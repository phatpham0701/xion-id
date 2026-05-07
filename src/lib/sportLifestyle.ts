export const SPORT_INTERESTS = [
  "Running",
  "Gym / Strength",
  "Cycling",
  "Swimming",
  "Hybrid Athlete",
  "Marathon / Events",
  "Recovery",
  "Wellness",
  "Sports Gear",
  "Supplements",
] as const;

export type SportInterest = (typeof SPORT_INTERESTS)[number];

export const BADGE_TIERS = ["Bronze", "Silver", "Gold", "Diamond", "Elite"] as const;
export type BadgeTier = (typeof BADGE_TIERS)[number];

export const BADGE_TIER_MEANING: Record<BadgeTier, string> = {
  Bronze: "started / entry proof",
  Silver: "basic consistency",
  Gold: "strong consistency",
  Diamond: "high-signal lifestyle",
  Elite: "exceptional / ambassador-level / career-worthy lifestyle proof",
};

export type SportBadgeDefinition = {
  id: string;
  name: string;
  interest: SportInterest;
  tierIntent: BadgeTier;
  proofHint: string;
  description: string;
};

const badgeSeeds: Record<SportInterest, Omit<SportBadgeDefinition, "id" | "interest">[]> = {
  Running: [
    { tierIntent: "Bronze", name: "Run Lifestyle Starter", proofHint: "first run log, screenshot, or event note", description: "Entry proof that running is part of your active lifestyle." },
    { tierIntent: "Silver", name: "Weekly Runner", proofHint: "one or more runs in a week", description: "Basic running consistency with repeatable proof." },
    { tierIntent: "Gold", name: "Run Consistency Builder", proofHint: "multi-run week or structured run note", description: "Strong signal that running is becoming a real habit." },
    { tierIntent: "Diamond", name: "Race-Ready Runner", proofHint: "long run, race registration, bib, or finish proof", description: "High-signal running lifestyle proof for brands and events." },
    { tierIntent: "Elite", name: "Run Lifestyle Ambassador", proofHint: "community run, pacing, content, or referral proof", description: "Ambassador-level running identity with community contribution." },
  ],
  "Gym / Strength": [
    { tierIntent: "Bronze", name: "Strength Lifestyle Starter", proofHint: "first gym log, lift screenshot, or membership note", description: "Entry proof that strength training is part of your week." },
    { tierIntent: "Silver", name: "Weekly Strength Builder", proofHint: "one or more strength sessions in a week", description: "Basic gym consistency across a training week." },
    { tierIntent: "Gold", name: "Progressive Strength Signal", proofHint: "volume, load, or movement progression", description: "Strong consistency signal from structured strength work." },
    { tierIntent: "Diamond", name: "Strength Discipline Proof", proofHint: "balanced split, form note, coach note, or program proof", description: "High-signal proof of disciplined and sustainable training." },
    { tierIntent: "Elite", name: "Strength Lifestyle Ambassador", proofHint: "training partner, community, content, or referral proof", description: "Career-worthy strength lifestyle reputation and influence." },
  ],
  Cycling: [
    { tierIntent: "Bronze", name: "Cycling Lifestyle Starter", proofHint: "first ride screenshot or manual distance", description: "Entry proof that cycling is part of your lifestyle." },
    { tierIntent: "Silver", name: "Weekly Rider", proofHint: "weekly ride log", description: "Basic cycling consistency over a week." },
    { tierIntent: "Gold", name: "Endurance Ride Builder", proofHint: "distance, route, cadence, or duration proof", description: "Strong cycling signal from repeatable endurance behavior." },
    { tierIntent: "Diamond", name: "Cycling Gear Signal", proofHint: "gear usage, ride streak, event, or group route", description: "High-signal cycling proof for gear, events, and communities." },
    { tierIntent: "Elite", name: "Cycling Lifestyle Ambassador", proofHint: "group ride, route leadership, content, or referral proof", description: "Ambassador-level cycling identity with community value." },
  ],
  Swimming: [
    { tierIntent: "Bronze", name: "Swim Lifestyle Starter", proofHint: "first swim log", description: "Entry proof that swimming is part of your active lifestyle." },
    { tierIntent: "Silver", name: "Weekly Swimmer", proofHint: "weekly lap or duration proof", description: "Basic swim consistency across a training week." },
    { tierIntent: "Gold", name: "Technique Builder", proofHint: "drill set, lap count, or stroke practice note", description: "Strong signal for skill development and consistency." },
    { tierIntent: "Diamond", name: "Aquatic Discipline Proof", proofHint: "open-water, long swim, or structured swim block", description: "High-signal swim lifestyle proof with discipline and endurance." },
    { tierIntent: "Elite", name: "Swim Lifestyle Ambassador", proofHint: "club, group session, event, content, or referral proof", description: "Ambassador-level swimming identity with community contribution." },
  ],
  "Hybrid Athlete": [
    { tierIntent: "Bronze", name: "Hybrid Lifestyle Starter", proofHint: "proof from two training modalities", description: "Entry proof across endurance and strength lifestyle behavior." },
    { tierIntent: "Silver", name: "Multi-Sport Consistency", proofHint: "two sports repeated within a week", description: "Basic consistency across more than one sport." },
    { tierIntent: "Gold", name: "Engine + Strength Builder", proofHint: "cardio and strength proof in the same block", description: "Strong signal of balanced hybrid training." },
    { tierIntent: "Diamond", name: "Recovery-Aware Hybrid", proofHint: "training plus recovery proof", description: "High-signal hybrid proof that intensity is matched by recovery." },
    { tierIntent: "Elite", name: "Hybrid Lifestyle Ambassador", proofHint: "multi-sport event, community, content, or referral proof", description: "Career-worthy hybrid athlete identity and public lifestyle signal." },
  ],
  "Marathon / Events": [
    { tierIntent: "Bronze", name: "Event Lifestyle Starter", proofHint: "registration, ticket, or event intent proof", description: "Entry proof that events are part of your lifestyle." },
    { tierIntent: "Silver", name: "Training Block Starter", proofHint: "first training week or preparation note", description: "Basic consistency toward an event goal." },
    { tierIntent: "Gold", name: "Bib Holder", proofHint: "bib, check-in, or event participation proof", description: "Strong proof of real-world event participation." },
    { tierIntent: "Diamond", name: "Finish Line Proof", proofHint: "finish result, medal, photo, or timing proof", description: "High-signal event completion proof." },
    { tierIntent: "Elite", name: "Event Lifestyle Ambassador", proofHint: "volunteer, pacer, creator, referral, or community proof", description: "Ambassador-level contribution to an event community." },
  ],
  Recovery: [
    { tierIntent: "Bronze", name: "Recovery Lifestyle Starter", proofHint: "mobility, sleep, cooldown, or rest habit note", description: "Entry proof of taking recovery seriously." },
    { tierIntent: "Silver", name: "Weekly Recovery Ritual", proofHint: "three recovery sessions or routines", description: "Basic consistency in movement care and recovery behavior." },
    { tierIntent: "Gold", name: "Sleep + Mobility Builder", proofHint: "sleep routine, mobility streak, or cooldown proof", description: "Strong signal for sustainable training discipline." },
    { tierIntent: "Diamond", name: "Recovery Discipline Proof", proofHint: "deload week, HRV-aware adjustment, or recovery protocol", description: "High-signal proof of intelligent training judgment." },
    { tierIntent: "Elite", name: "Recovery Lifestyle Ambassador", proofHint: "shared routine, community education, content, or referral proof", description: "Ambassador-level recovery behavior that helps others." },
  ],
  Wellness: [
    { tierIntent: "Bronze", name: "Wellness Lifestyle Starter", proofHint: "wellness check-in or habit log", description: "Entry proof of a wellness practice." },
    { tierIntent: "Silver", name: "Daily Care Builder", proofHint: "hydration, walking, breathwork, or mobility streak", description: "Basic consistency in daily wellness care." },
    { tierIntent: "Gold", name: "Mindful Movement Signal", proofHint: "walk, yoga, mobility, or stress reset proof", description: "Strong balanced lifestyle signal." },
    { tierIntent: "Diamond", name: "Wellness Discipline Proof", proofHint: "multi-week habit streak or routine summary", description: "High-signal proof of sustainable wellness behavior." },
    { tierIntent: "Elite", name: "Wellness Lifestyle Ambassador", proofHint: "group activity, shared routine, content, or referral proof", description: "Ambassador-level wellness identity with community value." },
  ],
  "Sports Gear": [
    { tierIntent: "Bronze", name: "Gear Lifestyle Starter", proofHint: "gear purchase or gear-in-use proof", description: "Entry proof that sport gear supports real activity." },
    { tierIntent: "Silver", name: "Gear In Use", proofHint: "training photo, usage log, or gear rotation note", description: "Basic signal that gear is actively used, not just purchased." },
    { tierIntent: "Gold", name: "Durability Feedback Signal", proofHint: "usage report or repeated activity with the same gear", description: "Strong product feedback signal for sport brands." },
    { tierIntent: "Diamond", name: "Trusted Gear Reviewer", proofHint: "review plus activity proof", description: "High-signal gear lifestyle proof with useful feedback." },
    { tierIntent: "Elite", name: "Gear Lifestyle Ambassador", proofHint: "community recommendation, product test, content, or referral proof", description: "Ambassador-level gear reputation and creator value." },
  ],
  Supplements: [
    { tierIntent: "Bronze", name: "Nutrition Lifestyle Starter", proofHint: "nutrition routine, receipt, or training-day note", description: "Entry proof of intentional nutrition support." },
    { tierIntent: "Silver", name: "Protein Consistency", proofHint: "weekly protein or supplement routine", description: "Basic consistency in fueling and recovery support." },
    { tierIntent: "Gold", name: "Training Fuel Builder", proofHint: "hydration, electrolytes, or workout fueling proof", description: "Strong signal for sport-specific nutrition behavior." },
    { tierIntent: "Diamond", name: "Race Fuel Tested", proofHint: "long workout, event prep, or tested fueling note", description: "High-signal proof of performance-oriented preparation." },
    { tierIntent: "Elite", name: "Nutrition Lifestyle Ambassador", proofHint: "shared routine with disclaimer, community content, or referral proof", description: "Ambassador-level nutrition lifestyle signal." },
  ],
};

