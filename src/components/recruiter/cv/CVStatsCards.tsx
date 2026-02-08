import { FileText, Users, TrendingUp, HardDrive, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CVStats {
  totalCVs: number;
  candidatesWithCVs: number;
  uploadedThisWeek: number;
  storageMB: number;
  storageGB: number;
  storagePercent: number;
}

interface CVStatsCardsProps {
  stats: CVStats;
}

const CVStatsCards = ({ stats }: CVStatsCardsProps) => {
  const cards = [
    {
      icon: FileText,
      iconBg: "bg-primary-50",
      iconColor: "text-primary",
      title: "Total CVs",
      value: stats.totalCVs.toString(),
      trend: "+12 this month",
      trendIcon: TrendingUp,
      trendColor: "text-success-500",
    },
    {
      icon: Users,
      iconBg: "bg-success-50",
      iconColor: "text-success-500",
      title: "Candidates with CVs",
      value: stats.candidatesWithCVs.toString(),
      trend: "All candidates covered",
      trendIcon: CheckCircle,
      trendColor: "text-success-500",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-info-50",
      iconColor: "text-info-500",
      title: "Uploaded This Week",
      value: stats.uploadedThisWeek.toString(),
      trend: "+3 from last week",
      trendIcon: TrendingUp,
      trendColor: "text-success-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center`}>
            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
          </div>
          <p className="text-sm font-medium text-neutral-600 mt-4">{card.title}</p>
          <p className="text-3xl font-bold text-secondary-900 font-display mt-2">{card.value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${card.trendColor}`}>
            <card.trendIcon className="w-4 h-4" />
            <span>{card.trend}</span>
          </div>
        </div>
      ))}

      {/* Storage card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200">
        <div className="w-12 h-12 rounded-full bg-warning-50 flex items-center justify-center">
          <HardDrive className="w-6 h-6 text-warning-500" />
        </div>
        <p className="text-sm font-medium text-neutral-600 mt-4">Storage Used</p>
        <p className="text-xl font-semibold text-secondary-900 font-display mt-2">{stats.storageMB} MB</p>
        <p className="text-xs text-neutral-600 mt-2">of {stats.storageGB} GB plan</p>
        <Progress value={stats.storagePercent} className="h-2 mt-2 bg-neutral-200" />
        <p className="text-xs text-neutral-500 mt-1.5">{stats.storagePercent}% used</p>
      </div>
    </div>
  );
};

export default CVStatsCards;
