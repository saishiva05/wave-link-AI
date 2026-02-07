import { motion } from "framer-motion";
import DashboardCharts from "@/components/admin/DashboardCharts";

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">
          Analytics
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Comprehensive platform analytics and insights
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <DashboardCharts />
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
