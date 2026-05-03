import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  Gift,
  Info,
  Loader2,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { themeFromJson, themeStyleVars } from "@/lib/theme";
import { trackEvent } from "@/lib/analytics";
import type { Block } from "@/lib/blocks";

type PublicProfileData = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_published: boolean;
  theme: unknown;
  xion_address: string | null;
  settings?: unknown;
};

type PublicBadge = {
  id: string;
  label: string;
  tierName?: "Silver" | "Gold" | "Diamond" | "silver" | "gold" | "diamond" | string;
  tier?: "Silver" | "Gold" | "Diamond" | "silver" | "gold" | "diamond" | string;
  category?: string;
  description?: string;
  emoji?: string;
  featured?: boolean;
  hidden?: boolean;
  proofSource?: string;
  issuedBy?: string;
  issuedAt?: string;
  visibility?: string;
  unlockUse?: string;
  privacyNote?: string;
};

const PAULUS_PITCH_BADGES: PublicBadge[] = [
  {
    id: "active-lifestyle",
    label: "Active Lifestyle",
    tierName: "Gold",
    category: "Lifestyle",
    description: "Verified from selected activity signal",
    emoji: "🏃",
    featured: true,
    hidden: false,
    proofSource: "Selected fitness and lifestyle activity signal",
    issuedBy: "XIONID demo verification layer",
    issuedAt: "Demo profile",
    visibility: "Public — selected by profile owner",
    unlockUse: "Helps match wellness, sport, and active lifestyle rewards.",
    privacyNote: "This badge shows only the verified category. Raw activity data is not exposed.",
  },
  {
    id: "premium-shopper",
    label: "Premium Shopper",
    tierName: "Diamond",
    category: "Rewards",
    description: "Eligible for premium offers",
    emoji: "💎",
    featured: true,
    hidden: false,
    proofSource: "Selected purchase / reward eligibility signal",
    issuedBy: "XIONID demo verification layer",
    issuedAt: "Demo profile",
    visibility: "Public — selected by profile owner",
    unlockUse: "Helps match premium consumer, loyalty, and lifestyle offers.",
    privacyNote:
      "This badge proves eligibility without revealing receipts, spending history, or private purchase details.",
  },
  {
    id: "verified-member",
    label: "Verified Member",
    tierName: "Silver",
    category: "Identity",
    description: "Public ID verified",
    emoji: "✅",
    featured: true,
    hidden: false,
    proofSource: "Public XIONID profile and selected identity signal",
    issuedBy: "XIONID",
    issuedAt: "Demo profile",
    visibility: "Public — selected by profile owner",
    unlockUse: "Creates a trusted baseline for public profile, badge wall, and rewards.",
    privacyNote: "This confirms a public XIONID identity exists. It does not expose private account details.",
  },
  {
    id: "offer-explorer",
    label: "Offer Explorer",
    tierName: "Silver",
    category: "Rewards",
    description: "Rewards-ready profile",
    emoji: "🎯",
    featured: true,
    hidden: false,
    proofSource: "Profile readiness and reward preference signal",
    issuedBy: "XIONID demo reward layer",
    issuedAt: "Demo profile",
    visibility: "Public — selected by profile owner",
    unlockUse: "Signals that this profile can receive matched offers and voucher campaigns.",
    privacyNote: "Brands see the badge, not the underlying private signals unless the user chooses to reveal more.",
  },
];

const PAULUS_REWARDS = [
  {
    title: "20% off wellness gear",
    partner: "Wellness Partner",
    requirement: "Active Lifestyle",
    icon: Gift,
  },
  {
    title: "Priority event access",
    partner: "Event Partner",
    requirement: "Verified Member",
    icon: Ticket,
  },
  {
    title: "Premium lifestyle voucher",
    partner: "Lifestyle Brand",
    requirement: "Premium Shopper",
    icon: Sparkles,
  },
];

const hasTipJar = (blocks: Block[]) => blocks.some((block) => block.type === "tip_jar");

const getSettingsObject = (settings: unknown): Record<string, unknown> => {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {};
  }

  return settings as Record<string, unknown>;
};