export const SPORT_BADGES: SportBadgeDefinition[] = SPORT_INTERESTS.flatMap((interest) =>
  badgeSeeds[interest].map((badge, index) => ({
    ...badge,
    interest,
    id: `${interest.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${index + 1}`,
  })),
);

export const OPPORTUNITY_CATEGORIES = [
  "Gear Support",
  "Recovery Support",
  "Nutrition Support",
  "Event Access",
  "Coaching Access",
  "Sponsorship Trial",
  "Creator Collaboration",
] as const;

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export type LifestyleOpportunity = {
  id: string;
  title: string;
  category: OpportunityCategory;
  interests: SportInterest[];
  readiness: "Explore" | "Apply" | "Qualified" | "Ambassador-ready";
  status: "Demo" | "Waitlist" | "Simulated";
  reason: string;
};

export const LIFESTYLE_OPPORTUNITIES: LifestyleOpportunity[] = [
  { id: "gear-run", title: "Endurance shoe wear-test pool", category: "Gear Support", interests: ["Running", "Marathon / Events", "Sports Gear"], readiness: "Apply", status: "Waitlist", reason: "Matched to running/event proof and gear usage signals." },
  { id: "recovery-hybrid", title: "Recovery protocol feedback circle", category: "Recovery Support", interests: ["Recovery", "Hybrid Athlete", "Gym / Strength"], readiness: "Explore", status: "Demo", reason: "Matched to recovery routines and high training load." },
  { id: "nutrition-fuel", title: "Training fuel routine review", category: "Nutrition Support", interests: ["Supplements", "Marathon / Events", "Cycling"], readiness: "Apply", status: "Simulated", reason: "Matched to nutrition and endurance preparation signals." },
  { id: "event-access", title: "Local event early-access list", category: "Event Access", interests: ["Running", "Cycling", "Swimming", "Marathon / Events"], readiness: "Qualified", status: "Waitlist", reason: "Matched to event interest, challenge progress, and proof consistency." },
  { id: "coach-path", title: "Coach office-hours pilot", category: "Coaching Access", interests: ["Gym / Strength", "Hybrid Athlete", "Wellness", "Swimming"], readiness: "Explore", status: "Demo", reason: "Matched to structured training and improvement goals." },
  { id: "sponsor-trial", title: "Micro-sponsorship trial roster", category: "Sponsorship Trial", interests: ["Running", "Sports Gear", "Supplements", "Hybrid Athlete"], readiness: "Ambassador-ready", status: "Waitlist", reason: "Best for Diamond or Elite reputation with consistent proof history." },
  { id: "creator-collab", title: "Sport creator collaboration board", category: "Creator Collaboration", interests: ["Sports Gear", "Wellness", "Recovery", "Marathon / Events"], readiness: "Apply", status: "Demo", reason: "Matched to useful reviews, community participation, and lifestyle storytelling." },
];

