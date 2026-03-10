import { useState } from "react";
import { Download, Sparkles, Send, Upload, Clock, Activity, ChevronDown, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecruiterActivity } from "@/hooks/useRecruiterData";
import { format, isToday, isYesterday } from "date-fns";

type ActivityType = "scrape" | "ats" | "application" | "cv";

const activityConfig: Record<ActivityType, { icon: typeof Download; label: string }> = {
  scrape: { icon: Download, label: "Job Search" },
  ats: { icon: Sparkles, label: "ATS Analysis" },
  application: { icon: Send, label: "Application" },
  cv: { icon: Upload, label: "CV Update" },
};

const statusBadge = (type: ActivityType) => {
  const styles: Record<ActivityType, { cls: string; label: string }> = {
    scrape: { cls: "bg-primary/15 text-primary", label: "Completed" },
    application: { cls: "bg-warning-50 text-warning-600", label: "Submitted" },
    ats: { cls: "bg-info-50 text-info-600", label: "Analyzed" },
    cv: { cls: "bg-success-50 text-success-600", label: "Updated" },
  };
  const s = styles[type] || styles.scrape;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold", s.cls)}>
      {s.label}
    </span>
  );
};

const ActivityFeed = () => {
  const [visibleCount, setVisibleCount] = useState(8);
  const { data: allActivities, isLoading } = useRecruiterActivity();
  const activities = allActivities || [];
  const visibleActivities = activities.slice(0, visibleCount);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "dd/MM/yyyy");
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">{activities.length} items</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : visibleActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider bg-muted/30">
                <th className="text-left px-5 py-2.5 font-medium">Activity</th>
                <th className="text-left px-4 py-2.5 font-medium">Type</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Details</th>
                <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Date</th>
                <th className="text-center px-4 py-2.5 font-medium">Status</th>
                <th className="w-10 px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleActivities.map((item: any) => {
                const config = activityConfig[item.type as ActivityType];
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-foreground">
                            {(item.title || "A").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-foreground font-medium truncate max-w-[180px]">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{config?.label || "Activity"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[140px]">
                      {(item.meta || []).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">{formatDate(item.time)}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(item.type as ActivityType)}</td>
                    <td className="px-2 py-3 text-center">
                      <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {visibleCount < activities.length && (
        <button
          onClick={() => setVisibleCount((c) => c + 8)}
          className="flex items-center justify-center gap-1.5 w-full py-3 text-xs text-muted-foreground hover:text-foreground border-t border-border transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" /> Load More
        </button>
      )}
    </div>
  );
};

export default ActivityFeed;