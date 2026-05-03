/**
 * XIONID — Demo Mode foundation (pitch-safe).
 *
 * Internal-only flag + lightweight client store for demo data.
 * No Supabase writes, no migrations. Existing live features (auth, editor,
 * public profile, tips, badges) remain untouched.
 *
 * Future phases should read/write through this module so we can flip
 * `DEMO_MODE` off without ripping code out.
 */

export const DEMO_MODE = true as const;

/** Map technical Web3 vocabulary → product-safe vocabulary. Use in NEW UI only. */
export const DEMO_TERMS = {
  wallet: "account",
  token: "access",
  gas: "free",
  blockchain: "secure ledger",
  onchain: "verified",
  nft: "collectible",
  mint: "claim",
  treasury: "sponsor",
  crypto: "rewards",
  chain: "network",
  metaAccount: "identity",
} as const;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type BadgeCategory =
  | "identity"
  | "activity"
  | "support"
  | "lifestyle"
  | "community"
  | "rewards"
  | "education"
  | "recruitment"
  | "events"
  | "creator";

export type BadgeTier = "silver" | "gold" | "diamond";

export type DemoBadge = {
  id: string;
  kind: string;
  label: string;
  emoji: string;
  description: string;
  /** Numeric tier kept for legacy components (1=silver, 2=gold, 3=diamond). */
  tier: number;
  tierName: BadgeTier;
  category: BadgeCategory;
  verifiedAt: string;
  hidden?: boolean;
  featured?: boolean;
  /** Short note shown on issuance / detail. */
  privacyNote?: string;
};

export type RewardStatus = "available" | "claimed" | "expiring" | "archived";

export type DemoReward = {
  id: string;
  title: string;
  description: string;
  cost: number; // abstract "points" — never call it tokens
  claimed: boolean;
  imageUrl?: string;
  brand?: string;
  benefit?: string;
  requiredBadgeKind?: string;
  status?: RewardStatus;
  expiresAt?: string;
  claimedAt?: string;
};

export type CampaignCategory = "creator" | "community" | "education" | "event" | "wellness";

export type CampaignTierKey = "supporter" | "super" | "founding";

export type CampaignTier = {
  key: CampaignTierKey;
  label: string;
  amount: number; // demo currency units
  perks: string;
};

export type CampaignSupporter = {
  id: string;
  name: string;
  tier: CampaignTierKey;
  amount: number;
  message?: string;
  at: string;
};

export type CampaignMilestone = {
  label: string;
  at: string;
  reached: boolean;
};

export type DemoCampaign = {
  id: string;
  title: string;
  blurb: string;
  story?: string;
  category?: CampaignCategory;
  coverEmoji?: string;
  visibility?: "public" | "private";
  goalAmount?: number;
  raised?: number;
  tiers?: CampaignTier[];
  supporters?: CampaignSupporter[];
  milestones?: CampaignMilestone[];
  endsAt: string;
  participants: number;
  joined: boolean;
  ownerHandle?: string;
};

export type DemoQrItem = {
  id: string;
  code: string; // demo scan code
  label: string;
  scanned: boolean;
  rewardId?: string;
};

export type DemoSupportEntry = {
  id: string;
  fromName: string;
  amount: number; // display units
  message?: string;
  createdAt: string;
};

export type DemoProfile = {
  username: string;
  displayName: string;
  bio: string;
  avatarEmoji: string;
  identityClaimed: boolean;
  identityClaimedAt?: string;
  passportLevel: 1 | 2 | 3;
};

export type DemoOffer = {
  id: string;
  brand: string;
  title: string;
  blurb: string;
  category: "shopping" | "events" | "food" | "travel" | "creator";
  unlocked: boolean;
  emoji: string;
};

export type DemoActivity = {
  id: string;
  kind: "badge" | "reward" | "offer" | "scan" | "support" | "campaign" | "profile";
  title: string;
  detail?: string;
  at: string;
};

