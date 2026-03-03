import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, User, Briefcase, Activity, UserPlus, Calendar, GraduationCap, Plus, ShieldPlus, Eye, MapPin, Building2, Clock } from "lucide-react";
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
import { useAdminStats, useAdminRecruiters } from "@/hooks/useAdminData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();
  const { data: recruitersData } = useAdminRecruiters(1, 100);

  // Fetch admin job postings
  const { data: adminJobs = [] } = useQuery({
    queryKey: ["admin", "admin-job-postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, company_name, location, contract_type, work_type, salary_range, job_apply_url, scraped_at, is_active")
        .eq("is_admin_posting", true)
        .order("scraped_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
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
          trend="All time"
          trendUp
          icon={Activity}
          iconBg="bg-warning-50"
          iconColor="text-warning-500"
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
              <div key={job.job_id} className="bg-card border border-border rounded-xl p-5 hover:shadow-card transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{job.job_title}</h3>
                  <Badge variant={job.is_active ? "default" : "secondary"} className="text-[10px] shrink-0 ml-2">
                    {job.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {job.company_name}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {job.location}</p>
                  {job.contract_type && <p className="flex items-center gap-1.5">📋 {job.contract_type} {job.work_type ? `• ${job.work_type}` : ""}</p>}
                  {job.salary_range && <p className="flex items-center gap-1.5">💰 {job.salary_range}</p>}
                  <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(job.scraped_at), { addSuffix: true })}</p>
                </div>
                {job.job_apply_url && job.job_apply_url !== "#" && (
                  <Button variant="outline" size="sm" className="mt-3 w-full text-xs" onClick={() => window.open(job.job_apply_url, "_blank")}>
                    <Eye className="w-3 h-3" /> View Listing
                  </Button>
                )}
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
    </div>
  );
};

export default AdminDashboard;
