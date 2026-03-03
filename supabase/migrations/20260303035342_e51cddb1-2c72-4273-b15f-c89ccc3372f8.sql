
-- Allow recruiters to view admin job postings
CREATE POLICY "Recruiters can view admin job postings"
ON public.scraped_jobs
FOR SELECT
USING ((is_admin_posting = true) AND has_role(auth.uid(), 'recruiter'::app_role));
