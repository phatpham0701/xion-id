import type { SigningClient } from "@burnt-labs/abstraxion";
import { supabase } from "@/integrations/supabase/client";
import { XION_CONFIG } from "@/lib/xion";

export const XION_DECIMALS = 6; // 1 XION = 1_000_000 uxion
export const MAX_TIP_XION = 1000;
export const MAX_MESSAGE_LEN = 280;

export const xionToUxion = (xion: number): bigint => {
  if (!Number.isFinite(xion) || xion <= 0) throw new Error("Amount must be > 0");
  if (xion > MAX_TIP_XION) throw new Error(`Max tip is ${MAX_TIP_XION} XION`);
  // round to 6 decimals to avoid float drift
  const rounded = Math.round(xion * 10 ** XION_DECIMALS);
  return BigInt(rounded);
};

export const uxionToXion = (uxion: bigint | number | string): number => {
  const n = typeof uxion === "bigint" ? Number(uxion) : Number(uxion);
  return n / 10 ** XION_DECIMALS;
};

export const formatXion = (uxion: bigint | number | string, digits = 4): string => {
  const x = uxionToXion(uxion);
  // Trim trailing zeros, keep at most `digits` decimals
  return x.toLocaleString(undefined, { maximumFractionDigits: digits });
};

export type SendTipParams = {
  client: SigningClient;
  senderAddress: string;
  recipientAddress: string;
  amountXion: number;
  memo?: string;
};

export type SendTipResult = {
  txHash: string;
  height: number | null;
};

/**
 * Sends a XION tip via the connected Abstraxion Meta Account.
 * Gas is sponsored by the treasury (configured in AbstraxionProvider).
 */
export const sendTip = async ({
  client,
  senderAddress,
  recipientAddress,
  amountXion,
  memo,
}: SendTipParams): Promise<SendTipResult> => {
  const amountUxion = xionToUxion(amountXion);

  const result = await client.sendTokens(
    senderAddress,
    recipientAddress,
    [{ denom: XION_CONFIG.denom, amount: amountUxion.toString() }],
    "auto",
    memo?.slice(0, MAX_MESSAGE_LEN) || "",
  );

  // Both DeliverTxResponse and SignAndBroadcastResult expose transactionHash + height (when available).
  const r = result as { transactionHash?: string; height?: number; code?: number; rawLog?: string };
  if (typeof r.code === "number" && r.code !== 0) {
    throw new Error(r.rawLog || `Transaction failed (code ${r.code})`);
  }
  const txHash = r.transactionHash;
  if (!txHash) throw new Error("No transaction hash returned");

  return { txHash, height: typeof r.height === "number" ? r.height : null };
};

export type RecordTipParams = {
  profileId: string;
  blockId?: string | null;
  recipientAddress: string;
  senderAddress: string;
  amountXion: number;
  message?: string | null;
  txHash: string;
  blockHeight: number | null;
};

export const recordTip = async (params: RecordTipParams): Promise<void> => {
  const amountUxion = Number(xionToUxion(params.amountXion));
  const trimmed = params.message?.trim().slice(0, MAX_MESSAGE_LEN) || null;

  const { error } = await supabase.from("tips").insert({
    profile_id: params.profileId,
    block_id: params.blockId ?? null,
    recipient_address: params.recipientAddress,
    sender_address: params.senderAddress,
    amount_uxion: amountUxion,
    message: trimmed,
    tx_hash: params.txHash,
    block_height: params.blockHeight,
  });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (already recorded — not fatal)
    throw error;
  }
};
