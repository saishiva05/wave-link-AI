import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, ExternalLink, CheckCircle2, Loader2, Building, MapPin,
  X, Monitor, Award, Calendar, Eye, Search, FileText,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const ensureUrl = (url: string) => /^https?:\/\//i.test(url) ? url : `https://${url}`;

const CandidateJobPostingsPage = () => {
  const { candidateId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isApplyingJobId, setIsApplyingJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const { data: adminJobs = [], isLoading } = useQuery({
    queryKey: ["candidate", "admin-job-postings", "page"],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, company_name, location, contract_type, work_type, experience_level, salary_range, job_description, job_apply_url, scraped_at")
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

  const filteredJobs = useMemo(() => {
    if (!search) return adminJobs;
    const q = search.toLowerCase();
    return adminJobs.filter((j) =>
      j.job_title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)
    );
  }, [adminJobs, search]);

  const applyMutation = useMutation({
    mutationFn: async (job: (typeof adminJobs)[number]) => {
      if (!candidateContext?.candidate_id || !candidateContext?.assigned_recruiter_id) throw new Error("Missing candidate assignment details.");
      if (!candidateContext?.primary_cv_id) throw new Error("Please upload a CV before applying.");
      const { error } = await supabase.from("job_applications").insert({
        job_id: job.job_id, candidate_id: candidateContext.candidate_id,
        recruiter_id: candidateContext.assigned_recruiter_id, cv_id: candidateContext.primary_cv_id,
        application_status: "pending", apply_started_at: new Date().toISOString(),
      });
      if (error) throw error;
      window.open(ensureUrl(job.job_apply_url), "_blank", "noopener,noreferrer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", "admin-job-applications"] });
      toast({ title: "Application started", description: "Click Mark Completed after finishing external apply." });
    },
    onError: (err: any) => toast({ title: "Could not apply", description: err.message, variant: "destructive" }),
    onSettled: () => setIsApplyingJobId(null),
  });

  const completeMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase.from("job_applications")
        .update({ apply_completed_at: new Date().toISOString(), application_status: "submitted" })
        .eq("application_id", applicationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", "admin-job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", "applications"] });
      toast({ title: "Marked as completed" });
    },
    onError: (err: any) => toast({ title: "Could not update", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-4xl font-bold text-foreground font-display">Job Postings</h1>
        <p className="text-muted-foreground mt-1">Browse and apply to platform-wide job opportunities.</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..."
            className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground font-display">{adminJobs.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Available Jobs</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary font-display">{applications.filter(a => !a.apply_completed_at).length}</p>
          <p className="text-xs text-muted-foreground mt-1">In Progress</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success-600 font-display">{applications.filter(a => !!a.apply_completed_at).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground font-display">{adminJobs.length - applications.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Not Applied</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-card border border-border rounded-xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
          {search ? "No jobs match your search." : "No job postings available yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const app = applicationsByJob[job.job_id];
            const isCompleted = !!app?.apply_completed_at;
            const isInProgress = !!app && !app.apply_completed_at;
            return (
              <motion.div key={job.job_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-5 space-y-3 hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setSelectedJob(job)}>
                      {job.job_title}
                    </h3>
                    <p className="text-sm text-primary flex items-center gap-1 mt-1"><Building className="w-3.5 h-3.5" /> {job.company_name}</p>
                    <div className="text-xs text-muted-foreground mt-2 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                      {job.contract_type && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.contract_type}</span>}
                      {job.work_type && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {job.work_type}</span>}
                      {job.salary_range && <span className="flex items-center gap-1 text-success-600 font-semibold">💰 {job.salary_range}</span>}
                      <span>{formatDistanceToNow(new Date(job.scraped_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-600 bg-success-50 dark:bg-emerald-950 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-success-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                  {isInProgress && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary-50 dark:bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> In Progress
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{job.job_description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setSelectedJob(job)}>
                    <Eye className="w-4 h-4" /> View Details
                  </Button>
                  {!app && (
                    <Button size="sm" onClick={() => { setIsApplyingJobId(job.job_id); applyMutation.mutate(job); }}
                      disabled={applyMutation.isPending}>
                      {applyMutation.isPending && isApplyingJobId === job.job_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                      Apply
                    </Button>
                  )}
                  {isInProgress && (
                    <Button size="sm" variant="outline" onClick={() => completeMutation.mutate(app.application_id)}
                      disabled={completeMutation.isPending}>
                      {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Mark Completed
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => window.open(ensureUrl(job.job_apply_url), "_blank", "noopener,noreferrer")}>
                    <ExternalLink className="w-4 h-4" /> Open Job
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-card rounded-2xl shadow-2xl max-w-[800px] w-full animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8 border-b border-border relative">
              <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-foreground font-display pr-12">{selectedJob.job_title}</h2>
              <p className="text-base font-medium text-primary flex items-center gap-1.5 mt-2"><Building className="w-4 h-4" /> {selectedJob.company_name}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedJob.location}</span>
                {selectedJob.contract_type && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {selectedJob.contract_type}</span>}
                {selectedJob.work_type && <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4" /> {selectedJob.work_type}</span>}
                {selectedJob.experience_level && <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> {selectedJob.experience_level}</span>}
                {selectedJob.salary_range && <span className="flex items-center gap-1.5 text-success-600 font-semibold">💰 {selectedJob.salary_range}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Posted {formatDistanceToNow(new Date(selectedJob.scraped_at), { addSuffix: true })}</span>
              </div>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <h3 className="text-lg font-semibold text-foreground font-display mb-3">Job Description</h3>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedJob.job_description}</div>
            </div>
            <div className="p-4 md:px-8 border-t border-border flex flex-wrap items-center gap-3">
              {(() => {
                const app = applicationsByJob[selectedJob.job_id];
                const isCompleted = !!app?.apply_completed_at;
                const isInProgress = !!app && !app.apply_completed_at;
                return (
                  <>
                    {!app && (
                      <Button onClick={() => { setIsApplyingJobId(selectedJob.job_id); applyMutation.mutate(selectedJob); }}
                        disabled={applyMutation.isPending}>
                        {applyMutation.isPending && isApplyingJobId === selectedJob.job_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                        Apply Now
                      </Button>
                    )}
                    {isInProgress && (
                      <Button variant="outline" onClick={() => completeMutation.mutate(app.application_id)} disabled={completeMutation.isPending}>
                        {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Mark Completed
                      </Button>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-600"><CheckCircle2 className="w-4 h-4" /> Application Completed</span>
                    )}
                    <Button variant="outline" onClick={() => window.open(selectedJob.job_apply_url, "_blank", "noopener,noreferrer")}>
                      <ExternalLink className="w-4 h-4" /> View Original Posting
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedJob(null)} className="ml-auto">Close</Button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobPostingsPage;
