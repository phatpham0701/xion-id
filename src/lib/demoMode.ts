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

export type DemoBadge = {
  id: string;
  kind: string;
  label: string;
  emoji: string;
  description: string;
  tier: number;
  verifiedAt: string;
};

export type DemoReward = {
  id: string;
  title: string;
  description: string;
  cost: number; // abstract "points" — never call it tokens
  claimed: boolean;
  imageUrl?: string;
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

export type DemoState = {
  version: 1;
  profile: DemoProfile;
  badges: DemoBadge[];
  rewards: DemoReward[];
  campaigns: DemoCampaign[];
  qrItems: DemoQrItem[];
  support: DemoSupportEntry[];
};

// ─────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────

const SEED: DemoState = {
  version: 1,
  profile: {
    username: "alex",
    displayName: "Alex Rivera",
    bio: "Designer · builder · collector of small wins.",
    avatarEmoji: "✨",
    identityClaimed: false,
    passportLevel: 1,
  },
  badges: [
    { id: "b1", kind: "og_2024", label: "OG 2024", emoji: "🏅", description: "Joined in the first wave.", tier: 2, verifiedAt: "2024-03-12T10:00:00Z" },
    { id: "b2", kind: "collector", label: "Collector", emoji: "🎴", description: "Owns 3+ verified collectibles.", tier: 1, verifiedAt: "2024-08-01T10:00:00Z" },
    { id: "b3", kind: "explorer", label: "Explorer", emoji: "🧭", description: "Tried 5+ verified apps.", tier: 1, verifiedAt: "2024-10-22T10:00:00Z" },
  ],
  rewards: [
    { id: "r1", title: "Early supporter sticker pack", description: "A limited drop for first 500 fans.", cost: 50, claimed: false },
    { id: "r2", title: "Backstage AMA invite", description: "Private session with the creator.", cost: 200, claimed: false },
    { id: "r3", title: "Signed digital print", description: "Numbered, 1 of 100.", cost: 120, claimed: true },
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
  const result = mutator(draft) ?? draft;
  setDemoState(result);
  return result;
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
