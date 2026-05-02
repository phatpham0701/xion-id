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

export type VerifyTipParams = {
  profileId: string;
  blockId?: string | null;
  txHash: string;
  message?: string | null;
};

export type VerifyTipStatus = "verified" | "already_recorded" | "pending";

export type VerifyTipResult = {
  status: VerifyTipStatus;
  error?: string;
};

/**
 * Calls the `verify-tip` edge function which validates the on-chain transaction
 * (sender, recipient, denom, amount) and writes to the `tips` table with the
 * service role. The `tips` table no longer accepts client-side INSERTs.
 */
export const verifyAndRecordTip = async (
  params: VerifyTipParams,
): Promise<VerifyTipResult> => {
  const trimmed = params.message?.trim().slice(0, MAX_MESSAGE_LEN) || null;

  const { data, error } = await supabase.functions.invoke("verify-tip", {
    body: {
      tx_hash: params.txHash,
      profile_id: params.profileId,
      block_id: params.blockId ?? null,
      message: trimmed,
    },
  });

  if (error) {
    // Non-2xx (incl. 202 pending) lands here with FunctionsHttpError.
    const ctx = (error as unknown as { context?: { status?: number } }).context;
    if (ctx?.status === 202) {
      return { status: "pending", error: "Transaction not indexed yet" };
    }
    return { status: "pending", error: error.message };
  }

  const status = (data?.status as VerifyTipStatus | undefined) ?? "verified";
  return { status };
};

/** @deprecated Use `verifyAndRecordTip` — client INSERTs to `tips` are no longer allowed. */
export const recordTip = async (params: {
  profileId: string;
  blockId?: string | null;
  txHash: string;
  message?: string | null;
}): Promise<void> => {
  await verifyAndRecordTip({
    profileId: params.profileId,
    blockId: params.blockId,
    txHash: params.txHash,
    message: params.message,
  });
};
