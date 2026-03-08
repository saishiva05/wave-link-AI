import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, FileText, Clock, CheckCircle, Loader2, MessageSquare, Briefcase, XCircle, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import type { CandidateApplication } from "@/hooks/useCandidateDashboard";
import CandidateStatsCards from "@/components/candidate/CandidateStatsCards";
import ApplicationStatusChart from "@/components/candidate/ApplicationStatusChart";
import RecentApplicationsList from "@/components/candidate/RecentApplicationsList";
import RecruiterInfoCard from "@/components/candidate/RecruiterInfoCard";
import ApplicationDetailsModal from "@/components/candidate/ApplicationDetailsModal";
import AdminJobPostingsSection from "@/components/candidate/AdminJobPostingsSection";
import WavePattern from "@/components/WavePattern";

const CandidateDashboardPage = () => {
  const navigate = useNavigate();
  const { fullName } = useAuth();
  const { recentApplications, recruiter, stats, chartData, isLoading, cvs, adminJobPostings } = useCandidateDashboard();
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
      <div className="space-y-5 md:space-y-8 max-w-[1400px] mx-auto">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-br from-primary to-primary-600 rounded-xl md:rounded-2xl p-5 md:p-10 overflow-hidden">
          <div className="absolute inset-0 opacity-10"><WavePattern /></div>
          <div className="relative z-10">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white mb-3 md:mb-4" />
            <h1 className="text-xl md:text-4xl font-bold text-white font-display">Welcome back, {firstName}!</h1>
            <p className="text-sm md:text-lg text-white/90 mt-1.5 md:mt-2 max-w-2xl leading-relaxed">
              Your recruiter <strong>{recruiter.name}</strong> at {recruiter.company} is actively working on your job search.
            </p>
            <div className="grid grid-cols-3 md:flex md:flex-wrap gap-3 md:gap-6 mt-4 md:mt-6 text-xs md:text-sm text-white font-medium">
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 shrink-0" /> {stats.total} Apps</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 shrink-0" /> {stats.pending} Pending</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 shrink-0" /> {stats.interviews} Interviews</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> {stats.offers} Offers</span>
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 shrink-0" /> {cvs.length} CVs</span>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-6">
              <Button size="sm" className="bg-white text-primary-700 hover:bg-white/90 font-semibold text-xs md:text-sm h-8 md:h-10" onClick={() => navigate("/candidate/messages")}>
                <MessageSquare className="w-3.5 h-3.5" /> Message {recruiter.name.split(" ")[0]}
              </Button>
              {recruiter.email && (
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 font-semibold text-xs md:text-sm h-8 md:h-10" onClick={() => window.open(`mailto:${recruiter.email}`)}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - all stages */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
           <h3 className="text-lg md:text-xl font-semibold text-secondary-900 font-display mb-4 md:mb-5">Application Status Overview</h3>
          <CandidateStatsCards stats={stats} onFilter={(status) => navigate(`/candidate/applications${status ? `?status=${status}` : ""}`)} />
        </motion.div>

        {/* Application Pipeline */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <h3 className="text-lg font-semibold text-secondary-900 font-display mb-5">Application Pipeline</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {[
                { label: "Pending", color: "bg-warning-500", count: stats.pending },
                { label: "In Review", color: "bg-info-500", count: stats.inReview },
                { label: "Interview", color: "bg-primary", count: stats.interviews },
                { label: "Offers", color: "bg-success-500", count: stats.offers },
                { label: "Rejected", color: "bg-error-500", count: stats.rejected },
              ].map((stage, i, arr) => (
                <div key={stage.label} className="flex items-center flex-1 min-w-[120px]">
                  <div className="flex-1 text-center">
                    <div className={`${stage.color} text-white rounded-lg py-3 px-4 mx-1`}>
                      <p className="text-2xl font-bold">{stage.count}</p>
                      <p className="text-xs font-medium mt-0.5 opacity-90">{stage.label}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <svg className="w-6 h-6 text-neutral-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
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

        {/* Admin Job Postings */}
        {adminJobPostings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.18 }}>
            <AdminJobPostingsSection jobs={adminJobPostings} />
          </motion.div>
        )}

        {/* Recruiter Info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <RecruiterInfoCard recruiter={recruiter} />
        </motion.div>
      </div>
    </>
  );
};

export default CandidateDashboardPage;
