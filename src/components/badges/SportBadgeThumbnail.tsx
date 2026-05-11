import { useEffect, useState } from "react";
import { CheckCircle2, Radio } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getBadgeTierVisual, getSportInterestVisual } from "@/lib/badgeVisuals";
import { getSportBadgeAsset } from "@/lib/sportBadgeAssets";
import type { SportBadgeDefinition, SportInterest } from "@/lib/sportLifestyle";
import { cn } from "@/lib/utils";

type SportBadgeThumbnailProps = {
  badge: SportBadgeDefinition;
  earned?: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg";
  variant?: "card" | "showcase";
  className?: string;
};

const sizeConfig = {
  sm: {
    shell: "min-h-[156px] p-3",
    seal: "h-16 w-16",
    image: "h-20 w-20",
    showcaseImage: "h-28 w-28",
    icon: "h-7 w-7",
    title: "text-sm",
    tier: "text-[10px]",
    progress: "h-1.5",
  },
  md: {
    shell: "min-h-[196px] p-4",
    seal: "h-20 w-20",
    image: "h-28 w-28",
    showcaseImage: "h-36 w-36",
    icon: "h-9 w-9",
    title: "text-base",
    tier: "text-[11px]",
    progress: "h-2",
  },
  lg: {
    shell: "min-h-[236px] p-5",
    seal: "h-24 w-24",
    image: "h-36 w-36",
    showcaseImage: "h-48 w-48",
    icon: "h-11 w-11",
    title: "text-lg",
    tier: "text-xs",
    progress: "h-2.5",
  },
} as const;

const SPORT_INTEREST_ASSET_SLUGS: Record<SportInterest, string> = {
  Running: "running",
  "Gym / Strength": "strength",
  Cycling: "cycling",
  Swimming: "swimming",
  "Hybrid Athlete": "hybrid",
  "Marathon / Events": "marathon-events",
  Recovery: "recovery",
  Wellness: "wellness",
  "Sports Gear": "gear",
  Supplements: "supplements",
};

const resolveSportBadgeAsset = (badge: SportBadgeDefinition) => {
  const categorySlug = SPORT_INTEREST_ASSET_SLUGS[badge.interest];
  const tier = badge.tierIntent.toLowerCase();

  if (!categorySlug || !tier) return null;

  return getSportBadgeAsset(categorySlug, tier);
};

