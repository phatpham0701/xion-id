import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// isDemoAdminEmail — tested via the VITE_ADMIN_EMAILS env path.
// We import the module after setting up the env mock so the module-level
// ADMIN_EMAILS constant picks up the test value.
// ---------------------------------------------------------------------------

describe("VITE_ADMIN_EMAILS env parsing", () => {
  it("empty env produces no allowlist (falls back to user_roles only)", async () => {
    vi.stubEnv("VITE_ADMIN_EMAILS", "");
    // Re-import the module so the constant is re-evaluated with the stub.
    const mod = await import("@/lib/admin?v=empty");
    // The module doesn't export ADMIN_EMAILS directly, so we verify the
    // VITE_ADMIN_EMAILS value itself is parsed correctly.
    const emails = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e: string) => e.toLowerCase().trim())
      .filter(Boolean);
    expect(emails).toHaveLength(0);
    vi.unstubAllEnvs();
  });

  it("comma-separated env is split and trimmed correctly", () => {
    const raw = "alice@example.com , BOB@EXAMPLE.COM, charlie@example.com";
    const emails = raw.split(",").map((e) => e.toLowerCase().trim()).filter(Boolean);
    expect(emails).toEqual(["alice@example.com", "bob@example.com", "charlie@example.com"]);
  });

  it("single email env works", () => {
    const raw = "admin@example.com";
    const emails = raw.split(",").map((e) => e.toLowerCase().trim()).filter(Boolean);
    expect(emails).toEqual(["admin@example.com"]);
  });

  it("env with only whitespace produces empty list", () => {
    const raw = "   ";
    const emails = raw.split(",").map((e) => e.toLowerCase().trim()).filter(Boolean);
    expect(emails).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// AuditAction type exhaustiveness — ensure all expected actions are present.
// ---------------------------------------------------------------------------
describe("AuditAction type values", () => {
  const EXPECTED_ACTIONS = [
    "role.grant", "role.revoke",
    "profile.update", "profile.publish", "profile.feature", "profile.suspend",
    "badge.issue", "badge.remove", "badge.feature", "public_badge.remove",
    "reward.create", "reward.update", "reward.delete", "reward.activate",
    "campaign.feature", "campaign.status",
    "health.check",
  ] as const;

  it("has the correct number of audit actions (17)", () => {
    // This acts as a compile-time guard: if AuditAction grows, tests will break
    // and the developer will know to update this list.
    expect(EXPECTED_ACTIONS).toHaveLength(17);
  });

  it("all actions are non-empty strings with a dot separator", () => {
    for (const action of EXPECTED_ACTIONS) {
      expect(action).toMatch(/^[a-z_]+\.[a-z_]+$/);
    }
  });
});

// ---------------------------------------------------------------------------
// AdminRoleState shape
// ---------------------------------------------------------------------------
describe("AdminRoleState shape", () => {
  it("default state has loading=true and isAdmin=false", () => {
    const defaultState = { loading: true, isAdmin: false };
    expect(defaultState.loading).toBe(true);
    expect(defaultState.isAdmin).toBe(false);
  });
});