export type DemoGoalKey = "offers" | "page" | "badges" | "campaign";
export type DemoStarterKey =
  | "essential"
  | "minimal"
  | "badgeFirst"
  | "quickSupport"
  | "creatorHub"
  | "athlete"
  | "shopper"
  | "community"
  | "fundraise";

export type DemoState = {
  version: 1;
  onboarded: boolean;
  selectedGoal?: DemoGoalKey;
  selectedStarter?: DemoStarterKey;
  profile: DemoProfile;
  badges: DemoBadge[];
  rewards: DemoReward[];
  offers: DemoOffer[];
  campaigns: DemoCampaign[];
  qrItems: DemoQrItem[];
  support: DemoSupportEntry[];
  activity: DemoActivity[];
};

// ─────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────

const SEED: DemoState = {
  version: 1,
  onboarded: false,
  profile: {
    username: "alex",
    displayName: "Alex Rivera",
    bio: "Designer · builder · collector of small wins.",
    avatarEmoji: "✨",
    identityClaimed: false,
    passportLevel: 1,
  },
  badges: [
    { id: "b1", kind: "og_2024", label: "OG 2024", emoji: "🏅", description: "Joined in the first wave.", tier: 2, tierName: "gold", category: "identity", verifiedAt: "2024-03-12T10:00:00Z", featured: true, privacyNote: "Visible on your public profile." },
    { id: "b2", kind: "collector", label: "Reward Collector", emoji: "🎴", description: "Claimed 3+ verified rewards.", tier: 1, tierName: "silver", category: "rewards", verifiedAt: "2024-08-01T10:00:00Z", featured: true },
    { id: "b3", kind: "explorer", label: "Offer Explorer", emoji: "🧭", description: "Engaged with 5+ partner offers.", tier: 1, tierName: "silver", category: "rewards", verifiedAt: "2024-10-22T10:00:00Z" },
  ],
  rewards: [
    { id: "r1", title: "Early supporter sticker pack", description: "A limited drop for first 500 fans.", brand: "XIONID", benefit: "Limited drop", cost: 50, claimed: false, status: "available", requiredBadgeKind: "verified_member" },
    { id: "r2", title: "Backstage AMA invite", description: "Private session with the creator.", brand: "Creator Partner", benefit: "Supporter-only access", cost: 200, claimed: false, status: "expiring", expiresAt: "2026-05-20T00:00:00Z", requiredBadgeKind: "supporter" },
    { id: "r3", title: "Signed digital print", description: "Numbered, 1 of 100.", brand: "Lumen Apparel", benefit: "Collectible", cost: 120, claimed: true, status: "claimed", claimedAt: "2026-04-12T10:00:00Z" },
  ],
  offers: [
    { id: "o1", brand: "Nimbus Coffee", title: "20% off any drink", blurb: "For verified Explorers in your city.", category: "food", unlocked: true, emoji: "☕" },
    { id: "o2", brand: "Lumen Apparel", title: "Early access drop", blurb: "Pre-launch window for Collectors.", category: "shopping", unlocked: true, emoji: "🧥" },
    { id: "o3", brand: "Sound District", title: "Free concert ticket", blurb: "OG members only · Sat night.", category: "events", unlocked: false, emoji: "🎟️" },
    { id: "o4", brand: "Atlas Stays", title: "Late checkout, free", blurb: "Available at 200+ partner hotels.", category: "travel", unlocked: false, emoji: "🏨" },
  ],
  campaigns: [
    { id: "c1", title: "Spring identity drop", blurb: "Claim your free passport upgrade.", endsAt: "2026-06-30T00:00:00Z", participants: 1284, joined: false },
    { id: "c2", title: "Weekend scan-to-win", blurb: "Scan a partner code to enter.", endsAt: "2026-05-10T00:00:00Z", participants: 412, joined: false },
  ],
  qrItems: [
    { id: "q1", code: "DEMO-CAFE-01", label: "Partner café check-in", scanned: false, rewardId: "r1" },
    { id: "q2", code: "DEMO-EVENT-22", label: "Live event entry", scanned: false },
    { id: "q3", code: "DEMO-MERCH-07", label: "Merch authenticity", scanned: true },
  ],
  support: [
    { id: "s1", fromName: "Jess", amount: 5, message: "Love what you're building!", createdAt: "2026-04-28T12:00:00Z" },
    { id: "s2", fromName: "Marco", amount: 12, createdAt: "2026-04-30T09:30:00Z" },
    { id: "s3", fromName: "Anonymous", amount: 1, message: "gm ✨", createdAt: "2026-05-02T08:15:00Z" },
  ],
  activity: [
    { id: "a1", kind: "badge", title: "Explorer badge verified", detail: "5 partner apps in 30 days", at: "2026-05-01T18:22:00Z" },
    { id: "a2", kind: "offer", title: "Unlocked: 20% off Nimbus Coffee", detail: "Local · in-store", at: "2026-04-30T11:04:00Z" },
    { id: "a3", kind: "support", title: "Marco supported you", detail: "Thanks for the post.", at: "2026-04-30T09:30:00Z" },
    { id: "a4", kind: "scan", title: "Checked in at partner café", at: "2026-04-28T08:14:00Z" },
  ],
};

