import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, User, Briefcase, Activity, UserPlus, Calendar, GraduationCap, Plus, ShieldPlus, Eye, MapPin, Building2, Clock, ClipboardCheck, TrendingUp, Power, Pencil, Sparkles, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/admin/StatsCard";
import DashboardCharts from "@/components/admin/DashboardCharts";
import RecruitersTable from "@/components/admin/RecruitersTable";
import CreateRecruiterModal from "@/components/admin/CreateRecruiterModal";
import CreateCandidateModal from "@/components/admin/CreateCandidateModal";
import CreateAdminModal from "@/components/admin/CreateAdminModal";
import CreateJobModal from "@/components/recruiter/CreateJobModal";
import RecruiterActivityTracker from "@/components/admin/RecruiterActivityTracker";
import EditJobModal from "@/components/admin/EditJobModal";
import AdminJobDetailModal from "@/components/admin/AdminJobDetailModal";
import { useAdminStats, useAdminRecruiters } from "@/hooks/useAdminData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editJobModalOpen, setEditJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [detailJob, setDetailJob] = useState<any>(null);
  const [detailJobOpen, setDetailJobOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useAdminStats();
  const { data: recruitersData } = useAdminRecruiters(1, 100);

  // Fetch admin job postings
  const { data: adminJobs = [] } = useQuery({
    queryKey: ["admin", "admin-job-postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, company_name, location, contract_type, work_type, salary_range, job_apply_url, scraped_at, is_active, job_description, experience_level")
        .eq("is_admin_posting", true)
        .order("scraped_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent applications for dashboard summary
  const { data: recentApps = [] } = useQuery({
    queryKey: ["admin", "recent-applications-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          application_id, application_status, applied_at, recruiter_id,
          scraped_jobs!job_applications_job_id_fkey(job_title, company_name),
          candidates!job_applications_candidate_id_fkey(users!candidates_user_id_fkey(full_name)),
          recruiters!job_applications_recruiter_id_fkey(users!recruiters_user_id_fkey(full_name))
        `)
        .order("applied_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Application stats for today/this week
  const todayApps = recentApps.filter((a: any) => {
    const d = new Date(a.applied_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const thisWeekApps = recentApps.filter((a: any) => {
    return new Date(a.applied_at) >= subDays(new Date(), 7);
  });

  const recruiterOptions = (recruitersData?.recruiters || []).map((r: any) => ({
    recruiter_id: r.recruiter_id,
    full_name: r.users?.full_name || "Unknown",
  }));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Dashboard Overview
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Platform analytics and recruiter activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        <StatsCard
          title="Total Recruiters"
          value={isLoading ? "..." : String(stats?.totalRecruiters ?? 0)}
          trend={`+${stats?.recruitersThisMonth ?? 0} this month`}
          trendUp={(stats?.recruitersThisMonth ?? 0) >= 0}
          icon={Users}
          iconBg="bg-primary-50"
          iconColor="text-primary"
          footerLink="View all recruiters"
          onFooterClick={() => navigate("/admin/recruiters")}
        />
        <StatsCard
          title="Active Candidates"
          value={isLoading ? "..." : String(stats?.totalCandidates ?? 0)}
          trend={`+${stats?.candidatesThisWeek ?? 0} this week`}
          trendUp={(stats?.candidatesThisWeek ?? 0) >= 0}
          icon={User}
          iconBg="bg-success-50"
          iconColor="text-success-500"
          footerLink="View details"
        />
        <StatsCard
          title="Jobs Scraped (Total)"
          value={isLoading ? "..." : (stats?.totalJobs ?? 0).toLocaleString()}
          trend={`+${stats?.jobsToday ?? 0} today`}
          trendUp={(stats?.jobsToday ?? 0) >= 0}
          icon={Briefcase}
          iconBg="bg-info-50"
          iconColor="text-info-500"
          footerLink="View analytics"
          onFooterClick={() => navigate("/admin/analytics")}
        />
        <StatsCard
          title="Total Applications"
          value={isLoading ? "..." : String(stats?.totalApplications ?? 0)}
          trend={`+${todayApps.length} today`}
          trendUp={todayApps.length > 0}
          icon={ClipboardCheck}
          iconBg="bg-warning-50"
          iconColor="text-warning-500"
          footerLink="View all applications"
          onFooterClick={() => navigate("/admin/applications")}
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <DashboardCharts />
      </motion.div>

      {/* Recent Applications Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.105 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground font-display">Recent Applications</h2>
            <Badge variant="secondary" className="text-xs">{thisWeekApps.length} this week</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/applications")}>
            View All →
          </Button>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {recentApps.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No applications submitted yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentApps.slice(0, 8).map((app: any) => {
                const statusStyle: Record<string, string> = {
                  pending: "bg-warning-50 text-warning-700",
                  submitted: "bg-info-50 text-info-700",
                  rejected: "bg-error-50 text-error-700",
                  interview_scheduled: "bg-primary-50 text-primary",
                  hired: "bg-success-50 text-success-700",
                };
                const statusLabel: Record<string, string> = {
                  pending: "Pending", submitted: "Submitted", rejected: "Rejected",
                  interview_scheduled: "Interview", hired: "Hired", interviewed: "Interviewed",
                  offer_received: "Offer", declined: "Declined",
                };
                return (
                  <div key={app.application_id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{(app.scraped_jobs as any)?.job_title || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(app.scraped_jobs as any)?.company_name} • by {(app.recruiters as any)?.users?.full_name || "Unknown"} → {(app.candidates as any)?.users?.full_name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium", statusStyle[app.application_status] || "bg-muted text-muted-foreground")}>
                        {statusLabel[app.application_status] || app.application_status}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Admin Job Postings Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.11 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground font-display">Admin Job Postings</h2>
            <Badge variant="secondary" className="text-xs">{adminJobs.length} jobs</Badge>
          </div>
          <Button variant="portal" onClick={() => setJobModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </div>

        {adminJobs.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No admin job postings yet. Click "Post New Job" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {adminJobs.map((job: any) => (
              <div key={job.job_id} className="bg-card border border-border rounded-xl p-5 hover:shadow-card transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{job.job_title}</h3>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { error } = await supabase.from("scraped_jobs").update({ is_active: !job.is_active }).eq("job_id", job.job_id);
                      if (!error) {
                        queryClient.invalidateQueries({ queryKey: ["admin", "admin-job-postings"] });
                      }
                    }}
                    className="shrink-0 ml-2"
                  >
                    <Badge
                      variant={job.is_active ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] cursor-pointer hover:opacity-80 transition-opacity",
                        job.is_active ? "bg-success-500 hover:bg-success-600 text-white" : ""
                      )}
                    >
                      {job.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {job.company_name}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {job.location}</p>
                  {job.contract_type && <p className="flex items-center gap-1.5">📋 {job.contract_type} {job.work_type ? `• ${job.work_type}` : ""}</p>}
                  {job.salary_range && <p className="flex items-center gap-1.5">💰 {job.salary_range}</p>}
                  <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(job.scraped_at), { addSuffix: true })}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDetailJob(job);
                      setDetailJobOpen(true);
                    }}
                  >
                    <Eye className="w-3 h-3" /> Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setEditingJob(job);
                      setEditJobModalOpen(true);
                    }}
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  {job.job_apply_url && job.job_apply_url !== "#" && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                      let url = job.job_apply_url;
                      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
                      window.open(url, "_blank");
                    }}>
                      <ExternalLink className="w-3 h-3" /> Listing
                    </Button>
                  )}
                  <Button
                    variant={job.is_active ? "destructive" : "portal"}
                    size="sm"
                    className="text-xs"
                    onClick={async () => {
                      const { error } = await supabase.from("scraped_jobs").update({ is_active: !job.is_active }).eq("job_id", job.job_id);
                      if (!error) {
                        queryClient.invalidateQueries({ queryKey: ["admin", "admin-job-postings"] });
                      }
                    }}
                  >
                    <Power className="w-3 h-3" />
                    {job.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recruiter Activity Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
      >
        <RecruiterActivityTracker />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground font-display">
            Recently Added Recruiters
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setCandidateModalOpen(true)}>
              <GraduationCap className="w-4 h-4" />
              Create Candidate
            </Button>
            <Button variant="outline" onClick={() => setAdminModalOpen(true)}>
              <ShieldPlus className="w-4 h-4" />
              Create Admin
            </Button>
            <Button variant="portal" onClick={() => setCreateModalOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Create Recruiter
            </Button>
          </div>
        </div>
        <RecruitersTable onCreateNew={() => setCreateModalOpen(true)} />
      </motion.div>

      <CreateRecruiterModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <CreateCandidateModal open={candidateModalOpen} onOpenChange={setCandidateModalOpen} />
      <CreateAdminModal open={adminModalOpen} onOpenChange={setAdminModalOpen} />
      <CreateJobModal
        open={jobModalOpen}
        onOpenChange={setJobModalOpen}
        recruiterId=""
        adminMode
      />
      {editingJob && (
        <EditJobModal
          open={editJobModalOpen}
          onOpenChange={(v) => {
            setEditJobModalOpen(v);
            if (!v) setEditingJob(null);
          }}
          job={editingJob}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