export type LifestyleProof = {
  id: string;
  interest: SportInterest;
  badgeId: string;
  proofType: string;
  status: "Simulated" | "Submitted" | "Reviewed";
  createdAt: string;
};

export type PersonalChallenge = {
  id: string;
  title: string;
  sportType: SportInterest;
  targetMetric: string;
  target: number;
  currentProgress: number;
  deadline: string;
  linkedBadgeId: string;
};

export type SportLifestyleState = {
  version: 1;
  source: "local-demo";
  updatedAt: string;
  selectedInterest: SportInterest;
  earnedBadges: Record<string, { tier: BadgeTier; progress: number; proofs: number }>;
  proofs: LifestyleProof[];
  challenges: PersonalChallenge[];
};

const STORAGE_KEY = "xionid:sport-lifestyle:v1";
const nowIso = () => new Date().toISOString();

export const defaultSportLifestyleState = (): SportLifestyleState => ({
  version: 1,
  source: "local-demo",
  updatedAt: nowIso(),
  selectedInterest: "Running",
  earnedBadges: {
    "running-1": { tier: "Bronze", progress: 25, proofs: 1 },
    "recovery-1": { tier: "Bronze", progress: 15, proofs: 1 },
  },
  proofs: [
    { id: "proof-demo-1", interest: "Running", badgeId: "running-1", proofType: "Demo run screenshot", status: "Simulated", createdAt: nowIso() },
  ],
  challenges: [
    {
      id: "challenge-demo-1",
      title: "4 runs before Sunday",
      sportType: "Running",
      targetMetric: "completed runs",
      target: 4,
      currentProgress: 1,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      linkedBadgeId: "running-2",
    },
  ],
});

