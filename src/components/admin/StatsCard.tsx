import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  footerLink?: string;
  onFooterClick?: () => void;
}

const StatsCard = ({
  title, value, trend, trendUp, icon: Icon, iconBg, iconColor, footerLink, onFooterClick,
}: StatsCardProps) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      {/* Decorative gradient */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity", iconBg)} />
      
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-glow", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted">
          {trendUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-success-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          )}
          <span className={cn("text-xs font-medium", trendUp ? "text-success-600" : "text-destructive")}>{trend}</span>
        </div>
      </div>

      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold text-foreground font-display tracking-tight">{value}</p>

      {footerLink && (
        <button
          onClick={onFooterClick}
          className="mt-4 text-sm text-primary hover:text-primary-600 font-medium flex items-center gap-1 group/link transition-colors"
        >
          {footerLink}
          <span className="transition-transform group-hover/link:translate-x-1">→</span>
        </button>
      )}
    </div>
  );
};

export default StatsCard;
