import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAILS = ["phatpham0701@gmail.com"];

export type AdminRoleState = {
  loading: boolean;
  isAdmin: boolean;
};

function isDemoAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Returns whether the currently signed-in user has admin access.
 *
 * Admin access is granted by:
 * 1. Demo-safe email allowlist for Paulus.
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
  | "reward.create"
  | "reward.update"
  | "reward.delete"
  | "reward.activate"
  | "campaign.feature"
  | "campaign.status";

export const logAdminAction = async (params: {
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("admin_audit_logs").insert({
    actor_id: user.id,
    actor_email: user.email ?? null,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    details: params.details ?? {},
  });

  if (error) {
    console.warn("[XIONID Admin] Failed to write audit log:", error.message);
  }
};
