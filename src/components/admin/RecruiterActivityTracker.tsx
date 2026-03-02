import { motion } from "framer-motion";
import { Clock, Users, Activity, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminRecruiterSessions } from "@/hooks/useAdminData";
import { formatDistanceToNow } from "date-fns";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const RecruiterActivityTracker = () => {
  const { data: sessions = [], isLoading } = useAdminRecruiterSessions();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs text-center">
        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No recruiter activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground font-display">Recruiter Activity</h3>
          <p className="text-sm text-muted-foreground">Login sessions and active hours</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
            <Wifi className="w-3 h-3 text-success-500" /> {sessions.filter(s => s.is_online).length} Online
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {sessions.map((s) => (
          <div key={s.recruiter_id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {s.name.charAt(0)}
              </div>
              {s.is_online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success-500 border-2 border-card rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                {s.is_online ? (
                  <span className="text-[10px] font-bold text-success-600 bg-success-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Wifi className="w-2.5 h-2.5" /> Online
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <WifiOff className="w-2.5 h-2.5" /> Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{s.email}</p>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-sm font-bold text-foreground">{formatDuration(s.total_minutes)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Active</p>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{s.sessions.length} session{s.sessions.length !== 1 ? "s" : ""}</p>
              <p className="text-[10px] text-muted-foreground">Last: {formatDistanceToNow(new Date(s.last_active), { addSuffix: true })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterActivityTracker;
