import { FileText, Users, TrendingUp, HardDrive, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CVStats {
  totalCVs: number;
  totalUpdatedCVs: number;
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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[
        { icon: FileText, bg: "bg-primary/10", color: "text-primary", label: "Original CVs", value: stats.totalCVs },
        { icon: Sparkles, bg: "bg-teal-50", color: "text-teal-600", label: "AI Rewritten", value: stats.totalUpdatedCVs },
        { icon: Users, bg: "bg-emerald-50", color: "text-emerald-600", label: "Candidates", value: stats.candidatesWithCVs },
        { icon: TrendingUp, bg: "bg-blue-50", color: "text-blue-600", label: "This Week", value: stats.uploadedThisWeek },
      ].map((card) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-xl p-4 shadow-xs hover:shadow-card transition-shadow"
        >
          <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground font-display mt-3">{card.value}</p>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">{card.label}</p>
        </div>
      ))}

      {/* Storage card */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs hover:shadow-card transition-shadow">
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-lg font-bold text-foreground font-display mt-3">{stats.storageMB} MB</p>
        <Progress value={stats.storagePercent} className="h-1.5 mt-2 bg-muted" />
        <p className="text-[11px] text-muted-foreground mt-1">{stats.storagePercent}% of {stats.storageGB} GB</p>
      </div>
    </div>
  );
};

export default CVStatsCards;
