
-- Allow candidates to upload their own CVs (up to 3, enforced in app)
CREATE POLICY "Candidates can insert their own CVs"
ON public.cvs
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
);

-- Allow candidates to update their own CVs (set primary)
CREATE POLICY "Candidates can update their own CVs"
ON public.cvs
FOR UPDATE
USING (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
);

-- Allow candidates to delete their own CVs
CREATE POLICY "Candidates can delete their own CVs"
ON public.cvs
FOR DELETE
USING (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
);

-- Storage policy: allow candidates to upload to cvs-bucket
CREATE POLICY "Candidates can upload to cvs-bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs-bucket'
  AND auth.role() = 'authenticated'
);

-- Storage policy: allow candidates to read their own CVs from cvs-bucket
CREATE POLICY "Candidates can read from cvs-bucket"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs-bucket'
  AND auth.role() = 'authenticated'
);
