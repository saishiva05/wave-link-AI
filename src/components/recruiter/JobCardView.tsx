import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Eye, ExternalLink, Clock, Building2,
  FileEdit, Search, Mail, ChevronDown, Send, CheckCircle,
  BarChart3, Zap, ArrowUpRight, CircleDollarSign, Timer, Users, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import UpdatedCVsBadge from "@/components/recruiter/UpdatedCVsBadge";
import { getPlatformDisplayName } from "@/lib/platformBranding";
import wavelynkLogo from "@/assets/wavelynk-logo-unified.png";

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

const PlatformBadge = ({ platform }: { platform: string }) => {
  const label = getPlatformDisplayName(platform);
  const isMax = platform.toLowerCase() === "linkedin";

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-sm",
      isMax ? "bg-gradient-to-r from-primary-50 to-primary-100/60 text-primary border-primary-200" : "bg-gradient-to-r from-secondary-50 to-secondary-100/60 text-secondary-700 border-secondary-200"
    )}>
      <img src={wavelynkLogo} alt={label} className="w-5 h-5 object-contain" />
      {label}
    </span>
  );
};

const JobCardView = ({ jobs, selectedIds, onToggleSelect, onViewDetails, onRunATS, onUpdateCV, onGenerateEmail, onViewATSResult, onApplyToJob, atsAnalyses, updatedCVsMap, generatedEmailsMap, jobApplicationsMap }: JobCardViewProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1 font-display">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or find new jobs</p>
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
              "bg-card border rounded-xl shadow-card transition-all duration-200 flex flex-col overflow-hidden group/card",
              selectedIds.has(job.id) ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/30 hover:shadow-lg",
              isExpanded && "shadow-lg"
            )}
          >
            {/* Color accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary to-primary-600" />

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
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border bg-gradient-to-r transition-all hover:scale-105 hover:shadow-md",
                        latestATS.ats_score >= 70 ? "from-emerald-50 to-emerald-100/80 text-emerald-700 border-emerald-200"
                          : latestATS.ats_score >= 50 ? "from-amber-50 to-amber-100/80 text-amber-700 border-amber-200"
                          : "from-red-50 to-red-100/80 text-red-600 border-red-200"
                      )}
                    >
                      <BarChart3 className="w-3 h-3" /> {latestATS.ats_score}%
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Company */}
              <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 mb-1.5 cursor-pointer hover:text-primary transition-colors font-display" onClick={() => onViewDetails(job)}>
                {job.job_title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-3">
                <Building2 className="w-3.5 h-3.5 opacity-60" />{job.company_name}
              </div>

              {/* Meta */}
              <div className="space-y-2 mb-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary/40" />{job.location}
                </span>
                {job.salary_range && (
                  <span className="inline-flex items-center gap-1.5 font-bold text-success-700 bg-gradient-to-r from-success-50 to-emerald-50 px-2 py-1 rounded-md border border-success-200">
                    <CircleDollarSign className="w-3.5 h-3.5" />{job.salary_range}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground/70">
                  <Timer className="w-3.5 h-3.5" />Added {timeAgo(job.scraped_at)}
                </span>
                {job.applications_count && (
                  <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-info-50 px-2 py-1 rounded-md border border-blue-200">
                    <Users className="w-3.5 h-3.5" />{job.applications_count}
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
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-border text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mt-auto"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                {isExpanded ? "Collapse" : "Actions"}
              </button>

              {/* Expanded actions */}
              {isExpanded && (
                <div className="pt-3 space-y-2 animate-accordion-down">
                  {/* ATS Analysis */}
                  {hasATS ? (
                    <>
                      <button onClick={() => onViewATSResult(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all">
                        <BarChart3 className="w-4 h-4" /> View ATS Results ({atsAnalysesForJob.length})
                      </button>
                      <button onClick={() => onRunATS(job)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all">
                        <Zap className="w-3.5 h-3.5" /> Re-run ATS Analysis
                      </button>
                    </>
                  ) : (
                    <button onClick={() => onRunATS(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all">
                      <Zap className="w-4 h-4" /> Run ATS Analysis
                    </button>
                  )}
                  {/* Update CV */}
                  {updatedCVs.length > 0 ? (
                    <>
                      <div className="w-full"><UpdatedCVsBadge updatedCVs={updatedCVs} /></div>
                      <button onClick={() => onUpdateCV(job)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-teal-600 hover:bg-teal-50 transition-all">
                        <FileEdit className="w-3.5 h-3.5" /> Update More CVs
                      </button>
                    </>
                  ) : (
                    <button onClick={() => onUpdateCV(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200 hover:border-teal-300 hover:shadow-md transition-all">
                      <FileText className="w-4 h-4" /> Update CV
                    </button>
                  )}
                  {/* Email */}
                  {hasEmails ? (
                    <button onClick={() => onGenerateEmail(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all">
                      <Mail className="w-4 h-4" /> View Generated Emails
                    </button>
                  ) : (
                    <button onClick={() => onGenerateEmail(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all">
                      <Mail className="w-4 h-4" /> Generate Email
                    </button>
                  )}
                  {/* Apply to Job */}
                  <button onClick={() => {
                    let url = job.job_apply_url;
                    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
                    window.open(url, "_blank");
                  }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-50 to-info-50 text-blue-700 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <ArrowUpRight className="w-4 h-4" /> Apply to Job
                  </button>
                  {/* Submit Application */}
                  {jobApplications.length > 0 ? (
                    <span className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-success-50 to-emerald-50 text-success-700 border border-success-200">
                      <CheckCircle className="w-4 h-4" /> Submitted ({jobApplications.length})
                    </span>
                  ) : (
                    <button onClick={() => onApplyToJob(job)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all">
                      <Send className="w-4 h-4" /> Submit Application
                    </button>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => onViewDetails(job)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
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
