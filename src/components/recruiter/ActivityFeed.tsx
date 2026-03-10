import { useState } from "react";
import { Download, Sparkles, Send, Upload, Clock, Globe, User, ChevronDown, Activity, Info, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecruiterActivity } from "@/hooks/useRecruiterData";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

type ActivityType = "scrape" | "ats" | "application" | "cv";

const activityConfig: Record<ActivityType, { icon: typeof Download; label: string }> = {
  scrape: { icon: Download, label: "Job Search" },
  ats: { icon: Sparkles, label: "ATS Analysis" },
  application: { icon: Send, label: "Application" },
  cv: { icon: Upload, label: "CV Update" },
};

const statusBadge = (type: ActivityType) => {
  const styles: Record<ActivityType, { bg: string; text: string; label: string }> = {
    scrape: { bg: "bg-success-50 border-success-500", text: "text-success-600", label: "Completed" },
    application: { bg: "bg-warning-50 border-warning-500", text: "text-warning-600", label: "Submitted" },
    ats: { bg: "bg-info-50 border-info-500", text: "text-info-600", label: "Analyzed" },
    cv: { bg: "bg-primary-50 border-primary", text: "text-primary", label: "Updated" },
  };
  const s = styles[type] || styles.scrape;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", s.bg, s.text)}>
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
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">Applicant Details</h3>
          <Info className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-sm text-muted-foreground ml-1">
            {activities.length} Activities
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : visibleActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-neutral-500" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No recent activity</h3>
          <p className="text-sm text-muted-foreground mb-4">Your recent actions will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Activity</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Details</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleActivities.map((item: any) => {
                const config = activityConfig[item.type as ActivityType];
                const Icon = config?.icon || Activity;
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-foreground">
                            {(item.title || "A").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-foreground font-medium truncate max-w-[200px]">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {config?.label || "Activity"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground hidden md:table-cell truncate max-w-[150px]">
                      {(item.meta || []).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {formatDate(item.time)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {statusBadge(item.type as ActivityType)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More */}
      {visibleCount < activities.length && (
        <button
          onClick={() => setVisibleCount((c) => c + 8)}
          className="flex items-center justify-center gap-2 w-full py-4 text-sm text-muted-foreground hover:text-foreground border-t border-border transition-colors"
        >
          <ChevronDown className="w-4 h-4" /> Load More
        </button>
      )}
    </div>
  );
};

export default ActivityFeed;