const getNestedObject = (object: Record<string, unknown>, key: string): Record<string, unknown> => {
  const value = object[key];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const normalizeTier = (badge: PublicBadge): string => {
  const rawTier = badge.tierName || badge.tier || "Silver";
  const normalized = String(rawTier).trim().toLowerCase();

  if (normalized.includes("diamond")) return "Diamond";
  if (normalized.includes("gold")) return "Gold";
  return "Silver";
};

const normalizeBadge = (badge: PublicBadge): PublicBadge => {
  const tierName = normalizeTier(badge);

  return {
    ...badge,
    tierName,
    category: badge.category || "Proof",
    description: badge.description || "Selected proof signal",
    proofSource: badge.proofSource || "Selected verification signal",
    issuedBy: badge.issuedBy || "XIONID verification layer",
    issuedAt: badge.issuedAt || "Demo profile",
    visibility: badge.visibility || "Public — selected by profile owner",
    unlockUse: badge.unlockUse || "Can help unlock relevant offers, rewards, and access.",
    privacyNote:
      badge.privacyNote ||
      "This badge shows only selected public proof. Private source data stays hidden unless the owner chooses otherwise.",
  };
};

const getPublicBadgesFromSettings = (settings: unknown): PublicBadge[] => {
  const settingsObject = getSettingsObject(settings);
  const publicBadgeRoot = settingsObject.xionidPublicBadges;

  if (!publicBadgeRoot || typeof publicBadgeRoot !== "object" || Array.isArray(publicBadgeRoot)) {
    return [];
  }

  const badges = (publicBadgeRoot as { badges?: unknown }).badges;

  if (!Array.isArray(badges)) return [];

  return badges
    .filter((badge): badge is PublicBadge => {
      if (!badge || typeof badge !== "object") return false;
      const candidate = badge as Partial<PublicBadge>;
      return Boolean(candidate.id && candidate.label);
    })
    .filter((badge) => badge.featured !== false && badge.hidden !== true)
    .map(normalizeBadge);
};

const getShowOfferBox = (settings: unknown): boolean => {
  const settingsObject = getSettingsObject(settings);
  const publicProfileSettings = getNestedObject(settingsObject, "xionidPublicProfile");

  return publicProfileSettings.showOfferBox !== false;
};

const isPlaceholderBlock = (block: Block): boolean => {
  const config = (block.config || {}) as Record<string, unknown>;

  const values = Object.values(config)
    .filter((value) => typeof value === "string")
    .map((value) => String(value).trim().toLowerCase());

  const placeholderValues = [
    "your name",
    "@you",
    "@handle",
    "a one-line intro about who you are.",
    "visit my page",
    "tell people about yourself…",
    "tell people about yourself...",
    "untitled link",
    "heading",
  ];

  if (values.some((value) => placeholderValues.includes(value))) {
    return true;
  }

  if (block.type === "avatar") {
    const name = String(config.name || "")
      .trim()
      .toLowerCase();
    const subtitle = String(config.subtitle || "")
      .trim()
      .toLowerCase();

    return name === "your name" || subtitle === "@you" || subtitle === "@handle" || (!name && !subtitle);
  }

  if (block.type === "link") {
    const title = String(config.title || "")
      .trim()
      .toLowerCase();
    const url = String(config.url || "").trim();

    return title === "visit my page" || title === "untitled link" || url === "#";
  }

  return false;
};

const getTierClasses = (tierName: string) => {
  const tier = tierName.toLowerCase();

  if (tier.includes("diamond")) {
    return {
      card: "border-cyan-300/30 bg-gradient-to-br from-cyan-300/15 via-blue-400/10 to-violet-500/15 shadow-[0_0_30px_rgba(105,168,255,0.18)]",
      seal: "from-cyan-200 via-sky-300 to-violet-400 text-slate-950",
      pill: "border-cyan-200/30 bg-cyan-200/10 text-cyan-100",
      modalGlow: "from-cyan-300/20 via-blue-400/10 to-violet-500/20",
    };
  }

  if (tier.includes("gold")) {
    return {
      card: "border-amber-300/30 bg-gradient-to-br from-amber-200/15 via-yellow-400/10 to-orange-500/10 shadow-[0_0_30px_rgba(230,185,75,0.14)]",
      seal: "from-amber-100 via-yellow-300 to-amber-500 text-amber-950",
      pill: "border-amber-200/30 bg-amber-200/10 text-amber-100",
      modalGlow: "from-amber-300/20 via-yellow-400/10 to-orange-500/20",
    };
  }

  return {
    card: "border-slate-300/20 bg-gradient-to-br from-slate-200/12 via-white/5 to-slate-500/10",
    seal: "from-slate-100 via-slate-300 to-slate-500 text-slate-950",
    pill: "border-slate-200/20 bg-white/5 text-slate-200",
    modalGlow: "from-slate-300/15 via-white/5 to-slate-500/10",
  };
};

const FeaturedBadgeCard = ({ badge, onClick }: { badge: PublicBadge; onClick: () => void }) => {
  const tierName = normalizeTier(badge);
  const tierClasses = getTierClasses(tierName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-3xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-cyan-300/40 ${tierClasses.card}`}
      aria-label={`View details for ${badge.label} badge`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br text-xl font-black shadow-lg ${tierClasses.seal}`}
        >
          {badge.emoji || <BadgeCheck className="h-6 w-6" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">{badge.label}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tierClasses.pill}`}>
              {tierName}
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-slate-300">{badge.category || "Proof"}</p>

          <p className="mt-2 text-xs leading-relaxed text-slate-400">{badge.description || "Selected proof signal"}</p>

          <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-200 opacity-80 transition group-hover:opacity-100">
            <Info className="h-3.5 w-3.5" />
            View badge details
          </p>
        </div>
      </div>
    </button>
  );
};

const BadgeDetailModal = ({ badge, onClose }: { badge: PublicBadge; onClose: () => void }) => {
  const normalizedBadge = normalizeBadge(badge);
  const tierName = normalizeTier(normalizedBadge);
  const tierClasses = getTierClasses(tierName);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${normalizedBadge.label} badge details`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] shadow-[0_32px_100px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${tierClasses.modalGlow} blur-2xl`}
        />

        <div className="relative p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br text-2xl font-black shadow-xl ${tierClasses.seal}`}
              >
                {normalizedBadge.emoji || <BadgeCheck className="h-7 w-7" />}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">Badge details</p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{normalizedBadge.label}</h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tierClasses.pill}`}>
                    {tierName}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-slate-200">
                    {normalizedBadge.category}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1] hover:text-white"
              aria-label="Close badge details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-slate-300">{normalizedBadge.description}</p>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Proof source</p>
                  <p className="mt-1 text-sm font-medium text-white">{normalizedBadge.proofSource}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Issued by</p>
                  <p className="mt-1 text-sm font-medium text-white">{normalizedBadge.issuedBy}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start gap-3">
                <Eye className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Visibility</p>
                  <p className="mt-1 text-sm font-medium text-white">{normalizedBadge.visibility}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start gap-3">
                <Gift className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Reward use case</p>
                  <p className="mt-1 text-sm font-medium text-white">{normalizedBadge.unlockUse}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-emerald-100">Privacy note</p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-50/75">{normalizedBadge.privacyNote}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
              <CalendarDays className="h-4 w-4" />
              {normalizedBadge.issuedAt}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");
  const [selectedBadge, setSelectedBadge] = useState<PublicBadge | null>(null);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    setStatus("loading");

    (async () => {
      const { data: p, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, is_published, theme, xion_address, settings")
        .eq("username", username)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || !p || !p.username || !p.is_published) {
        setStatus("not_found");
        return;
      }

      setProfile(p as PublicProfileData);

      const { data: b } = await supabase
        .from("blocks")
        .select("*")
        .eq("profile_id", p.id)
        .eq("is_visible", true)
        .order("position", { ascending: true });

      if (cancelled) return;

      setBlocks((b || []) as Block[]);
      setStatus("ready");

      trackEvent(p.id, "profile_view");

      document.title = `${p.display_name || `@${p.username}`} · XIONID`;

      const desc = p.bio || `${p.display_name || p.username}'s verified identity and rewards passport on XIONID`;

      let metaDescription = document.querySelector('meta[name="description"]');

      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }

      metaDescription.setAttribute("content", desc.slice(0, 160));
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const theme = useMemo(() => themeFromJson(profile?.theme), [profile]);
  const styleVars = useMemo(() => themeStyleVars(theme), [theme]);

  const cleanBlocks = useMemo(() => blocks.filter((block) => !isPlaceholderBlock(block)), [blocks]);

  const tipJarEnabled = useMemo(() => hasTipJar(cleanBlocks), [cleanBlocks]);

  const isPaulusProfile = profile?.username?.toLowerCase() === "paulus";

  const showOfferBox = useMemo(() => getShowOfferBox(profile?.settings), [profile?.settings]);

  const publicBadges = useMemo(() => {
    const badgesFromSettings = getPublicBadgesFromSettings(profile?.settings);

    if (badgesFromSettings.length > 0) {
      return badgesFromSettings;
    }

    if (isPaulusProfile) {
      return PAULUS_PITCH_BADGES;
    }

    return [];
  }, [isPaulusProfile, profile?.settings]);

  const openBadgeDetails = (badge: PublicBadge) => {
    setSelectedBadge(normalizeBadge(badge));

    if (profile?.id) {
      trackEvent(profile.id, "block_click", `badge:${badge.id}`);
    }
  };

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-300 shadow-2xl">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          Loading XIONID profile...
        </div>
      </main>
    );
  }

  if (status === "not_found" || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck className="h-7 w-7 text-slate-300" />
          </div>

          <h1 className="text-2xl font-bold">Profile not found</h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            @{username} does not exist on XIONID or is not published yet.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const displayName = isPaulusProfile ? "Paulus Pham" : profile.display_name || profile.username;

  const bio = isPaulusProfile
    ? "A privacy-first lifestyle passport for selected proof, badges, and relevant rewards."
    : profile.bio || "A verified identity and rewards passport for selected proof, badges, and public signals.";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-white" style={styleVars as CSSProperties}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute left-[-12rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 via-sky-300 to-emerald-300 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/15">
              X
            </span>
            XIONID
          </Link>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
            xionid.com/{profile.username}
          </div>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-[-10px] rounded-[2rem] bg-gradient-to-br from-violet-400 via-sky-300 to-emerald-300 opacity-40 blur-xl" />

              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="relative h-24 w-24 rounded-[2rem] border border-white/20 object-cover shadow-2xl"
                />
              ) : (
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-gradient-to-br from-violet-400 via-sky-300 to-emerald-300 text-4xl font-black text-slate-950 shadow-2xl">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-[#07111f] shadow-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              </div>
            </div>

            <div className="mt-6">
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{displayName}</h1>

              <p className="mt-2 text-sm font-semibold text-cyan-200">@{profile.username}</p>

              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300">{bio}</p>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {(isPaulusProfile
                ? ["Active lifestyle", "Premium consumer", "Vietnam"]
                : ["Verified passport", "Selected proof", "Private by design"]
              ).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#badges"
                onClick={() => trackEvent(profile.id, "block_click", "featured_badges")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-400 via-sky-300 to-emerald-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
              >
                <BadgeCheck className="h-4 w-4" />
                See verified badges
              </a>

              {showOfferBox ? (
                <a
                  href="#offer-box"
                  onClick={() => trackEvent(profile.id, "block_click", "offer_box")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                >
                  <Gift className="h-4 w-4" />
                  View Offer Box
                </a>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {profile.xion_address ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  XIONID verified
                </span>
              ) : null}

              {tipJarEnabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Creator support enabled
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {publicBadges.length > 0 ? (
          <section
            id="badges"
            className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Featured badges
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Selected proof signals</h2>

                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Click any badge to view proof details and privacy context.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-300">
                <LockKeyhole className="h-3.5 w-3.5 text-emerald-300" />
                Visibility controlled
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {publicBadges.slice(0, 6).map((badge) => (
                <FeaturedBadgeCard key={badge.id} badge={badge} onClick={() => openBadgeDetails(badge)} />
              ))}
            </div>
          </section>
        ) : null}

        {isPaulusProfile && showOfferBox ? (
          <section
            id="offer-box"
            className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <div className="mb-5">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-semibold text-violet-100">
                <Gift className="h-3.5 w-3.5" />
                Offer Box
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Matched rewards</h2>

              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Rewards unlocked by selected badges and privacy-safe proof.
              </p>
            </div>

            <div className="grid gap-3">
              {PAULUS_REWARDS.map((reward) => {
                const Icon = reward.icon;

                return (
                  <article
                    key={reward.title}
                    className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.07]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400/25 via-sky-300/20 to-emerald-300/20 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-white">{reward.title}</h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {reward.partner} · Requires {reward.requirement}
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                      Matched
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {cleanBlocks.length > 0 ? (
          <section className="mt-6 space-y-4">
            {cleanBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                theme={theme}
                ownerXionAddress={null}
                interactive={false}
                onClick={() => trackEvent(profile.id, "block_click", block.id)}
              />
            ))}
          </section>
        ) : null}

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 text-center backdrop-blur-xl">
          <div className="mx-auto flex max-w-md flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06]">
              <QrCode className="h-5 w-5 text-cyan-200" />
            </div>

            <h2 className="mt-3 text-base font-bold text-white">Privacy-first public passport</h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              XIONID lets people collect proof-backed badges, choose what appears publicly, and unlock relevant rewards
              without oversharing.
            </p>
          </div>
        </section>

        <footer className="mt-auto flex flex-col items-center gap-3 py-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Made with XIONID
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <p className="text-xs text-slate-500">Verified identity and rewards passport.</p>
        </footer>
      </div>

      {selectedBadge ? <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} /> : null}
    </main>
  );
};

export default PublicProfile;
