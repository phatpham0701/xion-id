// verify-tip — server-side XION tip verifier
//
// Flow:
//   1. Client broadcasts MsgSend on xion-testnet-2 via Abstraxion.
//   2. Client calls this function with { tx_hash, profile_id, block_id?, message? }.
//   3. We fetch the tx from the LCD, validate it really paid the profile's
//      xion_address in uxion, then insert into `tips` with the service role
//      (bypassing RLS — anon users can no longer insert directly).
//
// Idempotent: re-calling with the same tx_hash returns { status: "already_recorded" }.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const XION_REST = "https://api.xion-testnet-2.burnt.com";
const DENOM = "uxion";
const MAX_UXION = 1_000_000_000_000n; // 1M XION sanity cap
const MAX_MESSAGE_LEN = 280;

// Tiny in-memory rate limiter. Edge function instances are short-lived, so this
// is best-effort — good enough to slow a single abuser, not a DDoS shield.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_MAX;
}

const isUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const isTxHash = (v: unknown): v is string =>
  typeof v === "string" && /^[A-Fa-f0-9]{40,128}$/.test(v.trim());

type LcdTx = {
  tx?: {
    body?: {
      messages?: Array<Record<string, unknown>>;
    };
  };
  tx_response?: {
    code?: number;
    height?: string;
    txhash?: string;
    raw_log?: string;
  };
};

async function fetchTx(hash: string): Promise<LcdTx | null> {
  // Retry to absorb mempool propagation delay.
  const url = `${XION_REST}/cosmos/tx/v1beta1/txs/${hash}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.status === 404) {
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      if (!res.ok) {
        const text = await res.text();
        console.warn("[verify-tip] LCD non-OK", res.status, text.slice(0, 200));
        return null;
      }
      return (await res.json()) as LcdTx;
    } catch (err) {
      console.warn("[verify-tip] LCD fetch error", err);
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
  return null;
}

type ParsedSend = {
  fromAddress: string;
  amountUxion: bigint;
};

function parseMsgSend(
  messages: Array<Record<string, unknown>>,
  expectedRecipient: string,
): ParsedSend | null {
  for (const msg of messages) {
    const type = (msg["@type"] ?? msg["type"]) as string | undefined;
    if (type !== "/cosmos.bank.v1beta1.MsgSend") continue;

    const toAddress = msg["to_address"] as string | undefined;
    const fromAddress = msg["from_address"] as string | undefined;
    const amountArr = msg["amount"] as Array<{ denom: string; amount: string }> | undefined;
    if (!toAddress || !fromAddress || !Array.isArray(amountArr)) continue;
    if (toAddress !== expectedRecipient) continue;

    let total = 0n;
    for (const coin of amountArr) {
      if (coin.denom !== DENOM) continue;
      try {
        total += BigInt(coin.amount);
      } catch {
        return null;
      }
    }
    if (total <= 0n || total > MAX_UXION) continue;
    return { fromAddress, amountUxion: total };
  }
  return null;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  if (!rateLimit(ip)) {
    return jsonResponse({ error: "Rate limit exceeded" }, 429);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const txHash = typeof payload.tx_hash === "string" ? payload.tx_hash.trim() : "";
  const profileId = payload.profile_id;
  const blockId = payload.block_id;
  const messageRaw = payload.message;

  if (!isTxHash(txHash)) {
    return jsonResponse({ error: "Invalid tx_hash" }, 400);
  }
  if (!isUuid(profileId)) {
    return jsonResponse({ error: "Invalid profile_id" }, 400);
  }
  if (blockId !== undefined && blockId !== null && !isUuid(blockId)) {
    return jsonResponse({ error: "Invalid block_id" }, 400);
  }
  let message: string | null = null;
  if (typeof messageRaw === "string") {
    const trimmed = messageRaw.trim();
    if (trimmed.length > MAX_MESSAGE_LEN) {
      return jsonResponse({ error: "Message too long" }, 400);
    }
    message = trimmed.length ? trimmed : null;
  } else if (messageRaw != null) {
    return jsonResponse({ error: "Invalid message" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("[verify-tip] Missing Supabase env");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Fast path: already recorded?
  const { data: existing, error: existingErr } = await supabase
    .from("tips")
    .select("id")
    .eq("tx_hash", txHash)
    .maybeSingle();
  if (existingErr) {
    console.error("[verify-tip] Lookup failed", existingErr);
    return jsonResponse({ error: "Database error" }, 500);
  }
  if (existing) {
    return jsonResponse({ status: "already_recorded", id: existing.id }, 200);
  }

  // Resolve recipient address from the profile.
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, xion_address")
    .eq("id", profileId)
    .maybeSingle();
  if (profileErr) {
    console.error("[verify-tip] Profile lookup failed", profileErr);
    return jsonResponse({ error: "Database error" }, 500);
  }
  if (!profile) {
    return jsonResponse({ error: "Profile not found" }, 404);
  }
  const recipient = (profile.xion_address ?? "").trim();
  if (!recipient || !/^xion1[02-9ac-hj-np-z]{20,80}$/.test(recipient)) {
    return jsonResponse({ error: "Profile has no XION wallet" }, 400);
  }

  // Fetch the tx from the LCD.
  const lcdTx = await fetchTx(txHash);
  if (!lcdTx || !lcdTx.tx_response) {
    return jsonResponse(
      { status: "pending", error: "Transaction not found yet — try again in a few seconds" },
      202,
    );
  }
  if (typeof lcdTx.tx_response.code === "number" && lcdTx.tx_response.code !== 0) {
    return jsonResponse(
      {
        error: "Transaction failed on-chain",
        raw_log: lcdTx.tx_response.raw_log?.slice(0, 200),
      },
      422,
    );
  }
  const messages = lcdTx.tx?.body?.messages ?? [];
  const parsed = parseMsgSend(messages, recipient);
  if (!parsed) {
    return jsonResponse(
      { error: "No matching MsgSend to recipient in this transaction" },
      422,
    );
  }

  const blockHeight = lcdTx.tx_response.height ? Number(lcdTx.tx_response.height) : null;

  const { data: inserted, error: insertErr } = await supabase
    .from("tips")
    .insert({
      profile_id: profileId,
      block_id: typeof blockId === "string" ? blockId : null,
      recipient_address: recipient,
      sender_address: parsed.fromAddress,
      amount_uxion: Number(parsed.amountUxion),
      message,
      tx_hash: txHash,
      block_height: blockHeight,
    })
    .select("id")
    .single();

  if (insertErr) {
    // Race: another request inserted first. Treat as success.
    if (insertErr.code === "23505") {
      return jsonResponse({ status: "already_recorded" }, 200);
    }
    console.error("[verify-tip] Insert failed", insertErr);
    return jsonResponse({ error: "Failed to record tip" }, 500);
  }

  console.log("[verify-tip] verified", {
    txHash,
    profileId,
    sender: parsed.fromAddress,
    amount: parsed.amountUxion.toString(),
  });

  return jsonResponse(
    {
      status: "verified",
      id: inserted.id,
      amount_uxion: Number(parsed.amountUxion),
      sender_address: parsed.fromAddress,
      block_height: blockHeight,
    },
    200,
  );
});
