-- Fix RLS policies: change 'public' role to 'authenticated' on affected tables

-- messages table
DROP POLICY IF EXISTS "Candidates can send messages" ON public.messages;
CREATE POLICY "Candidates can send messages" ON public.messages FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'candidate'::app_role) AND sender_user_id = auth.uid() AND candidate_id = get_candidate_id(auth.uid()));

DROP POLICY IF EXISTS "Candidates can view their messages" ON public.messages;
CREATE POLICY "Candidates can view their messages" ON public.messages FOR SELECT TO authenticated
USING (sender_user_id = auth.uid() OR receiver_user_id = auth.uid());

DROP POLICY IF EXISTS "Recruiters can view messages for their candidates" ON public.messages;
CREATE POLICY "Recruiters can view messages for their candidates" ON public.messages FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'recruiter'::app_role) AND EXISTS (SELECT 1 FROM candidates c JOIN recruiters r ON r.recruiter_id = c.assigned_recruiter_id WHERE c.candidate_id = messages.candidate_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS "Recruiters can send messages" ON public.messages;
CREATE POLICY "Recruiters can send messages" ON public.messages FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'recruiter'::app_role) AND sender_user_id = auth.uid() AND EXISTS (SELECT 1 FROM candidates c JOIN recruiters r ON r.recruiter_id = c.assigned_recruiter_id WHERE c.candidate_id = messages.candidate_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can mark their received messages as read" ON public.messages;
CREATE POLICY "Users can mark their received messages as read" ON public.messages FOR UPDATE TO authenticated
USING (receiver_user_id = auth.uid()) WITH CHECK (receiver_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;
CREATE POLICY "Admins can manage all messages" ON public.messages FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- cvs table
DROP POLICY IF EXISTS "Candidates can delete their own CVs" ON public.cvs;
CREATE POLICY "Candidates can delete their own CVs" ON public.cvs FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'candidate'::app_role) AND candidate_id = get_candidate_id(auth.uid()));

DROP POLICY IF EXISTS "Candidates can insert their own CVs" ON public.cvs;
CREATE POLICY "Candidates can insert their own CVs" ON public.cvs FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'candidate'::app_role) AND candidate_id = get_candidate_id(auth.uid()));

DROP POLICY IF EXISTS "Candidates can update their own CVs" ON public.cvs;
CREATE POLICY "Candidates can update their own CVs" ON public.cvs FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'candidate'::app_role) AND candidate_id = get_candidate_id(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'candidate'::app_role) AND candidate_id = get_candidate_id(auth.uid()));

-- job_applications table
DROP POLICY IF EXISTS "Candidates can apply to admin job postings" ON public.job_applications;
CREATE POLICY "Candidates can apply to admin job postings" ON public.job_applications FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'candidate'::app_role) AND candidate_id = get_candidate_id(auth.uid()) AND recruiter_id = (SELECT c.assigned_recruiter_id FROM candidates c WHERE c.candidate_id = get_candidate_id(auth.uid()) LIMIT 1) AND EXISTS (SELECT 1 FROM scraped_jobs sj WHERE sj.job_id = job_applications.job_id AND sj.is_admin_posting = true AND sj.is_active = true) AND EXISTS (SELECT 1 FROM cvs cv WHERE cv.cv_id = job_applications.cv_id AND cv.candidate_id = get_candidate_id(auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own application completion" ON public.job_applications;
CREATE POLICY "Candidates can update own application completion" ON public.job_applications FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'candidate'::app_role) AND candidate_id = get_candidate_id(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'candidate'::app_role) AND candidate_id = get_candidate_id(auth.uid()));

-- updated_cvs table
DROP POLICY IF EXISTS "Admins can manage all updated CVs" ON public.updated_cvs;
CREATE POLICY "Admins can manage all updated CVs" ON public.updated_cvs FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Candidates can view their updated CVs" ON public.updated_cvs;
CREATE POLICY "Candidates can view their updated CVs" ON public.updated_cvs FOR SELECT TO authenticated
USING (candidate_id = get_candidate_id(auth.uid()));

DROP POLICY IF EXISTS "Recruiters can manage their updated CVs" ON public.updated_cvs;
CREATE POLICY "Recruiters can manage their updated CVs" ON public.updated_cvs FOR ALL TO authenticated
USING (recruiter_id = get_recruiter_id(auth.uid())) WITH CHECK (recruiter_id = get_recruiter_id(auth.uid()));

-- generated_emails table
DROP POLICY IF EXISTS "Admins can manage all generated emails" ON public.generated_emails;
CREATE POLICY "Admins can manage all generated emails" ON public.generated_emails FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Recruiters can manage their generated emails" ON public.generated_emails;
CREATE POLICY "Recruiters can manage their generated emails" ON public.generated_emails FOR ALL TO authenticated
USING (recruiter_id = get_recruiter_id(auth.uid())) WITH CHECK (recruiter_id = get_recruiter_id(auth.uid()));

-- scraped_jobs table
DROP POLICY IF EXISTS "Recruiters can view admin job postings" ON public.scraped_jobs;
CREATE POLICY "Recruiters can view admin job postings" ON public.scraped_jobs FOR SELECT TO authenticated
USING (is_admin_posting = true AND has_role(auth.uid(), 'recruiter'::app_role));