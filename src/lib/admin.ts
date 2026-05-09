import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Pure helpers — exported so they can be unit-tested without mocking React or
// Supabase. VITE_ADMIN_EMAILS is an *optional* dev/demo/recovery shortcut.
// In production the user_roles table is the sole source of truth.
// ---------------------------------------------------------------------------

/** Parse a raw comma-separated email string (e.g. from an env var) into a
 *  trimmed, lower-cased list. Returns an empty array for empty/nullish input. */
export function parseAdminEmails(raw?: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);
}

/** Return true when `email` appears in `adminEmails`.
 *  Matching is case-insensitive and whitespace-tolerant.
 *  Falls back to the module-level parsed list when `adminEmails` is omitted. */
export function isConfiguredAdminEmail(
  email?: string | null,
  adminEmails = ADMIN_EMAILS,
): boolean {
  if (!email || adminEmails.length === 0) return false;
  return adminEmails.includes(email.toLowerCase().trim());
}

// Module-level allowlist derived from env at startup.
// Only populated when VITE_ADMIN_EMAILS is set — intentionally empty by default.
const ADMIN_EMAILS = parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS);

export type AdminRoleState = {
  loading: boolean;
  isAdmin: boolean;
};

/**
 * Returns whether the currently signed-in user has admin access.
 *
 * Admin access is granted by:
 * 1. VITE_ADMIN_EMAILS env var allowlist — optional dev/demo/recovery only.
 *    Leave empty (or unset) in production.
 * 2. user_roles table — production source of truth (always checked when the
 *    env allowlist is empty or the email is not in it).
 */
export const useIsAdmin = (): AdminRoleState => {
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<AdminRoleState>({
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAccess() {
      if (authLoading) {
        setState({
          loading: true,
          isAdmin: false,
        });
        return;
      }

      if (!user) {
        setState({
          loading: false,
          isAdmin: false,
        });
        return;
      }

      // Dev/demo/recovery shortcut: check the env-configured allowlist first.
      if (isConfiguredAdminEmail(user.email)) {
        if (!cancelled) {
          setState({
            loading: false,
            isAdmin: true,
          });
        }
        return;
      }

      // Production: check the user_roles table.
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn("[XIONID Admin] Failed to check user_roles:", error.message);
        setState({
          loading: false,
          isAdmin: false,
        });
        return;
      }

      setState({
        loading: false,
        isAdmin: !!data,
      });
    }

    checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return state;
};

export type AuditAction =
  | "role.grant"
  | "role.revoke"
  | "profile.update"
  | "profile.publish"
  | "profile.feature"
  | "profile.suspend"
  | "badge.issue"
  | "badge.remove"
  | "badge.feature"
  | "public_badge.remove"
  | "reward.create"
  | "reward.update"
  | "reward.delete"
  | "reward.activate"
  | "campaign.feature"
  | "campaign.status"
  | "health.check"
  | "profile.restore";

export const logAdminAction = async (params: {
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("admin_audit_logs").insert([{
      actor_id: user.id,
      actor_email: user.email ?? undefined,
      action: params.action,
      target_type: params.targetType ?? undefined,
      target_id: params.targetId ?? undefined,
      details: (params.details ?? {}) as never,
    }]);

    if (error) {
      console.warn("[XIONID Admin] Failed to write audit log:", error.message);
    }
  } catch (error) {
    console.warn("[XIONID Admin] Audit logging failed unexpectedly:", error);
  }
};
