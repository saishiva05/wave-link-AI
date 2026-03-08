import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecruiterApplications } from "@/hooks/useRecruiterData";
import { isToday, isYesterday, isThisWeek, isThisMonth, format } from "date-fns";
import ApplicationStatusModal from "@/components/recruiter/ApplicationStatusModal";
import ApplicationAnalytics from "@/components/recruiter/applications/ApplicationAnalytics";
import ApplicationDateGroup from "@/components/recruiter/applications/ApplicationDateGroup";

const statusLabels: Record<string, string> = {
  pending: "Pending", submitted: "Submitted", interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed", offer_received: "Offer Received", hired: "Hired",
  rejected: "Rejected", declined: "Declined",
};

function groupByDate(applications: any[]) {
  const buckets: Record<string, any[]> = {};
  applications.forEach((a) => {
    const date = new Date(a.applied_at);
    let key: string;
    if (isToday(date)) key = "Today";
    else if (isYesterday(date)) key = "Yesterday";
    else if (isThisWeek(date)) key = "This Week";
    else if (isThisMonth(date)) key = "This Month";
    else key = format(date, "MMMM yyyy");
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(a);
  });
  const groups: { label: string; items: any[] }[] = [];
  const order = ["Today", "Yesterday", "This Week", "This Month"];
  const usedKeys = new Set<string>();
  order.forEach((key) => {
    if (buckets[key]) { groups.push({ label: key, items: buckets[key] }); usedKeys.add(key); }
  });
  Object.keys(buckets).forEach((key) => {
    if (!usedKeys.has(key)) groups.push({ label: key, items: buckets[key] });
  });
  return groups;
}

const RecruiterApplications = () => {
  const { data: applications = [], isLoading } = useRecruiterApplications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editApp, setEditApp] = useState<any | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const filtered = applications.filter((a: any) => {
    if (statusFilter && a.application_status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const title = a.scraped_jobs?.job_title?.toLowerCase() || "";
    const company = a.scraped_jobs?.company_name?.toLowerCase() || "";
    const candidate = a.candidates?.users?.full_name?.toLowerCase() || "";
    return title.includes(q) || company.includes(q) || candidate.includes(q);
  });

  const dateGroups = useMemo(() => groupByDate(filtered), [filtered]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ApplicationStatusModal application={editApp} onClose={() => setEditApp(null)} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Applications</h1>
        <p className="text-base text-muted-foreground mt-1">
          Track and manage all candidate applications with real-time analytics
        </p>
      </motion.div>

      {/* Analytics Section */}
      {!isLoading && applications.length > 0 && (
        <ApplicationAnalytics applications={applications} />
      )}

      {/* Filters */}
      {applications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, or candidate..."
              className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(statusLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                  statusFilter === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {statusFilter && (
            <button onClick={() => setStatusFilter("")} className="text-xs text-primary hover:underline font-medium">
              Clear filter
            </button>
          )}
        </motion.div>
      )}

      {/* Application List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-card border border-border rounded-xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading applications...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-info-50 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-8 h-8 text-info-500" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            {search || statusFilter ? "No matching applications" : "No applications submitted"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {search || statusFilter
              ? "Try adjusting your filters."
              : "Once you submit applications for your candidates, they'll appear here with real-time status tracking."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dateGroups.map((group) => (
            <motion.div key={group.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ApplicationDateGroup
                label={group.label}
                items={group.items}
                isCollapsed={collapsedGroups.has(group.label)}
                onToggle={() => toggleGroup(group.label)}
                onEditApp={setEditApp}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
