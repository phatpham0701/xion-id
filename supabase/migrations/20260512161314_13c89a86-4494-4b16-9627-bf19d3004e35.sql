-- 1. Tighten profiles SELECT
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Owners and admins can read profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Public-safe view for profiles
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, username, display_name, bio, avatar_url, theme,
       is_published, is_featured, xion_address, wallet_connected_at,
       settings, created_at, updated_at
FROM public.profiles
WHERE is_published = true AND is_suspended = false;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 3. Username availability RPC (replaces direct cross-user reads)
CREATE OR REPLACE FUNCTION public.is_username_available(_username text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = _username);
$$;

REVOKE EXECUTE ON FUNCTION public.is_username_available(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO anon, authenticated;

-- 4. Tighten tips SELECT
DROP POLICY IF EXISTS "Tips are viewable by everyone" ON public.tips;

CREATE POLICY "Owners and admins can read tips"
  ON public.tips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = tips.profile_id AND p.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- 5. Public anonymized tips view
CREATE OR REPLACE VIEW public.tips_public AS
SELECT id, profile_id, block_id, amount_uxion, message,
       CASE
         WHEN length(sender_address) > 16
           THEN substr(sender_address, 1, 10) || '…' || substr(sender_address, length(sender_address) - 3)
         ELSE sender_address
       END AS sender_short,
       block_height, created_at
FROM public.tips;

GRANT SELECT ON public.tips_public TO anon, authenticated;

-- 6. Harden has_role: only ever returns true for the current session user
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 7. Lock down log_profile_event execute privileges (admin check is inside)
REVOKE EXECUTE ON FUNCTION public.log_profile_event(uuid, text, text, jsonb, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_profile_event(uuid, text, text, jsonb, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_profile_event(uuid, text, text, jsonb, jsonb) TO authenticated;