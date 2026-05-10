import { describe, expect, it } from "vitest";
import {
  DEFAULT_ONBOARDING_AVATAR_ID,
  ONBOARDING_AVATARS,
  getOnboardingAvatarById,
  getOnboardingAvatarIdFromUrl,
  getOnboardingAvatarUrl,
} from "@/lib/onboardingAvatars";

const EXPECTED_CATEGORIES = [
  "runner",
  "strength",
  "cyclist",
  "swimmer",
  "recovery",
  "hybrid",
  "wellness",
  "gear",
  "nutrition",
  "creator",
  "community",
  "elite",
];

const LEGACY_DATA_URL = (emoji: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg"><text>${emoji}</text></svg>`)}`;

describe("onboarding avatar catalog", () => {
  it("contains exactly 24 avatars", () => {
    expect(ONBOARDING_AVATARS).toHaveLength(24);
  });

  it("uses unique avatar IDs", () => {
    const ids = ONBOARDING_AVATARS.map((avatar) => avatar.avatar_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses unique sort orders from 1 to 24", () => {
    const sortOrders = ONBOARDING_AVATARS.map((avatar) => avatar.sort_order).sort((a, b) => a - b);
    expect(new Set(sortOrders).size).toBe(sortOrders.length);
    expect(sortOrders).toEqual(Array.from({ length: 24 }, (_, index) => index + 1));
  });

  it("includes every expected category", () => {
    const categories = new Set(ONBOARDING_AVATARS.map((avatar) => avatar.category));
    expect([...categories].sort()).toEqual([...EXPECTED_CATEGORIES].sort());
  });

  it("includes male and female variants for every category", () => {
    for (const category of EXPECTED_CATEGORIES) {
      const variants = ONBOARDING_AVATARS
        .filter((avatar) => avatar.category === category)
        .map((avatar) => avatar.gender_variant)
        .sort();

      expect(variants).toEqual(["female", "male"]);
    }
  });

  it("has exactly one default avatar", () => {
    expect(ONBOARDING_AVATARS.filter((avatar) => avatar.is_default)).toHaveLength(1);
  });

  it("uses runner-male as the default avatar", () => {
    expect(DEFAULT_ONBOARDING_AVATAR_ID).toBe("runner-male");
    expect(getOnboardingAvatarById(DEFAULT_ONBOARDING_AVATAR_ID).is_default).toBe(true);
  });

  it("stores sources under the onboarding avatar asset path", () => {
    expect(ONBOARDING_AVATARS.every((avatar) => avatar.src.startsWith("/avatars/onboarding/"))).toBe(true);
  });

  it("uses WebP filenames", () => {
    expect(ONBOARDING_AVATARS.every((avatar) => avatar.filename.endsWith(".webp"))).toBe(true);
  });

  it("returns the default avatar for unknown IDs", () => {
    expect(getOnboardingAvatarById("unknown-avatar").avatar_id).toBe(DEFAULT_ONBOARDING_AVATAR_ID);
    expect(getOnboardingAvatarUrl("unknown-avatar")).toBe(getOnboardingAvatarUrl(DEFAULT_ONBOARDING_AVATAR_ID));
  });

  it("safely maps old emoji and data URL avatar values", () => {
    expect(getOnboardingAvatarIdFromUrl("🏃")).toBe("runner-male");
    expect(getOnboardingAvatarIdFromUrl(LEGACY_DATA_URL("🧘"))).toBe("recovery-female");
    expect(getOnboardingAvatarIdFromUrl(LEGACY_DATA_URL("🥇"))).toBe("elite-male");
    expect(getOnboardingAvatarIdFromUrl("data:image/svg+xml;utf8,not-an-avatar")).toBe(DEFAULT_ONBOARDING_AVATAR_ID);
  });

  it("returns default for null, undefined, blank, and malformed values", () => {
    expect(getOnboardingAvatarIdFromUrl(null)).toBe(DEFAULT_ONBOARDING_AVATAR_ID);
    expect(getOnboardingAvatarIdFromUrl(undefined)).toBe(DEFAULT_ONBOARDING_AVATAR_ID);
    expect(getOnboardingAvatarIdFromUrl("   ")).toBe(DEFAULT_ONBOARDING_AVATAR_ID);
    expect(getOnboardingAvatarIdFromUrl("/avatars/onboarding/not-real.png")).toBe(DEFAULT_ONBOARDING_AVATAR_ID);
  });
});
