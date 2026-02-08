import { useState } from "react";
import { Download, Sparkles, Send, Upload, Clock, Globe, User, ArrowRight, ChevronDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecruiterActivity } from "@/hooks/useRecruiterData";
import { formatDistanceToNow } from "date-fns";

type ActivityType = "scrape" | "ats" | "application" | "cv";

const activityConfig: Record<ActivityType, { icon: typeof Download; bg: string; color: string }> = {
  scrape: { icon: Download, bg: "bg-primary-100", color: "text-primary" },
  ats: { icon: Sparkles, bg: "bg-warning-50", color: "text-warning-500" },
  application: { icon: Send, bg: "bg-success-50", color: "text-success-500" },
  cv: { icon: Upload, bg: "bg-info-50", color: "text-info-500" },
};

const filters = ["All", "Job Scraping", "Applications", "ATS Analysis"];
const filterMap: Record<string, ActivityType | null> = {
  All: null, "Job Scraping": "scrape", Applications: "application", "ATS Analysis": "ats",
};

const badgeVariants = {
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  info: "bg-info-50 text-info-700",
};

const metaIcons = [Clock, Globe, User];

const ActivityFeed = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(5);
  const { data: allActivities, isLoading } = useRecruiterActivity();

  const activities = allActivities || [];
  const filteredActivities = filterMap[activeFilter]
    ? activities.filter((a: any) => a.type === filterMap[activeFilter])
    : activities;
  const visibleActivities = filteredActivities.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-secondary-900 font-display">Recent Activity</h2>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => { setActiveFilter(f); setVisibleCount(5); }}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeFilter === f ? "bg-primary-100 text-primary-700" : "bg-muted text-muted-foreground hover:text-foreground")}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : visibleActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4"><Activity className="w-6 h-6 text-neutral-500" /></div>
            <h3 className="text-base font-semibold text-neutral-700 mb-1">No recent activity</h3>
            <p className="text-sm text-muted-foreground mb-4">Your recent actions will appear here.</p>
            <Button variant="portal" size="sm">Start Scraping Jobs</Button>
          </div>
        ) : (
          <>
            {visibleActivities.map((item: any, i: number) => {
              const config = activityConfig[item.type as ActivityType];
              const Icon = config?.icon || Activity;
              return (
                <div key={item.id} className={cn("flex gap-4 p-5 hover:bg-muted/50 transition-colors cursor-pointer", i < visibleActivities.length - 1 && "border-b border-border")}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", config?.bg || "bg-muted")}>
                    <Icon className={cn("w-5 h-5", config?.color || "text-neutral-500")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 leading-snug">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {(item.meta || []).map((m: string, j: number) => {
                        const MetaIcon = metaIcons[j % metaIcons.length];
                        return (<span key={j} className="flex items-center gap-1 text-xs text-muted-foreground"><MetaIcon className="w-3 h-3" />{m}</span>);
                      })}
                    </div>
                    {item.badge && (
                      <span className={cn("inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium", badgeVariants[item.badge.variant as keyof typeof badgeVariants])}>{item.badge.text}</span>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(item.time), { addSuffix: true })}</p>
                  </div>
                </div>
              );
            })}
            {visibleCount < filteredActivities.length && (
              <button onClick={() => setVisibleCount((c) => c + 5)}
                className="flex items-center justify-center gap-2 w-full py-4 text-sm text-muted-foreground hover:text-foreground border-t border-border transition-colors">
                <ChevronDown className="w-4 h-4" /> Load More Activity
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
