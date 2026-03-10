import { motion } from "framer-motion";
import WelcomeBanner from "@/components/recruiter/WelcomeBanner";
import RecruiterStatsCards from "@/components/recruiter/RecruiterStatsCards";
import PlatformBreakdown from "@/components/recruiter/PlatformBreakdown";
import RecruiterCharts from "@/components/recruiter/RecruiterCharts";
import ActivityFeed from "@/components/recruiter/ActivityFeed";
import RecruiterAdminJobPostingsSection from "@/components/recruiter/AdminJobPostingsSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  initial: { opacity: 0, y: 6 },
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
    <div className="space-y-7">
      <motion.div {...fadeUp} transition={{ duration: 0.25 }}>
        <WelcomeBanner />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.05 }}>
        <RecruiterStatsCards />
      </motion.div>

      {adminJobs.length > 0 && (
        <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.08 }}>
          <RecruiterAdminJobPostingsSection jobs={adminJobs} />
        </motion.div>
      )}

      <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.1 }}>
        <RecruiterCharts />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.13 }}>
        <PlatformBreakdown />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.16 }}>
        <ActivityFeed />
      </motion.div>
    </div>
  );
};

export default RecruiterDashboard;
