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
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  iconBg,
  iconColor,
  footerLink,
  onFooterClick,
}: StatsCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>

      <p className="text-3xl font-bold text-secondary-900 font-display mb-2">{value}</p>

      <div className="flex items-center gap-1.5">
        {trendUp ? (
          <TrendingUp className="w-4 h-4 text-success-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-destructive" />
        )}
        <span className={cn("text-sm", trendUp ? "text-success-600" : "text-destructive")}>{trend}</span>
      </div>

      {footerLink && (
        <button
          onClick={onFooterClick}
          className="mt-4 text-sm text-primary hover:underline font-medium"
        >
          {footerLink} →
        </button>
      )}
    </div>
  );
};

export default StatsCard;
