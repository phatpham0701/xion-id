import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeTier } from "@/lib/demoMode";

/**
 * Premium "Proof Seal" — the canonical XIONID badge visual.
 * A soft octagon mark with tier-specific gradient ring and inner glow.
 * Tiers: silver / gold / diamond.
 */

const TIER_STYLES: Record<
  BadgeTier,
  { ring: string; glow: string; inner: string; chip: string; label: string }
> = {
  silver: {
    ring:  "from-slate-200 via-slate-400 to-slate-600",
    glow:  "shadow-[0_0_28px_-6px_rgba(203,213,225,0.45)]",
    inner: "from-slate-700/60 to-slate-900/80",
    chip:  "bg-slate-300/15 text-slate-200 border-slate-300/25",
    label: "Silver",
  },
  gold: {
    ring:  "from-amber-200 via-amber-400 to-amber-600",
    glow:  "shadow-[0_0_36px_-6px_rgba(251,191,36,0.55)]",
    inner: "from-amber-900/40 to-zinc-900/80",
    chip:  "bg-amber-400/15 text-amber-200 border-amber-300/30",
    label: "Gold",
  },
  diamond: {
    ring:  "from-mint-300 via-sky-400 to-indigo-500",
    glow:  "shadow-[0_0_44px_-6px_rgba(105,168,255,0.65)]",
    inner: "from-indigo-900/50 to-slate-900/80",
    chip:  "bg-secondary/15 text-secondary border-secondary/30",
    label: "Diamond",
  },
};

// Tailwind doesn't ship `mint-*` — alias via inline style fallback below.
const TIER_RING_STYLE: Record<BadgeTier, React.CSSProperties> = {
  silver:  { background: "linear-gradient(135deg,#e2e8f0,#94a3b8 45%,#475569)" },
  gold:    { background: "linear-gradient(135deg,#fde68a,#f59e0b 50%,#b45309)" },
  diamond: { background: "linear-gradient(135deg,#6FE7C8,#69A8FF 45%,#6D5EF7)" },
};

const OCTAGON =
  "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)";

type SealProps = {
  emoji: string;
  tier: BadgeTier;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const ProofSeal = ({ emoji, tier, size = "md", className }: SealProps) => {
  const dim = size === "sm" ? "h-12 w-12" : size === "lg" ? "h-20 w-20" : "h-16 w-16";
  const inner = size === "sm" ? "h-10 w-10 text-xl" : size === "lg" ? "h-[68px] w-[68px] text-3xl" : "h-[54px] w-[54px] text-2xl";
  const t = TIER_STYLES[tier];

  return (
    <div className={cn("relative grid place-items-center shrink-0", dim, t.glow, className)}>
      {/* Outer tier ring (octagon) */}
      <div
        className="absolute inset-0"
        style={{ ...TIER_RING_STYLE[tier], clipPath: OCTAGON }}
        aria-hidden
      />
      {/* Inner well */}
      <div
        className={cn(
          "relative grid place-items-center bg-gradient-to-br",
          inner, t.inner,
        )}
        style={{ clipPath: OCTAGON }}
      >
        <span className="leading-none">{emoji}</span>
      </div>
    </div>
  );
};

type CardProps = {
  label: string;
  emoji: string;
  tier: BadgeTier;
  category: string;
  verifiedAt?: string;
  privacyNote?: string;
  onClick?: () => void;
  compact?: boolean;
};

export const ProofSealCard = ({
  label, emoji, tier, category, verifiedAt, privacyNote, onClick, compact,
}: CardProps) => {
  const t = TIER_STYLES[tier];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative text-left rounded-2xl border border-glass-border bg-background/40",
        "hover:border-primary/40 hover:-translate-y-0.5 transition-all overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        compact ? "p-3" : "p-4",
      )}
    >
      {/* Subtle tier-tinted backdrop */}
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={TIER_RING_STYLE[tier]}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <ProofSeal emoji={emoji} tier={tier} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[10px] uppercase tracking-wider rounded-full border px-1.5 py-0.5", t.chip)}>
              {t.label}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{category}</span>
          </div>
          <div className={cn("mt-1 font-display font-semibold leading-tight truncate", compact ? "text-sm" : "text-base")}>
            {label}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent">
            <ShieldCheck className="h-3 w-3" />
            Proof verified
          </div>
          {!compact && privacyNote && (
            <div className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">{privacyNote}</div>
          )}
        </div>
      </div>
    </button>
  );
};
