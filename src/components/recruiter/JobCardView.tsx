import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin,
  Calendar,
  Award,
  Sparkles,
  MoreVertical,
  Eye,
  Link,
  Download,
  Trash,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface JobCardViewProps {
  jobs: ScrapedJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewDetails: (job: ScrapedJob) => void;
  onRunATS: (job: ScrapedJob) => void;
}

const contractBadgeStyles: Record<string, string> = {
  "Full-time": "bg-primary-100 text-primary-700",
  "Part-time": "bg-info-50 text-info-700",
  Contract: "bg-warning-50 text-warning-700",
  Internship: "bg-success-50 text-success-700",
  Temporary: "bg-neutral-200 text-neutral-700",
  Volunteer: "bg-primary-50 text-primary-600",
};

const JobCardView = ({ jobs, selectedIds, onToggleSelect, onViewDetails, onRunATS }: JobCardViewProps) => {
  const { toast } = useToast();

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
          onCopyUrl={() => {
            navigator.clipboard.writeText(job.job_apply_url);
            toast({ title: "Copied!", description: "Job URL copied to clipboard" });
          }}
        />
      ))}
    </div>
  );
};

const JobCard = ({
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
    <div
      className={cn(
        "bg-card border rounded-xl p-6 shadow-card transition-all duration-200 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5",
        selected ? "border-primary bg-primary-50 ring-2 ring-primary/10" : "border-border"
      )}
      onClick={onViewDetails}
    >
      {/* Header: checkbox + platform + menu */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          <span className={cn(
            "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded",
            job.platform === "linkedin" ? "bg-blue-50 text-blue-600" : "bg-secondary-100 text-secondary-700"
          )}>
            {job.platform === "linkedin" ? "LinkedIn" : "JSearch"}
          </span>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 hover:text-primary transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-card border border-border rounded-lg shadow-elevated z-20 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
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
              <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-error-50 text-destructive transition-colors text-left">
                <Trash className="w-4 h-4" /> Delete Job
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Company */}
      <h3 className="text-base font-semibold text-secondary-900 leading-snug line-clamp-2 mb-1.5">{job.job_title}</h3>
      <p className="text-sm font-medium text-primary-600 mb-3">{job.company_name}</p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(job.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        {job.experience_level && <span className="flex items-center gap-1"><Award className="w-3 h-3" />{job.experience_level}</span>}
      </div>

      {/* Badge */}
      {job.contract_type && (
        <span className={cn("inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-4", contractBadgeStyles[job.contract_type] || "bg-muted text-muted-foreground")}>
          {job.contract_type}
        </span>
      )}

      {/* Description preview */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5">
        {job.job_description}
      </p>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <button
          onClick={(e) => { e.stopPropagation(); onRunATS(); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5" /> Run ATS
        </button>
        <button onClick={(e) => { e.stopPropagation(); onViewDetails(); }} className="text-xs font-medium text-primary hover:underline">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default JobCardView;
