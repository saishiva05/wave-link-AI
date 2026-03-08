import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Eye, Trash, Search,
  ChevronUp, ChevronDown, ExternalLink,
  Clock, Building2, FileEdit,
  ChevronRight, Mail, Sparkles, Copy, Check,
  Send, CheckCircle, TrendingUp, BarChart3,
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
import wavelynkLogo from "@/assets/wavelynk-logo-unified.png";

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

const PlatformIcon = ({ platform }: { platform: string }) => {
  const label = getPlatformDisplayName(platform);
  const isMax = platform.toLowerCase() === "linkedin";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(
          "inline-flex items-center justify-center rounded-xl border shadow-sm transition-all hover:shadow-md",
          isMax ? "bg-gradient-to-br from-primary-50 to-primary-100/80 border-primary-200" : "bg-gradient-to-br from-secondary-50 to-secondary-100/80 border-secondary-200"
        )}>
          <img src={wavelynkLogo} alt={label} className="w-10 h-10 object-contain" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-semibold">{label}</TooltipContent>
    </Tooltip>
  );
};

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return "—"; }
};

const SortIcon = ({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) => {
  if (field !== sortField) return <ChevronUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" />;
  return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />;
};

const ATSScoreBadge = ({ score, onClick }: { score: number; onClick: () => void }) => {
  const color = score >= 70
    ? "from-emerald-50 to-emerald-100/80 text-emerald-700 border-emerald-200 hover:border-emerald-300 dark:from-emerald-950 dark:to-emerald-900/80 dark:text-emerald-400 dark:border-emerald-800 dark:hover:border-emerald-700"
    : score >= 50
    ? "from-amber-50 to-amber-100/80 text-amber-700 border-amber-200 hover:border-amber-300 dark:from-amber-950 dark:to-amber-900/80 dark:text-amber-400 dark:border-amber-800 dark:hover:border-amber-700"
    : "from-red-50 to-red-100/80 text-red-600 border-red-200 hover:border-red-300 dark:from-red-950 dark:to-red-900/80 dark:text-red-400 dark:border-red-800 dark:hover:border-red-700";
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-gradient-to-r transition-all hover:shadow-md cursor-pointer", color)} title="View ATS analysis">
      <BarChart3 className="w-3.5 h-3.5" />{score}%
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
      <button onClick={handleClick} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-50 to-info-50 text-blue-700 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all dark:from-blue-950 dark:to-blue-900/50 dark:text-blue-400 dark:border-blue-800 dark:hover:border-blue-700">
        <ArrowUpRight className="w-4 h-4" /> Apply to Job
      </button>
      {startedAt && elapsed > 0 && (
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1">
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
        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1 font-display">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or find new jobs</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-muted/60 to-muted/30 border-b border-border">
                <th className="w-10 px-3 py-4">
                  <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                </th>
                <th className="w-8 px-2 py-4"></th>
                <th className="px-3 py-4 text-left font-bold text-muted-foreground text-[11px] uppercase tracking-widest w-12"></th>
                <th className="px-3 py-4 text-left font-bold text-muted-foreground text-[11px] uppercase tracking-widest cursor-pointer select-none min-w-[260px] group" onClick={() => onSort("job_title")}>
                  <div className="flex items-center gap-1.5">Job Details <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-4 text-left font-bold text-muted-foreground text-[11px] uppercase tracking-widest min-w-[130px]">
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</div>
                </th>
                <th className="px-3 py-4 text-left font-bold text-muted-foreground text-[11px] uppercase tracking-widest min-w-[100px]">
                  <div className="flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> Salary</div>
                </th>
                <th className="px-3 py-4 text-left font-bold text-muted-foreground text-[11px] uppercase tracking-widest cursor-pointer select-none min-w-[110px] group" onClick={() => onSort("scraped_at")}>
                  <div className="flex items-center gap-1.5"><Timer className="w-3 h-3" /> Added <SortIcon field="scraped_at" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-4 text-center font-bold text-muted-foreground text-[11px] uppercase tracking-widest w-20">
                  <span className="flex items-center justify-center gap-1"><BarChart3 className="w-3 h-3" /> ATS</span>
                </th>
                <th className="px-3 py-4 text-center font-bold text-muted-foreground text-[11px] uppercase tracking-widest w-24">
                  <span className="flex items-center justify-center gap-1"><FileCheck className="w-3 h-3" /> CV</span>
                </th>
                <th className="px-3 py-4 text-center font-bold text-muted-foreground text-[11px] uppercase tracking-widest w-24">
                  <span className="flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Applicants</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
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
          "group transition-all duration-150 cursor-pointer",
          selected ? "bg-primary/[0.03]" : "hover:bg-muted/40",
          isExpanded && "bg-muted/20"
        )}
        onClick={onToggle}
      >
        <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggleSelect} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
        </td>
        <td className="px-2 py-4">
          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center transition-all", isExpanded ? "bg-primary/10" : "group-hover:bg-muted")}>
            <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-90 text-primary")} />
          </div>
        </td>
        <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
          <PlatformIcon platform={job.platform} />
        </td>
        <td className="px-3 py-4">
          <div className="space-y-1">
            <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 font-display">{job.job_title}</p>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Building2 className="w-3.5 h-3.5 opacity-60" />{job.company_name}
            </div>
          </div>
        </td>
        <td className="px-3 py-4">
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/40" />{job.location}
          </span>
        </td>
        <td className="px-3 py-4">
          {job.salary_range ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success-700 bg-gradient-to-r from-success-50 to-emerald-50 px-2.5 py-1.5 rounded-lg border border-success-200 shadow-sm dark:from-emerald-950 dark:to-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800">
              <CircleDollarSign className="w-3.5 h-3.5" />{job.salary_range}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/40 px-2 py-1">
              <CircleDollarSign className="w-3.5 h-3.5" /> —
            </span>
          )}
        </td>
        <td className="px-3 py-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40" />{timeAgo(job.scraped_at)}
          </span>
        </td>
        <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          {hasATS ? (
            <ATSScoreBadge score={latestATS.ats_score} onClick={onViewATSResult} />
          ) : (
            <span className="text-[11px] text-muted-foreground/40 italic">Not run</span>
          )}
        </td>
        <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          {updatedCVs.length > 0 ? (
            <UpdatedCVsBadge updatedCVs={updatedCVs} compact />
          ) : (
            <span className="text-[11px] text-muted-foreground/40 italic">None</span>
          )}
        </td>
        <td className="px-3 py-4 text-center">
          {job.applications_count ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-blue-50 to-info-50 text-blue-700 border border-blue-200 shadow-sm dark:from-blue-950 dark:to-blue-900/50 dark:text-blue-400 dark:border-blue-800">
              <Users className="w-3 h-3" /> {job.applications_count}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground/40">0</span>
          )}
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr>
          <td colSpan={10} className="px-0 py-0">
            <div className="bg-gradient-to-r from-muted/30 via-card to-muted/30 border-t border-b border-border/50 px-6 py-5 animate-accordion-down space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* ATS Analysis */}
                {hasATS ? (
                  <button onClick={onViewATSResult} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all dark:from-purple-950 dark:to-violet-950 dark:text-purple-400 dark:border-purple-800 dark:hover:border-purple-700">
                    <BarChart3 className="w-4 h-4" /> View ATS Results ({atsAnalysesForJob.length})
                  </button>
                ) : (
                  <button onClick={onRunATS} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all dark:from-purple-950 dark:to-violet-950 dark:text-purple-400 dark:border-purple-800 dark:hover:border-purple-700">
                    <Zap className="w-4 h-4" /> Run ATS Analysis
                  </button>
                )}
                {hasATS && (
                  <button onClick={onRunATS} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all dark:text-purple-400 dark:hover:bg-purple-950">
                    <Zap className="w-3.5 h-3.5" /> Run Again
                  </button>
                )}

                {/* Update CV */}
                {hasUpdatedCVs ? (
                  <UpdatedCVsBadge updatedCVs={updatedCVs} />
                ) : (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200 hover:border-teal-300 hover:shadow-md transition-all dark:from-teal-950 dark:to-emerald-950 dark:text-teal-400 dark:border-teal-800 dark:hover:border-teal-700">
                    <FileText className="w-4 h-4" /> Update CV
                  </button>
                )}
                {hasUpdatedCVs && (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-teal-600 hover:bg-teal-50 transition-all">
                    <FileEdit className="w-3.5 h-3.5" /> Update More
                  </button>
                )}

                {/* Generate Email */}
                {hasEmails ? (
                  <button onClick={() => setShowEmails(!showEmails)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all">
                    <Mail className="w-4 h-4" /> View Emails ({generatedEmails.length})
                  </button>
                ) : (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all">
                    <Mail className="w-4 h-4" /> Generate Email
                  </button>
                )}
                {hasEmails && (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-all">
                    <Sparkles className="w-3.5 h-3.5" /> Generate New
                  </button>
                )}

                {/* Apply to Job */}
                <ApplyExternallyButton job={job} />

                {/* Submit Application */}
                {jobApplications.length > 0 ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-success-50 to-emerald-50 text-success-700 border border-success-200">
                    <CheckCircle className="w-4 h-4" /> Submitted ({jobApplications.length})
                  </span>
                ) : (
                  <button onClick={onApplyToJob} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all">
                    <Send className="w-4 h-4" /> Submit Application
                  </button>
                )}
                {jobApplications.length > 0 && (
                  <button onClick={onApplyToJob} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-all">
                    <Send className="w-3.5 h-3.5" /> Submit More
                  </button>
                )}

                <div className="h-8 w-px bg-border mx-1" />

                <button onClick={onViewDetails} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <Eye className="w-4 h-4" /> View Details
                </button>

                <div className="ml-auto">
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-all">
                    <Trash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              {/* ATS Results Summary */}
              {hasATS && atsAnalysesForJob.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-500" /> ATS Analyses ({atsAnalysesForJob.length} candidate{atsAnalysesForJob.length > 1 ? "s" : ""})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {atsAnalysesForJob.map((a: any) => (
                      <div key={a.analysis_id} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2.5 border border-border/50">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                          a.ats_score >= 70 ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700" : a.ats_score >= 50 ? "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700" : "bg-gradient-to-br from-red-100 to-red-50 text-red-600"
                        )}>
                          {a.ats_score}%
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{a.candidate_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{a.cv_file_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Emails */}
              {showEmails && hasEmails && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-orange-500" /> Generated Emails ({generatedEmails.length})
                  </h4>
                  {generatedEmails.map((email: any) => (
                    <div key={email.email_id} className="border border-border/50 rounded-lg p-3 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">Subject: {email.subject}</p>
                        <button
                          onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, email.email_id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 hover:text-orange-700"
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
              <p className="text-xs text-muted-foreground/70 line-clamp-2 max-w-3xl leading-relaxed italic">
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