// ─────────────────────────────────────────────────────────────
// Persistence (localStorage, SSR-safe)
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "xionid:demo:v1";

const isBrowser = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const clone = <T,>(v: T): T => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

export const getDemoState = (): DemoState => {
  if (!isBrowser()) return clone(SEED);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(SEED);
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed?.version !== 1) return clone(SEED);
    return parsed;
  } catch {
    return clone(SEED);
  }
};

export const setDemoState = (next: DemoState): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("xionid:demo:change"));
  } catch {
    /* quota / private mode — silently noop */
  }
};

export const updateDemoState = (mutator: (s: DemoState) => DemoState | void): DemoState => {
  const current = getDemoState();
  const draft = clone(current);
  const result = mutator(draft);
  const next = (result ?? draft) as DemoState;
  setDemoState(next);
  return next;
};

export const resetDemoState = (): DemoState => {
  const fresh = clone(SEED);
  setDemoState(fresh);
  return fresh;
};

// ─────────────────────────────────────────────────────────────
// Demo actions (used by future phases — safe no-ops today)
// ─────────────────────────────────────────────────────────────

export const claimDemoIdentity = (): DemoState =>
  updateDemoState((s) => {
    s.profile.identityClaimed = true;
    s.profile.identityClaimedAt = new Date().toISOString();
  });

export const claimDemoReward = (rewardId: string): DemoState =>
  updateDemoState((s) => {
    const r = s.rewards.find((x) => x.id === rewardId);
    if (r) {
      r.claimed = true;
      r.status = "claimed";
      r.claimedAt = new Date().toISOString();
      s.activity.unshift({
        id: `a-claim-${Date.now()}`,
        kind: "reward",
        title: `Claimed: ${r.title}`,
        detail: r.brand,
        at: r.claimedAt,
      });
    }
  });

/** Claim a reward that may not yet exist in user state — upsert + claim. */
export const upsertAndClaimReward = (reward: DemoReward): DemoState =>
  updateDemoState((s) => {
    let r = s.rewards.find((x) => x.id === reward.id);
    if (!r) {
      r = { ...reward };
      s.rewards.unshift(r);
    }
    r.claimed = true;
    r.status = "claimed";
    r.claimedAt = new Date().toISOString();
    s.activity.unshift({
      id: `a-claim-${Date.now()}`,
      kind: "reward",
      title: `Claimed: ${r.title}`,
      detail: r.brand,
      at: r.claimedAt,
    });
  });

export const joinDemoCampaign = (campaignId: string): DemoState =>
  updateDemoState((s) => {
    const c = s.campaigns.find((x) => x.id === campaignId);
    if (c && !c.joined) {
      c.joined = true;
      c.participants += 1;
    }
  });

export const scanDemoQr = (code: string): DemoState =>
  updateDemoState((s) => {
    const q = s.qrItems.find((x) => x.code === code);
    if (q) q.scanned = true;
  });

