import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ExternalLink, CheckCircle2, Loader2, Building, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const CandidateJobPostingsPage = () => {
  const { candidateId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isApplyingJobId, setIsApplyingJobId] = useState<string | null>(null);

  const { data: adminJobs = [], isLoading } = useQuery({
    queryKey: ["candidate", "admin-job-postings", "page"],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, company_name, location, contract_type, work_type, job_description, job_apply_url, scraped_at")
        .eq("is_admin_posting", true)
        .eq("is_active", true)
        .order("scraped_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: candidateContext } = useQuery({
    queryKey: ["candidate", "job-postings-context", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: candidateRow, error: candidateError } = await supabase
        .from("candidates")
        .select("candidate_id, assigned_recruiter_id")
        .eq("user_id", user!.id)
        .single();
      if (candidateError) throw candidateError;

      const { data: cvs } = await supabase
        .from("cvs")
        .select("cv_id, is_primary")
        .eq("candidate_id", candidateRow.candidate_id)
        .order("uploaded_at", { ascending: false });

      const primaryCv = (cvs || []).find((cv) => cv.is_primary) || (cvs || [])[0] || null;

      return {
        candidate_id: candidateRow.candidate_id,
        assigned_recruiter_id: candidateRow.assigned_recruiter_id,
        primary_cv_id: primaryCv?.cv_id || null,
      };
    },
  });

  const jobIds = useMemo(() => adminJobs.map((j) => j.job_id), [adminJobs]);

  const { data: applications = [] } = useQuery({
    queryKey: ["candidate", "admin-job-applications", candidateId, jobIds],
    enabled: !!candidateId && jobIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("application_id, job_id, apply_started_at, apply_completed_at, application_status")
        .eq("candidate_id", candidateId!)
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const applicationsByJob = useMemo(
    () => Object.fromEntries(applications.map((a) => [a.job_id, a])),
    [applications]
  );

  const applyMutation = useMutation({
    mutationFn: async (job: (typeof adminJobs)[number]) => {
      if (!candidateContext?.candidate_id || !candidateContext?.assigned_recruiter_id) {
        throw new Error("Missing candidate assignment details.");
      }
      if (!candidateContext?.primary_cv_id) {
        throw new Error("Please upload a CV before applying.");
      }

      const { error } = await supabase.from("job_applications").insert({
        job_id: job.job_id,
        candidate_id: candidateContext.candidate_id,
        recruiter_id: candidateContext.assigned_recruiter_id,
        cv_id: candidateContext.primary_cv_id,
        application_status: "pending",
        apply_started_at: new Date().toISOString(),
      });

      if (error) throw error;
      window.open(job.job_apply_url, "_blank", "noopener,noreferrer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", "admin-job-applications"] });
      toast({ title: "Application started", description: "Now click Mark Completed after finishing external apply." });
    },
    onError: (err: any) => {
      toast({ title: "Could not apply", description: err.message, variant: "destructive" });
    },
    onSettled: () => setIsApplyingJobId(null),
  });

  const completeMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("job_applications")
        .update({
          apply_completed_at: new Date().toISOString(),
          application_status: "submitted",
        })
        .eq("application_id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", "admin-job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", "applications"] });
      toast({ title: "Marked as completed" });
    },
    onError: (err: any) => {
      toast({ title: "Could not update", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-4xl font-bold text-foreground font-display">Admin Job Postings</h1>
        <p className="text-muted-foreground mt-1">Apply to platform-wide jobs posted manually by admins.</p>
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
            const app = applicationsByJob[job.job_id];
            const isCompleted = !!app?.apply_completed_at;
            const isInProgress = !!app && !app.apply_completed_at;
            return (
              <div key={job.job_id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{job.job_title}</h3>
                    <p className="text-sm text-primary flex items-center gap-1 mt-1"><Building className="w-3.5 h-3.5" /> {job.company_name}</p>
                    <div className="text-xs text-muted-foreground mt-2 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                      <span>{formatDistanceToNow(new Date(job.scraped_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-500 bg-success-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{job.job_description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {!app && (
                    <Button
                      variant="portal"
                      onClick={() => {
                        setIsApplyingJobId(job.job_id);
                        applyMutation.mutate(job);
                      }}
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending && isApplyingJobId === job.job_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                      Apply
                    </Button>
                  )}

                  {isInProgress && (
                    <Button
                      variant="outline"
                      onClick={() => completeMutation.mutate(app.application_id)}
                      disabled={completeMutation.isPending}
                    >
                      {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Mark Completed
                    </Button>
                  )}

                  <Button variant="outline" onClick={() => window.open(job.job_apply_url, "_blank", "noopener,noreferrer")}>
                    <ExternalLink className="w-4 h-4" /> Open Job
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateJobPostingsPage;
