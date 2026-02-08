import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, X, Loader2, ChevronRight, MapPin, Calendar, FileText, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecruiterApplications } from "@/hooks/useRecruiterData";
import { formatDistanceToNow, format } from "date-fns";

const statusStyles: Record<string, string> = {
  pending: "bg-warning-100 text-warning-700",
  submitted: "bg-info-100 text-info-700",
  interview_scheduled: "bg-primary-100 text-primary-700",
  interviewed: "bg-primary-100 text-primary-700",
  offer_received: "bg-success-100 text-success-700",
  hired: "bg-success-200 text-success-800",
  rejected: "bg-error-100 text-error-700",
  declined: "bg-error-100 text-error-700",
};

const statusLabels: Record<string, string> = {
  pending: "Pending", submitted: "Submitted", interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed", offer_received: "Offer Received", hired: "Hired",
  rejected: "Rejected", declined: "Declined",
};

const RecruiterApplications = () => {
  const { data: applications = [], isLoading } = useRecruiterApplications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = applications.filter((a: any) => {
    if (statusFilter && a.application_status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const title = a.scraped_jobs?.job_title?.toLowerCase() || "";
    const company = a.scraped_jobs?.company_name?.toLowerCase() || "";
    const candidate = a.candidates?.users?.full_name?.toLowerCase() || "";
    return title.includes(q) || company.includes(q) || candidate.includes(q);
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Applications</h1>
        <p className="text-base text-muted-foreground mt-1">{applications.length} application{applications.length !== 1 ? "s" : ""} submitted</p>
      </motion.div>

      {/* Filters */}
      {applications.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, or candidate..."
              className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
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
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {filtered.map((a: any, i: number) => (
            <div key={a.application_id} className={cn("flex items-center gap-4 px-6 py-5 hover:bg-muted/30 transition-colors", i < filtered.length - 1 && "border-b border-border")}>
              <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-border flex items-center justify-center shrink-0">
                <Building className="w-6 h-6 text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary-900 truncate">{a.scraped_jobs?.job_title || "Unknown Job"}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5">{a.scraped_jobs?.company_name || "Unknown"}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-600">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.scraped_jobs?.location || "—"}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {formatDistanceToNow(new Date(a.applied_at), { addSuffix: true })}</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{a.cvs?.file_name || "—"}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Candidate: {a.candidates?.users?.full_name || "Unknown"}</p>
              </div>
              <div className="text-right shrink-0 space-y-2">
                <span className={cn("inline-block text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[a.application_status] || "bg-neutral-100 text-neutral-700")}>
                  {statusLabels[a.application_status] || a.application_status}
                </span>
                <p className="text-xs text-neutral-500">{format(new Date(a.applied_at), "MMM d, yyyy")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
