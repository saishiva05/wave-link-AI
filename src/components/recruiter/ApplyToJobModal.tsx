import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrapedJob } from "@/data/mockScrapedJobs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, FileText, CheckCircle2, Send, AlertCircle } from "lucide-react";

interface ApplyToJobModalProps {
  job: ScrapedJob | null;
  candidates: any[];
  cvs: any[];
  updatedCVs: any[];
  atsAnalyses: any[];
  onClose: () => void;
}

const ApplyToJobModal = ({ job, candidates, cvs, updatedCVs, atsAnalyses, onClose }: ApplyToJobModalProps) => {
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;

  // Build candidate list from ALL candidates (not just those with updated CVs)
  const candidateMap: Record<string, { candidate_id: string; candidate_name: string; originalCVs: any[]; updatedCVs: any[]; atsScore: number | null }> = {};

  // Add all candidates that have CVs
  cvs.forEach((cv: any) => {
    if (!candidateMap[cv.candidate_id]) {
      const candidate = candidates.find((c: any) => c.candidate_id === cv.candidate_id);
      candidateMap[cv.candidate_id] = {
        candidate_id: cv.candidate_id,
        candidate_name: candidate?.users?.full_name || candidate?.full_name || "Unknown",
        originalCVs: [],
        updatedCVs: [],
        atsScore: null,
      };
    }
    candidateMap[cv.candidate_id].originalCVs.push(cv);
  });

  // Attach updated CVs
  updatedCVs.forEach((ucv: any) => {
    if (candidateMap[ucv.candidate_id]) {
      candidateMap[ucv.candidate_id].updatedCVs.push(ucv);
    }
  });

  // Attach ATS scores
  atsAnalyses.forEach((a: any) => {
    Object.values(candidateMap).forEach((c) => {
      const hasCV = c.originalCVs.some((cv: any) => cv.cv_id === a.cv_id) ||
                    c.updatedCVs.some((cv: any) => cv.cv_id === a.cv_id);
      if (hasCV && (c.atsScore === null || a.ats_score > c.atsScore)) {
        c.atsScore = a.ats_score;
      }
    });
  });

  const eligibleCandidates = Object.values(candidateMap);
  const selectedCandidate = eligibleCandidates.find((c) => c.candidate_id === selectedCandidateId);

  // Combine original + updated CVs for selection
  const availableCVs = selectedCandidate
    ? [
        ...selectedCandidate.originalCVs.map((cv: any) => ({ type: "original" as const, cv_id: cv.cv_id, file_name: cv.file_name, label: "Original" })),
        ...selectedCandidate.updatedCVs.map((ucv: any) => ({ type: "updated" as const, cv_id: ucv.cv_id, file_name: ucv.updated_file_name, label: "Updated" })),
      ]
    : [];

  const handleSubmit = async () => {
    if (!selectedCandidateId || !selectedCvId || !recruiterId) return;

    setIsSubmitting(true);
    try {
      const atsAnalysis = atsAnalyses.find((a: any) => a.cv_id === selectedCvId);

      const { error } = await supabase.from("job_applications").insert({
        job_id: job.id,
        candidate_id: selectedCandidateId,
        cv_id: selectedCvId,
        recruiter_id: recruiterId,
        application_status: "submitted",
        ats_analysis_id: atsAnalysis?.analysis_id || null,
        apply_started_at: new Date().toISOString(),
        apply_completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: `Successfully applied for ${job.job_title} at ${job.company_name}`,
      });

      queryClient.invalidateQueries({ queryKey: ["recruiter"] });
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display">Apply to Job</DialogTitle>
          <DialogDescription>
            {job.job_title} at {job.company_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {eligibleCandidates.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle className="w-10 h-10 text-warning-500 mb-3" />
              <p className="text-sm font-medium text-secondary-900">No candidates with CVs</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a CV for a candidate first.</p>
            </div>
          ) : (
            <>
              {/* Step 1: Select Candidate */}
              <div>
                <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider mb-2 block">
                  Select Candidate
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {eligibleCandidates.map((c) => (
                    <button
                      key={c.candidate_id}
                      onClick={() => { setSelectedCandidateId(c.candidate_id); setSelectedCvId(null); }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        selectedCandidateId === c.candidate_id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      )}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary-900 truncate">{c.candidate_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.originalCVs.length} CV{c.originalCVs.length > 1 ? "s" : ""}
                          {c.updatedCVs.length > 0 && ` · ${c.updatedCVs.length} updated`}
                        </p>
                      </div>
                      {c.atsScore !== null && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          c.atsScore >= 70 ? "bg-emerald-100 text-emerald-700" :
                          c.atsScore >= 50 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-600"
                        )}>
                          ATS: {c.atsScore}%
                        </span>
                      )}
                      {selectedCandidateId === c.candidate_id && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select CV */}
              {selectedCandidate && (
                <div>
                  <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider mb-2 block">
                    Select CV to Submit
                  </label>
                  <div className="space-y-2">
                    {availableCVs.map((cv) => (
                      <button
                        key={`${cv.type}-${cv.cv_id}`}
                        onClick={() => setSelectedCvId(cv.cv_id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                          selectedCvId === cv.cv_id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30 hover:bg-muted/30"
                        )}
                      >
                        <FileText className={cn("w-4 h-4 shrink-0", cv.type === "updated" ? "text-teal-600" : "text-muted-foreground")} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">{cv.file_name}</p>
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                            cv.type === "updated" ? "bg-teal-100 text-teal-700" : "bg-muted text-muted-foreground"
                          )}>
                            {cv.label}
                          </span>
                        </div>
                        {selectedCvId === cv.cv_id && (
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              variant="portal"
              disabled={!selectedCandidateId || !selectedCvId || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Application</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyToJobModal;
