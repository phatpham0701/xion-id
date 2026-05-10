import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { hasCompleteProfile, needsOnboarding } from "@/lib/onboarding";
import type { EditableProfile } from "@/components/dashboard/ProfileEditorCard";

const makeProfile = (username: string | null, extra?: Partial<EditableProfile>): EditableProfile => ({
  id: "test-id",
  username,
  display_name: null,
  avatar_url: null,
  bio: null,
  is_published: false,
  ...extra,
});

// ---------------------------------------------------------------------------
// hasCompleteProfile
// ---------------------------------------------------------------------------
describe("hasCompleteProfile", () => {
  it("returns true when username is a non-empty string", () => {
    expect(hasCompleteProfile(makeProfile("paulus"))).toBe(true);
  });

  it("returns true when username has leading/trailing whitespace around real content", () => {
    expect(hasCompleteProfile(makeProfile("  paulus  "))).toBe(true);
  });

  it("returns true when username is present along with display_name", () => {
    expect(hasCompleteProfile(makeProfile("paulus", { display_name: "Paulus" }))).toBe(true);
  });

  it("returns false when username is empty string", () => {
    expect(hasCompleteProfile(makeProfile(""))).toBe(false);
  });

  it("returns false when username is whitespace only", () => {
    expect(hasCompleteProfile(makeProfile("   "))).toBe(false);
  });

  it("returns false when username is null", () => {
    expect(hasCompleteProfile(makeProfile(null))).toBe(false);
  });

  it("returns false for null profile", () => {
    expect(hasCompleteProfile(null)).toBe(false);
  });

  it("returns false for undefined profile", () => {
    expect(hasCompleteProfile(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// needsOnboarding
// ---------------------------------------------------------------------------
describe("needsOnboarding", () => {
  it("returns false when profile has a real username", () => {
    expect(needsOnboarding(makeProfile("paulus"))).toBe(false);
  });

  it("returns false when username has surrounding whitespace but is non-empty", () => {
    expect(needsOnboarding(makeProfile("  paulus  "))).toBe(false);
  });

  it("returns false when username and display_name are both present", () => {
    expect(needsOnboarding(makeProfile("paulus", { display_name: "Paulus" }))).toBe(false);
  });

  it("returns true when username is empty string", () => {
    expect(needsOnboarding(makeProfile(""))).toBe(true);
  });

  it("returns true when username is whitespace only", () => {
    expect(needsOnboarding(makeProfile("   "))).toBe(true);
  });

  it("returns true when username is null", () => {
    expect(needsOnboarding(makeProfile(null))).toBe(true);
  });

  it("returns false for null profile (missing-data state — do not trigger onboarding)", () => {
    expect(needsOnboarding(null)).toBe(false);
  });

  it("returns false for undefined profile", () => {
    expect(needsOnboarding(undefined)).toBe(false);
  });

  // Key safety test: localStorage / demo state must have no influence on this function.
  describe("localStorage / demo state isolation", () => {
    const originalGetItem = Storage.prototype.getItem;

    beforeEach(() => {
      // Simulate localStorage being empty (incognito / cleared / new device).
      Storage.prototype.getItem = () => null;
    });

    afterEach(() => {
      Storage.prototype.getItem = originalGetItem;
    });

    it("returns false for an existing user even when localStorage is empty", () => {
      expect(needsOnboarding(makeProfile("paulus"))).toBe(false);
    });

    it("returns true for a new user with null username even when localStorage is empty", () => {
      expect(needsOnboarding(makeProfile(null))).toBe(true);
    });
  });
});
