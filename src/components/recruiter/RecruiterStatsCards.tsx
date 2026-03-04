import { useNavigate } from "react-router-dom";
import { Briefcase, Users, ClipboardCheck, Sparkles } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import { Progress } from "@/components/ui/progress";
import { useRecruiterStats } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";

const RecruiterStatsCards = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useRecruiterStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatsCard
        title="Jobs Found"
        value={(stats?.totalJobs ?? 0).toLocaleString()}
        trend="Total collected"
        trendUp
        icon={Briefcase}
        iconBg="bg-primary-50"
        iconColor="text-primary"
        footerLink="View all jobs"
        onFooterClick={() => navigate("/recruiter/scraped-jobs")}
      />
      <StatsCard
        title="Active Candidates"
        value={String(stats?.totalCandidates ?? 0)}
        trend="Assigned to you"
        trendUp
        icon={Users}
        iconBg="bg-success-50"
        iconColor="text-success-500"
        footerLink="Manage candidates"
        onFooterClick={() => navigate("/recruiter/candidates")}
      />
      <StatsCard
        title="Applications Submitted"
        value={String(stats?.totalApplications ?? 0)}
        trend="All time"
        trendUp
        icon={ClipboardCheck}
        iconBg="bg-info-50"
        iconColor="text-info-500"
        footerLink="View applications"
        onFooterClick={() => navigate("/recruiter/applications")}
      />
      <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-warning-50">
            <Sparkles className="w-6 h-6 text-warning-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">ATS Analyses Run</p>
        </div>
        <p className="text-3xl font-bold text-secondary-900 font-display mb-2">{stats?.totalATS ?? 0}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">Success rate</span>
          <span className="text-xs font-semibold text-success-600">{stats?.atsSuccessRate ?? 0}%</span>
        </div>
        <Progress value={stats?.atsSuccessRate ?? 0} className="h-1.5 bg-neutral-200 [&>div]:bg-success-500" />
        <button onClick={() => navigate("/recruiter/scraped-jobs")} className="mt-4 text-sm text-primary hover:underline font-medium">
          Run new analysis →
        </button>
      </div>
    </div>
  );
};

export default RecruiterStatsCards;
