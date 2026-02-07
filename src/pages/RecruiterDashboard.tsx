import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import WelcomeBanner from "@/components/recruiter/WelcomeBanner";
import RecruiterStatsCards from "@/components/recruiter/RecruiterStatsCards";
import PlatformBreakdown from "@/components/recruiter/PlatformBreakdown";
import RecruiterCharts from "@/components/recruiter/RecruiterCharts";
import ActivityFeed from "@/components/recruiter/ActivityFeed";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const RecruiterDashboard = () => {
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
