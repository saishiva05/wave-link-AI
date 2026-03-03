import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import WelcomeBanner from "@/components/recruiter/WelcomeBanner";
import RecruiterStatsCards from "@/components/recruiter/RecruiterStatsCards";
import PlatformBreakdown from "@/components/recruiter/PlatformBreakdown";
import RecruiterCharts from "@/components/recruiter/RecruiterCharts";
import ActivityFeed from "@/components/recruiter/ActivityFeed";
import RecruiterAdminJobPostingsSection from "@/components/recruiter/AdminJobPostingsSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const RecruiterDashboard = () => {
  const { data: adminJobs = [] } = useQuery({
    queryKey: ["recruiter", "admin-job-postings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("scraped_jobs")
        .select("job_id, job_title, company_name, location, contract_type, work_type, salary_range, job_apply_url, scraped_at")
        .eq("is_admin_posting", true)
        .eq("is_active", true)
        .order("scraped_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
        <WelcomeBanner />
      </motion.div>

      {/* Section header + date filter */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <h2 className="text-xl font-bold text-secondary-900 font-display">
          Your Performance Overview
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-neutral-600 w-fit">
          <Calendar className="w-4 h-4" />
          Last 30 Days
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.1 }}>
        <RecruiterStatsCards />
      </motion.div>

      {/* Admin Job Postings */}
      {adminJobs.length > 0 && (
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.12 }}>
          <RecruiterAdminJobPostingsSection jobs={adminJobs} />
        </motion.div>
      )}

      {/* Platform Breakdown */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.15 }}>
        <PlatformBreakdown />
      </motion.div>

      {/* Charts */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.2 }}>
        <RecruiterCharts />
      </motion.div>

      {/* Activity Feed */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.25 }}>
        <ActivityFeed />
      </motion.div>
    </div>
  );
};

export default RecruiterDashboard;
