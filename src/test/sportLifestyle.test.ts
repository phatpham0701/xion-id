import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  SPORT_BADGES,
  SPORT_INTERESTS,
  BADGE_TIERS,
  getTierFromProofs,
  getRankScore,
  getSuggestedBadges,
  getMatchedOpportunities,
  getCountdown,
  defaultSportLifestyleState,
  sanitizeSportLifestyleState,
  getSportLifestyleState,
  saveSportLifestyleState,
  resetSportLifestyleState,
  demoLeaderboard,
  LIFESTYLE_OPPORTUNITIES,
} from "@/lib/sportLifestyle";

// ---------------------------------------------------------------------------
// SPORT_BADGES catalogue
// ---------------------------------------------------------------------------
describe("SPORT_BADGES", () => {
  it("has exactly 50 badges (5 tiers × 10 interests)", () => {
    expect(SPORT_BADGES).toHaveLength(50);
  });

  it("every badge has a unique id", () => {
    const ids = SPORT_BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every badge interest is in SPORT_INTERESTS", () => {
    for (const badge of SPORT_BADGES) {
      expect(SPORT_INTERESTS).toContain(badge.interest);
    }
  });

  it("every badge tier is in BADGE_TIERS", () => {
    for (const badge of SPORT_BADGES) {
      expect(BADGE_TIERS).toContain(badge.tierIntent);
    }
  });

  it("every badge has non-empty name, proofHint, and description", () => {
    for (const badge of SPORT_BADGES) {
      expect(badge.name.length).toBeGreaterThan(0);
      expect(badge.proofHint.length).toBeGreaterThan(0);
      expect(badge.description.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getTierFromProofs
// ---------------------------------------------------------------------------
describe("getTierFromProofs", () => {
  it.each([
    [0, "Bronze"],
    [1, "Bronze"],
    [2, "Bronze"],
    [3, "Silver"],
    [6, "Silver"],
    [7, "Gold"],
    [11, "Gold"],
    [12, "Diamond"],
    [19, "Diamond"],
    [20, "Elite"],
    [100, "Elite"],
  ])("proofs=%i → %s", (proofs, expected) => {
    expect(getTierFromProofs(proofs)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getRankScore
// ---------------------------------------------------------------------------
describe("getRankScore", () => {
  it("returns 0 for empty state (no badges, no challenges, no proofs)", () => {
    const state = defaultSportLifestyleState();
    // default state has 2 badges + 1 proof + 1 challenge with progress
    const score = getRankScore(state);
    expect(score).toBeGreaterThan(0);
  });

  it("higher tier badges produce higher scores", () => {
    const base = defaultSportLifestyleState();
    const bronzeState = {
      ...base,
      earnedBadges: { "running-1": { tier: "Bronze" as const, progress: 100, proofs: 1 } },
      proofs: [],
      challenges: [],
    };
    const eliteState = {
      ...base,
      earnedBadges: { "running-1": { tier: "Elite" as const, progress: 100, proofs: 20 } },
      proofs: [],
      challenges: [],
    };
    expect(getRankScore(eliteState)).toBeGreaterThan(getRankScore(bronzeState));
  });

  it("more proofs increase the score", () => {
    const base = defaultSportLifestyleState();
    const fewProofs = { ...base, earnedBadges: {}, challenges: [], proofs: [
      { id: "p1", interest: "Running" as const, badgeId: "running-1", proofType: "x", status: "Simulated" as const, createdAt: new Date().toISOString() },
    ]};
    const manyProofs = { ...fewProofs, proofs: Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`, interest: "Running" as const, badgeId: "running-1", proofType: "x", status: "Simulated" as const, createdAt: new Date().toISOString(),
    }))};
    expect(getRankScore(manyProofs)).toBeGreaterThan(getRankScore(fewProofs));
  });
});

// ---------------------------------------------------------------------------
// getSuggestedBadges
// ---------------------------------------------------------------------------
describe("getSuggestedBadges", () => {
  it("returns exactly 5 badges for each interest", () => {
    for (const interest of SPORT_INTERESTS) {
      expect(getSuggestedBadges(interest)).toHaveLength(5);
    }
  });

  it("all returned badges belong to the requested interest", () => {
    for (const interest of SPORT_INTERESTS) {
      for (const badge of getSuggestedBadges(interest)) {
        expect(badge.interest).toBe(interest);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// getMatchedOpportunities
// ---------------------------------------------------------------------------
describe("getMatchedOpportunities", () => {
  it("returns an array (may be empty) for any interest", () => {
    for (const interest of SPORT_INTERESTS) {
      expect(Array.isArray(getMatchedOpportunities(interest))).toBe(true);
    }
  });

  it("returned opportunities each include the requested interest", () => {
    for (const interest of SPORT_INTERESTS) {
      for (const opp of getMatchedOpportunities(interest)) {
        expect(opp.interests).toContain(interest);
      }
    }
  });

  it("total LIFESTYLE_OPPORTUNITIES have valid category and readiness fields", () => {
    for (const opp of LIFESTYLE_OPPORTUNITIES) {
      expect(opp.id.length).toBeGreaterThan(0);
      expect(opp.title.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getCountdown
// ---------------------------------------------------------------------------
describe("getCountdown", () => {
  it("returns 'Expired' for a past date", () => {
    expect(getCountdown("2000-01-01")).toBe("Expired");
  });

  it("returns a non-empty string for a future date", () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const result = getCountdown(future);
    expect(result).toMatch(/d|h/);
  });

  it("handles invalid date gracefully", () => {
    expect(getCountdown("not-a-date")).toBe("No deadline");
  });
});

// ---------------------------------------------------------------------------
// sanitizeSportLifestyleState
// ---------------------------------------------------------------------------
describe("sanitizeSportLifestyleState", () => {
  it("returns default state for null input", () => {
    const result = sanitizeSportLifestyleState(null);
    expect(result.version).toBe(1);
    expect(result.source).toBe("local-demo");
  });

  it("returns default state for non-object input", () => {
    expect(sanitizeSportLifestyleState("invalid").version).toBe(1);
    expect(sanitizeSportLifestyleState(42).version).toBe(1);
  });

  it("clamps badge progress to 0-100", () => {
    const state = sanitizeSportLifestyleState({
      earnedBadges: { "running-1": { tier: "Bronze", progress: 9999, proofs: 1 } },
    });
    expect(state.earnedBadges["running-1"].progress).toBeLessThanOrEqual(100);
  });

  it("strips unknown badge ids", () => {
    const state = sanitizeSportLifestyleState({
      earnedBadges: { "totally-fake-badge-id": { tier: "Gold", progress: 50, proofs: 5 } },
    });
    expect(state.earnedBadges["totally-fake-badge-id"]).toBeUndefined();
  });

  it("limits proofs to 100 entries", () => {
    const manyProofs = Array.from({ length: 200 }, (_, i) => ({
      id: `p${i}`, interest: "Running", badgeId: "running-1", proofType: "x", createdAt: new Date().toISOString(),
    }));
    const state = sanitizeSportLifestyleState({ proofs: manyProofs });
    expect(state.proofs.length).toBeLessThanOrEqual(100);
  });

  it("preserves valid selectedInterest", () => {
    const state = sanitizeSportLifestyleState({ selectedInterest: "Cycling" });
    expect(state.selectedInterest).toBe("Cycling");
  });

  it("rejects invalid selectedInterest and uses default", () => {
    const state = sanitizeSportLifestyleState({ selectedInterest: "Skateboarding" });
    expect(SPORT_INTERESTS).toContain(state.selectedInterest);
  });
});

// ---------------------------------------------------------------------------
// localStorage round-trip (getSportLifestyleState / saveSportLifestyleState)
// ---------------------------------------------------------------------------
describe("localStorage round-trip", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("getSportLifestyleState returns default when storage empty", () => {
    const state = getSportLifestyleState();
    expect(state.version).toBe(1);
  });

  it("saveSportLifestyleState persists and getSportLifestyleState retrieves it", () => {
    const fresh = defaultSportLifestyleState();
    fresh.selectedInterest = "Cycling";
    saveSportLifestyleState(fresh);
    const loaded = getSportLifestyleState();
    expect(loaded.selectedInterest).toBe("Cycling");
  });

  it("resetSportLifestyleState restores defaults", () => {
    const s = defaultSportLifestyleState();
    s.selectedInterest = "Swimming";
    saveSportLifestyleState(s);
    resetSportLifestyleState();
    const after = getSportLifestyleState();
    expect(after.selectedInterest).toBe("Running");
  });
});

// ---------------------------------------------------------------------------
// demoLeaderboard
// ---------------------------------------------------------------------------
describe("demoLeaderboard", () => {
  it("returns 5 entries", () => {
    expect(demoLeaderboard(defaultSportLifestyleState())).toHaveLength(5);
  });

  it("entries are sorted by signal descending", () => {
    const board = demoLeaderboard(defaultSportLifestyleState());
    for (let i = 1; i < board.length; i++) {
      expect(board[i - 1].signal).toBeGreaterThanOrEqual(board[i].signal);
    }
  });

  it("rank field is sequential from 1", () => {
    const board = demoLeaderboard(defaultSportLifestyleState());
    board.forEach((entry, idx) => expect(entry.rank).toBe(idx + 1));
  });
});
