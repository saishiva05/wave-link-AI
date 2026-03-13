import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { Briefcase, MapPin, Building2, Clock, ExternalLink, FileText, Sparkles, Users, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ATSResultsView, { type ATSAnalysisResult } from "@/components/recruiter/ATSResultsView";

interface AdminJobDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
}

const statusLabels: Record<string, string> = {
  pending: "Pending", submitted: "Submitted", rejected: "Rejected",
  interview_scheduled: "Interview", interviewed: "Interviewed",
  offer_received: "Offer", hired: "Hired", declined: "Declined",
};

const statusStyles: Record<string, string> = {
  pending: "bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400",
  submitted: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
  interview_scheduled: "bg-primary/15 text-primary",
  interviewed: "bg-primary/20 text-primary",
  offer_received: "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400",
  hired: "bg-success-100 text-success-700 dark:bg-success-500/30 dark:text-success-400",
  declined: "bg-muted text-muted-foreground",
};

const AdminJobDetailModal = ({ open, onOpenChange, job }: AdminJobDetailModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [viewATSResult, setViewATSResult] = useState<ATSAnalysisResult | null>(null);

  // Fetch ATS analyses for this job
  const { data: atsAnalyses = [], isLoading: atsLoading } = useQuery({
    queryKey: ["admin", "job-ats", job?.job_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("ats_analyses")
        .select(`
          analysis_id, ats_score, analyzed_at, analysis_result,
          cvs!ats_analyses_cv_id_fkey(file_name, candidates!cvs_candidate_id_fkey(users!candidates_user_id_fkey(full_name))),
          recruiters!ats_analyses_recruiter_id_fkey(users!recruiters_user_id_fkey(full_name))
        `)
        .eq("job_id", job.job_id)
        .order("analyzed_at", { ascending: false });
      return data || [];
    },
    enabled: open && !!job?.job_id,
  });

  // Fetch updated CVs for this job
  const { data: updatedCVs = [], isLoading: cvsLoading } = useQuery({
    queryKey: ["admin", "job-updated-cvs", job?.job_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("updated_cvs")
        .select(`
          updated_cv_id, updated_file_name, updated_file_url, created_at, original_file_name,
          candidates!updated_cvs_candidate_id_fkey(users!candidates_user_id_fkey(full_name)),
          recruiters!updated_cvs_recruiter_id_fkey(users!recruiters_user_id_fkey(full_name))
        `)
        .eq("job_id", job.job_id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: open && !!job?.job_id,
  });

  // Fetch applications for this job
  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["admin", "job-applications", job?.job_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_applications")
        .select(`
          application_id, application_status, applied_at, recruiter_notes,
          candidates!job_applications_candidate_id_fkey(users!candidates_user_id_fkey(full_name, email)),
          recruiters!job_applications_recruiter_id_fkey(users!recruiters_user_id_fkey(full_name))
        `)
        .eq("job_id", job.job_id)
        .order("applied_at", { ascending: false });
      return data || [];
    },
    enabled: open && !!job?.job_id,
  });

  if (!job) return null;

  const handleCopyUrl = () => {
    if (job.job_apply_url) {
      navigator.clipboard.writeText(job.job_apply_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "URL copied to clipboard" });
    }
  };

  const handleViewATS = (analysis: any) => {
    let result = analysis.analysis_result;
    if (Array.isArray(result) && result[0]?.text) {
      result = result[0].text;
    }
    setViewATSResult(result as ATSAnalysisResult);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-lg">
              <Briefcase className="w-5 h-5 text-primary" />
              {job.job_title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> {job.company_name}
              <span className="text-muted-foreground">•</span>
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant={job.is_active ? "default" : "secondary"} className={job.is_active ? "bg-success-500 text-white" : ""}>
              {job.is_active ? "Active" : "Inactive"}
            </Badge>
            {job.contract_type && <Badge variant="outline">{job.contract_type}</Badge>}
            {job.work_type && <Badge variant="outline">{job.work_type}</Badge>}
            {job.experience_level && <Badge variant="outline">{job.experience_level}</Badge>}
            {job.salary_range && <Badge variant="outline">💰 {job.salary_range}</Badge>}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Clock className="w-3.5 h-3.5" />
            Posted {formatDistanceToNow(new Date(job.scraped_at), { addSuffix: true })}
            {job.job_apply_url && job.job_apply_url !== "#" && (
              <>
                <span>•</span>
                <button onClick={handleCopyUrl} className="flex items-center gap-1 text-primary hover:underline">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy URL"}
                </button>
                <a href={job.job_apply_url.startsWith("http") ? job.job_apply_url : `https://${job.job_apply_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" /> View Listing
                </a>
              </>
            )}
          </div>

          <Tabs defaultValue="details" className="mt-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="ats" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ATS
                {atsAnalyses.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{atsAnalyses.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="cvs" className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> CVs
                {updatedCVs.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{updatedCVs.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="apps" className="flex items-center gap-1">
                <Users className="w-3 h-3" /> Apps
                {applications.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{applications.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <div className="prose prose-sm max-w-none text-foreground">
                <div className="bg-muted rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                  {job.job_description || "No description available."}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ats" className="mt-4">
              {atsLoading ? (
                <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : atsAnalyses.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No ATS analyses have been run for this job yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atsAnalyses.map((a: any) => {
                    const candidateName = (a.cvs as any)?.candidates?.users?.full_name || "Unknown";
                    const recruiterName = (a.recruiters as any)?.users?.full_name || "Unknown";
                    const score = a.ats_score;
                    const scoreColor = score >= 80 ? "text-success-500" : score >= 60 ? "text-warning-500" : "text-destructive";
                    return (
                      <div key={a.analysis_id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{candidateName}</p>
                          <p className="text-xs text-muted-foreground">By {recruiterName} • {formatDistanceToNow(new Date(a.analyzed_at), { addSuffix: true })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn("text-lg font-bold", scoreColor)}>{score}%</span>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleViewATS(a)}>
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cvs" className="mt-4">
              {cvsLoading ? (
                <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : updatedCVs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No updated CVs have been generated for this job yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {updatedCVs.map((cv: any) => {
                    const candidateName = (cv.candidates as any)?.users?.full_name || "Unknown";
                    const recruiterName = (cv.recruiters as any)?.users?.full_name || "Unknown";
                    return (
                      <div key={cv.updated_cv_id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{candidateName}</p>
                          <p className="text-xs text-muted-foreground">
                            {cv.original_file_name} → {cv.updated_file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">By {recruiterName} • {formatDistanceToNow(new Date(cv.created_at), { addSuffix: true })}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(cv.updated_file_url, "_blank")}>
                          <ExternalLink className="w-3 h-3" /> View
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="apps" className="mt-4">
              {appsLoading ? (
                <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No applications have been submitted for this job yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app: any) => {
                    const candidateName = (app.candidates as any)?.users?.full_name || "Unknown";
                    const recruiterName = (app.recruiters as any)?.users?.full_name || "Unknown";
                    const status = app.application_status;
                    return (
                      <div key={app.application_id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{candidateName}</p>
                          <p className="text-xs text-muted-foreground">
                            By {recruiterName} • {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                          </p>
                          {app.recruiter_notes && <p className="text-xs text-muted-foreground mt-1 italic">"{app.recruiter_notes}"</p>}
                        </div>
                        <Badge className={cn("text-xs", statusStyles[status] || "")}>
                          {statusLabels[status] || status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ATS Result Full View */}
      {viewATSResult && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewATSResult(null)}>
          <div className="bg-card rounded-xl border border-border max-w-3xl w-full max-h-[92vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">ATS Analysis Results</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{job.job_title} at {job.company_name}</p>
              </div>
              <button onClick={() => setViewATSResult(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">✕</button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <ATSResultsView result={viewATSResult} />
            </div>
            <div className="px-6 py-3 border-t border-border flex items-center justify-end shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewATSResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminJobDetailModal;
