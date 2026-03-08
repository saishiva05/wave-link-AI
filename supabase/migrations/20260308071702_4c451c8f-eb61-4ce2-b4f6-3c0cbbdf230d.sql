
-- Fix: All policies are RESTRICTIVE (AND logic), so candidates can't insert 
-- because the admin ALL policy fails for them.
-- Solution: Drop restrictive insert policies and recreate as PERMISSIVE.

DROP POLICY IF EXISTS "Candidates can send messages" ON public.messages;
DROP POLICY IF EXISTS "Recruiters can send messages" ON public.messages;

-- Candidate insert - PERMISSIVE
CREATE POLICY "Candidates can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'candidate'::app_role)
  AND sender_user_id = auth.uid()
  AND candidate_id = get_candidate_id(auth.uid())
);

-- Recruiter insert - PERMISSIVE  
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
