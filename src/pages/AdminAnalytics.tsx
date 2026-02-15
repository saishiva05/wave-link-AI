import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { useAdminStats } from "@/hooks/useAdminData";

const AdminAnalytics = () => {
  const { data: stats, isLoading } = useAdminStats();

  const quickStats = [
    { label: "Total Jobs Scraped", value: isLoading ? "..." : (stats?.totalJobs ?? 0).toLocaleString(), color: "bg-primary-50 text-primary" },
    { label: "Total Recruiters", value: isLoading ? "..." : String(stats?.totalRecruiters ?? 0), color: "bg-secondary-50 text-secondary" },
    { label: "Total Candidates", value: isLoading ? "..." : String(stats?.totalCandidates ?? 0), color: "bg-info-50 text-info-500" },
    { label: "Total Applications", value: isLoading ? "..." : String(stats?.totalApplications ?? 0), color: "bg-warning-50 text-warning-500" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Analytics</h1>
          </div>
          <p className="text-base text-muted-foreground ml-[52px]">Comprehensive platform analytics and insights</p>
        </div>
      </motion.div>

      {/* Quick Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color.split(" ")[0]}`}>
              <TrendingUp className={`w-5 h-5 ${s.color.split(" ")[1]}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <DashboardCharts />
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
