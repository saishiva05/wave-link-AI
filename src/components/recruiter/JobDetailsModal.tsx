import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  X, MapPin, Calendar, Briefcase, ExternalLink, Building2, Award,
  Clock, Globe, DollarSign, Sparkles, FilePen, Copy, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface JobDetailsModalProps {
  job: ScrapedJob | null;
  onClose: () => void;
  onRunATS: (job: ScrapedJob) => void;
}

const MetaItem = ({ icon: Icon, label, value, className }: { icon: any; label: string; value: string; className?: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
      <Icon className={cn("w-4.5 h-4.5 text-primary/70", className)} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-secondary-900 mt-0.5">{value}</p>
    </div>
  </div>
);

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); }
  catch { return "—"; }
};

const JobDetailsModal = ({ job, onClose, onRunATS }: JobDetailsModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(job.job_apply_url);
    setCopied(true);
    toast({ title: "Copied!", description: "Job URL copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const platformLabel = job.platform.charAt(0).toUpperCase() + job.platform.slice(1);
  const isLinkedIn = job.platform.toLowerCase() === "linkedin";
  const platformColor = isLinkedIn ? "bg-info-50 text-info-500 border-info-200" : "bg-secondary-100 text-secondary-600 border-secondary-200";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className={cn(
          "h-1.5 w-full",
          isLinkedIn ? "bg-info-500" : "bg-secondary-400"
        )} />

        {/* Header */}
        <div className="px-6 md:px-8 py-6 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-md border", platformColor)}>
                  {platformLabel}
                </span>
                {job.contract_type && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 border border-primary-200">
                    {job.contract_type}
                  </span>
                )}
                {job.work_type && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                    {job.work_type}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-secondary-900 font-display leading-tight">{job.job_title}</h2>
              <div className="flex items-center gap-1.5 mt-2 text-base font-medium text-primary-600">
                <Building2 className="w-4 h-4" />
                {job.company_name}
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick info grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetaItem icon={MapPin} label="Location" value={job.location} />
            {job.salary_range && (
              <MetaItem icon={DollarSign} label="Salary" value={job.salary_range} className="text-success-600" />
            )}
            {job.experience_level && (
              <MetaItem icon={Award} label="Experience" value={job.experience_level} />
            )}
            <MetaItem icon={Clock} label="Published" value={job.published_date ? timeAgo(job.published_date) : "—"} />
            <MetaItem icon={Globe} label="Added" value={timeAgo(job.scraped_at)} />
            <MetaItem icon={Briefcase} label="Platform" value={platformLabel} />
            {job.applications_count && (
              <MetaItem icon={Briefcase} label="Applicants" value={job.applications_count} className="text-blue-600" />
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-secondary-900 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-primary" />
              Job Description
            </h3>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-5">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.job_description}</p>
            </div>
          </div>

          {/* Apply URL */}
          <div>
            <h3 className="text-sm font-bold text-secondary-900 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-success-500" />
              Apply Link
            </h3>
            <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border/60 rounded-xl">
              <a
                href={job.job_apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1.5 flex-1 min-w-0 truncate font-medium"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span className="truncate">{job.job_apply_url}</span>
              </a>
              <button
                onClick={handleCopyUrl}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
                  copied ? "bg-success-50 text-success-600" : "hover:bg-muted text-muted-foreground"
                )}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <Button variant="portal" size="sm" onClick={() => { onClose(); onRunATS(job); }}>
              <Sparkles className="w-4 h-4" />
              Run ATS Analysis
            </Button>
            <a
              href={job.job_apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-success-600 text-primary-foreground rounded-lg text-sm font-semibold hover:bg-success-700 transition-colors"
            >
              Apply Now
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