// ─────────────────────────────────────────────────────────────
// Phase 3 — Badge catalog, scan flow, rewards locker
// ─────────────────────────────────────────────────────────────

export const BADGE_CATEGORY_META: Record<BadgeCategory, { label: string; emoji: string; blurb: string }> = {
  identity:    { label: "Identity",       emoji: "🪪", blurb: "Who you are, verified once."          },
  activity:    { label: "Activity",       emoji: "⚡", blurb: "What you actually do, over time."     },
  support:     { label: "Support",        emoji: "💝", blurb: "Backers and the backed."              },
  lifestyle:   { label: "Lifestyle",      emoji: "🌿", blurb: "How you live and spend."              },
  community:   { label: "Community",      emoji: "🤝", blurb: "Where you belong."                    },
  rewards:     { label: "Rewards",        emoji: "🎁", blurb: "Perks unlocked, perks earned."        },
  education:   { label: "Education",      emoji: "🎓", blurb: "Skills with proof."                   },
  recruitment: { label: "Recruitment",    emoji: "💼", blurb: "Career signals you control."          },
  events:      { label: "Events & Travel",emoji: "🎟️", blurb: "Tickets, trips, and check-ins."       },
  creator:     { label: "Creator",        emoji: "🎨", blurb: "Your work and your milestones."       },
};

export const BADGE_TIER_META: Record<BadgeTier, { label: string; emoji: string; ring: string; numeric: 1 | 2 | 3 }> = {
  silver:  { label: "Silver",  emoji: "🥈", ring: "from-slate-300 to-slate-500",   numeric: 1 },
  gold:    { label: "Gold",    emoji: "🥇", ring: "from-amber-300 to-amber-600",   numeric: 2 },
  diamond: { label: "Diamond", emoji: "💎", ring: "from-cyan-300 to-fuchsia-500",  numeric: 3 },
};

export type BadgeCatalogEntry = {
  kind: string;
  label: string;
  emoji: string;
  description: string;
  category: BadgeCategory;
  tierName: BadgeTier;
  privacyNote?: string;
};

