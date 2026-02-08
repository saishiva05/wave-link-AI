import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, FileText, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import type { CandidateApplication } from "@/hooks/useCandidateDashboard";
import CandidateStatsCards from "@/components/candidate/CandidateStatsCards";
import ApplicationStatusChart from "@/components/candidate/ApplicationStatusChart";
import RecentApplicationsList from "@/components/candidate/RecentApplicationsList";
import RecruiterInfoCard from "@/components/candidate/RecruiterInfoCard";
import ApplicationDetailsModal from "@/components/candidate/ApplicationDetailsModal";
import WavePattern from "@/components/WavePattern";

const CandidateDashboardPage = () => {
  const navigate = useNavigate();
  const { fullName } = useAuth();
  const { recentApplications, recruiter, stats, chartData, isLoading } = useCandidateDashboard();
  const [detailApp, setDetailApp] = useState<CandidateApplication | null>(null);
  const firstName = fullName?.split(" ")[0] || "there";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <ApplicationDetailsModal application={detailApp} onClose={() => setDetailApp(null)} />
      <div className="space-y-8 max-w-[1400px] mx-auto">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-br from-primary to-primary-600 rounded-2xl p-8 md:p-10 overflow-hidden">
          <div className="absolute inset-0 opacity-10"><WavePattern /></div>
          <div className="relative z-10">
            <Sparkles className="w-8 h-8 text-white mb-4" />
            <h1 className="text-2xl md:text-4xl font-bold text-white font-display">Welcome, {firstName}!</h1>
            <p className="text-base md:text-lg text-white/90 mt-2 max-w-2xl leading-relaxed">
              Your recruiter {recruiter.name} is actively working on your job search. Here's what's happening with your applications.
            </p>
            <div className="flex flex-wrap gap-6 mt-6 text-sm text-white font-medium">
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {stats.total} Applications</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {stats.pending} Pending</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {stats.interviews} Interviews</span>
            </div>
            {recruiter.email && (
              <Button className="mt-6 bg-white text-primary-700 hover:bg-white/90 font-semibold" onClick={() => window.open(`mailto:${recruiter.email}`)}>
                <Mail className="w-4 h-4" /> Contact {recruiter.name.split(" ")[0]}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <h3 className="text-xl font-semibold text-secondary-900 font-display mb-5">Application Status Overview</h3>
          <CandidateStatsCards stats={stats} onFilter={(status) => navigate(`/candidate/applications?status=${status}`)} />
        </motion.div>

        {/* Chart */}
        {stats.total > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <ApplicationStatusChart data={chartData} total={stats.total} />
          </motion.div>
        )}

        {/* Recent Applications */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <RecentApplicationsList applications={recentApplications} onViewDetails={setDetailApp} onViewAll={() => navigate("/candidate/applications")} />
        </motion.div>

        {/* Recruiter Info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <RecruiterInfoCard recruiter={recruiter} />
        </motion.div>
      </div>
    </>
  );
};

export default CandidateDashboardPage;