const isSportInterest = (value: unknown): value is SportInterest =>
  typeof value === "string" && SPORT_INTERESTS.includes(value as SportInterest);

const isBadgeTier = (value: unknown): value is BadgeTier =>
  typeof value === "string" && BADGE_TIERS.includes(value as BadgeTier);

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

export const sanitizeSportLifestyleState = (raw: unknown): SportLifestyleState => {
  const fallback = defaultSportLifestyleState();
  if (!raw || typeof raw !== "object") return fallback;

  const value = raw as Partial<SportLifestyleState>;
  const earnedBadges = Object.entries(value.earnedBadges ?? {}).reduce<SportLifestyleState["earnedBadges"]>((acc, [badgeId, badge]) => {
    if (!SPORT_BADGES.some((item) => item.id === badgeId)) return acc;
    const safeBadge = badge as { tier?: unknown; progress?: unknown; proofs?: unknown };
    const proofs = clampNumber(safeBadge.proofs, 0, 0, 999);
    acc[badgeId] = {
      tier: isBadgeTier(safeBadge.tier) ? safeBadge.tier : getTierFromProofs(proofs),
      progress: clampNumber(safeBadge.progress, Math.min(100, proofs * 20), 0, 100),
      proofs,
    };
    return acc;
  }, {});

  const proofs = Array.isArray(value.proofs)
    ? value.proofs.filter((proof): proof is LifestyleProof => {
        const item = proof as Partial<LifestyleProof>;
        return Boolean(item.id && isSportInterest(item.interest) && item.badgeId && item.proofType && item.createdAt);
      }).slice(0, 100)
    : fallback.proofs;

  const challenges = Array.isArray(value.challenges)
    ? value.challenges.filter((challenge): challenge is PersonalChallenge => {
        const item = challenge as Partial<PersonalChallenge>;
        return Boolean(item.id && item.title && isSportInterest(item.sportType) && item.deadline && item.linkedBadgeId);
      }).map((challenge) => ({
        ...challenge,
        target: clampNumber(challenge.target, 1, 1, 999),
        currentProgress: clampNumber(challenge.currentProgress, 0, 0, clampNumber(challenge.target, 1, 1, 999)),
      })).slice(0, 50)
    : fallback.challenges;

  return {
    ...fallback,
    ...value,
    version: 1,
    source: "local-demo",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : nowIso(),
    selectedInterest: isSportInterest(value.selectedInterest) ? value.selectedInterest : fallback.selectedInterest,
    earnedBadges: Object.keys(earnedBadges).length ? earnedBadges : fallback.earnedBadges,
    proofs,
    challenges,
  };
};

