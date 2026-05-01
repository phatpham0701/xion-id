-- Tighten analytics_events INSERT: stop accepting empty/garbage events
DROP POLICY IF EXISTS "Anon and authed can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anon and authed can insert analytics events"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN ('profile_view', 'block_click', 'tip_sent', 'wallet_connect')
  AND length(event_type) <= 32
  AND (referrer IS NULL OR length(referrer) <= 512)
);

-- Harden has_role: only the postgres role / SECURITY DEFINER policies need it.
-- RLS evaluation does not require client EXECUTE permission.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;