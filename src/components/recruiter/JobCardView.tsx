import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Calendar, Award, Sparkles, MoreVertical, Eye, Link, Trash,
  Search, ExternalLink, FilePen, DollarSign, Globe, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface JobCardViewProps {
  jobs: ScrapedJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewDetails: (job: ScrapedJob) => void;
  onRunATS: (job: ScrapedJob) => void;
  onUpdateCV: (job: ScrapedJob) => void;
}

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "—";
  }
};

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
      <Search className="w-3.5 h-3.5" /> JSearch
    </span>
  );
};

const JobCardView = ({ jobs, selectedIds, onToggleSelect, onViewDetails, onRunATS, onUpdateCV }: JobCardViewProps) => {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or scrape new jobs</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          selected={selectedIds.has(job.id)}
          onToggleSelect={() => onToggleSelect(job.id)}
          onViewDetails={() => onViewDetails(job)}
          onRunATS={() => onRunATS(job)}
          onUpdateCV={() => onUpdateCV(job)}
        />
      ))}
    </div>
  );
};

const JobCard = ({
  job, selected, onToggleSelect, onViewDetails, onRunATS, onUpdateCV,
}: {
  job: ScrapedJob;
  selected: boolean;
  onToggleSelect: () => void;
  onViewDetails: () => void;
  onRunATS: () => void;
  onUpdateCV: () => void;
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

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5 shadow-card transition-all duration-200 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col",
        selected ? "border-primary bg-primary-50 ring-2 ring-primary/10" : "border-border"
      )}
      onClick={onViewDetails}
    >
      {/* Header: checkbox + platform + menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox" checked={selected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          {platformBadge(job.platform)}
        </div>
        <div ref={menuRef} className="relative">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 hover:text-primary transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-card border border-border rounded-lg shadow-elevated z-20 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { onViewDetails(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <Eye className="w-4 h-4 text-neutral-500" /> View Details
              </button>
              <button onClick={() => { navigator.clipboard.writeText(job.job_apply_url); toast({ title: "Copied!", description: "Job URL copied" }); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <Link className="w-4 h-4 text-neutral-500" /> Copy Job URL
              </button>
              <div className="border-t border-border" />
              <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-error-50 text-destructive transition-colors text-left">
                <Trash className="w-4 h-4" /> Delete Job
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Company */}
      <h3 className="text-sm font-semibold text-secondary-900 leading-snug line-clamp-2 mb-1">{job.job_title}</h3>
      <p className="text-xs font-medium text-primary-600 mb-2">{job.company_name}</p>

      {/* Description preview */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">{job.job_description}</p>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <span className="flex items-center gap-1 text-neutral-600"><MapPin className="w-3 h-3 text-neutral-400" />{job.location}</span>
        <span className="flex items-center gap-1 text-neutral-600"><Clock className="w-3 h-3 text-neutral-400" />{timeAgo(job.published_date)}</span>
        {job.salary_range && (
          <span className="flex items-center gap-1 text-success-600 font-medium"><DollarSign className="w-3 h-3" />{job.salary_range}</span>
        )}
        {job.experience_level && (
          <span className="flex items-center gap-1 text-neutral-600"><Award className="w-3 h-3 text-neutral-400" />{job.experience_level}</span>
        )}
        <span className="flex items-center gap-1 text-neutral-500"><Globe className="w-3 h-3 text-neutral-400" />Scraped {timeAgo(job.scraped_at)}</span>
      </div>

      {/* Apply URL */}
      <a
        href={job.job_apply_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-xs text-primary hover:underline flex items-center gap-1 mb-4 truncate"
      >
        <ExternalLink className="w-3 h-3 shrink-0" />
        <span className="truncate">{job.job_apply_url}</span>
      </a>

      {/* Footer actions */}
      <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onRunATS(); }} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Sparkles className="w-3.5 h-3.5" /> Run ATS
          </button>
          <span className="text-neutral-300">|</span>
          <button onClick={(e) => { e.stopPropagation(); onUpdateCV(); }} className="flex items-center gap-1.5 text-xs font-semibold text-info-500 hover:underline">
            <FilePen className="w-3.5 h-3.5" /> Update CV
          </button>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onViewDetails(); }} className="text-xs font-medium text-primary hover:underline">
          Details →
        </button>
      </div>
    </div>
  );
};

export default JobCardView;
