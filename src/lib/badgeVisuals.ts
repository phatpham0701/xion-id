import type { LucideIcon } from "lucide-react";
import {
  Bike,
  Dumbbell,
  Footprints,
  HeartPulse,
  Leaf,
  Medal,
  Package,
  Pill,
  Waves,
  Zap,
} from "lucide-react";
import type { BadgeTier, SportInterest } from "@/lib/sportLifestyle";

export type SportInterestVisual = {
  label: string;
  Icon: LucideIcon;
  accentClassName: string;
  accentTextClassName: string;
  softBgClassName: string;
  glowClassName: string;
};

export type BadgeTierVisual = {
  label: string;
  frameClassName: string;
  surfaceClassName: string;
  ringClassName: string;
  glowClassName: string;
  textClassName: string;
};

export const SPORT_INTEREST_VISUALS: Record<SportInterest, SportInterestVisual> = {
  Running: {
    label: "Run",
    Icon: Footprints,
    accentClassName: "from-emerald-300 via-teal-400 to-cyan-400",
    accentTextClassName: "text-emerald-200",
    softBgClassName: "bg-emerald-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(52,211,153,0.24)]",
  },
  "Gym / Strength": {
    label: "Strength",
    Icon: Dumbbell,
    accentClassName: "from-red-300 via-orange-400 to-amber-300",
    accentTextClassName: "text-orange-200",
    softBgClassName: "bg-orange-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(251,146,60,0.22)]",
  },
  Cycling: {
    label: "Ride",
    Icon: Bike,
    accentClassName: "from-sky-300 via-blue-400 to-indigo-400",
    accentTextClassName: "text-sky-200",
    softBgClassName: "bg-sky-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(56,189,248,0.22)]",
  },
  Swimming: {
    label: "Swim",
    Icon: Waves,
    accentClassName: "from-cyan-200 via-sky-300 to-blue-400",
    accentTextClassName: "text-cyan-200",
    softBgClassName: "bg-cyan-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(34,211,238,0.22)]",
  },
  "Hybrid Athlete": {
    label: "Hybrid",
    Icon: Zap,
    accentClassName: "from-violet-300 via-fuchsia-400 to-cyan-300",
    accentTextClassName: "text-fuchsia-200",
    softBgClassName: "bg-fuchsia-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(217,70,239,0.22)]",
  },
  "Marathon / Events": {
    label: "Event",
    Icon: Medal,
    accentClassName: "from-amber-200 via-yellow-400 to-orange-400",
    accentTextClassName: "text-amber-200",
    softBgClassName: "bg-amber-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(251,191,36,0.22)]",
  },
  Recovery: {
    label: "Recover",
    Icon: HeartPulse,
    accentClassName: "from-rose-200 via-pink-400 to-purple-400",
    accentTextClassName: "text-rose-200",
    softBgClassName: "bg-rose-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(244,114,182,0.22)]",
  },
  Wellness: {
    label: "Wellness",
    Icon: Leaf,
    accentClassName: "from-lime-200 via-green-400 to-emerald-400",
    accentTextClassName: "text-lime-200",
    softBgClassName: "bg-lime-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(132,204,22,0.2)]",
  },
  "Sports Gear": {
    label: "Gear",
    Icon: Package,
    accentClassName: "from-slate-200 via-zinc-300 to-cyan-300",
    accentTextClassName: "text-slate-200",
    softBgClassName: "bg-slate-300/10",
    glowClassName: "shadow-[0_0_34px_rgba(203,213,225,0.16)]",
  },
  Supplements: {
    label: "Fuel",
    Icon: Pill,
    accentClassName: "from-teal-200 via-cyan-300 to-violet-300",
    accentTextClassName: "text-teal-200",
    softBgClassName: "bg-teal-400/10",
    glowClassName: "shadow-[0_0_34px_rgba(45,212,191,0.2)]",
  },
};

export const BADGE_TIER_VISUALS: Record<BadgeTier, BadgeTierVisual> = {
  Bronze: {
    label: "Bronze",
    frameClassName: "border-amber-700/70 bg-gradient-to-br from-amber-950 via-stone-950 to-orange-950",
    surfaceClassName: "from-amber-500/24 via-orange-300/10 to-stone-950/30",
    ringClassName: "border-amber-400/45",
    glowClassName: "shadow-[0_0_38px_rgba(180,83,9,0.28)]",
    textClassName: "text-amber-200",
  },
  Silver: {
    label: "Silver",
    frameClassName: "border-slate-300/50 bg-gradient-to-br from-slate-900 via-zinc-950 to-slate-800",
    surfaceClassName: "from-slate-100/20 via-zinc-300/10 to-slate-950/30",
    ringClassName: "border-slate-200/45",
    glowClassName: "shadow-[0_0_34px_rgba(203,213,225,0.2)]",
    textClassName: "text-slate-100",
  },
  Gold: {
    label: "Gold",
    frameClassName: "border-yellow-300/70 bg-gradient-to-br from-yellow-950 via-amber-950 to-stone-950",
    surfaceClassName: "from-yellow-300/28 via-amber-400/12 to-stone-950/30",
    ringClassName: "border-yellow-200/55",
    glowClassName: "shadow-[0_0_42px_rgba(250,204,21,0.28)]",
    textClassName: "text-yellow-100",
  },
  Diamond: {
    label: "Diamond",
    frameClassName: "border-cyan-200/70 bg-gradient-to-br from-cyan-950 via-slate-950 to-emerald-950",
    surfaceClassName: "from-cyan-200/26 via-teal-300/12 to-blue-950/35",
    ringClassName: "border-cyan-200/60",
    glowClassName: "shadow-[0_0_46px_rgba(34,211,238,0.28)]",
    textClassName: "text-cyan-100",
  },
  Elite: {
    label: "Elite",
    frameClassName: "border-fuchsia-200/70 bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950",
    surfaceClassName: "from-fuchsia-300/24 via-cyan-300/14 to-violet-950/35",
    ringClassName: "border-fuchsia-200/55",
    glowClassName: "shadow-[0_0_52px_rgba(168,85,247,0.34)]",
    textClassName: "text-fuchsia-100",
  },
};

export const getSportInterestVisual = (interest: SportInterest) => SPORT_INTEREST_VISUALS[interest];

export const getBadgeTierVisual = (tier: BadgeTier) => BADGE_TIER_VISUALS[tier];