/** Master catalog — ~30 sample badges across all categories & tiers. */
export const BADGE_CATALOG: BadgeCatalogEntry[] = [
  // Identity
  { kind: "verified_member", label: "Verified Member",  emoji: "✅", description: "Identity confirmed by XIONID.",         category: "identity", tierName: "silver",  privacyNote: "Only the badge is public — never your data." },
  { kind: "public_id",       label: "Public ID Holder", emoji: "🪪", description: "Holds a claimed public ID handle.",     category: "identity", tierName: "gold" },
  { kind: "early_access",    label: "Early Access",     emoji: "🚀", description: "Joined during early access window.",    category: "identity", tierName: "diamond" },
  // Activity
  { kind: "active_lifestyle",   label: "Active Lifestyle",      emoji: "🏃", description: "Consistent activity signals over 30 days.", category: "activity", tierName: "silver" },
  { kind: "event_goer",         label: "Event Goer",            emoji: "🎫", description: "Attended 3+ verified events.",              category: "activity", tierName: "gold" },
  { kind: "frequent_traveler",  label: "Frequent Traveler",     emoji: "✈️", description: "5+ trips with verified bookings.",          category: "activity", tierName: "gold" },
  { kind: "consistent",         label: "Consistent Participant",emoji: "📈", description: "Steady engagement across 90 days.",         category: "activity", tierName: "diamond" },
  // Support
  { kind: "supporter",        label: "Supporter",       emoji: "💛", description: "Backed a creator or campaign.",      category: "support", tierName: "silver" },
  { kind: "super_supporter",  label: "Super Supporter", emoji: "💖", description: "Backed 5+ creators.",                category: "support", tierName: "gold" },
  { kind: "founding_backer",  label: "Founding Backer", emoji: "🌟", description: "Backed in the first 100 supporters.",category: "support", tierName: "diamond" },
  // Lifestyle
  { kind: "athlete",          label: "Athlete",            emoji: "🏅", description: "Verified club, league, or coach.",      category: "lifestyle", tierName: "gold" },
  { kind: "wellness",         label: "Wellness Enthusiast",emoji: "🧘", description: "Verified wellness brand activity.",     category: "lifestyle", tierName: "silver" },
  { kind: "premium_shopper",  label: "Premium Shopper",    emoji: "🛍️", description: "Verified premium purchases.",           category: "lifestyle", tierName: "gold" },
  // Community
  { kind: "community_member", label: "Community Member", emoji: "🫂", description: "Member of a verified community.",     category: "community", tierName: "silver" },
  { kind: "builder",          label: "Builder",          emoji: "🛠️", description: "Shipped a verified contribution.",    category: "community", tierName: "gold" },
  { kind: "ambassador",       label: "Ambassador",       emoji: "🎗️", description: "Official program ambassador.",        category: "community", tierName: "diamond" },
  // Rewards
  { kind: "offer_explorer",   label: "Offer Explorer",   emoji: "🧭", description: "Engaged with 5+ partner offers.",    category: "rewards", tierName: "silver" },
  { kind: "reward_collector", label: "Reward Collector", emoji: "🎁", description: "Claimed 10+ rewards.",               category: "rewards", tierName: "gold" },
  { kind: "priority_access",  label: "Priority Access",  emoji: "⏩", description: "Front-of-line at partner drops.",     category: "rewards", tierName: "diamond" },
  // Education
  { kind: "course_done",      label: "Course Completed",   emoji: "📘", description: "Completed an issuer-verified course.", category: "education", tierName: "silver" },
  { kind: "bootcamp_grad",    label: "Bootcamp Graduate",  emoji: "🎓", description: "Graduated a verified bootcamp.",       category: "education", tierName: "gold" },
  { kind: "credential",       label: "Credential Verified",emoji: "📜", description: "Professional credential confirmed.",   category: "education", tierName: "diamond" },
  // Recruitment
  { kind: "candidate_passport", label: "Candidate Passport",emoji: "💼", description: "Profile reviewed and verified.",       category: "recruitment", tierName: "silver" },
  { kind: "portfolio_verified", label: "Portfolio Verified",emoji: "📁", description: "Portfolio links confirmed by issuer.", category: "recruitment", tierName: "gold" },
  { kind: "professional",       label: "Professional Member",emoji: "🧑‍💼", description: "Verified professional org member.",   category: "recruitment", tierName: "diamond" },
  // Events & Travel
  { kind: "ticket_verified",   label: "Ticket Verified",     emoji: "🎟️", description: "Authentic ticket from issuer.",      category: "events", tierName: "silver" },
  { kind: "festival_attendee", label: "Festival Attendee",   emoji: "🎪", description: "Checked in at a verified festival.", category: "events", tierName: "gold" },
  { kind: "travel_perks",      label: "Travel Perks Eligible",emoji: "🛫", description: "Eligible for partner travel perks.", category: "events", tierName: "diamond" },
  // Creator
  { kind: "creator_verified",  label: "Creator Verified",    emoji: "🎨", description: "Verified independent creator.",      category: "creator", tierName: "silver" },
  { kind: "campaign_milestone",label: "Campaign Milestone",  emoji: "🏆", description: "Hit a verified campaign milestone.", category: "creator", tierName: "gold" },
  { kind: "trusted_creator",   label: "Trusted Creator",     emoji: "💎", description: "Long-standing trusted creator.",     category: "creator", tierName: "diamond" },
];

export const findCatalogByKind = (kind: string): BadgeCatalogEntry | undefined =>
  BADGE_CATALOG.find((b) => b.kind === kind);

// ── Scan flow taxonomy ──────────────────────────────────────

export type ScanSignalKey =
  | "purchase_receipt"
  | "app_account"
  | "event_ticket"
  | "course_certificate"
  | "membership"
  | "campaign_milestone"
  | "profile_completion";

export type ScanSourceKey =
  | "email_receipt"
  | "app_account"
  | "booking_record"
  | "issuer_confirmation"
  | "campaign_milestone"
  | "demo_source";

