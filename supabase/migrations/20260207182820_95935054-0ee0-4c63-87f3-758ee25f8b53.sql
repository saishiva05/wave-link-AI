
-- =============================================
-- WAVE LYNK AI - Complete Database Schema
-- =============================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'candidate');
CREATE TYPE public.platform_type AS ENUM ('linkedin', 'jsearch');
CREATE TYPE public.application_status AS ENUM (
  'pending', 'submitted', 'rejected', 
  'interview_scheduled', 'interviewed', 
  'offer_received', 'hired', 'declined'
);

-- 2. USER_ROLES TABLE (Security-critical - roles stored separately)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. SECURITY DEFINER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. USERS TABLE (profiles extending auth.users)
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- 5. RECRUITERS TABLE
CREATE TABLE public.recruiters (
  recruiter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  company_name TEXT,
  company_website TEXT,
  phone TEXT,
  created_by_admin_id UUID NOT NULL REFERENCES public.users(user_id),
  total_jobs_scraped INTEGER NOT NULL DEFAULT 0,
  total_candidates_managed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recruiters_user_id ON public.recruiters(user_id);
CREATE INDEX idx_recruiters_created_by ON public.recruiters(created_by_admin_id);
CREATE INDEX idx_recruiters_created_at ON public.recruiters(created_at);

-- 6. CANDIDATES TABLE (current_role renamed to current_job_title to avoid reserved keyword)
CREATE TABLE public.candidates (
  candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  assigned_recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id) ON DELETE CASCADE,
  phone TEXT,
  current_location TEXT,
  experience_years INTEGER,
  current_job_title TEXT,
  skills TEXT[],
  created_by_recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX idx_candidates_assigned_recruiter ON public.candidates(assigned_recruiter_id);
CREATE INDEX idx_candidates_created_by ON public.candidates(created_by_recruiter_id);
CREATE INDEX idx_candidates_created_at ON public.candidates(created_at);

-- Helper functions (created after tables exist)
CREATE OR REPLACE FUNCTION public.get_recruiter_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT recruiter_id FROM public.recruiters WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT candidate_id FROM public.candidates WHERE user_id = _user_id LIMIT 1
$$;

-- 7. SCRAPED_JOBS TABLE
CREATE TABLE public.scraped_jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id) ON DELETE CASCADE,
  platform_type platform_type NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  job_description TEXT NOT NULL,
  contract_type TEXT,
  work_type TEXT,
  experience_level TEXT,
  salary_range TEXT,
  job_apply_url TEXT NOT NULL,
  published_date TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scrape_filters_used JSONB NOT NULL DEFAULT '{}'::jsonb,
  external_job_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_scraped_jobs_recruiter ON public.scraped_jobs(recruiter_id);
CREATE INDEX idx_scraped_jobs_platform ON public.scraped_jobs(platform_type);
CREATE INDEX idx_scraped_jobs_scraped_at ON public.scraped_jobs(scraped_at);
CREATE INDEX idx_scraped_jobs_published ON public.scraped_jobs(published_date);
CREATE INDEX idx_scraped_jobs_recruiter_scraped ON public.scraped_jobs(recruiter_id, scraped_at);
CREATE INDEX idx_scraped_jobs_recruiter_platform ON public.scraped_jobs(recruiter_id, platform_type);
CREATE INDEX idx_scraped_jobs_filters ON public.scraped_jobs USING GIN(scrape_filters_used);
CREATE INDEX idx_scraped_jobs_active ON public.scraped_jobs(is_active);

