import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, User, Briefcase, Activity, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/admin/StatsCard";
import DashboardCharts from "@/components/admin/DashboardCharts";
import RecruitersTable from "@/components/admin/RecruitersTable";
import CreateRecruiterModal from "@/components/admin/CreateRecruiterModal";

const AdminDashboard = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();

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
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">
            Dashboard Overview
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Platform analytics and recruiter activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-neutral-600">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
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
          value="24"
          trend="+4 this month"
          trendUp
          icon={Users}
          iconBg="bg-primary-50"
          iconColor="text-primary"
          footerLink="View all recruiters"
          onFooterClick={() => navigate("/admin/recruiters")}
        />
        <StatsCard
          title="Active Candidates"
          value="187"
          trend="+23 this week"
          trendUp
          icon={User}
          iconBg="bg-success-50"
          iconColor="text-success-500"
          footerLink="View details"
        />
        <StatsCard
          title="Jobs Scraped (Total)"
          value="1,284"
          trend="+156 today"
          trendUp
          icon={Briefcase}
          iconBg="bg-info-50"
          iconColor="text-info-500"
          footerLink="View analytics"
          onFooterClick={() => navigate("/admin/analytics")}
        />
        <StatsCard
          title="Platform Activity"
          value="94%"
          trend="+5% vs last week"
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

      {/* Recent Recruiters Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary-900 font-display">
            Recently Added Recruiters
          </h2>
          <Button variant="portal" onClick={() => setCreateModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Create New Recruiter
          </Button>
        </div>
        <RecruitersTable onCreateNew={() => setCreateModalOpen(true)} />
      </motion.div>

      {/* Create Recruiter Modal */}
      <CreateRecruiterModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
};

export default AdminDashboard;
