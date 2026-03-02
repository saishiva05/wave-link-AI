import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  MapPin, Eye, Link, Trash, Search,
  ChevronUp, ChevronDown, ExternalLink, DollarSign,
  Clock, Building2, Wand2, FileCheck2, FileEdit,
  ChevronRight, Mail, Sparkles, Copy, Check,
  Send, CheckCircle,
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
  if (platform === "linkedin") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
          </span>
        </TooltipTrigger>
        <TooltipContent>LinkedIn</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-100 text-secondary-600">
          <Search className="w-4 h-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent>JSearch</TooltipContent>
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
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
    : score >= 50
    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all hover:scale-105 hover:shadow-md cursor-pointer", color)} title="Click to view full ATS analysis">
      <Wand2 className="w-3 h-3" />{score}%
    </button>
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
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or scrape new jobs</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-secondary-50/80 to-muted/50 border-b border-border">
                <th className="w-10 px-3 py-4">
                  <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                </th>
                <th className="w-8 px-2 py-4"></th>
                <th className="px-3 py-4 text-left font-bold text-secondary-700 text-[11px] uppercase tracking-widest w-12"></th>
                <th className="px-3 py-4 text-left font-bold text-secondary-700 text-[11px] uppercase tracking-widest cursor-pointer select-none min-w-[260px] group" onClick={() => onSort("job_title")}>
                  <div className="flex items-center gap-1.5">Job Details <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-4 text-left font-bold text-secondary-700 text-[11px] uppercase tracking-widest min-w-[130px]">Location</th>
                <th className="px-3 py-4 text-left font-bold text-secondary-700 text-[11px] uppercase tracking-widest min-w-[100px]">Salary</th>
                <th className="px-3 py-4 text-left font-bold text-secondary-700 text-[11px] uppercase tracking-widest cursor-pointer select-none min-w-[110px] group" onClick={() => onSort("scraped_at")}>
                  <div className="flex items-center gap-1.5">Scraped <SortIcon field="scraped_at" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-4 text-center font-bold text-secondary-700 text-[11px] uppercase tracking-widest w-20">
                  <span className="flex items-center justify-center gap-1"><Wand2 className="w-3 h-3" /> ATS</span>
                </th>
                <th className="px-3 py-4 text-center font-bold text-secondary-700 text-[11px] uppercase tracking-widest w-24">
                  <span className="flex items-center justify-center gap-1"><FileCheck2 className="w-3 h-3" /> CV</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
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
          selected ? "bg-primary/5" : "hover:bg-muted/30",
          isExpanded && "bg-muted/20"
        )}
        onClick={onToggle}
      >
        <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggleSelect} className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
        </td>
        <td className="px-2 py-4">
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-90")} />
        </td>
        <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
          <PlatformIcon platform={job.platform} />
        </td>
        <td className="px-3 py-4">
          <div className="space-y-1">
            <p className="text-[13px] font-bold text-secondary-900 group-hover:text-primary transition-colors line-clamp-1">{job.job_title}</p>
            <div className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
              <Building2 className="w-3 h-3" />{job.company_name}
            </div>
          </div>
        </td>
        <td className="px-3 py-4">
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/50" />{job.location}
          </span>
        </td>
        <td className="px-3 py-4">
          {job.salary_range ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <DollarSign className="w-3 h-3 shrink-0" />{job.salary_range}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </td>
        <td className="px-3 py-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />{timeAgo(job.scraped_at)}
          </span>
        </td>
        <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          {hasATS ? (
            <ATSScoreBadge score={latestATS.ats_score} onClick={onViewATSResult} />
          ) : (
            <span className="text-xs text-muted-foreground/30 italic">Not run</span>
          )}
        </td>
        <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          {updatedCVs.length > 0 ? (
            <UpdatedCVsBadge updatedCVs={updatedCVs} compact />
          ) : (
            <span className="text-xs text-muted-foreground/30 italic">None</span>
          )}
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr>
          <td colSpan={9} className="px-0 py-0">
            <div className="bg-gradient-to-r from-muted/40 via-card to-muted/40 border-t border-b border-border/50 px-6 py-5 animate-accordion-down space-y-4">
              {/* Action Buttons - Flow: Update CV first → then ATS Analysis */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Step 1: Update CV (always available) */}
                {hasUpdatedCVs ? (
                  <UpdatedCVsBadge updatedCVs={updatedCVs} />
                ) : (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:shadow-md transition-all hover:scale-[1.02]">
                    <FileEdit className="w-4 h-4" /> Update CV
                  </button>
                )}
                {hasUpdatedCVs && (
                  <button onClick={onUpdateCV} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-teal-600 hover:bg-teal-50 transition-all">
                    <FileEdit className="w-3.5 h-3.5" /> Update More
                  </button>
                )}

                {/* Step 2: ATS Analysis (only available after CV is updated) */}
                {hasUpdatedCVs ? (
                  <>
                    {hasATS ? (
                      <button onClick={onViewATSResult} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:shadow-md transition-all hover:scale-[1.02]">
                        <Eye className="w-4 h-4" /> View ATS Results ({atsAnalysesForJob.length})
                      </button>
                    ) : (
                      <button onClick={onRunATS} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:shadow-md transition-all hover:scale-[1.02]">
                        <Wand2 className="w-4 h-4" /> Run ATS Analysis
                      </button>
                    )}
                    {hasATS && (
                      <button onClick={onRunATS} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all">
                        <Wand2 className="w-3.5 h-3.5" /> Run Again
                      </button>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60">
                    <Wand2 className="w-4 h-4" /> Run ATS (Update CV first)
                  </span>
                )}

                {/* Generate Email */}
                {hasEmails ? (
                  <button onClick={() => setShowEmails(!showEmails)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:shadow-md transition-all hover:scale-[1.02]">
                    <Eye className="w-4 h-4" /> View Emails ({generatedEmails.length})
                  </button>
                ) : (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:shadow-md transition-all hover:scale-[1.02]">
                    <Mail className="w-4 h-4" /> Generate Email
                  </button>
                )}
                {hasEmails && (
                  <button onClick={onGenerateEmail} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-all">
                    <Sparkles className="w-3.5 h-3.5" /> Generate New
                  </button>
                )}

                {/* Step 4: Apply to Job (after CV updated + ATS analyzed) */}
                {hasUpdatedCVs && hasATS ? (
                  jobApplications.length > 0 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-success-100 text-success-700 border border-success-200">
                      <CheckCircle className="w-4 h-4" /> Applied ({jobApplications.length})
                    </span>
                  ) : (
                    <button onClick={onApplyToJob} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:shadow-md transition-all hover:scale-[1.02]">
                      <Send className="w-4 h-4" /> Apply to Job
                    </button>
                  )
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60">
                    <Send className="w-4 h-4" /> Apply (Complete steps first)
                  </span>
                )}
                {jobApplications.length > 0 && (
                  <button onClick={onApplyToJob} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-all">
                    <Send className="w-3.5 h-3.5" /> Apply More
                  </button>
                )}

                <div className="h-8 w-px bg-border mx-1" />

                <button onClick={onViewDetails} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <Eye className="w-4 h-4" /> View Details
                </button>

                <ApplyExternallyButton job={job} />

                <div className="ml-auto">
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-all">
                    <Trash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              {/* ATS Results Summary (if multiple) */}
              {hasATS && atsAnalysesForJob.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-xs font-bold text-secondary-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5 text-purple-500" /> ATS Analyses ({atsAnalysesForJob.length} student{atsAnalysesForJob.length > 1 ? "s" : ""})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {atsAnalysesForJob.map((a: any) => (
                      <div key={a.analysis_id} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2.5 border border-border/50">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                          a.ats_score >= 70 ? "bg-emerald-100 text-emerald-700" : a.ats_score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                        )}>
                          {a.ats_score}%
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-secondary-900 truncate">{a.candidate_name}</p>
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
                  <h4 className="text-xs font-bold text-secondary-700 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-orange-500" /> Generated Emails ({generatedEmails.length})
                  </h4>
                  {generatedEmails.map((email: any) => (
                    <div key={email.email_id} className="border border-border/50 rounded-lg p-3 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-secondary-900">Subject: {email.subject}</p>
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
              <p className="text-xs text-muted-foreground/80 line-clamp-2 max-w-3xl leading-relaxed">
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
