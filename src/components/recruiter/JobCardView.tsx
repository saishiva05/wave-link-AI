import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Sparkles, MoreVertical, Eye, Link, Trash,
  Search, ExternalLink, FilePen, DollarSign, Globe, Clock, CheckCircle, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import UpdatedCVsBadge from "@/components/recruiter/UpdatedCVsBadge";

interface JobCardViewProps {
  jobs: ScrapedJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewDetails: (job: ScrapedJob) => void;
  onRunATS: (job: ScrapedJob) => void;
  onUpdateCV: (job: ScrapedJob) => void;
  onViewATSResult: (job: ScrapedJob) => void;
  atsAnalyses: Record<string, any>;
  updatedCVsMap: Record<string, any[]>;
}

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "—";
  }
};

const PlatformBadge = ({ platform }: { platform: string }) => {
  if (platform === "linkedin") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-info-50 text-info-500">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
        LinkedIn
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary-100 text-secondary-600">
      <Search className="w-3 h-3" /> JSearch
    </span>
  );
};

const ATSScoreBadge = ({ score, onClick }: { score: number; onClick: (e: React.MouseEvent) => void }) => {
  const color = score >= 70
    ? "bg-success-50 text-success-700 border-success-200"
    : score >= 50
    ? "bg-warning-50 text-warning-700 border-warning-200"
    : "bg-destructive/10 text-destructive border-destructive/20";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 hover:shadow-sm",
        color
      )}
      title="Click to view full ATS analysis"
    >
      <CheckCircle className="w-3 h-3" />
      ATS: {score}%
    </button>
  );
};

const JobCardView = ({ jobs, selectedIds, onToggleSelect, onViewDetails, onRunATS, onUpdateCV, onViewATSResult, atsAnalyses, updatedCVsMap }: JobCardViewProps) => {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or scrape new jobs</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {jobs.map((job, idx) => (
        <JobCard
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
    </div>
  );
};

const JobCard = ({
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
    <div
      className={cn(
        "group bg-card border rounded-xl shadow-card transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 flex flex-col overflow-hidden",
        selected ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/30"
      )}
      onClick={onViewDetails}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Color accent bar */}
      <div className={cn(
        "h-1 w-full",
        job.platform === "linkedin" ? "bg-info-500" : "bg-secondary-400"
      )} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header: checkbox + platform + badges + menu */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="checkbox" checked={selected}
              onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <PlatformBadge platform={job.platform} />
            {hasATS && (
              <ATSScoreBadge
                score={atsAnalysis.ats_score}
                onClick={(e) => { e.stopPropagation(); onViewATSResult(); }}
              />
            )}
          </div>
          <div ref={menuRef} className="relative">
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 w-52 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden animate-scale-in py-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onViewDetails(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                  <Eye className="w-4 h-4 text-muted-foreground" /> View Details
                </button>
                <button onClick={() => { navigator.clipboard.writeText(job.job_apply_url); toast({ title: "Copied!", description: "Job URL copied" }); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
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

        {/* Title & Company */}
        <h3 className="text-sm font-bold text-secondary-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
          {job.job_title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 mb-3">
          <Building2 className="w-3 h-3" />
          {job.company_name}
        </div>

        {/* Description preview */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{job.job_description}</p>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3 h-3 text-primary/40" />{job.location}
          </span>
          {job.salary_range && (
            <span className="flex items-center gap-1.5 text-success-600 font-semibold">
              <DollarSign className="w-3 h-3" />{job.salary_range}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-muted-foreground/70">
            <Clock className="w-3 h-3" />Scraped {timeAgo(job.scraped_at)}
          </span>
        </div>

        {/* Updated CVs badge */}
        {updatedCVs.length > 0 && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <UpdatedCVsBadge updatedCVs={updatedCVs} />
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            {hasATS ? (
              <button onClick={(e) => { e.stopPropagation(); onViewATSResult(); }} className="flex items-center gap-1.5 text-xs font-semibold text-success-600 hover:text-success-700 px-2 py-1.5 rounded-md hover:bg-success-50 transition-all">
                <CheckCircle className="w-3.5 h-3.5" /> View ATS
              </button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); onRunATS(); }} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-700 px-2 py-1.5 rounded-md hover:bg-primary-50 transition-all">
                <Sparkles className="w-3.5 h-3.5" /> Run ATS
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onUpdateCV(); }} className="flex items-center gap-1.5 text-xs font-semibold text-info-500 hover:text-info-600 px-2 py-1.5 rounded-md hover:bg-info-50 transition-all">
              <FilePen className="w-3.5 h-3.5" /> Update CV
            </button>
          </div>
          <a
            href={job.job_apply_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary-50 text-primary transition-all hover:scale-110"
            title="Apply"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobCardView;
