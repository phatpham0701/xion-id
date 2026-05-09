import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  DEMO_MODE,
  DEMO_TERMS,
  BADGE_CATALOG,
  BADGE_CATEGORY_META,
  BADGE_TIER_META,
  SCAN_SIGNALS,
  SCAN_SOURCES,
  CAMPAIGN_CATEGORIES,
  DEFAULT_CAMPAIGN_TIERS,
  DEMO_GOALS,
  DEMO_STARTERS,
  getDemoState,
  setDemoState,
  updateDemoState,
  resetDemoState,
  claimDemoIdentity,
  claimDemoReward,
  joinDemoCampaign,
  scanDemoQr,
  issueDemoBadge,
  setBadgeFeatured,
  setBadgeHidden,
  getFeaturedBadges,
  findCatalogByKind,
  checkIdAvailability,
  suggestIds,
  reserveDemoId,
  createDemoCampaign,
  supportDemoCampaign,
  completeDemoOnboarding,
  getProfileCompleteness,
  upsertAndClaimReward,
} from "@/lib/demoMode";

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

// ─── constants ────────────────────────────────────────────────

describe("DEMO_MODE", () => {
  it("is true", () => {
    expect(DEMO_MODE).toBe(true);
  });
});

describe("DEMO_TERMS", () => {
  it("maps wallet → account", () => {
    expect(DEMO_TERMS.wallet).toBe("account");
  });

  it("has at least 10 term mappings", () => {
    expect(Object.keys(DEMO_TERMS).length).toBeGreaterThanOrEqual(10);
  });
});

// ─── BADGE_CATALOG ────────────────────────────────────────────

