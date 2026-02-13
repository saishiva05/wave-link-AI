
-- Create generated_emails table to store AI-generated email content per job
CREATE TABLE public.generated_emails (
  email_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.scraped_jobs(job_id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  webhook_response JSON NULL,
  webhook_response_time_ms INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Recruiters can manage their generated emails"
ON public.generated_emails FOR ALL
USING (recruiter_id = get_recruiter_id(auth.uid()))
WITH CHECK (recruiter_id = get_recruiter_id(auth.uid()));

CREATE POLICY "Admins can manage all generated emails"
ON public.generated_emails FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for quick lookups by job
CREATE INDEX idx_generated_emails_job_id ON public.generated_emails(job_id);
CREATE INDEX idx_generated_emails_recruiter_id ON public.generated_emails(recruiter_id);
