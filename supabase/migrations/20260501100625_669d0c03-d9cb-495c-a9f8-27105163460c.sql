-- Replace the broad public-read policy on avatars to forbid listing the bucket.
-- LIST requests come through with name = '' or a folder prefix; we only allow
-- requests that target a real object name (contains a dot extension).
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;

CREATE POLICY "Avatars are publicly readable by object"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
  AND name IS NOT NULL
  AND length(name) > 0
  AND position('.' in name) > 0
);