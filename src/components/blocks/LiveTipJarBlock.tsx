import { useState } from "react";
// (no extra type imports needed — sendTip accepts any abstraxion SigningClient)
import { Heart, Loader2, ExternalLink, Check, Zap, AlertCircle } from "lucide-react";
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { XION_CONFIG, truncateAddress } from "@/lib/xion";
import {
  MAX_MESSAGE_LEN,
  MAX_TIP_XION,
  recordTip,
  sendTip,
} from "@/lib/tipJar";
import { trackEvent } from "@/lib/analytics";

type Props = {
  profileId: string;
  blockId: string;
  recipientAddress?: string | null;
  title: string;
  description: string;
  cta: string;
  currency: string;
  suggestedAmounts: number[];
  allowCustom: boolean;
  allowMessage: boolean;
};

export const LiveTipJarBlock = ({
  profileId,
  blockId,
  recipientAddress,
  title,
  description,
  cta,
  currency,
  suggestedAmounts,
  allowCustom,
  allowMessage,
}: Props) => {
  const { data: account, isConnected, login } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  const [selectedAmount, setSelectedAmount] = useState<number>(suggestedAmounts[0] ?? 1);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<{ hash: string; amount: number } | null>(null);

  const senderAddress = account?.bech32Address;

  const effectiveAmount = (() => {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    return selectedAmount;
  })();

  const canTip = !!recipientAddress && effectiveAmount > 0 && effectiveAmount <= MAX_TIP_XION;

  // Owner hasn't connected wallet → friendly empty state.
  if (!recipientAddress) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-5 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-2xl bg-muted/40 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold text-foreground">Tips not available yet</div>
        <p className="mt-1 text-xs text-muted-foreground">
          The owner hasn't connected a XION wallet yet.
        </p>
      </div>
    );
  }

  // Success state.
  if (success) {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/30">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-base font-bold text-foreground">
            Sent {success.amount} {currency} ⚡
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Thanks for supporting this creator!</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <a
            href={XION_CONFIG.explorerTx(success.hash)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary"
          >
            View tx <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setMessage("");
              setCustomAmount("");
            }}
            className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Tip again
          </button>
        </div>
      </div>
    );
  }

  const handleTip = async () => {
    if (!recipientAddress || effectiveAmount <= 0) return;

    // Step 1: ensure connected
    if (!isConnected || !senderAddress || !client) {
      try {
        await login();
        toast.message("Wallet connected", { description: "Tap the tip button again to send." });
      } catch (err) {
        toast.error("Couldn't connect wallet", {
          description: err instanceof Error ? err.message : "Try again",
        });
      }
      return;
    }

    setIsSending(true);
    try {
      const memo = allowMessage ? message.trim().slice(0, MAX_MESSAGE_LEN) : "";

      const { txHash, height } = await sendTip({
        client,
        senderAddress,
        recipientAddress,
        amountXion: effectiveAmount,
        memo,
      });

      // Mirror to DB for analytics — non-blocking failure.
      try {
        await recordTip({
          profileId,
          blockId,
          recipientAddress,
          senderAddress,
          amountXion: effectiveAmount,
          message: memo || null,
          txHash,
          blockHeight: height,
        });
      } catch (recErr) {
        console.warn("[tip] couldn't mirror to DB:", recErr);
      }

      // Analytics event for the owner's dashboard.
      trackEvent(profileId, "block_click", `tip_${blockId}`).catch(() => {});

      setSuccess({ hash: txHash, amount: effectiveAmount });
      toast.success(`Tipped ${effectiveAmount} ${currency} ⚡`, {
        description: "Transaction confirmed on XION testnet-2.",
      });
    } catch (err) {
      toast.error("Tip failed", {
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 text-left">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/20 text-primary">
          <Heart className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-foreground">{title}</div>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground/70">
            → {truncateAddress(recipientAddress, 8, 6)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {suggestedAmounts.map((amount) => {
          const active = !customAmount && selectedAmount === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              className={cn(
                "rounded-2xl border px-3 py-2.5 text-center text-xs font-semibold transition-all",
                active
                  ? "border-primary/60 bg-primary/15 text-foreground shadow-sm shadow-primary/20"
                  : "border-white/10 bg-background/50 text-foreground hover:border-primary/30",
              )}
            >
              {amount} {currency}
            </button>
          );
        })}
      </div>

      {allowCustom ? (
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder={`Custom amount in ${currency}`}
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="h-10 bg-background/60 text-sm"
        />
      ) : null}

      {allowMessage ? (
        <Textarea
          rows={2}
          maxLength={MAX_MESSAGE_LEN}
          placeholder="Optional message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-none bg-background/60 text-sm"
        />
      ) : null}

      <button
        type="button"
        onClick={handleTip}
        disabled={isSending || !canTip}
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--theme-accent)), hsl(var(--theme-accent-glow)))",
        }}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Zap className="h-4 w-4" strokeWidth={2.5} />
            {isConnected
              ? `${cta} · ${effectiveAmount || 0} ${currency}`
              : "Connect wallet to tip"}
          </>
        )}
      </button>

      <div className="rounded-full border border-primary/20 bg-background/40 px-3 py-1.5 text-center text-[11px] text-muted-foreground">
        Gas sponsored by treasury · 0 fees for you ⚡
      </div>
    </div>
  );
};
