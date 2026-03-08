-- Allow candidates to read ONLY their assigned recruiter row
CREATE POLICY "Candidates can view assigned recruiter"
ON public.recruiters
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'candidate'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.candidates c
    WHERE c.user_id = auth.uid()
      AND c.assigned_recruiter_id = recruiters.recruiter_id
  )
);

-- Allow candidates to read ONLY the users row of their assigned recruiter
CREATE POLICY "Candidates can view assigned recruiter profile"
ON public.users
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'candidate'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.candidates c
    JOIN public.recruiters r ON r.recruiter_id = c.assigned_recruiter_id
    WHERE c.user_id = auth.uid()
      AND r.user_id = users.user_id
  )
);