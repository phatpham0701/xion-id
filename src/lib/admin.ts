import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AdminRoleState = {
  loading: boolean;
  isAdmin: boolean;
};

/**
 * Returns whether the currently signed-in user has the `admin` role.
 * Relies on the `user_roles` table + RLS (`Users can read their own roles`).
 */
export const useIsAdmin = (): AdminRoleState => {
  const { user, loading } = useAuth();
  const [state, setState] = useState<AdminRoleState>({ loading: true, isAdmin: false });

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    if (!user) {
      setState({ loading: false, isAdmin: false });
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      setState({ loading: false, isAdmin: !error && !!data });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

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
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return;
  await supabase.from("admin_audit_logs").insert({
    actor_id: user.id,
    actor_email: user.email ?? null,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    details: (params.details ?? {}) as never,
  });
};