export const SCAN_SIGNALS: { key: ScanSignalKey; label: string; emoji: string; blurb: string; suggestedBadgeKind: string }[] = [
  { key: "purchase_receipt",  label: "Purchase receipt",  emoji: "🧾", blurb: "From a partner brand or store.",      suggestedBadgeKind: "premium_shopper" },
  { key: "app_account",       label: "App account",       emoji: "📱", blurb: "Confirm an account with an app.",     suggestedBadgeKind: "active_lifestyle" },
  { key: "event_ticket",      label: "Event ticket",      emoji: "🎟️", blurb: "Real ticket from a real issuer.",     suggestedBadgeKind: "ticket_verified" },
  { key: "course_certificate",label: "Course certificate",emoji: "📘", blurb: "From an education issuer.",            suggestedBadgeKind: "course_done" },
  { key: "membership",        label: "Membership",        emoji: "🪪", blurb: "Club, gym, league, or org.",           suggestedBadgeKind: "community_member" },
  { key: "campaign_milestone",label: "Campaign milestone",emoji: "🏆", blurb: "Reach a creator goal.",                suggestedBadgeKind: "campaign_milestone" },
  { key: "profile_completion",label: "Profile completion",emoji: "✨", blurb: "Finish your XIONID passport.",         suggestedBadgeKind: "verified_member" },
];

export const SCAN_SOURCES: { key: ScanSourceKey; label: string; emoji: string; blurb: string }[] = [
  { key: "email_receipt",       label: "Email receipt",        emoji: "📧", blurb: "We read only what's needed."  },
  { key: "app_account",         label: "App account",          emoji: "🔗", blurb: "Linked, never stored."        },
  { key: "booking_record",      label: "Booking record",       emoji: "📅", blurb: "From a verified provider."    },
  { key: "issuer_confirmation", label: "Issuer confirmation",  emoji: "🏛️", blurb: "Direct from the source."      },
  { key: "campaign_milestone",  label: "Campaign milestone",   emoji: "📣", blurb: "Inside an XIONID campaign."   },
  { key: "demo_source",         label: "Demo source",          emoji: "🎭", blurb: "Pitch-safe simulated check."  },
];

