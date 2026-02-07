import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin,
  Sparkles,
  MoreVertical,
  Eye,
  Link,
  Download,
  Trash,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface JobTableViewProps {
  jobs: ScrapedJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onViewDetails: (job: ScrapedJob) => void;
  onRunATS: (job: ScrapedJob) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
}

const contractBadgeStyles: Record<string, string> = {
  "Full-time": "bg-primary-100 text-primary-700",
  "Part-time": "bg-info-50 text-info-700",
  Contract: "bg-warning-50 text-warning-700",
  Internship: "bg-success-50 text-success-700",
  Temporary: "bg-neutral-200 text-neutral-700",
  Volunteer: "bg-primary-50 text-primary-600",
};

const SortIcon = ({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) => {
  if (field !== sortField) return null;
  return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
};

const JobTableView = ({
  jobs,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  allSelected,
  onViewDetails,
  onRunATS,
  sortField,
  sortDir,
  onSort,
}: JobTableViewProps) => {
  const { toast } = useToast();

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
        <Search className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or scrape new jobs</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b-2 border-border">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700 cursor-pointer select-none" onClick={() => onSort("id")}>
                <div className="flex items-center gap-1">Job ID <SortIcon field="id" sortField={sortField} sortDir={sortDir} /></div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700 cursor-pointer select-none" onClick={() => onSort("published_date")}>
                <div className="flex items-center gap-1">Published <SortIcon field="published_date" sortField={sortField} sortDir={sortDir} /></div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700 cursor-pointer select-none min-w-[200px]" onClick={() => onSort("job_title")}>
                <div className="flex items-center gap-1">Job Title <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Company</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Location</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Type</th>
              <th className="hidden xl:table-cell px-4 py-3 text-left font-medium text-neutral-700">Experience</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Platform</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <JobTableRow
                key={job.id}
                job={job}
                selected={selectedIds.has(job.id)}
                onToggleSelect={() => onToggleSelect(job.id)}
                onViewDetails={() => onViewDetails(job)}
                onRunATS={() => onRunATS(job)}
                onCopyUrl={() => {
                  navigator.clipboard.writeText(job.job_apply_url);
                  toast({ title: "Copied!", description: "Job URL copied to clipboard" });
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const JobTableRow = ({
  job,
  selected,
  onToggleSelect,
  onViewDetails,
  onRunATS,
  onCopyUrl,
}: {
  job: ScrapedJob;
  selected: boolean;
  onToggleSelect: () => void;
  onViewDetails: () => void;
  onRunATS: () => void;
  onCopyUrl: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <tr className={cn(
      "border-b border-border hover:bg-muted/50 transition-colors",
      selected && "bg-primary-50 border-l-4 border-l-primary"
    )}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
        />
      </td>
      <td className="px-4 py-3 font-mono text-xs text-neutral-600">{job.id}</td>
      <td className="px-4 py-3 text-neutral-600">
        {new Date(job.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
      <td className="px-4 py-3">
        <button onClick={onViewDetails} className="text-secondary-900 font-medium hover:text-primary hover:underline text-left truncate max-w-[240px] block">
          {job.job_title}
        </button>
      </td>
      <td className="px-4 py-3 text-neutral-700 truncate max-w-[160px]">{job.company_name}</td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-neutral-600 truncate max-w-[140px]">
          <MapPin className="w-3.5 h-3.5 shrink-0" />{job.location}
        </span>
      </td>
      <td className="px-4 py-3">
        {job.contract_type && (
          <span className={cn("inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap", contractBadgeStyles[job.contract_type] || "bg-muted text-muted-foreground")}>
            {job.contract_type}
          </span>
        )}
      </td>
      <td className="hidden xl:table-cell px-4 py-3 text-neutral-600">{job.experience_level || "—"}</td>
      <td className="px-4 py-3">
        <span className={cn(
          "flex items-center gap-1 text-xs font-medium",
          job.platform === "linkedin" ? "text-blue-600" : "text-secondary-700"
        )}>
          {job.platform === "linkedin" ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
          ) : (
            <Search className="w-4 h-4" />
          )}
          {job.platform === "linkedin" ? "LinkedIn" : "JSearch"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-50 text-neutral-500 hover:text-primary transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-52 bg-card border border-border rounded-lg shadow-elevated z-20 overflow-hidden animate-scale-in">
              <button onClick={() => { onViewDetails(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <Eye className="w-4 h-4 text-neutral-500" /> View Details
              </button>
              <button onClick={() => { onRunATS(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <Sparkles className="w-4 h-4 text-primary" /> Run ATS Matcher
              </button>
              <button onClick={() => { onCopyUrl(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <Link className="w-4 h-4 text-neutral-500" /> Copy Job URL
              </button>
              <div className="border-t border-border" />
              <button onClick={() => { setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <Download className="w-4 h-4 text-neutral-500" /> Export to CSV
              </button>
              <div className="border-t border-border" />
              <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-error-50 text-destructive transition-colors text-left">
                <Trash className="w-4 h-4" /> Delete Job
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default JobTableView;
