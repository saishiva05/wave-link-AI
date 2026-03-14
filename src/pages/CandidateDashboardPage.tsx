import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, FileText, Clock, CheckCircle, Loader2, MessageSquare, Briefcase, XCircle, Calendar, Eye, CalendarCheck } from "lucide-react";
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
  const { recentApplications, todayApplications, recruiter, stats, chartData, isLoading, cvs, adminJobPostings } = useCandidateDashboard();
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
           <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-xs">
            <h3 className="text-base md:text-lg font-semibold text-secondary-900 font-display mb-4 md:mb-5">Application Pipeline</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1">
              {[
                { label: "Pending", color: "bg-warning-500", count: stats.pending },
                { label: "In Review", color: "bg-info-500", count: stats.inReview },
                { label: "Interview", color: "bg-primary", count: stats.interviews },
                { label: "Offers", color: "bg-success-500", count: stats.offers },
                { label: "Rejected", color: "bg-error-500", count: stats.rejected },
              ].map((stage, i, arr) => (
                 <div key={stage.label} className="flex items-center flex-1 min-w-[80px] md:min-w-[120px]">
                   <div className="flex-1 text-center">
                    <div className={`${stage.color} text-white rounded-lg py-2 md:py-3 px-2 md:px-4 mx-0.5 md:mx-1`}>
                       <p className="text-lg md:text-2xl font-bold">{stage.count}</p>
                       <p className="text-[10px] md:text-xs font-medium mt-0.5 opacity-90">{stage.label}</p>
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

        {/* Today's Applications */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }}>
          <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground font-display">Today's Applications</h3>
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{todayApplications.length}</span>
              </div>
            </div>
            {todayApplications.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No applications submitted today</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Your recruiter hasn't submitted any applications today yet.</p>
              </div>
            ) : (
              todayApplications.map((app, i) => {
                const statusMap: Record<string, { bg: string; text: string; label: string }> = {
                  pending: { bg: "bg-warning-100", text: "text-warning-700", label: "Pending" },
                  submitted: { bg: "bg-info-100", text: "text-info-700", label: "In Review" },
                  interview_scheduled: { bg: "bg-primary-100", text: "text-primary-700", label: "Interview" },
                  interviewed: { bg: "bg-primary-100", text: "text-primary-700", label: "Interviewed" },
                  offer_received: { bg: "bg-success-100", text: "text-success-700", label: "Offer" },
                  hired: { bg: "bg-success-100", text: "text-success-700", label: "Hired" },
                  rejected: { bg: "bg-error-100", text: "text-error-700", label: "Rejected" },
                  declined: { bg: "bg-muted", text: "text-muted-foreground", label: "Declined" },
                };
                const badge = statusMap[app.application_status] || statusMap.pending;
                return (
                  <div
                    key={app.application_id}
                    onClick={() => setDetailApp(app)}
                    className={cn("flex items-center gap-4 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors", i < todayApplications.length - 1 && "border-b border-border")}
                  >
                    <div className="w-10 h-10 rounded-lg border border-border bg-card flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{app.job_title}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.company_name} · {app.location}</p>
                    </div>
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium shrink-0", badge.bg, badge.text)}>{badge.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

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
