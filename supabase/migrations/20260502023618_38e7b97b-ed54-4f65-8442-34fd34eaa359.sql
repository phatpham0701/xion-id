DROP POLICY IF EXISTS "Anyone can insert a tip after on-chain broadcast" ON public.tips;

CREATE INDEX IF NOT EXISTS tips_profile_created_idx
  ON public.tips (profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS tips_tx_hash_idx
  ON public.tips (tx_hash);