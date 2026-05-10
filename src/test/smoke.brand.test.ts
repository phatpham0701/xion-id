import { describe, it, expect } from "vitest";
import { BRAND, profileUrl, RESERVED_USERNAMES } from "@/lib/brand";

describe("BRAND constants", () => {
  it("has a non-empty name", () => {
    expect(BRAND.name.length).toBeGreaterThan(0);
  });

  it("has a non-empty domain", () => {
    expect(BRAND.domain.length).toBeGreaterThan(0);
  });

  it("wordmarkPrefix + wordmarkSuffix equals the brand name", () => {
    expect(`${BRAND.wordmarkPrefix}${BRAND.wordmarkSuffix}`).toBe(BRAND.name);
  });

  it("twitter handle starts with @", () => {
    expect(BRAND.twitter.startsWith("@")).toBe(true);
  });
});

describe("profileUrl", () => {
  it("returns domain/username format", () => {
    const url = profileUrl("alex");
    expect(url).toBe(`${BRAND.domain}/alex`);
  });

  it("includes the username verbatim", () => {
    expect(profileUrl("test_user")).toContain("test_user");
  });
});

describe("RESERVED_USERNAMES", () => {
  it("is a Set with more than 20 entries", () => {
    expect(RESERVED_USERNAMES.size).toBeGreaterThan(20);
  });

  it("contains critical route paths", () => {
    const critical = ["auth", "dashboard", "editor", "admin", "api"];
    for (const name of critical) {
      expect(RESERVED_USERNAMES.has(name)).toBe(true);
    }
  });

  it("contains common vanity names that could conflict", () => {
    const vanity = ["xion", "xionid", "profile", "user", "www"];
    for (const name of vanity) {
      expect(RESERVED_USERNAMES.has(name)).toBe(true);
    }
  });

  it("does not contain an arbitrary username", () => {
    expect(RESERVED_USERNAMES.has("randomuser123")).toBe(false);
  });
});
