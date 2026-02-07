import { useState } from "react";
import { ScrapedJob } from "@/data/mockScrapedJobs";
import { X, Briefcase, MapPin, User, FileText, Info, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ATSMatcherModalProps {
  job: ScrapedJob | null;
  onClose: () => void;
}

const mockCandidates = [
  { id: "c1", name: "John Doe", email: "john@email.com", cvCount: 3 },
  { id: "c2", name: "Jane Smith", email: "jane@email.com", cvCount: 2 },
  { id: "c3", name: "Mike Chen", email: "mike@email.com", cvCount: 1 },
  { id: "c4", name: "Sarah Kim", email: "sarah@email.com", cvCount: 4 },
];

const mockCVs: Record<string, { id: string; filename: string; uploaded: string; size: string; isPrimary: boolean }[]> = {
  c1: [
    { id: "cv1", filename: "john_doe_resume_v2.pdf", uploaded: "5 days ago", size: "1.2 MB", isPrimary: true },
    { id: "cv2", filename: "john_doe_resume.pdf", uploaded: "2 weeks ago", size: "980 KB", isPrimary: false },
    { id: "cv3", filename: "john_doe_cover_letter.pdf", uploaded: "1 month ago", size: "540 KB", isPrimary: false },
  ],
  c2: [
    { id: "cv4", filename: "jane_smith_cv.pdf", uploaded: "1 week ago", size: "1.5 MB", isPrimary: true },
    { id: "cv5", filename: "jane_smith_cv_old.pdf", uploaded: "1 month ago", size: "1.1 MB", isPrimary: false },
  ],
  c3: [
    { id: "cv6", filename: "mike_chen_resume.pdf", uploaded: "3 days ago", size: "890 KB", isPrimary: true },
  ],
  c4: [
    { id: "cv7", filename: "sarah_kim_resume.pdf", uploaded: "1 day ago", size: "1.3 MB", isPrimary: true },
    { id: "cv8", filename: "sarah_kim_portfolio.pdf", uploaded: "1 week ago", size: "4.2 MB", isPrimary: false },
    { id: "cv9", filename: "sarah_kim_cover.pdf", uploaded: "2 weeks ago", size: "420 KB", isPrimary: false },
    { id: "cv10", filename: "sarah_kim_old_cv.pdf", uploaded: "2 months ago", size: "1.0 MB", isPrimary: false },
  ],
};

type ModalState = "form" | "loading" | "success" | "error";

const ATSMatcherModal = ({ job, onClose }: ATSMatcherModalProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedCV, setSelectedCV] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [score, setScore] = useState(0);

  if (!job) return null;

  const candidateCVs = selectedCandidate ? mockCVs[selectedCandidate] || [] : [];

  const handleRun = async () => {
    setState("loading");
    // Simulate ATS analysis
    await new Promise((r) => setTimeout(r, 3000));
    const randomScore = Math.floor(Math.random() * 40) + 55; // 55-95
    setScore(randomScore);
    setState("success");
  };

  const scoreColor = score >= 70 ? "text-success-500" : score >= 50 ? "text-warning-500" : "text-destructive";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-elevated max-w-xl w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 font-display">Run ATS Analysis</h2>
            <p className="text-sm text-muted-foreground mt-1">Select a candidate's CV to analyze against this job</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
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
                  Candidate <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedCandidate}
                  onChange={(e) => { setSelectedCandidate(e.target.value); setSelectedCV(""); }}
                  className="w-full h-12 px-3 border border-border rounded-lg bg-card text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Select a candidate</option>
                  {mockCandidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.email} ({c.cvCount} CVs)</option>
                  ))}
                </select>
              </div>

              {/* CV selection */}
              {selectedCandidate && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select CV <span className="text-destructive">*</span>
                  </label>
                  <div className="space-y-2">
                    {candidateCVs.map((cv) => (
                      <button
                        key={cv.id}
                        type="button"
                        onClick={() => setSelectedCV(cv.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                          selectedCV === cv.id
                            ? "border-primary bg-primary-50"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <FileText className="w-6 h-6 text-neutral-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-secondary-900 truncate">{cv.filename}</span>
                            {cv.isPrimary && (
                              <span className="text-[10px] font-semibold bg-success-50 text-success-700 px-1.5 py-0.5 rounded shrink-0">Primary</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Uploaded {cv.uploaded} • {cv.size}</p>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                          selectedCV === cv.id ? "border-primary bg-primary" : "border-neutral-300"
                        )}>
                          {selectedCV === cv.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info note */}
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
                <Button variant="portal" className="flex-1" onClick={onClose}>View Full Analysis</Button>
                <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
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
                <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - only for form state */}
        {state === "form" && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="portal"
              onClick={handleRun}
              disabled={!selectedCandidate || !selectedCV}
            >
              <Sparkles className="w-4 h-4" />
              Run ATS Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSMatcherModal;
