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
  proofHint: string;
  description: string;
};

const badgeSeeds: Record<SportInterest, Omit<SportBadgeDefinition, "id" | "interest">[]> = {
  Running: [
    { name: "First 5K Proof", proofHint: "run screenshot or manual run log", description: "Entry proof that running is part of your week." },
    { name: "Weekly Run Streak", proofHint: "three runs in seven days", description: "Basic consistency across a training week." },
    { name: "Tempo Builder", proofHint: "tempo workout note", description: "Proof of structured run effort." },
    { name: "Long Run Signal", proofHint: "long run distance log", description: "Endurance behavior with measurable distance." },
    { name: "Run Crew Contributor", proofHint: "group run participation", description: "Community signal from showing up with others." },
  ],
  "Gym / Strength": [
    { name: "Strength Starter", proofHint: "workout log or lift screenshot", description: "Entry proof of gym or strength training." },
    { name: "Progressive Overload", proofHint: "two-week lift progression", description: "Consistency signal from improving a movement." },
    { name: "Leg Day Verified", proofHint: "lower-body session log", description: "Proof of balanced strength work." },
    { name: "Form Discipline", proofHint: "coach note or training clip", description: "Quality signal for safe movement practice." },
    { name: "Strength Mentor", proofHint: "training partner support note", description: "Community signal from helping others train." },
  ],
  Cycling: [
    { name: "Ride Logged", proofHint: "ride screenshot or manual distance", description: "Entry proof of cycling activity." },
    { name: "Weekend Rider", proofHint: "weekend route log", description: "Lifestyle consistency across leisure training." },
    { name: "Climb Hunter", proofHint: "elevation proof", description: "High-effort ride behavior." },
    { name: "Commute Signal", proofHint: "commute ride proof", description: "Cycling embedded into daily lifestyle." },
    { name: "Peloton Pack", proofHint: "group ride proof", description: "Community proof from riding with others." },
  ],
  Swimming: [
    { name: "Pool Proof", proofHint: "swim session log", description: "Entry proof of swimming activity." },
    { name: "Lap Consistency", proofHint: "weekly lap count", description: "Basic swim consistency." },
    { name: "Technique Builder", proofHint: "drill session note", description: "Quality signal for improving stroke discipline." },
    { name: "Open Water Ready", proofHint: "open-water session proof", description: "High-signal swim lifestyle proof." },
    { name: "Swim Squad", proofHint: "club or group session proof", description: "Community signal from shared training." },
  ],
  "Hybrid Athlete": [
    { name: "Hybrid Starter", proofHint: "run plus strength session", description: "Entry proof across endurance and strength." },
    { name: "Two-a-Day Proof", proofHint: "two workouts in one day", description: "Advanced consistency signal." },
    { name: "Engine + Iron", proofHint: "cardio and lift week", description: "Balanced high-signal training." },
    { name: "Recovery-Aware Hybrid", proofHint: "recovery routine attached", description: "Proof that intensity is matched by recovery." },
    { name: "Hybrid Event Ready", proofHint: "event or simulation result", description: "Career-worthy multi-discipline proof." },
  ],
  "Marathon / Events": [
    { name: "Race Registered", proofHint: "registration confirmation", description: "Entry proof toward an event goal." },
    { name: "Training Block Started", proofHint: "first week plan", description: "Structured preparation signal." },
    { name: "Bib Earned", proofHint: "bib or event check-in", description: "Participation proof from an organized event." },
    { name: "Finish Line Proof", proofHint: "finish result or photo", description: "Strong event completion signal." },
    { name: "Event Ambassador", proofHint: "volunteer, pacer, or creator proof", description: "High-signal contribution to an event community." },
  ],
  Recovery: [
    { name: "Recovery Ritual", proofHint: "mobility, sleep, or cooldown log", description: "Entry proof of taking recovery seriously." },
    { name: "Mobility Streak", proofHint: "three mobility sessions", description: "Basic consistency in movement care." },
    { name: "Sleep Discipline", proofHint: "sleep routine summary", description: "Lifestyle signal for sustainable training." },
    { name: "Deload Smart", proofHint: "deload week note", description: "High-quality training judgment." },
    { name: "Recovery Advocate", proofHint: "shared routine or community support", description: "Ambassador-level recovery behavior." },
  ],
  Wellness: [
    { name: "Wellness Check-In", proofHint: "habit log", description: "Entry proof of a wellness practice." },
    { name: "Hydration Habit", proofHint: "hydration streak", description: "Basic consistency in daily care." },
    { name: "Mindful Movement", proofHint: "walk, yoga, or mobility proof", description: "Balanced lifestyle signal." },
    { name: "Stress Reset", proofHint: "breathwork or reset routine", description: "Proof of sustainable wellness behavior." },
    { name: "Community Wellness Lead", proofHint: "group wellness activity", description: "High-signal contribution to others." },
  ],
  "Sports Gear": [
    { name: "Gear In Use", proofHint: "training photo or gear log", description: "Entry proof that gear supports real activity." },
    { name: "Shoe Rotation", proofHint: "gear rotation note", description: "Consistency signal around training readiness." },
    { name: "Durability Tester", proofHint: "usage report", description: "Useful signal for brands and communities." },
    { name: "Kit Review Signal", proofHint: "review plus activity proof", description: "Creator-quality gear feedback." },
    { name: "Gear Ambassador", proofHint: "community recommendation or test history", description: "High-signal gear lifestyle reputation." },
  ],
  Supplements: [
    { name: "Nutrition Routine", proofHint: "routine note", description: "Entry proof of intentional nutrition support." },
    { name: "Protein Consistency", proofHint: "weekly intake habit", description: "Basic consistency in fueling." },
    { name: "Hydration + Electrolytes", proofHint: "training-day nutrition proof", description: "Sport-specific nutrition behavior." },
    { name: "Race Fuel Tested", proofHint: "long workout fueling note", description: "High-signal preparation proof." },
    { name: "Nutrition Educator", proofHint: "shared routine with disclaimer", description: "Ambassador-level nutrition community signal." },
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
  selectedInterest: SportInterest;
  earnedBadges: Record<string, { tier: BadgeTier; progress: number; proofs: number }>;
  proofs: LifestyleProof[];
  challenges: PersonalChallenge[];
};

const STORAGE_KEY = "xionid:sport-lifestyle:v1";

export const defaultSportLifestyleState = (): SportLifestyleState => ({
  version: 1,
  selectedInterest: "Running",
  earnedBadges: {
    "running-1": { tier: "Bronze", progress: 25, proofs: 1 },
    "recovery-1": { tier: "Bronze", progress: 15, proofs: 1 },
  },
  proofs: [
    { id: "proof-demo-1", interest: "Running", badgeId: "running-1", proofType: "Demo run screenshot", status: "Simulated", createdAt: new Date().toISOString() },
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

export const getSportLifestyleState = (): SportLifestyleState => {
  if (typeof window === "undefined") return defaultSportLifestyleState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSportLifestyleState();
    return { ...defaultSportLifestyleState(), ...JSON.parse(raw) };
  } catch {
    return defaultSportLifestyleState();
  }
};

export const saveSportLifestyleState = (next: SportLifestyleState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("xionid:sport-lifestyle:change"));
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
  { rank: 1, name: "Maya Chen", sport: "Hybrid Athlete", signal: 420, topBadge: "Elite Hybrid Event Ready" },
  { rank: 2, name: "Jordan Lee", sport: "Running", signal: 355, topBadge: "Diamond Long Run Signal" },
  { rank: 3, name: "You", sport: state.selectedInterest, signal: getRankScore(state), topBadge: "Lifestyle proof in progress" },
  { rank: 4, name: "Sam Rivera", sport: "Recovery", signal: 285, topBadge: "Gold Recovery Ritual" },
  { rank: 5, name: "Ari Novak", sport: "Cycling", signal: 260, topBadge: "Gold Weekend Rider" },
].sort((a, b) => b.signal - a.signal || a.rank - b.rank).map((entry, index) => ({ ...entry, rank: index + 1 }));
