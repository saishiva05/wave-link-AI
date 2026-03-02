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
  updatedCVs: any[];
  atsAnalyses: any[];
  onClose: () => void;
}

const ApplyToJobModal = ({ job, candidates, updatedCVs, atsAnalyses, onClose }: ApplyToJobModalProps) => {
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;

  // Get candidates who have updated CVs for this job
  const candidatesWithCVs = updatedCVs.reduce((acc: Record<string, any>, ucv: any) => {
    if (!acc[ucv.candidate_id]) {
      acc[ucv.candidate_id] = {
        candidate_id: ucv.candidate_id,
        candidate_name: ucv.candidate_name || "Unknown",
        cvs: [],
        atsScore: null,
      };
    }
    acc[ucv.candidate_id].cvs.push(ucv);
    return acc;
  }, {} as Record<string, any>);

  // Attach ATS scores
  atsAnalyses.forEach((a: any) => {
    Object.values(candidatesWithCVs).forEach((c: any) => {
      const matchingCV = c.cvs.find((cv: any) => cv.cv_id === a.cv_id);
      if (matchingCV) {
        c.atsScore = a.ats_score;
      }
    });
  });

  const eligibleCandidates = Object.values(candidatesWithCVs) as any[];

  const selectedCandidate = eligibleCandidates.find((c: any) => c.candidate_id === selectedCandidateId);

  const handleSubmit = async () => {
    if (!selectedCandidateId || !selectedCvId || !recruiterId) return;

    setIsSubmitting(true);
    try {
      // Find ATS analysis for this candidate+job if exists
      const atsAnalysis = atsAnalyses.find(
        (a: any) => a.cv_id === selectedCvId
      );

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
              <p className="text-sm font-medium text-secondary-900">No eligible candidates</p>
              <p className="text-xs text-muted-foreground mt-1">Update CVs and run ATS analysis first before applying.</p>
            </div>
          ) : (
            <>
              {/* Step 1: Select Candidate */}
              <div>
                <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider mb-2 block">
                  Select Candidate
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {eligibleCandidates.map((c: any) => (
                    <button
                      key={c.candidate_id}
                      onClick={() => {
                        setSelectedCandidateId(c.candidate_id);
                        setSelectedCvId(null);
                      }}
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
                        <p className="text-xs text-muted-foreground">{c.cvs.length} updated CV{c.cvs.length > 1 ? "s" : ""}</p>
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
                    {selectedCandidate.cvs.map((cv: any) => (
                      <button
                        key={cv.updated_cv_id}
                        onClick={() => setSelectedCvId(cv.cv_id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                          selectedCvId === cv.cv_id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30 hover:bg-muted/30"
                        )}
                      >
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">{cv.updated_file_name}</p>
                          <p className="text-xs text-muted-foreground">Updated from: {cv.original_file_name}</p>
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