export const getSportLifestyleState = (): SportLifestyleState => {
  if (typeof window === "undefined") return defaultSportLifestyleState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSportLifestyleState();
    return sanitizeSportLifestyleState(JSON.parse(raw));
  } catch {
    return defaultSportLifestyleState();
  }
};

export const saveSportLifestyleState = (next: SportLifestyleState) => {
  if (typeof window === "undefined") return;
  const safe = sanitizeSportLifestyleState({ ...next, updatedAt: nowIso(), source: "local-demo" });
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent("xionid:sport-lifestyle:change"));
  } catch {
    // Private browsing / quota failure should not break the pitch-safe UI.
  }
};

export const resetSportLifestyleState = () => {
  const fresh = defaultSportLifestyleState();
  saveSportLifestyleState(fresh);
  return fresh;
};

export const getSuggestedBadges = (interest: SportInterest) => SPORT_BADGES.filter((badge) => badge.interest === interest);

export const getMatchedOpportunities = (interest: SportInterest) =>
  LIFESTYLE_OPPORTUNITIES.filter((opportunity) => opportunity.interests.includes(interest));

export const getTierFromProofs = (proofs: number): BadgeTier => {
  if (proofs >= 20) return "Elite";
  if (proofs >= 12) return "Diamond";
  if (proofs >= 7) return "Gold";
  if (proofs >= 3) return "Silver";
  return "Bronze";
};

export const getRankScore = (state: SportLifestyleState) => {
  const tierWeight: Record<BadgeTier, number> = { Bronze: 10, Silver: 25, Gold: 50, Diamond: 90, Elite: 150 };
  const badgeScore = Object.values(state.earnedBadges).reduce((sum, badge) => sum + tierWeight[badge.tier], 0);
  const challengeScore = state.challenges.reduce((sum, challenge) => sum + Math.min(40, Math.round((challenge.currentProgress / Math.max(1, challenge.target)) * 40)), 0);
  return badgeScore + challengeScore + state.proofs.length * 5;
};

export const getCountdown = (deadline: string) => {
  const end = new Date(`${deadline}T23:59:59`).getTime();
  const diff = end - Date.now();
  if (Number.isNaN(end)) return "No deadline";
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff / (60 * 60 * 1000)) % 24);
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
};

export const demoLeaderboard = (state: SportLifestyleState) => [
  { rank: 1, name: "Maya Chen", sport: "Hybrid Athlete", signal: 420, topBadge: "Elite Hybrid Lifestyle Ambassador" },
  { rank: 2, name: "Jordan Lee", sport: "Running", signal: 355, topBadge: "Diamond Race-Ready Runner" },
  { rank: 3, name: "You", sport: state.selectedInterest, signal: getRankScore(state), topBadge: "Lifestyle proof in progress" },
  { rank: 4, name: "Sam Rivera", sport: "Recovery", signal: 285, topBadge: "Gold Sleep + Mobility Builder" },
  { rank: 5, name: "Ari Novak", sport: "Cycling", signal: 260, topBadge: "Gold Endurance Ride Builder" },
].sort((a, b) => b.signal - a.signal || a.rank - b.rank).map((entry, index) => ({ ...entry, rank: index + 1 }));
