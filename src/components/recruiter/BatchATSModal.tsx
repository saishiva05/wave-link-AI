import { useState, useMemo } from "react";
import {
  X, Sparkles, Loader2, Search, FileText, Briefcase, Info,
  CheckCircle, XCircle, RefreshCw, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import ATSResultsView, { type ATSAnalysisResult } from "@/components/recruiter/ATSResultsView";
import type { ScrapedJob } from "@/data/mockScrapedJobs";

interface BatchATSModalProps {
  open: boolean;
  jobs: ScrapedJob[];
  candidates: any[];
  cvs: any[];
  atsAnalyses: Record<string, any[]>;
  onClose: () => void;
}

type ModalStep = "select-jobs" | "select-cv" | "running" | "results";

interface JobResult {
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: "pending" | "running" | "success" | "error";
  score?: number;
  result?: ATSAnalysisResult;
  error?: string;
}

const MAX_BATCH = 10;
const DELAY_BETWEEN_MS = 10_000; // 10 seconds

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const BatchATSModal = ({ open, jobs, candidates, cvs, atsAnalyses, onClose }: BatchATSModalProps) => {
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<ModalStep>("select-jobs");
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [selectedCV, setSelectedCV] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [cvSearch, setCvSearch] = useState("");
  const [includeAnalyzed, setIncludeAnalyzed] = useState(false);
  const [jobResults, setJobResults] = useState<JobResult[]>([]);
  const [viewingResult, setViewingResult] = useState<JobResult | null>(null);

  // Enrich CVs
  const enrichedCVs = useMemo(() => {
    return cvs.map((cv: any) => {
      const candidate = candidates.find((c: any) => c.candidate_id === cv.candidate_id);
      return {
        ...cv,
        candidate_name: candidate?.users?.full_name || "Unknown",
      };
    });
  }, [cvs, candidates]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (!includeAnalyzed) {
      list = list.filter((j) => !(atsAnalyses[j.id]?.length > 0));
    }
    if (jobSearch) {
      const q = jobSearch.toLowerCase();
      list = list.filter((j) =>
        j.job_title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, atsAnalyses, includeAnalyzed, jobSearch]);

  const filteredCVs = useMemo(() => {
    if (!cvSearch) return enrichedCVs;
    const q = cvSearch.toLowerCase();
    return enrichedCVs.filter((cv: any) =>
      (cv.candidate_name || "").toLowerCase().includes(q) ||
      (cv.file_name || "").toLowerCase().includes(q)
    );
  }, [enrichedCVs, cvSearch]);

  const unanalyzedCount = useMemo(() =>
    jobs.filter((j) => !(atsAnalyses[j.id]?.length > 0)).length
  , [jobs, atsAnalyses]);

  const toggleJob = (id: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_BATCH) {
        next.add(id);
      }
      return next;
    });
  };

  const handleRunBatch = async () => {
    setStep("running");
    const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));
    const results: JobResult[] = selectedJobs.map((j) => ({
      jobId: j.id,
      jobTitle: j.job_title,
      companyName: j.company_name,
      status: "pending" as const,
    }));
    setJobResults([...results]);

    // Parse CV once
    const cvObj = enrichedCVs.find((cv: any) => cv.cv_id === selectedCV);
    if (!cvObj) return;

    let cvText = "";
    try {
      let parsePayload: any = {};
      const urlParts = cvObj.file_url?.split("/cvs-bucket/");
      if (urlParts?.[1]) {
        parsePayload = { bucket: "cvs-bucket", filePath: decodeURIComponent(urlParts[1]), fileName: cvObj.file_name || "" };
      } else {
        const { data: signedData } = await supabase.storage
          .from("cvs-bucket")
          .createSignedUrl(decodeURIComponent(cvObj.file_url || ""), 3600);
        parsePayload = { fileUrl: signedData?.signedUrl || cvObj.file_url, fileName: cvObj.file_name || "" };
      }
      const parseResp = await supabase.functions.invoke("parse-cv", { body: parsePayload });
      if (parseResp.error) throw parseResp.error;
      if (parseResp.data?.error) throw new Error(parseResp.data.error);
      cvText = parseResp.data?.text || "";
    } catch (err: any) {
      // Mark all as error
      setJobResults(results.map((r) => ({ ...r, status: "error", error: `CV parse failed: ${err.message}` })));
      return;
    }

    if (!cvText) {
      setJobResults(results.map((r) => ({ ...r, status: "error", error: "No text extracted from CV" })));
      return;
    }

    const processJobs = async () => {
    for (let i = 0; i < selectedJobs.length; i++) {
      const job = selectedJobs[i];
      setJobResults((prev) => prev.map((r, idx) => idx === i ? { ...r, status: "running" } : r));

      try {
        const startTime = Date.now();
        const payload = {
          cv_content: cvText,
          cv_file_name: cvObj.file_name,
          candidate_name: cvObj.candidate_name || "Unknown",
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

        let parsed: any;
        if (Array.isArray(rawResult) && rawResult[0]?.text) parsed = rawResult[0].text;
        else if (rawResult?.text) parsed = rawResult.text;
        else parsed = rawResult;

        if (typeof parsed.ats_score !== "number" && typeof parsed.overall_match_percentage === "number") {
          parsed.ats_score = parsed.overall_match_percentage;
        }

        if (typeof parsed.ats_score === "number" && recruiterId) {
          await supabase.from("ats_analyses").insert({
            cv_id: cvObj.cv_id,
            job_id: job.id,
            recruiter_id: recruiterId,
            ats_score: parsed.ats_score,
            analysis_result: parsed,
            webhook_response_time_ms: elapsed,
          });

          setJobResults((prev) => prev.map((r, idx) =>
            idx === i ? { ...r, status: "success", score: parsed.ats_score, result: parsed } : r
          ));
        } else {
          setJobResults((prev) => prev.map((r, idx) =>
            idx === i ? { ...r, status: "error", error: "Invalid score in response" } : r
          ));
        }
      } catch (err: any) {
        setJobResults((prev) => prev.map((r, idx) =>
          idx === i ? { ...r, status: "error", error: err.message } : r
        ));
      }

      // Delay between jobs (except last)
      if (i < selectedJobs.length - 1) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_MS));
      }
    }

      queryClient.invalidateQueries({ queryKey: ["recruiter", "job-ats-analyses"] });
      setStep("results");
    };

    // Run in background so user can see results as they come in
    processJobs();
  };

  const handleClose = () => {
    setStep("select-jobs");
    setSelectedJobIds(new Set());
    setSelectedCV("");
    setJobSearch("");
    setCvSearch("");
    setIncludeAnalyzed(false);
    setJobResults([]);
    setViewingResult(null);
    onClose();
  };

  if (!open) return null;

  // Viewing a single result detail
  if (viewingResult?.result) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewingResult(null)}>
        <div className="bg-card rounded-2xl shadow-elevated max-w-3xl w-full max-h-[92vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold text-secondary-900 font-display">ATS Results</h2>
              <p className="text-sm text-muted-foreground mt-1">{viewingResult.jobTitle} at {viewingResult.companyName}</p>
            </div>
            <button onClick={() => setViewingResult(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-5 overflow-y-auto flex-1">
            <ATSResultsView result={viewingResult.result} />
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end shrink-0">
            <Button variant="portal" onClick={() => setViewingResult(null)}>Back to Results</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="bg-card rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {step === "select-jobs" ? "Batch ATS Analysis" : step === "select-cv" ? "Select Resume" : step === "running" ? "Running Analysis..." : "Batch Results"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "select-jobs" && `Select up to ${MAX_BATCH} jobs to analyze (${unanalyzedCount} unanalyzed)`}
              {step === "select-cv" && `Choose a candidate resume for ${selectedJobIds.size} selected jobs`}
              {step === "running" && "Processing jobs with 10-second intervals..."}
              {step === "results" && "Analysis complete for all selected jobs"}
            </p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {step === "select-jobs" && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search jobs..."
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeAnalyzed}
                    onChange={(e) => setIncludeAnalyzed(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-muted-foreground whitespace-nowrap">Include analyzed</span>
                </label>
              </div>

              {selectedJobIds.size > 0 && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-700">{selectedJobIds.size} / {MAX_BATCH} selected</span>
                  <button onClick={() => setSelectedJobIds(new Set())} className="text-xs text-primary-600 hover:text-primary-800 underline">Clear</button>
                </div>
              )}

              <div className="max-h-[360px] overflow-y-auto space-y-1.5">
                {filteredJobs.map((job) => {
                  const isSelected = selectedJobIds.has(job.id);
                  const hasExistingATS = (atsAnalyses[job.id]?.length || 0) > 0;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => toggleJob(job.id)}
                      disabled={!isSelected && selectedJobIds.size >= MAX_BATCH}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                        isSelected ? "border-primary bg-primary-50" : "border-border hover:bg-muted/50",
                        !isSelected && selectedJobIds.size >= MAX_BATCH && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 truncate">{job.job_title}</p>
                        <p className="text-xs text-muted-foreground truncate">{job.company_name} • {job.location}</p>
                      </div>
                      {hasExistingATS && (
                        <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> Re-run
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredJobs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {includeAnalyzed ? "No jobs match your search" : "All jobs have been analyzed! Toggle 'Include analyzed' to re-run."}
                  </p>
                )}
              </div>
            </>
          )}

          {step === "select-cv" && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  value={cvSearch}
                  onChange={(e) => setCvSearch(e.target.value)}
                  placeholder="Search by candidate name or file..."
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="max-h-[360px] overflow-y-auto space-y-1.5">
                {filteredCVs.map((cv: any) => (
                  <button
                    key={cv.cv_id}
                    type="button"
                    onClick={() => setSelectedCV(cv.cv_id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                      selectedCV === cv.cv_id ? "border-primary bg-primary-50" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                      {getInitials(cv.candidate_name || "?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{cv.candidate_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{cv.file_name}</span>
                        {cv.is_primary && (
                          <span className="text-[10px] font-semibold bg-success-50 text-success-700 px-1.5 py-0.5 rounded shrink-0">Primary</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{formatBytes(cv.file_size_bytes)}</p>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedCV === cv.cv_id ? "border-primary bg-primary" : "border-neutral-300"
                    )}>
                      {selectedCV === cv.cv_id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
                {filteredCVs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No resumes found</p>
                )}
              </div>

              <div className="notice-info flex items-start gap-2 mt-4">
                <Info className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
                <p className="text-sm">The selected resume will be analyzed against all {selectedJobIds.size} jobs. Jobs are processed with a 10-second gap between each.</p>
              </div>
            </>
          )}

          {(step === "running" || step === "results") && (
            <div className="space-y-2">
              {jobResults.map((jr) => (
                <div
                  key={jr.jobId}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    jr.status === "success" ? "border-success-200 bg-success-50/50" :
                    jr.status === "error" ? "border-destructive/20 bg-destructive/5" :
                    jr.status === "running" ? "border-primary/30 bg-primary-50/50" :
                    "border-border"
                  )}
                >
                  <div className="shrink-0">
                    {jr.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-border" />}
                    {jr.status === "running" && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                    {jr.status === "success" && <CheckCircle className="w-5 h-5 text-success-500" />}
                    {jr.status === "error" && <XCircle className="w-5 h-5 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">{jr.jobTitle}</p>
                    <p className="text-xs text-muted-foreground truncate">{jr.companyName}</p>
                    {jr.error && <p className="text-xs text-destructive mt-0.5">{jr.error}</p>}
                  </div>
                  {jr.status === "success" && jr.score !== undefined && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        "text-sm font-bold",
                        jr.score >= 70 ? "text-success-600" : jr.score >= 50 ? "text-warning-600" : "text-destructive"
                      )}>{jr.score}%</span>
                      <button
                        onClick={() => setViewingResult(jr)}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
          {step === "select-jobs" && (
            <>
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button
                variant="portal"
                onClick={() => setStep("select-cv")}
                disabled={selectedJobIds.size === 0}
              >
                <Users className="w-4 h-4" /> Next: Select Resume ({selectedJobIds.size})
              </Button>
            </>
          )}
          {step === "select-cv" && (
            <>
              <Button variant="ghost" onClick={() => setStep("select-jobs")}>Back</Button>
              <Button
                variant="portal"
                onClick={handleRunBatch}
                disabled={!selectedCV}
              >
                <Sparkles className="w-4 h-4" /> Run ATS for {selectedJobIds.size} Jobs
              </Button>
            </>
          )}
          {step === "running" && (
            <>
              <span className="text-sm text-muted-foreground">
                {jobResults.filter((r) => r.status === "success" || r.status === "error").length} / {jobResults.length} complete
              </span>
              <Button variant="outline" disabled>Processing...</Button>
            </>
          )}
          {step === "results" && (
            <>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-success-600 font-medium">{jobResults.filter((r) => r.status === "success").length} passed</span>
                {jobResults.filter((r) => r.status === "error").length > 0 && (
                  <span className="text-destructive font-medium">{jobResults.filter((r) => r.status === "error").length} failed</span>
                )}
              </div>
              <Button variant="portal" onClick={handleClose}>Done</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchATSModal;