-- 8. CVS TABLE
CREATE TABLE public.cvs (
  cv_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(candidate_id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_for_ats_at TIMESTAMPTZ
);
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cvs_candidate ON public.cvs(candidate_id);
CREATE INDEX idx_cvs_recruiter ON public.cvs(recruiter_id);
CREATE INDEX idx_cvs_uploaded_at ON public.cvs(uploaded_at);
CREATE UNIQUE INDEX idx_cvs_single_primary ON public.cvs(candidate_id) WHERE is_primary = true;

-- 9. ATS_ANALYSES TABLE
CREATE TABLE public.ats_analyses (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.scraped_jobs(job_id) ON DELETE CASCADE,
  cv_id UUID NOT NULL REFERENCES public.cvs(cv_id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id) ON DELETE CASCADE,
  ats_score INTEGER NOT NULL,
  analysis_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  webhook_response_time_ms INTEGER,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, cv_id)
);
ALTER TABLE public.ats_analyses ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ats_job ON public.ats_analyses(job_id);
CREATE INDEX idx_ats_cv ON public.ats_analyses(cv_id);
CREATE INDEX idx_ats_recruiter ON public.ats_analyses(recruiter_id);
CREATE INDEX idx_ats_score ON public.ats_analyses(ats_score);
CREATE INDEX idx_ats_analyzed_at ON public.ats_analyses(analyzed_at);
CREATE INDEX idx_ats_recruiter_analyzed ON public.ats_analyses(recruiter_id, analyzed_at);

-- 10. JOB_APPLICATIONS TABLE
CREATE TABLE public.job_applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.scraped_jobs(job_id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(candidate_id) ON DELETE CASCADE,
  cv_id UUID NOT NULL REFERENCES public.cvs(cv_id) ON DELETE RESTRICT,
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(recruiter_id) ON DELETE CASCADE,
  ats_analysis_id UUID REFERENCES public.ats_analyses(analysis_id) ON DELETE SET NULL,
  application_status application_status NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recruiter_notes TEXT,
  external_application_id TEXT,
  UNIQUE(job_id, candidate_id)
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_applications_candidate ON public.job_applications(candidate_id);
CREATE INDEX idx_applications_recruiter ON public.job_applications(recruiter_id);
CREATE INDEX idx_applications_job ON public.job_applications(job_id);
CREATE INDEX idx_applications_status ON public.job_applications(application_status);
CREATE INDEX idx_applications_applied_at ON public.job_applications(applied_at);
CREATE INDEX idx_applications_candidate_applied ON public.job_applications(candidate_id, applied_at);
CREATE INDEX idx_applications_recruiter_applied ON public.job_applications(recruiter_id, applied_at);

-- 11. TRIGGERS & FUNCTIONS

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_recruiters_updated_at BEFORE UPDATE ON public.recruiters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_candidates_updated_at BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validate ATS score range (using trigger instead of CHECK)
CREATE OR REPLACE FUNCTION public.validate_ats_score()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ats_score < 0 OR NEW.ats_score > 100 THEN
    RAISE EXCEPTION 'ats_score must be between 0 and 100';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_validate_ats_score BEFORE INSERT OR UPDATE ON public.ats_analyses
  FOR EACH ROW EXECUTE FUNCTION public.validate_ats_score();

-- Increment recruiter job count
CREATE OR REPLACE FUNCTION public.increment_recruiter_job_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.recruiters SET total_jobs_scraped = total_jobs_scraped + 1
  WHERE recruiter_id = NEW.recruiter_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_increment_job_count AFTER INSERT ON public.scraped_jobs
  FOR EACH ROW EXECUTE FUNCTION public.increment_recruiter_job_count();

-- Increment recruiter candidate count
CREATE OR REPLACE FUNCTION public.increment_recruiter_candidate_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.recruiters SET total_candidates_managed = total_candidates_managed + 1
  WHERE recruiter_id = NEW.assigned_recruiter_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_increment_candidate_count AFTER INSERT ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.increment_recruiter_candidate_count();

-- Ensure single primary CV per candidate
CREATE OR REPLACE FUNCTION public.ensure_single_primary_cv()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.cvs SET is_primary = false
    WHERE candidate_id = NEW.candidate_id AND cv_id != NEW.cv_id AND is_primary = true;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_ensure_single_primary_cv BEFORE INSERT OR UPDATE ON public.cvs
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_primary_cv();

-- Update application status timestamp
CREATE OR REPLACE FUNCTION public.update_application_status_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.application_status IS DISTINCT FROM NEW.application_status THEN
    NEW.status_updated_at = now();
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_application_status_updated BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_application_status_timestamp();

-- 12. RLS POLICIES

-- user_roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- users
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recruiters can view their candidates profiles" ON public.users FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'recruiter')
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      JOIN public.recruiters r ON r.recruiter_id = c.assigned_recruiter_id
      WHERE c.user_id = users.user_id AND r.user_id = auth.uid()
    )
  );