describe("BADGE_CATALOG", () => {
  it("has at least 30 entries", () => {
    expect(BADGE_CATALOG.length).toBeGreaterThanOrEqual(30);
  });

  it("every entry has unique kind", () => {
    const kinds = BADGE_CATALOG.map((b) => b.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it("every entry has non-empty label, emoji, and description", () => {
    for (const b of BADGE_CATALOG) {
      expect(b.label.length).toBeGreaterThan(0);
      expect(b.emoji.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
    }
  });

  it("every entry has valid tierName (silver|gold|diamond)", () => {
    const valid = new Set(["silver", "gold", "diamond"]);
    for (const b of BADGE_CATALOG) {
      expect(valid.has(b.tierName)).toBe(true);
    }
  });
});

describe("BADGE_CATEGORY_META", () => {
  const categories = [
    "identity", "activity", "support", "lifestyle",
    "community", "rewards", "education", "recruitment", "events", "creator",
  ] as const;

  it("covers all 10 categories", () => {
    for (const cat of categories) {
      expect(BADGE_CATEGORY_META[cat]).toBeDefined();
    }
  });

  it("every category has label and emoji", () => {
    for (const cat of categories) {
      expect(BADGE_CATEGORY_META[cat].label).toBeTruthy();
      expect(BADGE_CATEGORY_META[cat].emoji).toBeTruthy();
    }
  });
});

describe("BADGE_TIER_META", () => {
  it("covers silver, gold, diamond", () => {
    expect(BADGE_TIER_META.silver).toBeDefined();
    expect(BADGE_TIER_META.gold).toBeDefined();
    expect(BADGE_TIER_META.diamond).toBeDefined();
  });

  it("numeric values are 1, 2, 3", () => {
    expect(BADGE_TIER_META.silver.numeric).toBe(1);
    expect(BADGE_TIER_META.gold.numeric).toBe(2);
    expect(BADGE_TIER_META.diamond.numeric).toBe(3);
  });
});

describe("findCatalogByKind", () => {
  it("finds an existing badge by kind", () => {
    const entry = findCatalogByKind("verified_member");
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe("verified_member");
  });

  it("returns undefined for unknown kind", () => {
    expect(findCatalogByKind("not-a-real-badge")).toBeUndefined();
  });
});

// ─── SCAN_SIGNALS / SCAN_SOURCES ─────────────────────────────

describe("SCAN_SIGNALS", () => {
  it("has at least 5 signals", () => {
    expect(SCAN_SIGNALS.length).toBeGreaterThanOrEqual(5);
  });

  it("every signal has key, label, emoji, blurb, and suggestedBadgeKind", () => {
    for (const s of SCAN_SIGNALS) {
      expect(s.key).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.emoji).toBeTruthy();
      expect(s.blurb).toBeTruthy();
      expect(s.suggestedBadgeKind).toBeTruthy();
    }
  });
});

describe("SCAN_SOURCES", () => {
  it("has at least 5 sources", () => {
    expect(SCAN_SOURCES.length).toBeGreaterThanOrEqual(5);
  });

  it("every source has key, label, emoji, and blurb", () => {
    for (const s of SCAN_SOURCES) {
      expect(s.key).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.emoji).toBeTruthy();
      expect(s.blurb).toBeTruthy();
    }
  });
});

// ─── CAMPAIGN constants ───────────────────────────────────────

describe("CAMPAIGN_CATEGORIES", () => {
  it("has at least 4 categories", () => {
    expect(CAMPAIGN_CATEGORIES.length).toBeGreaterThanOrEqual(4);
  });

  it("includes creator and wellness", () => {
    const keys = CAMPAIGN_CATEGORIES.map((c) => c.key);
    expect(keys).toContain("creator");
    expect(keys).toContain("wellness");
  });
});

describe("DEFAULT_CAMPAIGN_TIERS", () => {
  it("has exactly 3 tiers", () => {
    expect(DEFAULT_CAMPAIGN_TIERS).toHaveLength(3);
  });

  it("tiers are supporter, super, founding in order", () => {
    expect(DEFAULT_CAMPAIGN_TIERS[0].key).toBe("supporter");
    expect(DEFAULT_CAMPAIGN_TIERS[1].key).toBe("super");
    expect(DEFAULT_CAMPAIGN_TIERS[2].key).toBe("founding");
  });

  it("amounts increase: supporter < super < founding", () => {
    expect(DEFAULT_CAMPAIGN_TIERS[0].amount).toBeLessThan(DEFAULT_CAMPAIGN_TIERS[1].amount);
    expect(DEFAULT_CAMPAIGN_TIERS[1].amount).toBeLessThan(DEFAULT_CAMPAIGN_TIERS[2].amount);
  });
});

// ─── DEMO_GOALS / DEMO_STARTERS ──────────────────────────────

describe("DEMO_GOALS", () => {
  it("has exactly 4 goals", () => {
    expect(DEMO_GOALS).toHaveLength(4);
  });

  it("every goal has key, title, blurb, and emoji", () => {
    for (const g of DEMO_GOALS) {
      expect(g.key).toBeTruthy();
      expect(g.title).toBeTruthy();
      expect(g.blurb).toBeTruthy();
      expect(g.emoji).toBeTruthy();
    }
  });
});

describe("DEMO_STARTERS", () => {
  it("has at least 8 starters", () => {
    expect(DEMO_STARTERS.length).toBeGreaterThanOrEqual(8);
  });

  it("every starter references at least one goal", () => {
    for (const s of DEMO_STARTERS) {
      expect(s.goalFit.length).toBeGreaterThan(0);
    }
  });
});

// ─── getDemoState / setDemoState / updateDemoState / resetDemoState ───

describe("getDemoState", () => {
  it("returns seed state when localStorage is empty", () => {
    const state = getDemoState();
    expect(state.version).toBe(1);
    expect(state.onboarded).toBe(false);
    expect(Array.isArray(state.badges)).toBe(true);
    expect(Array.isArray(state.rewards)).toBe(true);
  });

  it("seed state has a profile with username and displayName", () => {
    const state = getDemoState();
    expect(state.profile.username).toBeTruthy();
    expect(state.profile.displayName).toBeTruthy();
  });

  it("seed state has at least 3 badges", () => {
    expect(getDemoState().badges.length).toBeGreaterThanOrEqual(3);
  });

  it("seed state has at least 3 rewards", () => {
    expect(getDemoState().rewards.length).toBeGreaterThanOrEqual(3);
  });

  it("seed state has at least 3 offers", () => {
    expect(getDemoState().offers.length).toBeGreaterThanOrEqual(3);
  });

  it("seed state has at least 1 campaign", () => {
    expect(getDemoState().campaigns.length).toBeGreaterThanOrEqual(1);
  });
});

describe("setDemoState + getDemoState round-trip", () => {
  it("persists state to localStorage", () => {
    const state = getDemoState();
    state.onboarded = true;
    setDemoState(state);
    expect(getDemoState().onboarded).toBe(true);
  });
});

describe("updateDemoState", () => {
  it("applies a mutation and returns new state", () => {
    const next = updateDemoState((s) => { s.onboarded = true; });
    expect(next.onboarded).toBe(true);
  });

  it("accepts a mutator that returns void (mutation in place)", () => {
    updateDemoState((s) => { s.profile.displayName = "Test"; });
    expect(getDemoState().profile.displayName).toBe("Test");
  });
});

describe("resetDemoState", () => {
  it("restores the seed defaults", () => {
    updateDemoState((s) => { s.onboarded = true; });
    const reset = resetDemoState();
    expect(reset.onboarded).toBe(false);
  });
});

// ─── claimDemoIdentity ────────────────────────────────────────

describe("claimDemoIdentity", () => {
  it("sets identityClaimed to true", () => {
    const state = claimDemoIdentity();
    expect(state.profile.identityClaimed).toBe(true);
  });

  it("sets identityClaimedAt to a valid ISO date", () => {
    const state = claimDemoIdentity();
    expect(new Date(state.profile.identityClaimedAt!).getTime()).toBeGreaterThan(0);
  });
});

// ─── claimDemoReward ─────────────────────────────────────────

describe("claimDemoReward", () => {
  it("marks the reward as claimed", () => {
    const state = claimDemoReward("r1");
    const reward = state.rewards.find((r) => r.id === "r1");
    expect(reward?.claimed).toBe(true);
    expect(reward?.status).toBe("claimed");
  });

  it("adds an activity entry for the claim", () => {
    const before = getDemoState().activity.length;
    const state = claimDemoReward("r1");
    expect(state.activity.length).toBeGreaterThan(before);
    expect(state.activity[0].kind).toBe("reward");
  });

  it("does not throw for unknown reward id", () => {
    expect(() => claimDemoReward("non-existent")).not.toThrow();
  });
});

// ─── upsertAndClaimReward ────────────────────────────────────

describe("upsertAndClaimReward", () => {
  it("adds a new reward and marks it claimed", () => {
    const newReward = {
      id: "r-new-test",
      title: "Test Reward",
      description: "Test",
      cost: 10,
      claimed: false,
      status: "available" as const,
    };
    const state = upsertAndClaimReward(newReward);
    const found = state.rewards.find((r) => r.id === "r-new-test");
    expect(found?.claimed).toBe(true);
    expect(found?.status).toBe("claimed");
  });
});

// ─── joinDemoCampaign ────────────────────────────────────────

describe("joinDemoCampaign", () => {
  it("marks campaign as joined", () => {
    const state = joinDemoCampaign("c1");
    const campaign = state.campaigns.find((c) => c.id === "c1");
    expect(campaign?.joined).toBe(true);
  });

  it("increments participant count by 1", () => {
    const before = getDemoState().campaigns.find((c) => c.id === "c1")!.participants;
    const state = joinDemoCampaign("c1");
    const after = state.campaigns.find((c) => c.id === "c1")!.participants;
    expect(after).toBe(before + 1);
  });

  it("does not double-increment if already joined", () => {
    joinDemoCampaign("c1");
    const firstParticipants = getDemoState().campaigns.find((c) => c.id === "c1")!.participants;
    const state = joinDemoCampaign("c1");
    const secondParticipants = state.campaigns.find((c) => c.id === "c1")!.participants;
    expect(secondParticipants).toBe(firstParticipants);
  });
});

// ─── scanDemoQr ──────────────────────────────────────────────

describe("scanDemoQr", () => {
  it("marks the QR item as scanned", () => {
    const state = scanDemoQr("DEMO-CAFE-01");
    const item = state.qrItems.find((q) => q.code === "DEMO-CAFE-01");
    expect(item?.scanned).toBe(true);
  });

  it("does not throw for unknown QR code", () => {
    expect(() => scanDemoQr("UNKNOWN-CODE")).not.toThrow();
  });
});

// ─── issueDemoBadge ──────────────────────────────────────────

describe("issueDemoBadge", () => {
  it("returns a badge and state", () => {
    const { badge, state } = issueDemoBadge("verified_member");
    expect(badge.kind).toBe("verified_member");
    expect(badge.id).toBeTruthy();
    expect(state.badges.some((b) => b.kind === "verified_member")).toBe(true);
  });

  it("adds an activity entry for the issued badge", () => {
    const before = getDemoState().activity.length;
    const { state } = issueDemoBadge("supporter");
    expect(state.activity.length).toBeGreaterThan(before);
    expect(state.activity[0].kind).toBe("badge");
  });

  it("replaces an existing badge of the same kind", () => {
    issueDemoBadge("verified_member");
    const { state } = issueDemoBadge("verified_member");
    const count = state.badges.filter((b) => b.kind === "verified_member").length;
    expect(count).toBe(1);
  });

  it("falls back to first catalog entry for unknown kind", () => {
    const { badge } = issueDemoBadge("totally-unknown-kind");
    expect(badge.kind).toBeTruthy();
  });
});

// ─── setBadgeFeatured / setBadgeHidden ───────────────────────

describe("setBadgeFeatured", () => {
  it("sets featured flag on a badge", () => {
    const seed = getDemoState();
    const badgeId = seed.badges[0].id;
    const state = setBadgeFeatured(badgeId, true);
    expect(state.badges.find((b) => b.id === badgeId)?.featured).toBe(true);
  });
});

describe("setBadgeHidden", () => {
  it("sets hidden flag on a badge", () => {
    const seed = getDemoState();
    const badgeId = seed.badges[0].id;
    const state = setBadgeHidden(badgeId, true);
    expect(state.badges.find((b) => b.id === badgeId)?.hidden).toBe(true);
  });
});

// ─── getFeaturedBadges ───────────────────────────────────────

describe("getFeaturedBadges", () => {
  it("returns only featured and non-hidden badges", () => {
    const state = getDemoState();
    const featured = getFeaturedBadges(state);
    for (const b of featured) {
      expect(b.featured).toBe(true);
      expect(b.hidden).not.toBe(true);
    }
  });

  it("returns at most 6 badges", () => {
    const state = getDemoState();
    expect(getFeaturedBadges(state).length).toBeLessThanOrEqual(6);
  });
});

// ─── checkIdAvailability ────────────────────────────────────

describe("checkIdAvailability", () => {
  it("returns available for a valid unique handle", () => {
    const result = checkIdAvailability("uniqueuser99");
    expect(result.available).toBe(true);
  });

  it("returns unavailable for a reserved name (admin)", () => {
    const result = checkIdAvailability("admin");
    expect(result.available).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("returns unavailable for a handle shorter than 3 chars", () => {
    const result = checkIdAvailability("ab");
    expect(result.available).toBe(false);
  });

  it("returns unavailable for a handle longer than 24 chars", () => {
    const result = checkIdAvailability("a".repeat(25));
    expect(result.available).toBe(false);
  });

  it("returns unavailable for empty input", () => {
    const result = checkIdAvailability("");
    expect(result.available).toBe(false);
  });

  it("strips invalid characters before checking", () => {
    const result = checkIdAvailability("user@123!");
    expect(result.handle).not.toContain("@");
    expect(result.handle).not.toContain("!");
  });
});

// ─── suggestIds ──────────────────────────────────────────────

describe("suggestIds", () => {
  it("returns exactly 5 suggestions", () => {
    expect(suggestIds("alice")).toHaveLength(5);
  });

  it("all suggestions are at most 24 chars", () => {
    for (const s of suggestIds("verylongbasenamethatslong")) {
      expect(s.length).toBeLessThanOrEqual(24);
    }
  });

  it("handles empty input without throwing", () => {
    expect(() => suggestIds("")).not.toThrow();
    expect(suggestIds("")).toHaveLength(5);
  });

  it("includes the base name in at least one suggestion", () => {
    const suggestions = suggestIds("alice");
    expect(suggestions.some((s) => s.includes("alice"))).toBe(true);
  });
});

// ─── reserveDemoId ───────────────────────────────────────────

describe("reserveDemoId", () => {
  it("sets username and identityClaimed", () => {
    const state = reserveDemoId("mynewhandle");
    expect(state.profile.username).toBe("mynewhandle");
    expect(state.profile.identityClaimed).toBe(true);
  });

  it("adds an activity entry for the reservation", () => {
    const before = getDemoState().activity.length;
    const state = reserveDemoId("mynewhandle");
    expect(state.activity.length).toBeGreaterThan(before);
  });
});

// ─── createDemoCampaign ──────────────────────────────────────

describe("createDemoCampaign", () => {
  it("creates a campaign and adds it to state", () => {
    const before = getDemoState().campaigns.length;
    const { campaign, state } = createDemoCampaign({
      title: "Test Campaign",
      blurb: "A test blurb.",
      endsAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(state.campaigns.length).toBe(before + 1);
    expect(state.campaigns.some((c) => c.id === campaign.id)).toBe(true);
  });

  it("uses DEFAULT_CAMPAIGN_TIERS when no tiers provided", () => {
    const { campaign } = createDemoCampaign({
      title: "No tiers",
      blurb: "blurb",
      endsAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(campaign.tiers).toHaveLength(3);
  });

  it("starts with 0 participants and 0 raised", () => {
    const { campaign } = createDemoCampaign({
      title: "Fresh",
      blurb: "blurb",
      endsAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(campaign.participants).toBe(0);
    expect(campaign.raised).toBe(0);
  });
});

// ─── supportDemoCampaign ─────────────────────────────────────

describe("supportDemoCampaign", () => {
  it("increases raised amount by tier amount", () => {
    const before = getDemoState().campaigns.find((c) => c.id === "c1")!.raised ?? 0;
    const { state } = supportDemoCampaign("c1", "supporter");
    const after = state.campaigns.find((c) => c.id === "c1")!.raised ?? 0;
    expect(after).toBeGreaterThan(before);
  });

  it("issues a badge matching the tier", () => {
    const { badgeIssued } = supportDemoCampaign("c1", "super");
    expect(badgeIssued).toBeDefined();
    expect(badgeIssued?.kind).toBe("super_supporter");
  });

  it("marks campaign as joined", () => {
    const { state } = supportDemoCampaign("c1", "founding");
    expect(state.campaigns.find((c) => c.id === "c1")!.joined).toBe(true);
  });
});

// ─── completeDemoOnboarding ──────────────────────────────────

describe("completeDemoOnboarding", () => {
  it("sets onboarded to true", () => {
    const state = completeDemoOnboarding("offers", "essential");
    expect(state.onboarded).toBe(true);
  });

  it("records selected goal and starter", () => {
    const state = completeDemoOnboarding("badges", "badgeFirst");
    expect(state.selectedGoal).toBe("badges");
    expect(state.selectedStarter).toBe("badgeFirst");
  });

  it("adds an activity entry", () => {
    const before = getDemoState().activity.length;
    const state = completeDemoOnboarding("page", "minimal");
    expect(state.activity.length).toBeGreaterThan(before);
  });
});

// ─── getProfileCompleteness ──────────────────────────────────

describe("getProfileCompleteness", () => {
  it("returns a number between 0 and 100", () => {
    const score = getProfileCompleteness();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("seed state has a score > 20 (has bio and badges)", () => {
    expect(getProfileCompleteness(getDemoState())).toBeGreaterThan(20);
  });

  it("increases after claiming identity", () => {
    const before = getProfileCompleteness(getDemoState());
    const state = claimDemoIdentity();
    expect(getProfileCompleteness(state)).toBeGreaterThan(before);
  });
});
