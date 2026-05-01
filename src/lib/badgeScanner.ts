import { XION_CONFIG } from "@/lib/xion";
import { supabase } from "@/integrations/supabase/client";

export type BadgeKind =
  | "og_2024"
  | "og_2025"
  | "nft_collector"
  | "nft_minter"
  | "tipper"
  | "dapp_explorer"
  | "campaign_participant"
  | "contest_winner"
  | "whale"
  | "early_adopter";

export type ScannedBadge = {
  kind: BadgeKind;
  tier: number;
  metadata: Record<string, unknown>;
};

type LcdTx = {
  txhash: string;
  height: string;
  timestamp: string;
  tx?: { body?: { messages?: { "@type": string; contract?: string; sender?: string; receiver?: string }[] } };
  logs?: { events?: { type: string; attributes: { key: string; value: string }[] }[] }[];
};

type LcdTxsResponse = {
  tx_responses?: LcdTx[];
  pagination?: { next_key?: string | null; total?: string };
};

/** Fetch up to `limit` recent txs that involve `address` either as sender or receiver. */
const fetchTxsForAddress = async (address: string, limit = 100): Promise<LcdTx[]> => {
  // The LCD endpoint accepts events filter. We query both directions and merge.
  const queries = [
    `message.sender='${address}'`,
    `transfer.recipient='${address}'`,
  ];

  const all: LcdTx[] = [];
  for (const q of queries) {
    try {
      const url = `${XION_CONFIG.restUrl}/cosmos/tx/v1beta1/txs?events=${encodeURIComponent(q)}&pagination.limit=${limit}&order_by=ORDER_BY_DESC`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = (await res.json()) as LcdTxsResponse;
      if (json.tx_responses) all.push(...json.tx_responses);
    } catch {
      /* skip */
    }
  }

  // De-dupe by hash, keep newest order.
  const seen = new Set<string>();
  return all.filter((t) => (seen.has(t.txhash) ? false : (seen.add(t.txhash), true)));
};

/** Inspect a tx for cw721 transfer/mint signals. */
const inspectCw721 = (tx: LcdTx, address: string) => {
  let received = false;
  let minted = false;
  for (const log of tx.logs || []) {
    for (const ev of log.events || []) {
      if (ev.type !== "wasm") continue;
      const attrs = Object.fromEntries(ev.attributes.map((a) => [a.key, a.value]));
      const action = attrs.action;
      if (action === "transfer_nft" && attrs.recipient === address) received = true;
      if (action === "mint" && attrs.owner === address) minted = true;
    }
  }
  return { received, minted };
};

/** Collect distinct contract addresses interacted with. */
const collectContracts = (txs: LcdTx[]): Set<string> => {
  const set = new Set<string>();
  for (const tx of txs) {
    for (const msg of tx.tx?.body?.messages || []) {
      if (msg.contract) set.add(msg.contract);
    }
    for (const log of tx.logs || []) {
      for (const ev of log.events || []) {
        if (ev.type === "execute" || ev.type === "wasm") {
          const c = ev.attributes.find((a) => a.key === "_contract_address" || a.key === "contract_address");
          if (c?.value) set.add(c.value);
        }
      }
    }
  }
  return set;
};

export type ScanResult = {
  txCount: number;
  firstTxAt: Date | null;
  contracts: number;
  nftReceived: number;
  nftMinted: number;
  badges: ScannedBadge[];
};

export const scanWallet = async (address: string, profileId: string): Promise<ScanResult> => {
  const txs = await fetchTxsForAddress(address, 100);

  let firstTimestamp: number | null = null;
  let nftReceived = 0;
  let nftMinted = 0;

  for (const tx of txs) {
    const ts = Date.parse(tx.timestamp);
    if (!Number.isNaN(ts)) {
      if (firstTimestamp === null || ts < firstTimestamp) firstTimestamp = ts;
    }
    const sig = inspectCw721(tx, address);
    if (sig.received) nftReceived += 1;
    if (sig.minted) nftMinted += 1;
  }

  const contracts = collectContracts(txs);

  // Tipper badge: derived from our own DB.
  const { count: sentTipsCount } = await supabase
    .from("tips")
    .select("id", { count: "exact", head: true })
    .eq("sender_address", address);

  const badges: ScannedBadge[] = [];
  const firstTxAt = firstTimestamp ? new Date(firstTimestamp) : null;

  if (firstTxAt) {
    const y = firstTxAt.getUTCFullYear();
    if (y <= 2024) {
      badges.push({
        kind: "og_2024",
        tier: 2,
        metadata: { first_tx_at: firstTxAt.toISOString() },
      });
    } else if (y === 2025) {
      badges.push({
        kind: "og_2025",
        tier: 1,
        metadata: { first_tx_at: firstTxAt.toISOString() },
      });
    }
  }

  if (nftReceived + nftMinted >= 1) {
    badges.push({
      kind: "nft_collector",
      tier: nftReceived + nftMinted >= 5 ? 2 : 1,
      metadata: { received: nftReceived, minted: nftMinted },
    });
  }

  if (nftMinted >= 1) {
    badges.push({
      kind: "nft_minter",
      tier: nftMinted >= 3 ? 2 : 1,
      metadata: { minted: nftMinted },
    });
  }

  if (contracts.size >= 3) {
    badges.push({
      kind: "dapp_explorer",
      tier: contracts.size >= 8 ? 3 : contracts.size >= 5 ? 2 : 1,
      metadata: { contracts: Array.from(contracts).slice(0, 12) },
    });
  }

  if ((sentTipsCount ?? 0) >= 1) {
    badges.push({
      kind: "tipper",
      tier: (sentTipsCount ?? 0) >= 10 ? 3 : (sentTipsCount ?? 0) >= 3 ? 2 : 1,
      metadata: { count: sentTipsCount ?? 0 },
    });
  }

  // Persist badges (upsert on profile_id+kind via unique index).
  if (badges.length) {
    const rows = badges.map((b) => ({
      profile_id: profileId,
      xion_address: address,
      kind: b.kind,
      tier: b.tier,
      metadata: b.metadata as never,
    }));
    const { error } = await supabase
      .from("wallet_badges")
      .upsert(rows, { onConflict: "profile_id,kind" });
    if (error) console.warn("[badge] upsert failed:", error.message);
  }

  return {
    txCount: txs.length,
    firstTxAt,
    contracts: contracts.size,
    nftReceived,
    nftMinted,
    badges,
  };
};

export const BADGE_LABELS: Record<BadgeKind, { label: string; emoji: string; description: string }> = {
  og_2024: { label: "OG 2024", emoji: "👑", description: "Active on XION since 2024 or earlier." },
  og_2025: { label: "OG 2025", emoji: "🌟", description: "Active on XION in 2025." },
  nft_collector: { label: "NFT Collector", emoji: "🎨", description: "Holds NFTs on XION." },
  nft_minter: { label: "NFT Minter", emoji: "🛠️", description: "Minted NFTs on-chain." },
  tipper: { label: "Tipper", emoji: "💸", description: "Sent on-chain tips via XionID." },
  dapp_explorer: { label: "dApp Explorer", emoji: "🧭", description: "Interacted with multiple dApps." },
  campaign_participant: { label: "Campaign", emoji: "🎯", description: "Joined an official campaign." },
  contest_winner: { label: "Contest Winner", emoji: "🏆", description: "Won an XION contest." },
  whale: { label: "Whale", emoji: "🐋", description: "Holds a significant XION balance." },
  early_adopter: { label: "Early Adopter", emoji: "🚀", description: "Early XionID user." },
};
