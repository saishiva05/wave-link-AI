import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Sparkles, MoreVertical, Eye, Link, Trash, Search,
  ChevronUp, ChevronDown, ExternalLink, FilePen, DollarSign, Award,
  Globe, Clock, CheckCircle, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import UpdatedCVsBadge from "@/components/recruiter/UpdatedCVsBadge";

interface JobTableViewProps {
  jobs: ScrapedJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onViewDetails: (job: ScrapedJob) => void;
  onRunATS: (job: ScrapedJob) => void;
  onUpdateCV: (job: ScrapedJob) => void;
  onViewATSResult: (job: ScrapedJob) => void;
  atsAnalyses: Record<string, any>;
  updatedCVsMap: Record<string, any[]>;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "linkedin") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-info-50 text-info-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
          </span>
        </TooltipTrigger>
        <TooltipContent>LinkedIn</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-100 text-secondary-600">
          <Search className="w-4 h-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent>JSearch</TooltipContent>
    </Tooltip>
  );
};

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "—";
  }
};

const SortIcon = ({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) => {
  if (field !== sortField) return <ChevronUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" />;
  return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />;
};

const ATSScoreBadge = ({ score, onClick }: { score: number; onClick: () => void }) => {
  const color = score >= 70
    ? "bg-success-50 text-success-700 border-success-200 hover:bg-success-100"
    : score >= 50
    ? "bg-warning-50 text-warning-700 border-warning-200 hover:bg-warning-100"
    : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:scale-105 hover:shadow-sm cursor-pointer",
        color
      )}
      title="Click to view full ATS analysis"
    >
      <CheckCircle className="w-3 h-3" />
      {score}%
    </button>
  );
};

const JobTableView = ({
  jobs, selectedIds, onToggleSelect, onSelectAll, allSelected,
  onViewDetails, onRunATS, onUpdateCV, onViewATSResult, atsAnalyses,
  updatedCVsMap, sortField, sortDir, onSort,
}: JobTableViewProps) => {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or scrape new jobs</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary-50/50 border-b border-border">
                <th className="w-12 px-4 py-3.5">
                  <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                </th>
                <th className="px-3 py-3.5 text-left font-semibold text-secondary-700 text-xs uppercase tracking-wider w-12"></th>
                <th className="px-3 py-3.5 text-left font-semibold text-secondary-700 text-xs uppercase tracking-wider cursor-pointer select-none min-w-[280px] group" onClick={() => onSort("job_title")}>
                  <div className="flex items-center gap-1.5">Job Details <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3.5 text-left font-semibold text-secondary-700 text-xs uppercase tracking-wider min-w-[140px]">Location</th>
                <th className="px-3 py-3.5 text-left font-semibold text-secondary-700 text-xs uppercase tracking-wider min-w-[100px]">Salary</th>
                <th className="px-3 py-3.5 text-left font-semibold text-secondary-700 text-xs uppercase tracking-wider cursor-pointer select-none min-w-[120px] group" onClick={() => onSort("scraped_at")}>
                  <div className="flex items-center gap-1.5">Scraped <SortIcon field="scraped_at" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3.5 text-center font-semibold text-secondary-700 text-xs uppercase tracking-wider w-20">ATS</th>
                <th className="px-3 py-3.5 text-center font-semibold text-secondary-700 text-xs uppercase tracking-wider w-28">Updated CV</th>
                <th className="px-3 py-3.5 text-center font-semibold text-secondary-700 text-xs uppercase tracking-wider w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job, idx) => (
                <JobTableRow
                  key={job.id}
                  job={job}
                  index={idx}
                  selected={selectedIds.has(job.id)}
                  atsAnalysis={atsAnalyses[job.id] || null}
                  updatedCVs={updatedCVsMap[job.id] || []}
                  onToggleSelect={() => onToggleSelect(job.id)}
                  onViewDetails={() => onViewDetails(job)}
                  onRunATS={() => onRunATS(job)}
                  onUpdateCV={() => onUpdateCV(job)}
                  onViewATSResult={() => onViewATSResult(job)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
};

const JobTableRow = ({
  job, index, selected, atsAnalysis, updatedCVs, onToggleSelect, onViewDetails, onRunATS, onUpdateCV, onViewATSResult,
}: {
  job: ScrapedJob;
  index: number;
  selected: boolean;
  atsAnalysis: any;
  updatedCVs: any[];
  onToggleSelect: () => void;
  onViewDetails: () => void;
  onRunATS: () => void;
  onUpdateCV: () => void;
  onViewATSResult: () => void;
}) => {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasATS = !!atsAnalysis;

  return (
    <tr
      className={cn(
        "group transition-colors cursor-pointer",
        selected
          ? "bg-primary-50/60 border-l-4 border-l-primary"
          : "hover:bg-muted/40",
      )}
      onClick={onViewDetails}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Checkbox */}
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
      </td>

      {/* Platform */}
      <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
        <PlatformIcon platform={job.platform} />
      </td>

      {/* Job Details */}
      <td className="px-3 py-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-secondary-900 group-hover:text-primary transition-colors line-clamp-1">
            {job.job_title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
            <Building2 className="w-3 h-3" />
            {job.company_name}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px] leading-relaxed">
            {job.job_description}
          </p>
        </div>
      </td>

      {/* Location */}
      <td className="px-3 py-4">
        <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/50" />{job.location}
        </span>
      </td>

      {/* Salary */}
      <td className="px-3 py-4">
        {job.salary_range ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-success-600">
            <DollarSign className="w-3.5 h-3.5 shrink-0" />{job.salary_range}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Scraped */}
      <td className="px-3 py-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
          {timeAgo(job.scraped_at)}
        </span>
      </td>

      {/* ATS Score */}
      <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        {hasATS ? (
          <ATSScoreBadge score={atsAnalysis.ats_score} onClick={onViewATSResult} />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Updated CV */}
      <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        {updatedCVs.length > 0 ? (
          <UpdatedCVsBadge updatedCVs={updatedCVs} compact />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onRunATS} className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                hasATS ? "hover:bg-primary-50 text-primary/40 hover:text-primary" : "hover:bg-primary-50 text-primary hover:scale-110"
              )} aria-label={hasATS ? "Re-run ATS" : "Run ATS"}>
                <Sparkles className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{hasATS ? "Re-run ATS" : "Run ATS Analysis"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onUpdateCV} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-info-50 text-info-500 hover:scale-110 transition-all" aria-label="Update CV">
                <FilePen className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Update CV</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a href={job.job_apply_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-success-50 text-success-600 hover:scale-110 transition-all" aria-label="Apply Link">
                <ExternalLink className="w-4 h-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>Open Apply URL</TooltipContent>
          </Tooltip>

          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden animate-scale-in py-1">
                <button onClick={() => { onViewDetails(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left text-foreground">
                  <Eye className="w-4 h-4 text-muted-foreground" /> View Details
                </button>
                <button onClick={() => { navigator.clipboard.writeText(job.job_apply_url); toast({ title: "Copied!", description: "Job URL copied to clipboard" }); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left text-foreground">
                  <Link className="w-4 h-4 text-muted-foreground" /> Copy Job URL
                </button>
                <div className="my-1 border-t border-border" />
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-destructive/5 text-destructive transition-colors text-left">
                  <Trash className="w-4 h-4" /> Delete Job
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default JobTableView;
