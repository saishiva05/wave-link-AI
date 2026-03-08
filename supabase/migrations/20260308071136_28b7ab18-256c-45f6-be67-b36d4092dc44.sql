
-- Fix message sending: both INSERT policies are RESTRICTIVE so candidates can't send.
-- Drop the restrictive ones and recreate as PERMISSIVE.

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Recruiters can send messages" ON public.messages;

-- Candidates can send messages to their assigned recruiter
CREATE POLICY "Candidates can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'candidate'::app_role)
  AND sender_user_id = auth.uid()
  AND candidate_id = get_candidate_id(auth.uid())
);

-- Recruiters can send messages to their assigned candidates
CREATE POLICY "Recruiters can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'recruiter'::app_role)
  AND sender_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM candidates c
    JOIN recruiters r ON r.recruiter_id = c.assigned_recruiter_id
    WHERE c.candidate_id = messages.candidate_id AND r.user_id = auth.uid()
  )
);
