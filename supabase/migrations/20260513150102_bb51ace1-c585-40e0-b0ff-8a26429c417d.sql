create or replace function public.get_candidate_updated_cvs()
returns table (
  updated_cv_id uuid,
  cv_id uuid,
  job_id uuid,
  candidate_id uuid,
  recruiter_id uuid,
  updated_file_name text,
  updated_file_url text,
  updated_file_size_bytes bigint,
  original_file_name text,
  created_at timestamptz,
  job_title text,
  company_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    uc.updated_cv_id,
    uc.cv_id,
    uc.job_id,
    uc.candidate_id,
    uc.recruiter_id,
    uc.updated_file_name,
    uc.updated_file_url,
    uc.updated_file_size_bytes,
    uc.original_file_name,
    uc.created_at,
    sj.job_title,
    sj.company_name
  from public.candidates c
  join public.updated_cvs uc on uc.candidate_id = c.candidate_id
  left join public.scraped_jobs sj on sj.job_id = uc.job_id
  where c.user_id = auth.uid()
  order by uc.created_at desc;
$$;

grant execute on function public.get_candidate_updated_cvs() to authenticated;