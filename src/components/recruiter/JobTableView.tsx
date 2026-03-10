import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Eye, Trash, Search,
  ChevronUp, ChevronDown, ExternalLink,
  Clock, Building2, FileEdit,
  ChevronRight, Mail, Sparkles, Copy, Check,
  Send, CheckCircle, BarChart3,
  FileCheck, Zap, ArrowUpRight, CircleDollarSign,
  Timer, Users, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import UpdatedCVsBadge from "@/components/recruiter/UpdatedCVsBadge";
import { getPlatformDisplayName } from "@/lib/platformBranding";

interface JobTableViewProps {
  jobs: ScrapedJob[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
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
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
}

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return "—"; }
};

const SortIcon = ({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) => {
  if (field !== sortField) return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity" />;
  return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
};

const ATSScoreBadge = ({ score, onClick }: { score: number; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer"
      title="View ATS analysis"
    >
      <BarChart3 className="w-3 h-3" />{score}%
    </button>
  );
};

const ApplyExternallyButton = ({ job }: { job: ScrapedJob }) => {
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const handleClick = useCallback(() => {
    const now = new Date();
    setStartedAt(now);
    let url = job.job_apply_url;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    window.open(url, "_blank");
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - now.getTime()) / 1000));
    }, 1000);
    setTimeout(() => clearInterval(interval), 3600000);
    return () => clearInterval(interval);
  }, [job.job_apply_url]);

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={handleClick} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-info-600 bg-info-50 border border-info-500/20 hover:bg-info-100 transition-colors">
        <ArrowUpRight className="w-3.5 h-3.5" /> Apply
      </button>
      {startedAt && elapsed > 0 && (
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
          <Timer className="w-3 h-3" /> {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
        </span>
      )}
    </div>
  );
};

