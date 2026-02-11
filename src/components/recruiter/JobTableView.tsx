import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Sparkles, MoreVertical, Eye, Link, Trash, Search,
  ChevronUp, ChevronDown, ExternalLink, FilePen, DollarSign, Award,
  Globe, Clock, CheckCircle,
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

const platformBadge = (platform: string) => {
  if (platform === "linkedin") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
        LinkedIn
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary-100 text-secondary-700">
      <Search className="w-3.5 h-3.5" />
      JSearch
    </span>
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
  if (field !== sortField) return null;
  return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
};

const ATSScoreBadge = ({ score, onClick }: { score: number; onClick: () => void }) => {
  const color = score >= 70
    ? "bg-success-50 text-success-700 border-success-200"
    : score >= 50
    ? "bg-warning-50 text-warning-700 border-warning-200"
    : "bg-destructive/10 text-destructive border-destructive/20";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border transition-all hover:scale-105 hover:shadow-sm",
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
        <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
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
              <tr className="bg-muted border-b-2 border-border">
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                </th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground w-20">Platform</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none min-w-[260px]" onClick={() => onSort("job_title")}>
                  <div className="flex items-center gap-1">Job Details <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground min-w-[130px]">Location</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground min-w-[100px]">Salary</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground min-w-[100px]">Experience</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none min-w-[120px]" onClick={() => onSort("published_date")}>
                  <div className="flex items-center gap-1">Published <SortIcon field="published_date" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none min-w-[120px]" onClick={() => onSort("scraped_at")}>
                  <div className="flex items-center gap-1">Scraped <SortIcon field="scraped_at" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3 text-center font-medium text-muted-foreground w-20">ATS</th>
                <th className="px-3 py-3 text-center font-medium text-muted-foreground w-28">Updated CV</th>
                <th className="px-3 py-3 text-center font-medium text-muted-foreground w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <JobTableRow
                  key={job.id}
                  job={job}
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
  job, selected, atsAnalysis, updatedCVs, onToggleSelect, onViewDetails, onRunATS, onUpdateCV, onViewATSResult,
}: {
  job: ScrapedJob;
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
    <tr className={cn(
      "border-b border-border hover:bg-muted/50 transition-colors",
      selected && "bg-primary-50 border-l-4 border-l-primary"
    )}>
      {/* Checkbox */}
      <td className="px-3 py-3">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
      </td>

      {/* Platform */}
      <td className="px-3 py-3">{platformBadge(job.platform)}</td>

      {/* Job Details */}
      <td className="px-3 py-3">
        <button onClick={onViewDetails} className="text-secondary-900 font-semibold hover:text-primary hover:underline text-left truncate max-w-[280px] block text-sm">
          {job.job_title}
        </button>
        <p className="text-xs font-medium text-primary-600 mt-0.5">{job.company_name}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-[280px] leading-relaxed">
          {job.job_description}
        </p>
      </td>

      {/* Location */}
      <td className="px-3 py-3">
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="w-3.5 h-3.5 shrink-0" />{job.location}
        </span>
      </td>

      {/* Salary */}
      <td className="px-3 py-3">
        {job.salary_range ? (
          <span className="flex items-center gap-1 text-xs font-medium text-success-600">
            <DollarSign className="w-3.5 h-3.5 shrink-0" />{job.salary_range}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Experience */}
      <td className="px-3 py-3">
        {job.experience_level ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Award className="w-3.5 h-3.5 shrink-0" />{job.experience_level}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Published */}
      <td className="px-3 py-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {timeAgo(job.published_date)}
        </span>
      </td>

      {/* Scraped */}
      <td className="px-3 py-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="w-3.5 h-3.5 shrink-0" />
          {timeAgo(job.scraped_at)}
        </span>
      </td>

      {/* ATS Score */}
      <td className="px-3 py-3 text-center">
        {hasATS ? (
          <ATSScoreBadge score={atsAnalysis.ats_score} onClick={onViewATSResult} />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Updated CV */}
      <td className="px-3 py-3 text-center">
        {updatedCVs.length > 0 ? (
          <UpdatedCVsBadge updatedCVs={updatedCVs} compact />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          {!hasATS ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onRunATS} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary-50 text-primary transition-colors" aria-label="Run ATS">
                  <Sparkles className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Run ATS Analysis</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onRunATS} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary-50 text-primary/50 transition-colors" aria-label="Re-run ATS">
                  <Sparkles className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Re-run ATS Analysis</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onUpdateCV} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-info-50 text-info-500 transition-colors" aria-label="Update CV">
                <FilePen className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Update CV</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a href={job.job_apply_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-success-50 text-success-600 transition-colors" aria-label="Apply Link" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-4 h-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>Open Apply URL</TooltipContent>
          </Tooltip>

          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 w-48 bg-card border border-border rounded-lg shadow-elevated z-20 overflow-hidden animate-scale-in">
                <button onClick={() => { onViewDetails(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                  <Eye className="w-4 h-4 text-muted-foreground" /> View Details
                </button>
                <button onClick={() => { navigator.clipboard.writeText(job.job_apply_url); toast({ title: "Copied!", description: "Job URL copied to clipboard" }); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                  <Link className="w-4 h-4 text-muted-foreground" /> Copy Job URL
                </button>
                <div className="border-t border-border" />
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left">
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
