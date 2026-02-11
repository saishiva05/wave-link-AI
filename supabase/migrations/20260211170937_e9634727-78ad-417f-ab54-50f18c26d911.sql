
-- Add RLS policies for the "Update cv's" storage bucket
-- Allow recruiters to read their uploaded updated CVs
CREATE POLICY "Recruiters can read updated CVs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'Update cv''s');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload updated CVs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'Update cv''s' AND auth.role() = 'authenticated');

-- Make the bucket public so files can be previewed/downloaded via URL
UPDATE storage.buckets SET public = true WHERE id = 'Update cv''s';
