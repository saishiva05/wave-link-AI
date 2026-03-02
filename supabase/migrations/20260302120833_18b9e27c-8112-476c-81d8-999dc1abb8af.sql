
-- Feature #3: Track recruiter login/logout sessions for admin monitoring
CREATE TABLE public.recruiter_sessions (
  session_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  logged_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logged_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recruiter_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all sessions"
  ON public.recruiter_sessions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Recruiters can manage their own sessions"
  ON public.recruiter_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_recruiter_sessions_recruiter_id ON public.recruiter_sessions(recruiter_id);
CREATE INDEX idx_recruiter_sessions_logged_in_at ON public.recruiter_sessions(logged_in_at DESC);

-- Feature #4: Track time between apply URL click and mark-as-applied
ALTER TABLE public.job_applications
  ADD COLUMN apply_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN apply_completed_at TIMESTAMP WITH TIME ZONE;

-- Feature #2: Add flag for admin-posted jobs visible to all candidates
ALTER TABLE public.scraped_jobs
  ADD COLUMN is_admin_posting BOOLEAN NOT NULL DEFAULT false;

-- RLS: Allow all authenticated candidates to view admin postings
CREATE POLICY "Candidates can view admin job postings"
  ON public.scraped_jobs FOR SELECT
  TO authenticated
  USING (is_admin_posting = true AND has_role(auth.uid(), 'candidate'::app_role));
