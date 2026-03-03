import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AutoATSJob {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobDescription: string;
  salaryRange: string;
  experienceLevel: string;
  jobApplyUrl: string;
  platform: string;
  publishedDate: string;
  scrapedAt: string;
}

interface QueueStatus {
  total: number;
  completed: number;
  failed: number;
  current: string | null;
  isRunning: boolean;
}

const DELAY_BETWEEN_JOBS_MS = 60_000; // 1 minute
const MAX_AUTO_ATS_JOBS = 20;

export function useAutoATSQueue(recruiterId: string | null) {
  const queryClient = useQueryClient();
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    total: 0, completed: 0, failed: 0, current: null, isRunning: false,
  });
  const abortRef = useRef(false);

  const runAutoATS = useCallback(async (scrapedJobs: AutoATSJob[]) => {
    if (!recruiterId) return;
    abortRef.current = false;

    // Get all candidates' primary CVs for this recruiter
    const { data: primaryCVs } = await supabase
      .from("cvs")
      .select(`cv_id, candidate_id, file_name, file_url, file_size_bytes, candidates!cvs_candidate_id_fkey ( users!candidates_user_id_fkey ( full_name ) )`)
      .eq("recruiter_id", recruiterId)
      .eq("is_primary", true);

    if (!primaryCVs || primaryCVs.length === 0) {
      console.warn("No primary CVs found for auto-ATS");
      return;
    }

    // Use the first primary CV found (most common use case: single candidate)
    const primaryCV = primaryCVs[0];
    const candidateName = (primaryCV as any).candidates?.users?.full_name || "Unknown";

    // Parse the CV content once
    let cvText = "";
    try {
      let parsePayload: any = {};
      const urlParts = primaryCV.file_url?.split("/cvs-bucket/");
      if (urlParts?.[1]) {
        parsePayload = { bucket: "cvs-bucket", filePath: decodeURIComponent(urlParts[1]), fileName: primaryCV.file_name || "" };
      } else {
        const { data: signedData } = await supabase.storage
          .from("cvs-bucket")
          .createSignedUrl(decodeURIComponent(primaryCV.file_url || ""), 3600);
        parsePayload = { fileUrl: signedData?.signedUrl || primaryCV.file_url, fileName: primaryCV.file_name || "" };
      }
      const parseResp = await supabase.functions.invoke("parse-cv", { body: parsePayload });
      if (parseResp.error) throw parseResp.error;
      if (parseResp.data?.error) throw new Error(parseResp.data.error);
      cvText = parseResp.data?.text || "";
    } catch (err) {
      console.error("Failed to parse primary CV for auto-ATS:", err);
      return;
    }

    if (!cvText) return;

    const jobsToProcess = scrapedJobs.slice(0, MAX_AUTO_ATS_JOBS);
    setQueueStatus({ total: jobsToProcess.length, completed: 0, failed: 0, current: null, isRunning: true });

    for (let i = 0; i < jobsToProcess.length; i++) {
      if (abortRef.current) break;

      const job = jobsToProcess[i];
      setQueueStatus((prev) => ({ ...prev, current: job.jobTitle }));

      try {
        const startTime = Date.now();
        const payload = {
          cv_content: cvText,
          cv_file_name: primaryCV.file_name,
          candidate_name: candidateName,
          job_title: job.jobTitle,
          company_name: job.companyName,
          location: job.location,
          job_description: job.jobDescription,
          salary_range: job.salaryRange,
          experience_level: job.experienceLevel,
          job_apply_url: job.jobApplyUrl,
          platform_type: job.platform,
          published_date: job.publishedDate,
          scraped_at: job.scrapedAt,
        };

        const response = await fetch("https://n8n.srv1340079.hstgr.cloud/webhook/Ats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`Webhook returned ${response.status}`);

        const rawResult = await response.json();
        const elapsed = Date.now() - startTime;

        let parsed: any;
        if (Array.isArray(rawResult) && rawResult[0]?.text) parsed = rawResult[0].text;
        else if (rawResult?.text) parsed = rawResult.text;
        else parsed = rawResult;

        if (typeof parsed.ats_score !== "number" && typeof parsed.overall_match_percentage === "number") {
          parsed.ats_score = parsed.overall_match_percentage;
        }

        if (typeof parsed.ats_score === "number") {
          await supabase.from("ats_analyses").insert({
            cv_id: primaryCV.cv_id,
            job_id: job.jobId,
            recruiter_id: recruiterId,
            ats_score: parsed.ats_score,
            analysis_result: parsed,
            webhook_response_time_ms: elapsed,
          });
          setQueueStatus((prev) => ({ ...prev, completed: prev.completed + 1 }));
        } else {
          setQueueStatus((prev) => ({ ...prev, failed: prev.failed + 1 }));
        }
      } catch (err) {
        console.error(`Auto-ATS failed for job ${job.jobTitle}:`, err);
        setQueueStatus((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Wait 1 minute before next job (except for the last one)
      if (i < jobsToProcess.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_JOBS_MS));
      }
    }

    setQueueStatus((prev) => ({ ...prev, isRunning: false, current: null }));
    queryClient.invalidateQueries({ queryKey: ["recruiter", "job-ats-analyses"] });
  }, [recruiterId, queryClient]);

  const cancelAutoATS = useCallback(() => {
    abortRef.current = true;
    setQueueStatus((prev) => ({ ...prev, isRunning: false, current: null }));
  }, []);

  return { queueStatus, runAutoATS, cancelAutoATS };
}
