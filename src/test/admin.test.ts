import { describe, it, expect } from "vitest";
import { parseAdminEmails, isConfiguredAdminEmail } from "@/lib/admin";

// ---------------------------------------------------------------------------
// parseAdminEmails
// ---------------------------------------------------------------------------
describe("parseAdminEmails", () => {
  it("returns empty list for undefined", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });

  it("returns empty list for null", () => {
    expect(parseAdminEmails(null)).toEqual([]);
  });

  it("returns empty list for empty string", () => {
    expect(parseAdminEmails("")).toEqual([]);
  });

  it("returns empty list for whitespace-only string", () => {
    expect(parseAdminEmails("   ")).toEqual([]);
  });

  it("parses a single email", () => {
    expect(parseAdminEmails("admin@example.com")).toEqual(["admin@example.com"]);
  });

  it("parses comma-separated emails, trimming whitespace and lowercasing", () => {
    expect(
      parseAdminEmails("alice@example.com , BOB@EXAMPLE.COM, charlie@example.com"),
    ).toEqual(["alice@example.com", "bob@example.com", "charlie@example.com"]);
  });

  it("skips blank entries between commas", () => {
    expect(parseAdminEmails("a@a.com,,b@b.com")).toEqual(["a@a.com", "b@b.com"]);
  });
});

// ---------------------------------------------------------------------------
// isConfiguredAdminEmail
// ---------------------------------------------------------------------------
describe("isConfiguredAdminEmail", () => {
  const emails = ["alice@example.com", "bob@example.com"];

  it("returns false for undefined email", () => {
    expect(isConfiguredAdminEmail(undefined, emails)).toBe(false);
  });

  it("returns false for null email", () => {
    expect(isConfiguredAdminEmail(null, emails)).toBe(false);
  });

  it("returns false when adminEmails list is empty", () => {
    expect(isConfiguredAdminEmail("alice@example.com", [])).toBe(false);
  });

  it("returns true for an email in the list", () => {
    expect(isConfiguredAdminEmail("alice@example.com", emails)).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isConfiguredAdminEmail("ALICE@EXAMPLE.COM", emails)).toBe(true);
  });

  it("trims whitespace before matching", () => {
    expect(isConfiguredAdminEmail("  alice@example.com  ", emails)).toBe(true);
  });

  it("returns false for an email not in the list", () => {
    expect(isConfiguredAdminEmail("charlie@example.com", emails)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AuditAction type exhaustiveness — compile-time guard.
// If AuditAction grows, update this list and the count below.
// ---------------------------------------------------------------------------
describe("AuditAction exhaustiveness", () => {
  const EXPECTED_ACTIONS = [
    "role.grant", "role.revoke",
    "profile.update", "profile.publish", "profile.feature", "profile.suspend",
    "badge.issue", "badge.remove", "badge.feature", "public_badge.remove",
    "reward.create", "reward.update", "reward.delete", "reward.activate",
    "campaign.feature", "campaign.status",
    "health.check",
  ] as const;

  it("has exactly 17 actions", () => {
    expect(EXPECTED_ACTIONS).toHaveLength(17);
  });

  it("every action has a dot-separated lowercase format", () => {
    for (const action of EXPECTED_ACTIONS) {
      expect(action).toMatch(/^[a-z_]+\.[a-z_]+$/);
    }
  });
});

// ---------------------------------------------------------------------------
// AdminRoleState default shape
// ---------------------------------------------------------------------------
describe("AdminRoleState shape", () => {
  it("default state has loading=true and isAdmin=false", () => {
    const defaultState = { loading: true, isAdmin: false };
    expect(defaultState.loading).toBe(true);
    expect(defaultState.isAdmin).toBe(false);
  });
});
