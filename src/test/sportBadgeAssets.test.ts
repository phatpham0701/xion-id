import { describe, expect, it } from "vitest";
import { SPORT_BADGE_ASSETS, getSportBadgeAsset, getSportBadgeAssetSrc } from "@/lib/sportBadgeAssets";

const EXPECTED_CATEGORIES = [
  "running",
  "strength",
  "cycling",
  "swimming",
  "hybrid",
  "marathon-events",
  "recovery",
  "wellness",
  "gear",
  "supplements",
] as const;

const EXPECTED_TIERS = ["bronze", "silver", "gold", "diamond", "elite"] as const;
const EXPECTED_TIER_RANKS = {
  bronze: 1,
  silver: 2,
  gold: 3,
  diamond: 4,
  elite: 5,
} as const;

describe("SPORT_BADGE_ASSETS", () => {
  it("has exactly 50 items", () => {
    expect(SPORT_BADGE_ASSETS).toHaveLength(50);
  });

  it("has unique badge IDs", () => {
    const badgeIds = SPORT_BADGE_ASSETS.map((asset) => asset.badge_id);
    expect(new Set(badgeIds).size).toBe(badgeIds.length);
  });

  it("has unique sort_order values from 1 to 50", () => {
    const sortOrders = SPORT_BADGE_ASSETS.map((asset) => asset.sort_order);
    expect(new Set(sortOrders).size).toBe(sortOrders.length);
    expect(sortOrders.slice().sort((a, b) => a - b)).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
  });

  it("contains all expected categories", () => {
    const categories = new Set(SPORT_BADGE_ASSETS.map((asset) => asset.category_slug));

    for (const category of EXPECTED_CATEGORIES) {
      expect(categories.has(category)).toBe(true);
    }
  });

  it("has exactly 5 tiers for each category", () => {
    for (const category of EXPECTED_CATEGORIES) {
      const categoryAssets = SPORT_BADGE_ASSETS.filter((asset) => asset.category_slug === category);
      expect(categoryAssets).toHaveLength(5);
    }
  });

  it("has every tier for every category", () => {
    for (const category of EXPECTED_CATEGORIES) {
      const categoryTiers = new Set(
        SPORT_BADGE_ASSETS.filter((asset) => asset.category_slug === category).map((asset) => asset.tier),
      );

      for (const tier of EXPECTED_TIERS) {
        expect(categoryTiers.has(tier)).toBe(true);
      }
    }
  });

  it("uses the expected filename and public src conventions", () => {
    for (const asset of SPORT_BADGE_ASSETS) {
      expect(asset.filename.startsWith("xionid-badge-")).toBe(true);
      expect(asset.filename.endsWith(".webp")).toBe(true);
      expect(asset.src.startsWith("/badges/sport/")).toBe(true);
    }
  });

  it("returns the correct src for running bronze", () => {
    expect(getSportBadgeAsset("running", "bronze")?.src).toBe("/badges/sport/xionid-badge-running-bronze.webp");
    expect(getSportBadgeAssetSrc("running", "bronze")).toBe("/badges/sport/xionid-badge-running-bronze.webp");
  });

  it("returns null safely for unknown category or tier values", () => {
    expect(getSportBadgeAsset("unknown", "bronze")).toBeNull();
    expect(getSportBadgeAsset("running", "unknown")).toBeNull();
    expect(getSportBadgeAssetSrc("unknown", "unknown")).toBeNull();
  });

  it("uses the expected tier_rank for every tier", () => {
    for (const asset of SPORT_BADGE_ASSETS) {
      expect(asset.tier_rank).toBe(EXPECTED_TIER_RANKS[asset.tier]);
    }
  });
});
