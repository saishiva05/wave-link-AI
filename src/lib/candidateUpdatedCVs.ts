import { supabase } from "@/integrations/supabase/client";

export interface CandidateUpdatedCV {
  updated_cv_id: string;
  cv_id: string;
  job_id: string;
  candidate_id: string;
  recruiter_id: string;
  updated_file_name: string;
  updated_file_url: string;
  updated_file_size_bytes: number | null;
  original_file_name: string;
  created_at: string;
  job_title: string | null;
  company_name: string | null;
  job?: { job_title: string; company_name: string } | null;
}

export async function fetchCandidateUpdatedCVs(): Promise<CandidateUpdatedCV[]> {
  const { data, error } = await (supabase as any).rpc("get_candidate_updated_cvs");
  if (error) throw error;

  return (data || []).map((cv: CandidateUpdatedCV) => ({
    ...cv,
    job: cv.job_title || cv.company_name
      ? { job_title: cv.job_title || "Unknown role", company_name: cv.company_name || "Unknown company" }
      : null,
  }));
}