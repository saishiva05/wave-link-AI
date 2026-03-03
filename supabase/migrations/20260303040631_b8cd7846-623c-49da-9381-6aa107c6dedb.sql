-- Allow candidates to create applications for admin-posted jobs assigned to their recruiter
CREATE POLICY "Candidates can apply to admin job postings"
ON public.job_applications
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
  AND recruiter_id = (
    SELECT c.assigned_recruiter_id
    FROM public.candidates c
    WHERE c.candidate_id = get_candidate_id(auth.uid())
    LIMIT 1
  )
  AND EXISTS (
    SELECT 1
    FROM public.scraped_jobs sj
    WHERE sj.job_id = job_applications.job_id
      AND sj.is_admin_posting = true
      AND sj.is_active = true
  )
  AND EXISTS (
    SELECT 1
    FROM public.cvs cv
    WHERE cv.cv_id = job_applications.cv_id
      AND cv.candidate_id = get_candidate_id(auth.uid())
  )
);

-- Allow candidates to mark their own applications complete (e.g., after applying externally)
CREATE POLICY "Candidates can update own application completion"
ON public.job_applications
FOR UPDATE
USING (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'candidate'::app_role)
  AND candidate_id = get_candidate_id(auth.uid())
);