-- recruiters
CREATE POLICY "Admins can manage all recruiters" ON public.recruiters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters can view own record" ON public.recruiters FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Recruiters can update own record" ON public.recruiters FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- candidates
CREATE POLICY "Admins can manage all candidates" ON public.candidates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters can manage their candidates" ON public.candidates FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'recruiter')
    AND (assigned_recruiter_id = public.get_recruiter_id(auth.uid())
      OR created_by_recruiter_id = public.get_recruiter_id(auth.uid()))
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'recruiter')
    AND (assigned_recruiter_id = public.get_recruiter_id(auth.uid())
      OR created_by_recruiter_id = public.get_recruiter_id(auth.uid()))
  );
CREATE POLICY "Candidates can view own record" ON public.candidates FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- scraped_jobs
CREATE POLICY "Admins can manage all jobs" ON public.scraped_jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters can manage their scraped jobs" ON public.scraped_jobs FOR ALL TO authenticated
  USING (recruiter_id = public.get_recruiter_id(auth.uid()))
  WITH CHECK (recruiter_id = public.get_recruiter_id(auth.uid()));
CREATE POLICY "Candidates can view jobs applied to them" ON public.scraped_jobs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.job_applications ja
      WHERE ja.job_id = scraped_jobs.job_id
        AND ja.candidate_id = public.get_candidate_id(auth.uid())
    )
  );

-- cvs
CREATE POLICY "Admins can manage all CVs" ON public.cvs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters can manage CVs for their candidates" ON public.cvs FOR ALL TO authenticated
  USING (recruiter_id = public.get_recruiter_id(auth.uid()))
  WITH CHECK (recruiter_id = public.get_recruiter_id(auth.uid()));
CREATE POLICY "Candidates can view their own CVs" ON public.cvs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.candidate_id = cvs.candidate_id AND c.user_id = auth.uid()
    )
  );

-- ats_analyses
CREATE POLICY "Admins can manage all analyses" ON public.ats_analyses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters can manage their analyses" ON public.ats_analyses FOR ALL TO authenticated
  USING (recruiter_id = public.get_recruiter_id(auth.uid()))
  WITH CHECK (recruiter_id = public.get_recruiter_id(auth.uid()));
CREATE POLICY "Candidates can view analyses for their applications" ON public.ats_analyses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.job_applications ja
      WHERE ja.ats_analysis_id = ats_analyses.analysis_id
        AND ja.candidate_id = public.get_candidate_id(auth.uid())
    )
  );

-- job_applications
CREATE POLICY "Admins can manage all applications" ON public.job_applications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters can manage their applications" ON public.job_applications FOR ALL TO authenticated
  USING (recruiter_id = public.get_recruiter_id(auth.uid()))
  WITH CHECK (recruiter_id = public.get_recruiter_id(auth.uid()));
CREATE POLICY "Candidates can view their applications" ON public.job_applications FOR SELECT TO authenticated
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- 13. STORAGE BUCKET FOR CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs-bucket', 'cvs-bucket', false, 10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

CREATE POLICY "Recruiters can upload CVs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cvs-bucket' AND public.has_role(auth.uid(), 'recruiter'));
CREATE POLICY "Admins and recruiters can view CVs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs-bucket' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter')));
CREATE POLICY "Candidates can view own CVs in storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs-bucket' AND public.has_role(auth.uid(), 'candidate') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Recruiters can delete CVs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cvs-bucket' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter')));
CREATE POLICY "Admins can manage all storage" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'cvs-bucket' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'cvs-bucket' AND public.has_role(auth.uid(), 'admin'));