const JobTableView = ({
  jobs, selectedIds, onToggleSelect, onSelectAll, allSelected,
  onViewDetails, onRunATS, onUpdateCV, onGenerateEmail, onViewATSResult, onApplyToJob, atsAnalyses,
  updatedCVsMap, generatedEmailsMap, jobApplicationsMap, sortField, sortDir, onSort,
}: JobTableViewProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or find new jobs</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-4 py-3.5">
                  <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                </th>
                <th className="w-8 px-1 py-3.5"></th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider cursor-pointer select-none group" onClick={() => onSort("job_title")}>
                  <div className="flex items-center gap-1">Job Details <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</div>
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                  <div className="flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> Salary</div>
                </th>
                <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[11px] uppercase tracking-wider cursor-pointer select-none group" onClick={() => onSort("scraped_at")}>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Added <SortIcon field="scraped_at" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-3.5 text-center font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                  <span className="flex items-center justify-center gap-1"><BarChart3 className="w-3 h-3" /> ATS</span>
                </th>
                <th className="px-4 py-3.5 text-center font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                  <span className="flex items-center justify-center gap-1"><FileCheck className="w-3 h-3" /> CV</span>
                </th>
              </tr>
            </thead>
            <tbody>
            {jobs.map((job) => {
                const isExpanded = expandedId === job.id;
                const atsAnalysesForJob = atsAnalyses[job.id] || [];
                const hasATS = atsAnalysesForJob.length > 0;
                const updatedCVs = updatedCVsMap[job.id] || [];
                const generatedEmails = generatedEmailsMap[job.id] || [];
                const jobApplications = jobApplicationsMap[job.id] || [];
                return (
                  <JobExpandableRow
                    key={job.id}
                    job={job}
                    selected={selectedIds.has(job.id)}
                    isExpanded={isExpanded}
                    hasATS={hasATS}
                    atsAnalyses={atsAnalysesForJob}
                    updatedCVs={updatedCVs}
                    generatedEmails={generatedEmails}
                    jobApplications={jobApplications}
                    onToggle={() => setExpandedId(isExpanded ? null : job.id)}
                    onToggleSelect={() => onToggleSelect(job.id)}
                    onViewDetails={() => onViewDetails(job)}
                    onRunATS={() => onRunATS(job)}
                    onUpdateCV={() => onUpdateCV(job)}
                    onGenerateEmail={() => onGenerateEmail(job)}
                    onViewATSResult={() => onViewATSResult(job)}
                    onApplyToJob={() => onApplyToJob(job)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
};

const JobExpandableRow = ({
  job, selected, isExpanded, hasATS, atsAnalyses: atsAnalysesForJob, updatedCVs, generatedEmails, jobApplications,
  onToggle, onToggleSelect, onViewDetails, onRunATS, onUpdateCV, onGenerateEmail, onViewATSResult, onApplyToJob,
}: {
  job: ScrapedJob; selected: boolean; isExpanded: boolean; hasATS: boolean;
  atsAnalyses: any[]; updatedCVs: any[]; generatedEmails: any[]; jobApplications: any[];
  onToggle: () => void; onToggleSelect: () => void; onViewDetails: () => void;
  onRunATS: () => void; onUpdateCV: () => void; onGenerateEmail: () => void; onViewATSResult: () => void;
  onApplyToJob: () => void;
}) => {
  const { toast } = useToast();
  const [showEmails, setShowEmails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const hasUpdatedCVs = updatedCVs.length > 0;
  const hasEmails = generatedEmails.length > 0;
  const latestATS = atsAnalysesForJob[0];

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      {/* Main row */}
      <tr
        className={cn(
          "border-b border-border transition-colors cursor-pointer",
          selected ? "bg-primary/[0.03]" : "hover:bg-muted/30",
          isExpanded && "bg-muted/20"
        )}
        onClick={onToggle}
      >
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggleSelect} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
        </td>
        <td className="px-1 py-4">
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-90 text-primary")} />
        </td>
        <td className="px-4 py-4 min-w-[280px]">
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{job.job_title}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-primary font-medium">
              <Building2 className="w-3 h-3 opacity-70" />{job.company_name}
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/50" />{job.location}
          </span>
        </td>
        <td className="px-4 py-4">
          {job.salary_range ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              <CircleDollarSign className="w-3.5 h-3.5" />{job.salary_range}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
              <CircleDollarSign className="w-3.5 h-3.5" />
            </span>
          )}
        </td>
        <td className="px-4 py-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />{timeAgo(job.scraped_at)}
          </span>
        </td>
        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          {hasATS ? (
            <ATSScoreBadge score={latestATS.ats_score} onClick={onViewATSResult} />
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">Not run</span>
          )}
        </td>
        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          {updatedCVs.length > 0 ? (
            <UpdatedCVsBadge updatedCVs={updatedCVs} compact />
          ) : (
            <span className="text-xs text-muted-foreground/50">None</span>
          )}
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="px-0 py-0">
            <div className="bg-muted/20 border-b border-border px-8 py-5 animate-accordion-down space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* ATS Analysis */}
                {hasATS ? (
                  <button onClick={onViewATSResult} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <BarChart3 className="w-3.5 h-3.5" /> View ATS ({atsAnalysesForJob.length})
                  </button>
                ) : (
                  <button onClick={onRunATS} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <Zap className="w-3.5 h-3.5" /> Run ATS
                  </button>
                )}
                {hasATS && (
                  <button onClick={onRunATS} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Zap className="w-3.5 h-3.5" /> Run Again
                  </button>
                )}

                {/* Update CV */}
                {hasUpdatedCVs ? (
                  <UpdatedCVsBadge updatedCVs={updatedCVs} />
                ) : (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <FileText className="w-3.5 h-3.5" /> Update CV
                  </button>
                )}
                {hasUpdatedCVs && (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <FileEdit className="w-3.5 h-3.5" /> Update More
                  </button>
                )}

                {/* Generate Email */}
                {hasEmails ? (
                  <button onClick={() => setShowEmails(!showEmails)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-warning-600 bg-warning-50 border border-warning-500/20 hover:bg-warning-100 transition-colors">
                    <Mail className="w-3.5 h-3.5" /> Emails ({generatedEmails.length})
                  </button>
                ) : (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-warning-600 bg-warning-50 border border-warning-500/20 hover:bg-warning-100 transition-colors">
                    <Mail className="w-3.5 h-3.5" /> Generate Email
                  </button>
                )}
                {hasEmails && (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Sparkles className="w-3.5 h-3.5" /> Generate New
                  </button>
                )}

                {/* Apply to Job */}
                <ApplyExternallyButton job={job} />

                {/* Submit Application */}
                {jobApplications.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-success-600 bg-success-50 border border-success-500/20">
                    <CheckCircle className="w-3.5 h-3.5" /> Submitted ({jobApplications.length})
                  </span>
                ) : (
                  <button onClick={onApplyToJob} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-success-600 bg-success-50 border border-success-500/20 hover:bg-success-100 transition-colors">
                    <Send className="w-3.5 h-3.5" /> Submit
                  </button>
                )}
                {jobApplications.length > 0 && (
                  <button onClick={onApplyToJob} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Send className="w-3.5 h-3.5" /> Submit More
                  </button>
                )}

                <div className="h-6 w-px bg-border mx-1" />

                <button onClick={onViewDetails} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>

                <div className="ml-auto">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                    <Trash className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* ATS Results Summary */}
              {hasATS && atsAnalysesForJob.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BarChart3 className="w-3 h-3 text-primary" /> ATS Analyses ({atsAnalysesForJob.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {atsAnalysesForJob.map((a: any) => (
                      <div key={a.analysis_id} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold",
                          a.ats_score >= 70 ? "bg-success-50 text-success-600" : a.ats_score >= 50 ? "bg-warning-50 text-warning-600" : "bg-error-50 text-error-600"
                        )}>
                          {a.ats_score}%
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{a.candidate_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{a.cv_file_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Emails */}
              {showEmails && hasEmails && (
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3 h-3 text-warning-600" /> Generated Emails ({generatedEmails.length})
                  </h4>
                  {generatedEmails.map((email: any) => (
                    <div key={email.email_id} className="border border-border/50 rounded-lg p-3 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">Subject: {email.subject}</p>
                        <button
                          onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, email.email_id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80"
                        >
                          {copiedField === email.email_id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedField === email.email_id ? "Copied!" : "Copy All"}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4 leading-relaxed">{email.body}</p>
                      <p className="text-[10px] text-muted-foreground/50">{timeAgo(email.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Description preview */}
              <p className="text-xs text-muted-foreground/60 line-clamp-2 max-w-3xl leading-relaxed">
                {job.job_description}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default JobTableView;
