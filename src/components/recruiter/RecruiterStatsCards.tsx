import { useNavigate } from "react-router-dom";
import { Briefcase, Users, ClipboardCheck, Sparkles, Info, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { useRecruiterStats } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeUp: boolean;
  subtitle: string;
  icon: React.ElementType;
  onClick?: () => void;
}

const StatCard = ({ title, value, change, changeUp, subtitle, icon: Icon, onClick }: StatCardProps) => (
  <div
    onClick={onClick}
    className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-card-hover transition-all duration-200 group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Info className="w-3.5 h-3.5 text-neutral-400" />
      </div>
      <button className="text-neutral-400 hover:text-foreground transition-colors">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
    <p className="text-3xl font-bold text-foreground font-display tracking-tight mb-3">
      {value}
    </p>
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
          changeUp
            ? "bg-success-50 text-success-600"
            : "bg-error-50 text-error-600"
        )}
      >
        {changeUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </div>
  </div>
);

const RecruiterStatsCards = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useRecruiterStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      title: "Jobs Found",
      value: (stats?.totalJobs ?? 0).toLocaleString(),
      change: "3.5%",
      changeUp: true,
      subtitle: "Last month",
      icon: Briefcase,
      onClick: () => navigate("/recruiter/scraped-jobs"),
    },
    {
      title: "Active Candidates",
      value: String(stats?.totalCandidates ?? 0),
      change: "0.0",
      changeUp: true,
      subtitle: "Last month",
      icon: Users,
      onClick: () => navigate("/recruiter/candidates"),
    },
    {
      title: "Applications Submitted",
      value: String(stats?.totalApplications ?? 0),
      change: "7.5%",
      changeUp: false,
      subtitle: "Last month",
      icon: ClipboardCheck,
      onClick: () => navigate("/recruiter/applications"),
    },
    {
      title: "ATS Analyses",
      value: String(stats?.totalATS ?? 0),
      change: "3.5%",
      changeUp: true,
      subtitle: "Last month",
      icon: Sparkles,
      onClick: () => navigate("/recruiter/scraped-jobs"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default RecruiterStatsCards;
