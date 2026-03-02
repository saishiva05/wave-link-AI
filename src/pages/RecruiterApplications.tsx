import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, X, Loader2, MapPin, Calendar, FileText, Building, Edit3, ChevronDown, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecruiterApplications } from "@/hooks/useRecruiterData";
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import ApplicationStatusModal from "@/components/recruiter/ApplicationStatusModal";

const statusStyles: Record<string, string> = {
  pending: "bg-warning-100 text-warning-700 border-warning-200",
  submitted: "bg-info-100 text-info-700 border-info-200",
  interview_scheduled: "bg-primary-100 text-primary-700 border-primary-200",
  interviewed: "bg-primary-100 text-primary-700 border-primary-200",
  offer_received: "bg-success-100 text-success-700 border-success-200",
  hired: "bg-success-200 text-success-800 border-success-300",
  rejected: "bg-error-100 text-error-700 border-error-200",
  declined: "bg-error-100 text-error-700 border-error-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending", submitted: "Submitted", interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed", offer_received: "Offer Received", hired: "Hired",
  rejected: "Rejected", declined: "Declined",
};

function groupByDate(applications: any[]) {
  const groups: { label: string; items: any[] }[] = [];
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

  // Maintain order
  const order = ["Today", "Yesterday", "This Week", "This Month"];
  const usedKeys = new Set<string>();

  order.forEach((key) => {
    if (buckets[key]) {
      groups.push({ label: key, items: buckets[key] });
      usedKeys.add(key);
    }
  });

  Object.keys(buckets).forEach((key) => {
    if (!usedKeys.has(key)) {
      groups.push({ label: key, items: buckets[key] });
    }
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

  // Stats
  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    applications.forEach((a: any) => {
      s[a.application_status] = (s[a.application_status] || 0) + 1;
    });
    return s;
  }, [applications]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ApplicationStatusModal application={editApp} onClose={() => setEditApp(null)} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Applications</h1>
        <p className="text-base text-muted-foreground mt-1">{applications.length} application{applications.length !== 1 ? "s" : ""} submitted</p>
      </motion.div>

      {/* Status Summary */}
      {applications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
        >
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center",
                statusFilter === key
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <span className="text-lg font-bold text-secondary-900">{stats[key] || 0}</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      {applications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
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
          {statusFilter && (
            <span className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
              {statusLabels[statusFilter]}
              <button onClick={() => setStatusFilter("")} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200"><X className="w-3 h-3" /></button>
            </span>
          )}
        </motion.div>
      )}

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
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">{search || statusFilter ? "No matching applications" : "No applications submitted"}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {search || statusFilter ? "Try adjusting your filters." : "Once you submit applications for your candidates, they'll appear here with real-time status tracking."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dateGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.label);
            return (
              <motion.div key={group.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {/* Date Group Header */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center gap-3 mb-3 w-full text-left group"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                  <h3 className="text-sm font-bold text-secondary-700 uppercase tracking-wider">{group.label}</h3>
                  <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                    {group.items.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </button>

                {!isCollapsed && (
                  <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                    {group.items.map((a: any, i: number) => (
                      <div key={a.application_id} className={cn("flex items-center gap-4 px-6 py-5 hover:bg-muted/30 transition-colors", i < group.items.length - 1 && "border-b border-border")}>
                        <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                          <Building className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 truncate">{a.scraped_jobs?.job_title || "Unknown Job"}</p>
                          <p className="text-xs text-primary-600 font-medium mt-0.5">{a.scraped_jobs?.company_name || "Unknown"}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.scraped_jobs?.location || "—"}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {formatDistanceToNow(new Date(a.applied_at), { addSuffix: true })}</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{a.cvs?.file_name || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />{a.candidates?.users?.full_name || "Unknown"}
                            </span>
                            {a.recruiter_notes && (
                              <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                                Note: {a.recruiter_notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 space-y-2 flex flex-col items-end">
                          <span className={cn("inline-block text-xs font-bold px-2.5 py-1 rounded-full border", statusStyles[a.application_status] || "bg-muted text-muted-foreground border-border")}>
                            {statusLabels[a.application_status] || a.application_status}
                          </span>
                          <p className="text-xs text-muted-foreground">{format(new Date(a.applied_at), "MMM d, yyyy")}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-primary hover:text-primary"
                            onClick={() => setEditApp(a)}
                          >
                            <Edit3 className="w-3 h-3 mr-1" /> Update Status
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
