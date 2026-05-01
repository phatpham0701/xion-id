-- Add nft_gallery block type
ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'nft_gallery';

-- Allow profile owners to insert/update their own wallet badges (verified client-side scan).
CREATE POLICY "Owners can insert their badges"
ON public.wallet_badges
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = wallet_badges.profile_id
    AND p.user_id = auth.uid()
));

CREATE POLICY "Owners can update their badges"
ON public.wallet_badges
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = wallet_badges.profile_id
    AND p.user_id = auth.uid()
));

-- Prevent duplicate badges of the same kind per profile.
CREATE UNIQUE INDEX IF NOT EXISTS wallet_badges_profile_kind_idx
  ON public.wallet_badges (profile_id, kind);