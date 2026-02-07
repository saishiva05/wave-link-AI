import { motion } from "framer-motion";
import { FileText, UserPlus, Briefcase, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const mockLogs = [
  { id: 1, action: "Created recruiter account", user: "Admin", target: "Sarah Johnson", time: "2 hours ago", icon: UserPlus, type: "create" },
  { id: 2, action: "Deactivated recruiter", user: "Admin", target: "Emma Davis", time: "5 hours ago", icon: Shield, type: "warning" },
  { id: 3, action: "New jobs scraped", user: "Mike Chen", target: "45 jobs from LinkedIn", time: "6 hours ago", icon: Briefcase, type: "info" },
  { id: 4, action: "Updated platform settings", user: "Admin", target: "Email notifications enabled", time: "1 day ago", icon: Settings, type: "default" },
  { id: 5, action: "Created recruiter account", user: "Admin", target: "Alex Brown", time: "2 days ago", icon: UserPlus, type: "create" },
  { id: 6, action: "New jobs scraped", user: "John Smith", target: "32 jobs from JSearch", time: "2 days ago", icon: Briefcase, type: "info" },
];

const typeStyles: Record<string, string> = {
  create: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  info: "bg-info-50 text-info-600",
  default: "bg-muted text-muted-foreground",
};

const AdminActivityLogs = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">
          Activity Logs
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Track all platform activity and changes
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
      >
        <div className="divide-y divide-border">
          {mockLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", typeStyles[log.type])}>
                <log.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900">{log.action}</p>
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium text-neutral-700">{log.user}</span> — {log.target}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminActivityLogs;
