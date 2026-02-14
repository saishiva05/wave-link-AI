
-- Create messages table for candidate-recruiter communication
CREATE TABLE public.messages (
  message_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_user_id UUID NOT NULL,
  receiver_user_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(candidate_id),
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Candidates can view messages where they are the candidate
CREATE POLICY "Candidates can view their messages"
  ON public.messages FOR SELECT
  USING (
    sender_user_id = auth.uid() OR receiver_user_id = auth.uid()
  );

-- Candidates can send messages (insert)
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_user_id = auth.uid());

-- Recruiters can view messages for their candidates
CREATE POLICY "Recruiters can view messages for their candidates"
  ON public.messages FOR SELECT
  USING (
    has_role(auth.uid(), 'recruiter'::app_role) AND
    EXISTS (
      SELECT 1 FROM candidates c
      JOIN recruiters r ON r.recruiter_id = c.assigned_recruiter_id
      WHERE c.candidate_id = messages.candidate_id AND r.user_id = auth.uid()
    )
  );

-- Recruiters can send messages to their candidates
CREATE POLICY "Recruiters can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'recruiter'::app_role) AND
    EXISTS (
      SELECT 1 FROM candidates c
      JOIN recruiters r ON r.recruiter_id = c.assigned_recruiter_id
      WHERE c.candidate_id = messages.candidate_id AND r.user_id = auth.uid()
    )
  );

-- Mark as read
CREATE POLICY "Users can mark their received messages as read"
  ON public.messages FOR UPDATE
  USING (receiver_user_id = auth.uid())
  WITH CHECK (receiver_user_id = auth.uid());

-- Admin full access
CREATE POLICY "Admins can manage all messages"
  ON public.messages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
