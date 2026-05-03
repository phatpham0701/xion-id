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

export type DemoCampaign = {
  id: string;
  title: string;
  blurb: string;
  endsAt: string;
  participants: number;
  joined: boolean;
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
    if (r) r.claimed = true;
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
