import { useState, useRef, useEffect } from "react";
import {
  X, Sparkles, FileText, MapPin, Briefcase, Info, Loader2, CheckCircle, XCircle, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CVFile, JobOption } from "@/hooks/useCVManagement";

interface CVATSModalProps {
  cv: CVFile | null;
  jobs: JobOption[];
  onClose: () => void;
}

type ModalState = "form" | "loading" | "success" | "error";

const CVATSModal = ({ cv, jobs, onClose }: CVATSModalProps) => {
  const [selectedJob, setSelectedJob] = useState("");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [score, setScore] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setJobDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!cv) return null;

  const filteredJobs = jobs.filter((j) =>
    j.job_title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.company_name.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const selectedJobObj = jobs.find((j) => j.job_id === selectedJob);

  const handleRun = async () => {
    setState("loading");
    await new Promise((r) => setTimeout(r, 3000));
    const randomScore = Math.floor(Math.random() * 40) + 55;
    setScore(randomScore);
    setState("success");
  };

  const scoreColor = score >= 70 ? "text-success-500" : score >= 50 ? "text-warning-500" : "text-destructive";

  const handleClose = () => {
    setSelectedJob("");
    setJobSearch("");
    setState("form");
    setScore(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="bg-card rounded-2xl shadow-elevated max-w-xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 font-display">Run ATS Analysis</h2>
            <p className="text-sm text-muted-foreground mt-1">Select a job to analyze this CV against</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {state === "form" && (
            <>
              {/* CV summary */}
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-secondary-900">{cv.file_name}</span>
                </div>
                <p className="text-sm text-neutral-700">Candidate: {cv.candidate_name}</p>
              </div>

              {/* Job selection */}
              <div className="mb-5" ref={dropdownRef}>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Job <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
                  className="w-full h-12 px-3 flex items-center gap-3 border border-border rounded-lg bg-card text-sm text-left hover:bg-muted/50 transition-colors"
                >
                  {selectedJobObj ? (
                    <>
                      <Briefcase className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-secondary-900 truncate block">{selectedJobObj.job_title}</span>
                        <span className="text-xs text-neutral-600">{selectedJobObj.company_name}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-5 h-5 text-neutral-400" />
                      <span className="text-neutral-500">Select a job</span>
                    </>
                  )}
                </button>

                {jobDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-[calc(100%-48px)] bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                          placeholder="Search jobs..."
                          className="w-full h-9 pl-8 pr-3 text-sm rounded border border-border outline-none focus:border-primary"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto">
                      {filteredJobs.map((j) => (
                        <button
                          key={j.job_id}
                          onClick={() => { setSelectedJob(j.job_id); setJobDropdownOpen(false); }}
                          className={cn("w-full flex items-start gap-3 px-3 py-3 hover:bg-primary-50 transition-colors text-left", selectedJob === j.job_id && "bg-primary-100")}
                        >
                          <Briefcase className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-secondary-900">{j.job_title}</p>
                            <p className="text-xs text-neutral-600">{j.company_name}</p>
                            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{j.location}</p>
                          </div>
                        </button>
                      ))}
                      {filteredJobs.length === 0 && (
                        <p className="text-sm text-neutral-500 text-center py-4">No jobs found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="notice-info flex items-start gap-2">
                <Info className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
                <p className="text-sm">ATS analysis will match this CV against the selected job description using AI. Results will include a match score and recommendations.</p>
              </div>
            </>
          )}

          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="text-lg font-bold text-secondary-900 font-display mt-6">Analyzing CV against job requirements...</h3>
              <p className="text-sm text-muted-foreground mt-2">This may take 10–20 seconds</p>
            </div>
          )}

          {state === "success" && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success-500" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 font-display mt-6">Analysis Complete!</h3>
              <div className="mt-4">
                <span className={cn("text-5xl font-bold font-display", scoreColor)}>{score}%</span>
                <p className="text-sm text-muted-foreground mt-2">
                  {score >= 70 ? "Good match" : score >= 50 ? "Moderate match" : "Low match"} — ATS Compatibility Score
                </p>
              </div>
              <div className="flex gap-3 mt-8 w-full">
                <Button variant="portal" className="flex-1" onClick={handleClose}>View Full Analysis</Button>
                <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 font-display mt-6">Analysis Failed</h3>
              <p className="text-sm text-muted-foreground mt-2">Something went wrong. Please try again.</p>
              <div className="flex gap-3 mt-8 w-full">
                <Button variant="portal" className="flex-1" onClick={() => setState("form")}>Try Again</Button>
                <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {state === "form" && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button variant="portal" onClick={handleRun} disabled={!selectedJob}>
              <Sparkles className="w-4 h-4" /> Run ATS Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVATSModal;
