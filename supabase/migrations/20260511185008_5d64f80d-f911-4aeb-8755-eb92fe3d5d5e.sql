ALTER TABLE public.job_applications ALTER COLUMN cv_id DROP NOT NULL;
ALTER TABLE public.job_applications DROP CONSTRAINT job_applications_cv_id_fkey;
ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_cv_id_fkey FOREIGN KEY (cv_id) REFERENCES public.cvs(cv_id) ON DELETE SET NULL;