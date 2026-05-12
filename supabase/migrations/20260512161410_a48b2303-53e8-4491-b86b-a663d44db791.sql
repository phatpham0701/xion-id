-- Revert profiles policy back to public read; we will restrict via column grants
DROP POLICY IF EXISTS "Owners and admins can read profiles" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Restrict columns the anonymous role can read on profiles
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, user_id, username, display_name, bio, avatar_url, theme,
  is_published, is_featured, xion_address, wallet_connected_at,
  settings, created_at, updated_at
) ON public.profiles TO anon;

-- Tips: restore public select, hide sender_address from anon
DROP POLICY IF EXISTS "Owners and admins can read tips" ON public.tips;

CREATE POLICY "Tips are viewable by everyone"
  ON public.tips FOR SELECT
  USING (true);

REVOKE SELECT ON public.tips FROM anon;
GRANT SELECT (
  id, profile_id, block_id, amount_uxion, message,
  recipient_address, block_height, created_at, tx_hash
) ON public.tips TO anon;

-- Drop helper objects we no longer need
DROP VIEW IF EXISTS public.profiles_public;
DROP VIEW IF EXISTS public.tips_public;
DROP FUNCTION IF EXISTS public.is_username_available(text);