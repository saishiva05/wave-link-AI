import { ScrapedJob } from "@/data/mockScrapedJobs";
import { X, MapPin, Calendar, Briefcase, ExternalLink, Building, Award, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JobDetailsModalProps {
  job: ScrapedJob | null;
  onClose: () => void;
  onRunATS: (job: ScrapedJob) => void;
}

const contractBadgeStyles: Record<string, string> = {
  "Full-time": "bg-primary-100 text-primary-700",
  "Part-time": "bg-info-50 text-info-700",
  Contract: "bg-warning-50 text-warning-700",
  Internship: "bg-success-50 text-success-700",
};

const JobDetailsModal = ({ job, onClose, onRunATS }: JobDetailsModalProps) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-elevated max-w-3xl w-full max-h-[90vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 md:px-8 py-6 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded",
                  job.platform === "linkedin" ? "bg-blue-50 text-blue-600" : "bg-secondary-100 text-secondary-700"
                )}>
                  {job.platform === "linkedin" ? "LinkedIn" : "JSearch"}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-secondary-900 font-display">{job.job_title}</h2>
              <p className="text-base font-medium text-primary-600 mt-1">{job.company_name}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(job.published_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><Hash className="w-4 h-4" />{job.id}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-6 overflow-y-auto flex-1">
          {/* Job Overview */}
          <h3 className="text-base font-semibold text-secondary-900 mb-4">Job Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {job.contract_type && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Contract Type</p>
                <span className={cn("inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full", contractBadgeStyles[job.contract_type] || "bg-muted text-muted-foreground")}>
                  {job.contract_type}
                </span>
              </div>
            )}
            {job.work_type && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Work Mode</p>
                <p className="text-sm font-medium text-secondary-900">{job.work_type}</p>
              </div>
            )}
            {job.experience_level && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Experience</p>
                <p className="text-sm font-medium text-secondary-900">{job.experience_level}</p>
              </div>
            )}
            {job.salary_range && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Salary Range</p>
                <p className="text-sm font-medium text-success-600">{job.salary_range}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <h3 className="text-base font-semibold text-secondary-900 mb-4">Description</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed mb-8">
            <p>{job.job_description}</p>
          </div>

          {/* Apply */}
          <h3 className="text-base font-semibold text-secondary-900 mb-4">Apply</h3>
          <a
            href={job.job_apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            Apply on {job.platform === "linkedin" ? "LinkedIn" : "JSearch"}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
          <Button variant="portal" onClick={() => { onClose(); onRunATS(job); }}>
            <Briefcase className="w-4 h-4" />
            Run ATS Analysis
          </Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