const GeneratedSportBadgeThumbnail = ({ badge, earned = false, progress, size = "md", className }: SportBadgeThumbnailProps) => {
  const interestVisual = getSportInterestVisual(badge.interest);
  const tierVisual = getBadgeTierVisual(badge.tierIntent);
  const Icon = interestVisual.Icon;
  const normalizedProgress = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;
  const sizing = sizeConfig[size];

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[1.75rem] border text-center",
        tierVisual.frameClassName,
        tierVisual.glowClassName,
        sizing.shell,
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", tierVisual.surfaceClassName)} />
      <div className={cn("absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl bg-gradient-to-br opacity-30", interestVisual.accentClassName)} />
      <div className="absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative flex h-full flex-col items-center justify-between gap-3">
        <div className="flex w-full items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-white/55">
          <span>{interestVisual.label}</span>
          <span className={cn("inline-flex items-center gap-1", earned ? "text-emerald-200" : "text-white/45")}>
            {earned ? <CheckCircle2 className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
            {earned ? "Earned" : "Signal"}
          </span>
        </div>

        <div
          className={cn(
            "relative grid place-items-center border bg-black/20 backdrop-blur-md",
            sizing.seal,
            tierVisual.ringClassName,
            interestVisual.glowClassName,
          )}
          style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
        >
          <div className={cn("absolute inset-2 rounded-full border border-dashed opacity-70", tierVisual.ringClassName)} />
          <div className={cn("absolute h-[78%] w-[78%] rounded-full bg-gradient-to-br opacity-25 blur-md", interestVisual.accentClassName)} />
          <div className={cn("relative grid h-[62%] w-[62%] place-items-center rounded-2xl", interestVisual.softBgClassName)}>
            <Icon className={cn(sizing.icon, interestVisual.accentTextClassName)} strokeWidth={1.8} />
          </div>
          <span className={cn("absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-gradient-to-br ring-2 ring-black/40", interestVisual.accentClassName)} />
        </div>

        <div className="w-full min-w-0 space-y-1">
          <h3 className={cn("font-display font-semibold leading-tight text-white", sizing.title)}>{badge.name}</h3>
          <div className={cn("font-semibold uppercase tracking-[0.28em]", tierVisual.textClassName, sizing.tier)}>{tierVisual.label}</div>
        </div>

        {normalizedProgress !== undefined && (
          <div className="w-full space-y-1">
            <Progress value={normalizedProgress} className={cn("bg-white/15", sizing.progress)} />
            <div className="flex items-center justify-between text-[10px] text-white/55">
              <span>Proof progress</span>
              <span>{normalizedProgress}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SportBadgeThumbnail = ({
  badge,
  earned = false,
  progress,
  size = "md",
  variant = "card",
  className,
}: SportBadgeThumbnailProps) => {
  const [failedAssetSrc, setFailedAssetSrc] = useState<string | null>(null);
  const asset = resolveSportBadgeAsset(badge);
  const assetSrc = asset?.src ?? null;

  useEffect(() => {
    setFailedAssetSrc(null);
  }, [assetSrc]);

  if (!asset || assetSrc === failedAssetSrc) {
    return (
      <GeneratedSportBadgeThumbnail
        badge={badge}
        earned={earned}
        progress={progress}
        size={size}
        className={className}
      />
    );
  }

  const interestVisual = getSportInterestVisual(badge.interest);
  const tierVisual = getBadgeTierVisual(badge.tierIntent);
  const normalizedProgress = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;
  const sizing = sizeConfig[size];

  if (variant === "showcase") {
    return (
      <div
        className={cn(
          "group relative isolate overflow-hidden rounded-[1.75rem] text-center",
          "bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.13),rgba(255,255,255,0.04)_38%,transparent_72%)]",
          "[perspective:900px]",
          sizing.shell,
          className,
        )}
      >
        <div className={cn("absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-25 blur-3xl", interestVisual.accentClassName)} />
        <div className="absolute inset-x-8 top-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.10)_45%,transparent_62%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />

        <div className="relative flex h-full flex-col items-center justify-between gap-3">
          <div className="flex w-full items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-white/55">
            <span>{asset.category}</span>
            <span className={cn("inline-flex items-center gap-1", earned ? "text-emerald-200" : "text-white/45")}>
              {earned ? <CheckCircle2 className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
              {earned ? "Earned" : "Signal"}
            </span>
          </div>

          <div className="relative grid place-items-center py-1">
            <div className={cn("absolute inset-4 rounded-full bg-gradient-to-br opacity-45 blur-2xl", interestVisual.accentClassName)} />
            <div className="absolute bottom-2 h-6 w-2/3 rounded-full bg-black/35 blur-xl" />
            <img
              src={asset.src}
              alt={`${asset.ui_title} badge`}
              className={cn(
                "relative object-contain drop-shadow-[0_24px_34px_rgba(0,0,0,0.45)]",
                "transition-transform duration-300 ease-out group-hover:[transform:rotateX(1.5deg)_rotateY(-2deg)_translateY(-2px)] motion-reduce:transform-none motion-reduce:transition-none",
                sizing.showcaseImage,
              )}
              loading="lazy"
              decoding="async"
              onError={() => setFailedAssetSrc(asset.src)}
            />
          </div>

          <div className="w-full min-w-0 space-y-1">
            <h3 className={cn("font-display font-semibold leading-tight text-white", sizing.title)}>{badge.name}</h3>
            <div className={cn("font-semibold uppercase tracking-[0.28em]", tierVisual.textClassName, sizing.tier)}>{tierVisual.label}</div>
          </div>

          {normalizedProgress !== undefined && (
            <div className="w-full space-y-1">
              <Progress value={normalizedProgress} className={cn("bg-white/15", sizing.progress)} />
              <div className="flex items-center justify-between text-[10px] text-white/55">
                <span>Proof progress</span>
                <span>{normalizedProgress}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[1.75rem] border text-center",
        tierVisual.frameClassName,
        tierVisual.glowClassName,
        sizing.shell,
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", tierVisual.surfaceClassName)} />
      <div className={cn("absolute -left-10 -top-10 h-28 w-28 rounded-full blur-2xl bg-gradient-to-br opacity-30", interestVisual.accentClassName)} />
      <div className="absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative flex h-full flex-col items-center justify-between gap-3">
        <div className="flex w-full items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-white/55">
          <span>{asset.category}</span>
          <span className={cn("inline-flex items-center gap-1", earned ? "text-emerald-200" : "text-white/45")}>
            {earned ? <CheckCircle2 className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
            {earned ? "Earned" : "Signal"}
          </span>
        </div>

        <div className="relative grid place-items-center">
          <div className={cn("absolute inset-3 rounded-full bg-gradient-to-br opacity-40 blur-xl", interestVisual.accentClassName)} />
          <img
            src={asset.src}
            alt={`${asset.ui_title} badge`}
            className={cn("relative object-contain drop-shadow-2xl", sizing.image)}
            loading="lazy"
            decoding="async"
            onError={() => setFailedAssetSrc(asset.src)}
          />
        </div>

        <div className="w-full min-w-0 space-y-1">
          <h3 className={cn("font-display font-semibold leading-tight text-white", sizing.title)}>{badge.name}</h3>
          <div className={cn("font-semibold uppercase tracking-[0.28em]", tierVisual.textClassName, sizing.tier)}>{tierVisual.label}</div>
        </div>

        {normalizedProgress !== undefined && (
          <div className="w-full space-y-1">
            <Progress value={normalizedProgress} className={cn("bg-white/15", sizing.progress)} />
            <div className="flex items-center justify-between text-[10px] text-white/55">
              <span>Proof progress</span>
              <span>{normalizedProgress}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
