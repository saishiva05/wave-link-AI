import { useNavigate } from "react-router-dom";
import { Briefcase, Users, ClipboardCheck, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { useRecruiterStats } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeUp: boolean;
  icon: React.ElementType;
  onClick?: () => void;
}

const StatCard = ({ title, value, change, changeUp, icon: Icon, onClick }: StatCardProps) => (
  <div
    onClick={onClick}
    className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-all duration-200 group"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
          changeUp
            ? "bg-success-50 text-success-600"
            : "bg-error-50 text-error-600"
        )}
      >
        {changeUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </span>
    </div>
    <p className="text-2xl font-bold text-foreground font-display tracking-tight">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{title}</p>
  </div>
);

const RecruiterStatsCards = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useRecruiterStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    { title: "Jobs Found", value: (stats?.totalJobs ?? 0).toLocaleString(), change: "3.5%", changeUp: true, icon: Briefcase, onClick: () => navigate("/recruiter/scraped-jobs") },
    { title: "Active Candidates", value: String(stats?.totalCandidates ?? 0), change: "0.0%", changeUp: true, icon: Users, onClick: () => navigate("/recruiter/candidates") },
    { title: "Applications", value: String(stats?.totalApplications ?? 0), change: "7.5%", changeUp: false, icon: ClipboardCheck, onClick: () => navigate("/recruiter/applications") },
    { title: "ATS Analyses", value: String(stats?.totalATS ?? 0), change: "3.5%", changeUp: true, icon: Sparkles, onClick: () => navigate("/recruiter/scraped-jobs") },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default RecruiterStatsCards;