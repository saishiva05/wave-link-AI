ALTER TABLE public.scraped_jobs ALTER COLUMN applications_count TYPE text USING applications_count::text;
ALTER TABLE public.scraped_jobs ALTER COLUMN applications_count SET DEFAULT null;