/** Issue a brand-new demo badge from the catalog. */
export const issueDemoBadge = (kind: string, opts?: { featured?: boolean }): { state: DemoState; badge: DemoBadge } => {
  const entry = findCatalogByKind(kind) ?? BADGE_CATALOG[0];
  const tierMeta = BADGE_TIER_META[entry.tierName];
  const id = `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const badge: DemoBadge = {
    id,
    kind: entry.kind,
    label: entry.label,
    emoji: entry.emoji,
    description: entry.description,
    category: entry.category,
    tierName: entry.tierName,
    tier: tierMeta.numeric,
    verifiedAt: new Date().toISOString(),
    featured: opts?.featured ?? false,
    privacyNote: entry.privacyNote ?? "Only the badge — never the underlying data — is shared.",
  };
  const state = updateDemoState((s) => {
    // Replace if same kind exists, else prepend.
    const existing = s.badges.findIndex((b) => b.kind === entry.kind);
    if (existing >= 0) s.badges[existing] = { ...s.badges[existing], ...badge, id: s.badges[existing].id };
    else s.badges.unshift(badge);
    s.activity.unshift({
      id: `a-${id}`,
      kind: "badge",
      title: `${entry.label} badge issued`,
      detail: `${BADGE_CATEGORY_META[entry.category].label} · ${tierMeta.label}`,
      at: badge.verifiedAt,
    });
    // Unlock matching offers / rewards.
    s.offers.forEach((o) => { if (!o.unlocked && Math.random() > 0.6) o.unlocked = true; });
    s.rewards.forEach((r) => { if (r.requiredBadgeKind === entry.kind && r.status === "available") r.status = "available"; });
  });
  return { state, badge };
};

export const setBadgeFeatured = (badgeId: string, featured: boolean): DemoState =>
  updateDemoState((s) => {
    const b = s.badges.find((x) => x.id === badgeId);
    if (b) b.featured = featured;
  });

export const setBadgeHidden = (badgeId: string, hidden: boolean): DemoState =>
  updateDemoState((s) => {
    const b = s.badges.find((x) => x.id === badgeId);
    if (b) b.hidden = hidden;
  });

/** Get badges marked featured (for public profile preview). */
export const getFeaturedBadges = (s: DemoState = getDemoState()): DemoBadge[] =>
  s.badges.filter((b) => b.featured && !b.hidden).slice(0, 6);


// ─────────────────────────────────────────────────────────────
// Onboarding catalogs (Phase 1)
// ─────────────────────────────────────────────────────────────

export const DEMO_GOALS: { key: DemoGoalKey; title: string; blurb: string; emoji: string }[] = [
  { key: "offers",   title: "Get more relevant offers", blurb: "Unlock perks tailored to what you actually do.", emoji: "🎁" },
  { key: "page",     title: "Build my public page",     blurb: "A polished page you can share with one tap.",   emoji: "✨" },
  { key: "badges",   title: "Collect badges",           blurb: "Earn proof for the things you're part of.",     emoji: "🏅" },
  { key: "campaign", title: "Launch a support campaign",blurb: "Let people back what you're working on.",       emoji: "📣" },
];

export const DEMO_STARTERS: {
  key: DemoStarterKey;
  title: string;
  blurb: string;
  goalFit: DemoGoalKey[];
  emoji: string;
}[] = [
  { key: "essential",    title: "Essential Rewards Passport", blurb: "Best all-rounder. Profile + rewards + offers.",     goalFit: ["offers","page"],          emoji: "🎫" },
  { key: "minimal",      title: "Minimal Public Card",        blurb: "Just the essentials, beautifully laid out.",         goalFit: ["page"],                   emoji: "🪪" },
  { key: "badgeFirst",   title: "Badge-First Passport",       blurb: "Lead with verified proof and badges.",                goalFit: ["badges","page"],          emoji: "🏅" },
  { key: "quickSupport", title: "Quick Support Page",         blurb: "Accept support in under a minute.",                   goalFit: ["campaign"],               emoji: "💝" },
  { key: "creatorHub",   title: "Creator Support Hub",        blurb: "Posts, perks, and supporters in one place.",          goalFit: ["campaign","page"],        emoji: "🎨" },
  { key: "athlete",      title: "Athlete Passport",           blurb: "Stats, sponsors, and event check-ins.",               goalFit: ["badges","offers"],        emoji: "🏃" },
  { key: "shopper",      title: "Shopper Perks Passport",     blurb: "Personal offers from brands you like.",               goalFit: ["offers"],                 emoji: "🛍️" },
  { key: "community",    title: "Community Leader Page",      blurb: "Member directory + event reminders.",                 goalFit: ["page","campaign"],        emoji: "🤝" },
  { key: "fundraise",    title: "Fundraise Campaign Starter", blurb: "Goal, supporters, and progress in one view.",         goalFit: ["campaign"],               emoji: "🚀" },
];

export const completeDemoOnboarding = (goal: DemoGoalKey, starter: DemoStarterKey): DemoState =>
  updateDemoState((s) => {
    s.onboarded = true;
    s.selectedGoal = goal;
    s.selectedStarter = starter;
    s.activity.unshift({
      id: `a-onboard-${Date.now()}`,
      kind: "profile",
      title: `Started with ${DEMO_STARTERS.find((x) => x.key === starter)?.title ?? "a starter"}`,
      at: new Date().toISOString(),
    });
  });

// Profile completeness 0–100 derived from demo state.
export const getProfileCompleteness = (s: DemoState = getDemoState()): number => {
  let score = 20;
  if (s.profile.identityClaimed) score += 20;
  if (s.profile.bio) score += 10;
  if (s.profile.avatarEmoji) score += 5;
  if (s.badges.length >= 3) score += 15;
  if (s.support.length > 0) score += 10;
  if (s.qrItems.some((q) => q.scanned)) score += 10;
  if (s.onboarded) score += 10;
  return Math.min(100, score);
};
