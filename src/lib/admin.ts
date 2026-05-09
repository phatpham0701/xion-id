import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Comma-separated admin emails from env (e.g. "alice@example.com,bob@example.com").
// Falls back to empty list so user_roles table is the sole authority in production.
const ADMIN_EMAILS: string[] = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e: string) => e.toLowerCase().trim())
  .filter(Boolean);

export type AdminRoleState = {
  loading: boolean;
  isAdmin: boolean;
};

function isDemoAdminEmail(email?: string | null) {
  if (!email || ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Returns whether the currently signed-in user has admin access.
 *
 * Admin access is granted by:
 * 1. VITE_ADMIN_EMAILS env var allowlist (demo/dev shortcut).
 * 2. Production-ready fallback via user_roles table.
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

      // Demo-safe shortcut:
      // Paulus can always access Admin when signed in with this Google email.
      if (isDemoAdminEmail(user.email)) {
        if (!cancelled) {
          setState({
            loading: false,
            isAdmin: true,
          });
        }
        return;
      }

      // Production fallback:
      // Check Supabase user_roles table.
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
  | "health.check";

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
      details: (params.details ?? {}) as any,
    }]);

    if (error) {
      console.warn("[XIONID Admin] Failed to write audit log:", error.message);
    }
  } catch (error) {
    console.warn("[XIONID Admin] Audit logging failed unexpectedly:", error);
  }
};
