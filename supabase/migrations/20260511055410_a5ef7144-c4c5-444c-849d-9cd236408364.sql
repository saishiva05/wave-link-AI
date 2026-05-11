
DROP POLICY IF EXISTS "Candidates can read from cvs-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can upload to cvs-bucket" ON storage.objects;

CREATE POLICY "Candidates can upload own CVs to storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cvs-bucket'
  AND has_role(auth.uid(), 'candidate'::app_role)
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Recruiters can delete CVs" ON storage.objects;
CREATE POLICY "Recruiters can delete their candidates CVs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'cvs-bucket'
  AND has_role(auth.uid(), 'recruiter'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.cvs c
    WHERE c.recruiter_id = get_recruiter_id(auth.uid())
      AND c.file_url LIKE '%' || storage.objects.name
  )
);

UPDATE storage.buckets SET public = false WHERE id = 'Update cv''s';

DROP POLICY IF EXISTS "Recruiters can read updated CVs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload updated CVs" ON storage.objects;

CREATE POLICY "Recruiters can read their updated CVs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'Update cv''s'
  AND has_role(auth.uid(), 'recruiter'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.updated_cvs u
    WHERE u.recruiter_id = get_recruiter_id(auth.uid())
      AND u.updated_file_url LIKE '%' || storage.objects.name
  )
);

CREATE POLICY "Candidates can read their updated CVs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'Update cv''s'
  AND has_role(auth.uid(), 'candidate'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.updated_cvs u
    WHERE u.candidate_id = get_candidate_id(auth.uid())
      AND u.updated_file_url LIKE '%' || storage.objects.name
  )
);

CREATE POLICY "Admins can manage updated CVs storage"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'Update cv''s' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'Update cv''s' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Recruiters can upload updated CVs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'Update cv''s'
  AND has_role(auth.uid(), 'recruiter'::app_role)
);

DROP POLICY IF EXISTS "Candidates can view their messages" ON public.messages;
CREATE POLICY "Candidates can view their own messages"
ON public.messages FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
  AND (sender_user_id = auth.uid() OR receiver_user_id = auth.uid())
);

REVOKE EXECUTE ON FUNCTION public.increment_recruiter_job_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_recruiter_candidate_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_single_primary_cv() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_ats_score() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_application_status_timestamp() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_recruiter_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_candidate_id(uuid) FROM PUBLIC, anon;
