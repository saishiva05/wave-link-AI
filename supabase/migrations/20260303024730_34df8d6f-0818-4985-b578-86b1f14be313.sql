
-- Change platform_type from enum to text to accept any platform
ALTER TABLE public.scraped_jobs 
  ALTER COLUMN platform_type TYPE text USING platform_type::text;

-- Drop the enum type since it's no longer needed
DROP TYPE IF EXISTS public.platform_type;
