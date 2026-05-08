-- Grant EXECUTE on has_role() to the authenticated role.
--
-- The migration 20260504 added RLS policies on profiles, user_roles, and
-- admin_audit_logs that call public.has_role(). PostgreSQL evaluates ALL
-- matching policies (OR'd) before granting access. If the authenticated role
-- lacks EXECUTE on has_role(), every policy that references it throws
-- "permission denied for function has_role" — even for non-admin users whose
-- own-row policy would otherwise succeed.
--
-- Affected operations before this fix:
--   • profiles UPDATE  → onboarding "Open Dashboard" blocked
--   • user_roles SELECT → useIsAdmin() 403 for every authenticated user
--   • admin_audit_logs SELECT/INSERT → admin audit logging broken
--
-- Granting EXECUTE does not grant admin access; the function itself returns
-- false for users who have no row in user_roles with role = 'admin'.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
