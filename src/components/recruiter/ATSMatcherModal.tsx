import { useState, useMemo } from "react";
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
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedCV, setSelectedCV] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const candidateCVs = useMemo(
    () => cvs.filter((cv: any) => cv.candidate_id === selectedCandidate),
    [cvs, selectedCandidate]
  );

  const filteredCandidates = useMemo(
    () => candidates.filter((c: any) => {
      const name = c.users?.full_name || "";
      const email = c.users?.email || "";
      const q = candidateSearch.toLowerCase();
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    }),
    [candidates, candidateSearch]
  );

  if (!job) return null;

  const selectedCVObj = cvs.find((cv: any) => cv.cv_id === selectedCV);

  const handleRun = async () => {
    setState("loading");
    setErrorMsg("");
    const startTime = Date.now();

    try {
      const cvObj = cvs.find((cv: any) => cv.cv_id === selectedCV);
      if (!cvObj) throw new Error("CV not found");

      // Create a signed URL for the CV
      let cvUrl = cvObj.file_url;
      const urlParts = cvObj.file_url.split("/cvs-bucket/");
      if (urlParts[1]) {
        const { data: signedData } = await supabase.storage
          .from("cvs-bucket")
          .createSignedUrl(decodeURIComponent(urlParts[1]), 3600);
        if (signedData?.signedUrl) cvUrl = signedData.signedUrl;
      }

      const payload = {
        cv_url: cvUrl,
        cv_file_name: cvObj.file_name,
        candidate_name: cvObj.candidate_name || cvObj.candidates?.users?.full_name || "Unknown",
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

      // Parse the response: expected format is [{ text: { ...fields } }]
      let parsed: ATSAnalysisResult;
      if (Array.isArray(rawResult) && rawResult[0]?.text) {
        parsed = rawResult[0].text;
      } else if (rawResult?.text) {
        parsed = rawResult.text;
      } else {
        // Try using the result directly
        parsed = rawResult;
      }

      // Validate that we have the expected fields
      if (typeof parsed.ats_score !== "number" && typeof parsed.overall_match_percentage !== "number") {
        throw new Error("Unexpected response format from ATS webhook");
      }

      // Normalize score
      if (typeof parsed.ats_score !== "number") {
        parsed.ats_score = parsed.overall_match_percentage;
      }

      setAtsResult(parsed);
      setState("results");

      // Save to Supabase
      if (recruiterId) {
        await supabase.from("ats_analyses").insert({
          cv_id: selectedCV,
          job_id: job.id,
          recruiter_id: recruiterId,
          ats_score: parsed.ats_score,
          analysis_result: parsed as any,
          webhook_response_time_ms: elapsed,
        });

        // Invalidate ATS analyses cache so score shows on job record
        queryClient.invalidateQueries({ queryKey: ["recruiter", "job-ats-analyses"] });
      }
    } catch (err: any) {
      console.error("ATS analysis failed:", err);
      setErrorMsg(err.message || "Something went wrong");
      setState("error");
    }
  };

  const handleClose = () => {
    setSelectedCandidate("");
    setSelectedCV("");
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
                : "Select a candidate's CV to analyze against this job"}
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

              {/* Candidate selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Candidate <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    placeholder="Search candidates..."
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-2"
                  />
                </div>
                <div className="max-h-[180px] overflow-y-auto border border-border rounded-lg">
                  {filteredCandidates.map((c: any) => (
                    <button
                      key={c.candidate_id}
                      type="button"
                      onClick={() => { setSelectedCandidate(c.candidate_id); setSelectedCV(""); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        selectedCandidate === c.candidate_id ? "bg-primary-100" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                        {getInitials(c.users?.full_name || "?")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-secondary-900 truncate">{c.users?.full_name}</p>
                        <p className="text-xs text-neutral-500">{c.users?.email}</p>
                      </div>
                    </button>
                  ))}
                  {filteredCandidates.length === 0 && (
                    <p className="text-sm text-neutral-500 text-center py-4">No candidates found</p>
                  )}
                </div>
              </div>

              {/* CV selection */}
              {selectedCandidate && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select CV <span className="text-destructive">*</span>
                  </label>
                  {candidateCVs.length === 0 ? (
                    <p className="text-sm text-neutral-500 bg-muted/50 p-3 rounded-lg">No CVs uploaded for this candidate.</p>
                  ) : (
                    <div className="space-y-2">
                      {candidateCVs.map((cv: any) => (
                        <button
                          key={cv.cv_id}
                          type="button"
                          onClick={() => setSelectedCV(cv.cv_id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                            selectedCV === cv.cv_id ? "border-primary bg-primary-50" : "border-border hover:bg-muted/50"
                          )}
                        >
                          <FileText className="w-5 h-5 text-neutral-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-secondary-900 truncate">{cv.file_name}</span>
                              {cv.is_primary && (
                                <span className="text-[10px] font-semibold bg-success-50 text-success-700 px-1.5 py-0.5 rounded shrink-0">Primary</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatBytes(cv.file_size_bytes)} • Uploaded {new Date(cv.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedCV === cv.cv_id ? "border-primary bg-primary" : "border-neutral-300"
                          )}>
                            {selectedCV === cv.cv_id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="notice-info flex items-start gap-2">
                <Info className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
                <p className="text-sm">ATS analysis will match the candidate's CV against this job description using AI. Results will include a match score and recommendations.</p>
              </div>
            </>
          )}

          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="text-lg font-bold text-secondary-900 font-display mt-6">Analyzing CV against job requirements...</h3>
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
            <Button variant="portal" onClick={handleRun} disabled={!selectedCandidate || !selectedCV}>
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
