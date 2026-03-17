import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase, CheckCircle2, Loader2, Building, MapPin, Users, Eye,
  ExternalLink, Send, Sparkles, FilePen, Mail, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useRecruiterCandidates, useRecruiterCVs, useJobATSAnalyses, useJobUpdatedCVs, useJobGeneratedEmails } from "@/hooks/useRecruiterData";
import ApplyToJobModal from "@/components/recruiter/ApplyToJobModal";
import JobDetailsModal from "@/components/recruiter/JobDetailsModal";
import ATSMatcherModal from "@/components/recruiter/ATSMatcherModal";
import UpdateCVModal from "@/components/recruiter/UpdateCVModal";
import GenerateEmailModal from "@/components/recruiter/GenerateEmailModal";
import UpdatedCVsBadge from "@/components/recruiter/UpdatedCVsBadge";
import ATSResultsView, { type ATSAnalysisResult } from "@/components/recruiter/ATSResultsView";
import type { ScrapedJob } from "@/data/mockScrapedJobs";
import { mapDbJob } from "@/data/mockScrapedJobs";

const RecruiterJobPostingsPage = () => {
  const { recruiterId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: candidatesData = [] } = useRecruiterCandidates();
  const { data: cvsData = [] } = useRecruiterCVs();

  const [applyJob, setApplyJob] = useState<ScrapedJob | null>(null);
  const [detailsJob, setDetailsJob] = useState<ScrapedJob | null>(null);
  const [atsJob, setAtsJob] = useState<ScrapedJob | null>(null);
  const [updateCVJob, setUpdateCVJob] = useState<ScrapedJob | null>(null);
  const [emailJob, setEmailJob] = useState<ScrapedJob | null>(null);
  const [viewATSResult, setViewATSResult] = useState<{ result: ATSAnalysisResult; job: ScrapedJob } | null>(null);

  const { data: adminJobs = [], isLoading } = useQuery({
    queryKey: ["recruiter", "admin-job-postings", "page"],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("*")
        .eq("is_admin_posting", true)
        .eq("is_active", true)
        .order("scraped_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDbJob);
    },
  });

  const jobIds = useMemo(() => adminJobs.map((j) => j.id), [adminJobs]);

  const { data: applicationsByJob = {} } = useQuery({
    queryKey: ["recruiter", "admin-job-applications", recruiterId, jobIds],
    enabled: !!recruiterId && jobIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          application_id, job_id, candidate_id, apply_completed_at, application_status,
          candidates!job_applications_candidate_id_fkey (
            users!candidates_user_id_fkey (full_name)
          )
        `)
        .eq("recruiter_id", recruiterId!)
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      const grouped: Record<string, any[]> = {};
      (data || []).forEach((row: any) => {
        if (!grouped[row.job_id]) grouped[row.job_id] = [];
        grouped[row.job_id].push({
          ...row,
          candidate_name: row.candidates?.users?.full_name || "Unknown",
        });
      });
      return grouped;
    },
  });

  // Reuse shared hooks for ATS, updated CVs, generated emails
  const { data: atsAnalyses = {} } = useJobATSAnalyses(jobIds);
  const { data: updatedCVsMap = {} } = useJobUpdatedCVs(jobIds);
  const { data: generatedEmailsMap = {} } = useJobGeneratedEmails(jobIds);

  const { data: applyJobUpdatedCVs = [] } = useQuery({
    queryKey: ["recruiter", "admin-job-apply-updated-cvs", applyJob?.id],
    enabled: !!recruiterId && !!applyJob,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("updated_cvs")
        .select("*")
        .eq("recruiter_id", recruiterId!)
        .eq("job_id", applyJob!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: applyJobAts = [] } = useQuery({
    queryKey: ["recruiter", "admin-job-apply-ats", applyJob?.id],
    enabled: !!recruiterId && !!applyJob,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ats_analyses")
        .select("analysis_id, cv_id, ats_score")
        .eq("recruiter_id", recruiterId!)
        .eq("job_id", applyJob!.id)
        .order("analyzed_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ apply_completed_at: new Date().toISOString(), application_status: "submitted" })
        .eq("application_id", applicationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter", "admin-job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "applications"] });
      toast({ title: "Application marked completed" });
    },
    onError: (err: any) => {
      toast({ title: "Could not update", description: err.message, variant: "destructive" });
    },
  });

  const handleViewATSResult = (job: ScrapedJob) => {
    const analyses = atsAnalyses[job.id];
    if (analyses && analyses.length > 0) {
      let result = analyses[0].analysis_result;
      if (Array.isArray(result) && result[0]?.text) {
        result = result[0].text;
      }
      setViewATSResult({ result: result as ATSAnalysisResult, job });
    }
  };

  return (
    <>
      <ApplyToJobModal
        job={applyJob}
        candidates={candidatesData}
        cvs={cvsData}
        updatedCVs={applyJobUpdatedCVs}
        atsAnalyses={applyJobAts}
        onClose={() => setApplyJob(null)}
      />
      <JobDetailsModal
        job={detailsJob}
        onClose={() => setDetailsJob(null)}
        onRunATS={(j) => { setDetailsJob(null); setAtsJob(j); }}
      />
      <ATSMatcherModal job={atsJob} candidates={candidatesData} cvs={cvsData} onClose={() => setAtsJob(null)} />
      <UpdateCVModal job={updateCVJob} candidates={candidatesData} cvs={cvsData} onClose={() => setUpdateCVJob(null)} />
      <GenerateEmailModal job={emailJob} onClose={() => setEmailJob(null)} />

      {viewATSResult && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewATSResult(null)}>
          <div className="bg-card rounded-xl border border-border max-w-3xl w-full max-h-[92vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">ATS Analysis Results</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{viewATSResult.job.job_title} at {viewATSResult.job.company_name}</p>
              </div>
              <button onClick={() => setViewATSResult(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <ATSResultsView result={viewATSResult.result} />
            </div>
            <div className="px-6 py-3 border-t border-border flex items-center justify-end shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewATSResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground font-display">Admin Job Postings</h1>
          <p className="text-muted-foreground mt-1">Platform-wide jobs from admins — run ATS, update CVs, and apply for your candidates.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-card border border-border rounded-xl">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : adminJobs.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">No admin job postings available yet.</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {adminJobs.map((job) => {
              const apps = applicationsByJob[job.id] || [];
              const firstOpenApplication = apps.find((a: any) => !a.apply_completed_at);
              const jobAts = atsAnalyses[job.id] || [];
              const hasATS = jobAts.length > 0;
              const bestScore = hasATS ? Math.max(...jobAts.map((a: any) => a.ats_score)) : null;
              const jobUpdatedCVs = updatedCVsMap[job.id] || [];

              return (
                <div key={job.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{job.job_title}</h3>
                      <p className="text-sm text-primary flex items-center gap-1 mt-1"><Building className="w-3.5 h-3.5" /> {job.company_name}</p>
                      <div className="text-xs text-muted-foreground mt-2 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span>{formatDistanceToNow(new Date(job.scraped_at || new Date().toISOString()), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasATS && (
                        <button
                          onClick={() => handleViewATSResult(job)}
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            bestScore! >= 75 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : bestScore! >= 50 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          ATS: {bestScore}%
                        </button>
                      )}
                      {jobUpdatedCVs.length > 0 && (
                        <UpdatedCVsBadge updatedCVs={jobUpdatedCVs} compact />
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                        <Users className="w-3.5 h-3.5" /> {apps.length}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{job.job_description}</p>

                  {apps.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                      {apps.slice(0, 3).map((app: any) => (
                        <div key={app.application_id} className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                          <span className="truncate">{app.candidate_name}</span>
                          <span className={app.apply_completed_at ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                            {app.apply_completed_at ? "Completed" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {hasATS ? (
                      <Button variant="outline" size="sm" onClick={() => handleViewATSResult(job)}>
                        <Eye className="w-4 h-4" /> View ATS
                      </Button>
                    ) : (
                      <Button variant="portal" size="sm" onClick={() => setAtsJob(job)}>
                        <Sparkles className="w-4 h-4" /> Run ATS
                      </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={() => setUpdateCVJob(job)}>
                      <FilePen className="w-4 h-4" /> Update CV
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setEmailJob(job)}>
                      <Mail className="w-4 h-4" /> Generate Email
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setDetailsJob(job)}>
                      <Eye className="w-4 h-4" /> Details
                    </Button>

                    <Button variant="portal" size="sm" onClick={() => {
                      let url = job.job_apply_url;
                      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
                      window.open(url, "_blank");
                    }}>
                      <ExternalLink className="w-4 h-4" /> Apply
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setApplyJob(job)}>
                      <Send className="w-4 h-4" /> Submit
                    </Button>

                    {firstOpenApplication && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markCompletedMutation.mutate(firstOpenApplication.application_id)}
                        disabled={markCompletedMutation.isPending}
                      >
                        {markCompletedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default RecruiterJobPostingsPage;
