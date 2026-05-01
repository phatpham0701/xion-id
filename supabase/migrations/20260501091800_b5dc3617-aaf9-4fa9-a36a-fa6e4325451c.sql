-- Add tip_jar to block_type enum
ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'tip_jar';

-- Tips table: on-chain XION tips sent to a profile
CREATE TABLE public.tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  block_id uuid,
  recipient_address text NOT NULL,
  sender_address text NOT NULL,
  amount_uxion bigint NOT NULL CHECK (amount_uxion > 0),
  message text,
  tx_hash text NOT NULL UNIQUE,
  block_height bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tips_profile_created ON public.tips (profile_id, created_at DESC);
CREATE INDEX idx_tips_recipient ON public.tips (recipient_address);

ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Anyone can read tips (used for public leaderboards & owner analytics)
CREATE POLICY "Tips are viewable by everyone"
  ON public.tips FOR SELECT
  USING (true);

-- Anyone (anon or authed) can record a tip after broadcasting on-chain.
-- tx_hash uniqueness + on-chain truth keeps this safe; basic length sanity below.
CREATE POLICY "Anyone can insert a tip after on-chain broadcast"
  ON public.tips FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(tx_hash) BETWEEN 40 AND 128
    AND length(sender_address) BETWEEN 20 AND 128
    AND length(recipient_address) BETWEEN 20 AND 128
    AND amount_uxion > 0
    AND (message IS NULL OR length(message) <= 280)
  );