import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Eye, ExternalLink, DollarSign, Clock, Building2,
  Wand2, FileEdit, Search, Mail, ChevronDown, Send, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import UpdatedCVsBadge from "@/components/recruiter/UpdatedCVsBadge";

interface JobCardViewProps {
  jobs: ScrapedJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewDetails: (job: ScrapedJob) => void;
  onRunATS: (job: ScrapedJob) => void;
  onUpdateCV: (job: ScrapedJob) => void;
  onGenerateEmail: (job: ScrapedJob) => void;
  onViewATSResult: (job: ScrapedJob) => void;
  onApplyToJob: (job: ScrapedJob) => void;
  atsAnalyses: Record<string, any[]>;
  updatedCVsMap: Record<string, any[]>;
  generatedEmailsMap: Record<string, any[]>;
  jobApplicationsMap: Record<string, any[]>;
}

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return "—"; }
};

const platformStyles: Record<string, { bg: string; text: string; icon?: "linkedin" }> = {
  linkedin: { bg: "bg-[#0A66C2]/10", text: "text-[#0A66C2]", icon: "linkedin" },
  jsearch: { bg: "bg-secondary-100", text: "text-secondary-600" },
};

const PlatformBadge = ({ platform }: { platform: string }) => {
  const key = platform.toLowerCase();
  const style = platformStyles[key] || { bg: "bg-muted", text: "text-foreground" };
  const label = platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md", style.bg, style.text)}>
      {style.icon === "linkedin" ? (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
      ) : (
        <Search className="w-3 h-3" />
      )}
      {label}
    </span>
  );
};

const JobCardView = ({ jobs, selectedIds, onToggleSelect, onViewDetails, onRunATS, onUpdateCV, onGenerateEmail, onViewATSResult, onApplyToJob, atsAnalyses, updatedCVsMap, generatedEmailsMap, jobApplicationsMap }: JobCardViewProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      {jobs.map((job) => {
        const isExpanded = expandedId === job.id;
        const atsAnalysesForJob = atsAnalyses[job.id] || [];
        const hasATS = atsAnalysesForJob.length > 0;
        const updatedCVs = updatedCVsMap[job.id] || [];
        const hasEmails = (generatedEmailsMap[job.id] || []).length > 0;
        const jobApplications = jobApplicationsMap[job.id] || [];
        const latestATS = atsAnalysesForJob[0];

        return (
          <div
            key={job.id}
            className={cn(
              "bg-card border rounded-xl shadow-card transition-all duration-200 flex flex-col overflow-hidden",
              selectedIds.has(job.id) ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/30",
              isExpanded && "shadow-lg"
            )}
          >
            {/* Color accent bar */}
            <div className={cn("h-1 w-full", job.platform.toLowerCase() === "linkedin" ? "bg-[#0A66C2]" : "bg-secondary-400")} />

            <div className="p-5 flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="checkbox" checked={selectedIds.has(job.id)}
                    onChange={() => onToggleSelect(job.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <PlatformBadge platform={job.platform} />
                  {hasATS && (
                    <button
                      onClick={() => onViewATSResult(job)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105",
                        latestATS.ats_score >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : latestATS.ats_score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      )}
                    >
                      <Wand2 className="w-3 h-3" /> {latestATS.ats_score}%
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Company */}
              <h3 className="text-sm font-bold text-secondary-900 leading-snug line-clamp-2 mb-1.5 cursor-pointer hover:text-primary transition-colors" onClick={() => onViewDetails(job)}>
                {job.job_title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 mb-3">
                <Building2 className="w-3 h-3" />{job.company_name}
              </div>

              {/* Meta */}
              <div className="space-y-1.5 mb-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3 h-3 text-primary/40" />{job.location}
                </span>
                {job.salary_range && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <DollarSign className="w-3 h-3" />{job.salary_range}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground/70">
                  <Clock className="w-3 h-3" />Scraped {timeAgo(job.scraped_at)}
                </span>
                {job.applications_count && (
                  <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                    <Send className="w-3 h-3" />{job.applications_count}
                  </span>
                )}
              </div>

              {updatedCVs.length > 0 && (
                <div className="mb-3">
                  <UpdatedCVsBadge updatedCVs={updatedCVs} />
                </div>
              )}

              {/* Expand toggle */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : job.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-border text-xs font-medium text-muted-foreground hover:text-primary transition-colors mt-auto"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                {isExpanded ? "Collapse" : "Actions"}
              </button>

              {/* Expanded actions */}
              {isExpanded && (
                <div className="pt-3 space-y-2 animate-accordion-down">
                  {/* Step 1: ATS Analysis (always available) */}
                  {hasATS ? (
                    <>
                      <button onClick={() => onViewATSResult(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all">
                        <Eye className="w-4 h-4" /> View ATS Results ({atsAnalysesForJob.length})
                      </button>
                      <button onClick={() => onRunATS(job)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all">
                        <Wand2 className="w-3.5 h-3.5" /> Re-run ATS Analysis
                      </button>
                    </>
                  ) : (
                    <button onClick={() => onRunATS(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all">
                      <Wand2 className="w-4 h-4" /> Run ATS Analysis
                    </button>
                  )}
                  {/* Step 2: Update CV (always available) */}
                  {updatedCVs.length > 0 ? (
                    <>
                      <div className="w-full"><UpdatedCVsBadge updatedCVs={updatedCVs} /></div>
                      <button onClick={() => onUpdateCV(job)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-teal-600 hover:bg-teal-50 transition-all">
                        <FileEdit className="w-3.5 h-3.5" /> Update More CVs
                      </button>
                    </>
                  ) : (
                    <button onClick={() => onUpdateCV(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-all">
                      <FileEdit className="w-4 h-4" /> Update CV
                    </button>
                  )}
                  {hasEmails ? (
                    <button onClick={() => onGenerateEmail(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-all">
                      <Eye className="w-4 h-4" /> View Generated Emails
                    </button>
                  ) : (
                    <button onClick={() => onGenerateEmail(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-all">
                      <Mail className="w-4 h-4" /> Generate Email
                    </button>
                  )}
                  {/* Step 4: Apply to Job */}
                  {jobApplications.length > 0 ? (
                    <span className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-success-100 text-success-700 border border-success-200">
                      <CheckCircle className="w-4 h-4" /> Applied ({jobApplications.length})
                    </span>
                  ) : (
                    <button onClick={() => onApplyToJob(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all">
                      <Send className="w-4 h-4" /> Apply to Job
                    </button>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => onViewDetails(job)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <a href={job.job_apply_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-all">
                      <ExternalLink className="w-3.5 h-3.5" /> External
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JobCardView;
