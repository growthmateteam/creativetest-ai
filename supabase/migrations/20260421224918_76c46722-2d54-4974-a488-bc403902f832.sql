
DROP POLICY IF EXISTS "Workspace logos are publicly readable" ON storage.objects;

-- Public can read individual files by URL via the storage proxy (uses service role).
-- Restrict the direct policy to authenticated users so anonymous clients cannot list the bucket.
CREATE POLICY "Authenticated users can read workspace logos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'workspace-logos');
