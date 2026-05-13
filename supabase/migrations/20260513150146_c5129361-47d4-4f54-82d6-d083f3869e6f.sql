revoke all on function public.get_candidate_updated_cvs() from public;
revoke all on function public.get_candidate_updated_cvs() from anon;
grant execute on function public.get_candidate_updated_cvs() to authenticated;