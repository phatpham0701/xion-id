-- profiles: wallet fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xion_address text,
  ADD COLUMN IF NOT EXISTS wallet_connected_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_xion_address_unique
  ON public.profiles(xion_address) WHERE xion_address IS NOT NULL;

-- badge enum
DO $$ BEGIN
  CREATE TYPE public.badge_kind AS ENUM (
    'og_2024','og_2025','nft_collector','nft_minter','tipper',
    'dapp_explorer','campaign_participant','contest_winner','whale','early_adopter'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- wallet_badges
CREATE TABLE IF NOT EXISTS public.wallet_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  xion_address text NOT NULL,
  kind public.badge_kind NOT NULL,
  tier int NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, kind)
);

CREATE INDEX IF NOT EXISTS wallet_badges_profile_idx ON public.wallet_badges(profile_id);
CREATE INDEX IF NOT EXISTS wallet_badges_address_idx ON public.wallet_badges(xion_address);

ALTER TABLE public.wallet_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Badges viewable by everyone" ON public.wallet_badges;
CREATE POLICY "Badges viewable by everyone"
  ON public.wallet_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can delete their badges" ON public.wallet_badges;
CREATE POLICY "Owners can delete their badges"
  ON public.wallet_badges FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = wallet_badges.profile_id AND p.user_id = auth.uid()
  ));