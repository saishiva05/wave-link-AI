import { useState, useMemo, useEffect } from "react";
import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  X, Briefcase, MapPin, FileText, Info, Sparkles, Loader2,
  XCircle, User, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import ATSResultsView, { type ATSAnalysisResult } from "@/components/recruiter/ATSResultsView";

interface ATSMatcherModalProps {
  job: ScrapedJob | null;
  candidates: any[];
  cvs: any[];
  onClose: () => void;
}

type ModalState = "form" | "loading" | "results" | "error";

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const ATSMatcherModal = ({ job, candidates, cvs, onClose }: ATSMatcherModalProps) => {
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUpdatedCV, setSelectedUpdatedCV] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatedCVs, setUpdatedCVs] = useState<any[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);

  // Fetch updated CVs for this job
  useEffect(() => {
    if (!job || !recruiterId) {
      setUpdatedCVs([]);
      return;
    }
    const fetchUpdatedCVs = async () => {
      setLoadingCVs(true);
      const { data } = await supabase
        .from("updated_cvs")
        .select(`
          updated_cv_id,
          job_id,
          cv_id,
          candidate_id,
          original_file_name,
          updated_file_name,
          updated_file_url,
          updated_file_size_bytes,
          created_at,
          candidates!updated_cvs_candidate_id_fkey (
            users!candidates_user_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq("job_id", job.id)
        .eq("recruiter_id", recruiterId)
        .order("created_at", { ascending: false });

      setUpdatedCVs((data || []).map((ucv: any) => ({
        ...ucv,
        candidate_name: ucv.candidates?.users?.full_name || "Unknown",
        candidate_email: ucv.candidates?.users?.email || "",
      })));
      setLoadingCVs(false);
    };
    fetchUpdatedCVs();
  }, [job, recruiterId]);

  const filteredUpdatedCVs = useMemo(() => {
    if (!candidateSearch) return updatedCVs;
    const q = candidateSearch.toLowerCase();
    return updatedCVs.filter((ucv: any) =>
      (ucv.candidate_name || "").toLowerCase().includes(q) ||
      (ucv.candidate_email || "").toLowerCase().includes(q) ||
      (ucv.updated_file_name || "").toLowerCase().includes(q)
    );
  }, [updatedCVs, candidateSearch]);

  if (!job) return null;

  const selectedUCVObj = updatedCVs.find((ucv: any) => ucv.updated_cv_id === selectedUpdatedCV);

  const handleRun = async () => {
    setState("loading");
    setErrorMsg("");
    const startTime = Date.now();

    try {
      const ucvObj = updatedCVs.find((ucv: any) => ucv.updated_cv_id === selectedUpdatedCV);
      if (!ucvObj) throw new Error("Updated CV not found");

      // Parse updated CV content via edge function
      let cvText = "";
      try {
        const parseResp = await supabase.functions.invoke("parse-cv", {
          body: { fileUrl: ucvObj.updated_file_url },
        });
        if (parseResp.error) throw parseResp.error;
        if (parseResp.data?.error) throw new Error(parseResp.data.error);
        cvText = parseResp.data?.text || "";
      } catch (parseErr: any) {
        throw new Error(`Failed to parse CV: ${parseErr.message}`);
      }

      if (!cvText) throw new Error("No text content extracted from CV");

      const payload = {
        cv_content: cvText,
        cv_file_name: ucvObj.updated_file_name,
        candidate_name: ucvObj.candidate_name || "Unknown",
        job_title: job.job_title,
        company_name: job.company_name,
        location: job.location,
        job_description: job.job_description,
        salary_range: job.salary_range || "",
        experience_level: job.experience_level || "",
        job_apply_url: job.job_apply_url,
        platform_type: job.platform,
        published_date: job.published_date,
        scraped_at: job.scraped_at || "",
      };

      const response = await fetch("https://n8n.srv1340079.hstgr.cloud/webhook/Ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);

      const rawResult = await response.json();
      const elapsed = Date.now() - startTime;

      let parsed: ATSAnalysisResult;
      if (Array.isArray(rawResult) && rawResult[0]?.text) {
        parsed = rawResult[0].text;
      } else if (rawResult?.text) {
        parsed = rawResult.text;
      } else {
        parsed = rawResult;
      }

      if (typeof parsed.ats_score !== "number" && typeof parsed.overall_match_percentage !== "number") {
        throw new Error("Unexpected response format from ATS webhook");
      }

      if (typeof parsed.ats_score !== "number") {
        parsed.ats_score = parsed.overall_match_percentage;
      }

      setAtsResult(parsed);
      setState("results");

      // Save to Supabase - use the original cv_id from the updated CV record
      if (recruiterId) {
        await supabase.from("ats_analyses").insert({
          cv_id: ucvObj.cv_id,
          job_id: job.id,
          recruiter_id: recruiterId,
          ats_score: parsed.ats_score,
          analysis_result: parsed as any,
          webhook_response_time_ms: elapsed,
        });

        queryClient.invalidateQueries({ queryKey: ["recruiter", "job-ats-analyses"] });
      }
    } catch (err: any) {
      console.error("ATS analysis failed:", err);
      setErrorMsg(err.message || "Something went wrong");
      setState("error");
    }
  };

  const handleClose = () => {
    setSelectedUpdatedCV("");
    setCandidateSearch("");
    setState("form");
    setAtsResult(null);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div
        className={cn(
          "bg-card rounded-2xl shadow-elevated w-full animate-scale-in flex flex-col",
          state === "results" ? "max-w-3xl max-h-[92vh]" : "max-w-xl max-h-[90vh]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 font-display">
              {state === "results" ? "ATS Analysis Results" : "Run ATS Analysis"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {state === "results"
                ? `${job.job_title} at ${job.company_name}`
                : "Select an updated/rewritten CV to analyze against this job"}
            </p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {state === "form" && (
            <>
              {/* Job summary */}
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-secondary-900">{job.job_title}</span>
                </div>
                <p className="text-sm text-neutral-700">{job.company_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{job.location}</p>
              </div>

              {/* Updated CV selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Updated Resume <span className="text-destructive">*</span>
                </label>

                {loadingCVs ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading updated resumes...
                  </div>
                ) : updatedCVs.length === 0 ? (
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-warning-700 mb-1">No updated resumes found</p>
                    <p className="text-xs text-warning-600">You need to update CVs for this job first before running ATS analysis. Use the "Update CV" feature to rewrite resumes based on this job description.</p>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        placeholder="Search by candidate name or file..."
                        className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="max-h-[280px] overflow-y-auto space-y-2">
                      {filteredUpdatedCVs.map((ucv: any) => (
                        <button
                          key={ucv.updated_cv_id}
                          type="button"
                          onClick={() => setSelectedUpdatedCV(ucv.updated_cv_id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                            selectedUpdatedCV === ucv.updated_cv_id ? "border-primary bg-primary-50" : "border-border hover:bg-muted/50"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                            {getInitials(ucv.candidate_name || "?")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">{ucv.candidate_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">{ucv.updated_file_name}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                              {formatBytes(ucv.updated_file_size_bytes)} • Updated {new Date(ucv.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedUpdatedCV === ucv.updated_cv_id ? "border-primary bg-primary" : "border-neutral-300"
                          )}>
                            {selectedUpdatedCV === ucv.updated_cv_id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      ))}
                      {filteredUpdatedCVs.length === 0 && candidateSearch && (
                        <p className="text-sm text-neutral-500 text-center py-4">No matching resumes found</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="notice-info flex items-start gap-2">
                <Info className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
                <p className="text-sm">ATS analysis will match the updated resume against this job description using AI. Results will include a match score and recommendations.</p>
              </div>
            </>
          )}

          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="text-lg font-bold text-secondary-900 font-display mt-6">Analyzing updated resume against job requirements...</h3>
              <p className="text-sm text-muted-foreground mt-2">Sending to ATS webhook. This may take 10–30 seconds.</p>
            </div>
          )}

          {state === "results" && atsResult && (
            <ATSResultsView result={atsResult} />
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 font-display mt-6">Analysis Failed</h3>
              <p className="text-sm text-muted-foreground mt-2">{errorMsg || "Something went wrong. Please try again."}</p>
              <div className="flex gap-3 mt-8 w-full">
                <Button variant="portal" className="flex-1" onClick={() => setState("form")}>Try Again</Button>
                <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {state === "form" && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button variant="portal" onClick={handleRun} disabled={!selectedUpdatedCV || updatedCVs.length === 0}>
              <Sparkles className="w-4 h-4" /> Run ATS Analysis
            </Button>
          </div>
        )}

        {state === "results" && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
            <Button variant="outline" onClick={() => { setState("form"); setAtsResult(null); }}>
              Analyze Another
            </Button>
            <Button variant="portal" onClick={handleClose}>Done</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSMatcherModal;
