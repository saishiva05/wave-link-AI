import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Eye, Trash, Search,
  ChevronUp, ChevronDown, ExternalLink,
  Clock, Building2, FileEdit,
  ChevronRight, Mail, Sparkles, Copy, Check,
  Send, CheckCircle, BarChart3,
  FileCheck, Zap, ArrowUpRight, CircleDollarSign,
  Timer, Users, FileText, MoreVertical,
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

const ATSScoreBadge = ({ score, onClick }: { score: number; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors",
      score >= 70
        ? "bg-primary/15 text-primary border border-primary/20"
        : score >= 50
          ? "bg-warning-50 text-warning-600 border border-warning-500/20"
          : "bg-error-50 text-error-600 border border-error-500/20"
    )}
    title="View ATS analysis"
  >
    {score}
  </button>
);

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
      <button onClick={handleClick} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-info-600 bg-info-50 border border-info-500/20 hover:bg-info-100 transition-colors">
        <ArrowUpRight className="w-3 h-3" /> Apply
      </button>
      {startedAt && elapsed > 0 && (
        <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-1">
          <Timer className="w-2.5 h-2.5" /> {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
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
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Search className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No jobs found</h3>
        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary" />
                </th>
                <th className="w-7 px-1 py-3"></th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider cursor-pointer select-none group" onClick={() => onSort("job_title")}>
                  <div className="flex items-center gap-1">Description <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
                  <div className="flex items-center gap-1">Area</div>
                </th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
                  <div className="flex items-center gap-1">Vol</div>
                </th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider cursor-pointer select-none group" onClick={() => onSort("scraped_at")}>
                  <div className="flex items-center gap-1">Weight <SortIcon field="scraped_at" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3 text-center font-medium text-muted-foreground text-[10px] uppercase tracking-wider">ATS</th>
                <th className="w-10 px-2 py-3"></th>
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
      <tr
        className={cn(
          "border-b border-border transition-colors cursor-pointer",
          selected ? "bg-primary/[0.04]" : "hover:bg-muted/30",
          isExpanded && "bg-muted/20"
        )}
        onClick={onToggle}
      >
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggleSelect} className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary" />
        </td>
        <td className="px-1 py-3">
          <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-90 text-primary")} />
        </td>
        <td className="px-3 py-3 min-w-[240px]">
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight">{job.job_title}</p>
            <p className="text-[10px] text-primary font-medium mt-0.5">{job.company_name}</p>
          </div>
        </td>
        <td className="px-3 py-3">
          <span className="text-[11px] text-muted-foreground">{job.location}</span>
        </td>
        <td className="px-3 py-3">
          {job.salary_range ? (
            <span className="text-[11px] text-foreground font-medium">{job.salary_range}</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-3 py-3">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(job.scraped_at)}</span>
        </td>
        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
          {hasATS ? (
            <ATSScoreBadge score={latestATS.ats_score} onClick={onViewATSResult} />
          ) : (
            <span className="text-[10px] text-muted-foreground/40">—</span>
          )}
        </td>
        <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="px-0 py-0">
            <div className="bg-muted/10 border-b border-border px-6 py-4 animate-accordion-down space-y-3">
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {hasATS ? (
                  <button onClick={onViewATSResult} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <BarChart3 className="w-3 h-3" /> View ATS ({atsAnalysesForJob.length})
                  </button>
                ) : (
                  <button onClick={onRunATS} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <Zap className="w-3 h-3" /> Run ATS
                  </button>
                )}
                {hasATS && (
                  <button onClick={onRunATS} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Zap className="w-3 h-3" /> Run Again
                  </button>
                )}

                {hasUpdatedCVs ? (
                  <UpdatedCVsBadge updatedCVs={updatedCVs} />
                ) : (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <FileText className="w-3 h-3" /> Update CV
                  </button>
                )}
                {hasUpdatedCVs && (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <FileEdit className="w-3 h-3" /> Update More
                  </button>
                )}

                {hasEmails ? (
                  <button onClick={() => setShowEmails(!showEmails)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-warning-600 bg-warning-50 border border-warning-500/20 hover:bg-warning-100 transition-colors">
                    <Mail className="w-3 h-3" /> Emails ({generatedEmails.length})
                  </button>
                ) : (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-warning-600 bg-warning-50 border border-warning-500/20 hover:bg-warning-100 transition-colors">
                    <Mail className="w-3 h-3" /> Generate Email
                  </button>
                )}
                {hasEmails && (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Sparkles className="w-3 h-3" /> Generate New
                  </button>
                )}

                <ApplyExternallyButton job={job} />

                {jobApplications.length > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-success-600 bg-success-50 border border-success-500/20">
                    <CheckCircle className="w-3 h-3" /> Submitted ({jobApplications.length})
                  </span>
                ) : (
                  <button onClick={onApplyToJob} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-success-600 bg-success-50 border border-success-500/20 hover:bg-success-100 transition-colors">
                    <Send className="w-3 h-3" /> Submit
                  </button>
                )}
                {jobApplications.length > 0 && (
                  <button onClick={onApplyToJob} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Send className="w-3 h-3" /> Submit More
                  </button>
                )}

                <div className="h-5 w-px bg-border mx-1" />

                <button onClick={onViewDetails} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Eye className="w-3 h-3" /> Details
                </button>

                <div className="ml-auto">
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-destructive hover:bg-destructive/5 transition-colors">
                    <Trash className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>

              {/* ATS Results Summary */}
              {hasATS && atsAnalysesForJob.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-3">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3 text-primary" /> ATS Analyses ({atsAnalysesForJob.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {atsAnalysesForJob.map((a: any) => (
                      <div key={a.analysis_id} className="flex items-center gap-2.5 bg-muted/20 rounded-lg px-2.5 py-2 border border-border/50">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold",
                          a.ats_score >= 70 ? "bg-primary/15 text-primary" : a.ats_score >= 50 ? "bg-warning-50 text-warning-600" : "bg-error-50 text-error-600"
                        )}>
                          {a.ats_score}%
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{a.candidate_name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{a.cv_file_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Emails */}
              {showEmails && hasEmails && (
                <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-warning-600" /> Generated Emails ({generatedEmails.length})
                  </h4>
                  {generatedEmails.map((email: any) => (
                    <div key={email.email_id} className="border border-border/50 rounded-lg p-2.5 bg-muted/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-foreground">Subject: {email.subject}</p>
                        <button
                          onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, email.email_id)}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80"
                        >
                          {copiedField === email.email_id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedField === email.email_id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground whitespace-pre-wrap line-clamp-3 leading-relaxed">{email.body}</p>
                      <p className="text-[9px] text-muted-foreground/50">{timeAgo(email.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground/50 line-clamp-2 max-w-3xl leading-relaxed">
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