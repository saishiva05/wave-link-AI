WITH ranked AS (
  SELECT job_id,
         row_number() OVER (
           PARTITION BY recruiter_id, lower(platform_type),
             md5(lower(coalesce(job_apply_url,'')) || '|' || lower(coalesce(job_title,'')))
           ORDER BY scraped_at DESC NULLS LAST, job_id DESC
         ) AS rn
  FROM public.scraped_jobs
  WHERE external_job_id IS NULL OR external_job_id = ''
)
DELETE FROM public.scraped_jobs sj
USING ranked r
WHERE sj.job_id = r.job_id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS scraped_jobs_recruiter_platform_url_title_hash_uniq
  ON public.scraped_jobs (
    recruiter_id,
    lower(platform_type),
    md5(lower(coalesce(job_apply_url,'')) || '|' || lower(coalesce(job_title,'')))
  )
  WHERE external_job_id IS NULL OR external_job_id = '';