import { useState } from "react";
import { Heart, Loader2, ExternalLink, Check, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGE_LEN, MAX_TIP_XION } from "@/lib/tipJar";
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

const truncateAddress = (addr?: string | null, head = 8, tail = 6): string => {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
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
  const [selectedAmount, setSelectedAmount] = useState<number>(suggestedAmounts[0] ?? 1);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<{ hash: string; amount: number } | null>(null);

  const effectiveAmount = (() => {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    return selectedAmount;
  })();

  const canTip = !!recipientAddress && effectiveAmount > 0 && effectiveAmount <= MAX_TIP_XION;

  // Owner hasn't configured a support destination yet → friendly empty state.
  if (!recipientAddress) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-5 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-2xl bg-muted/40 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold text-foreground">Support not available yet</div>
        <p className="mt-1 text-xs text-muted-foreground">
          The owner has not configured a support destination for this pitch demo.
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
            Support intent recorded · {success.amount} {currency} ⚡
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Pitch-safe demo mode: no live payment was sent.</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <a
            href={`#${success.hash}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary"
          >
            Demo record <ExternalLink className="h-3 w-3" />
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
            Record again
          </button>
        </div>
      </div>
    );
  }

  const handleTip = async () => {
    if (!recipientAddress || effectiveAmount <= 0) return;

    setIsSending(true);
    try {
      const memo = allowMessage ? message.trim().slice(0, MAX_MESSAGE_LEN) : "";
      const demoHash = `demo-support-${Date.now()}`;

      await trackEvent(profileId, "support_intent", blockId).catch(() => {});
      setSuccess({ hash: demoHash, amount: effectiveAmount });
      toast.success(`Support intent recorded · ${effectiveAmount} ${currency}`, {
        description: memo ? "Message saved in demo mode." : "Pitch-safe mode: no live payment was sent.",
      });
    } catch (err) {
      toast.error("Couldn't record support intent", {
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
            {`${cta} · ${effectiveAmount || 0} ${currency}`}
          </>
        )}
      </button>

      <div className="rounded-full border border-primary/20 bg-background/40 px-3 py-1.5 text-center text-[11px] text-muted-foreground">
        Pitch-safe support demo · live XION transfer deferred ⚡
      </div>
    </div>
  );
};
