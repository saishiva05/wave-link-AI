import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Plus, Globe, Calendar, Briefcase, Building, LayoutGrid, List,
  Sparkles, Download, Trash, X, ChevronLeft, ChevronRight, Loader2, FileDown, Users, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { exportJobsToCSV } from "@/lib/exportJobsCSV";
import { ScrapedJob, mapDbJob } from "@/data/mockScrapedJobs";
import { useScrapedJobs, useRecruiterCandidates, useRecruiterCVs, useJobATSAnalyses, useJobUpdatedCVs, useJobGeneratedEmails, useJobApplicationsMap } from "@/hooks/useRecruiterData";
import ATSResultsView, { type ATSAnalysisResult } from "@/components/recruiter/ATSResultsView";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import FilterDropdown from "@/components/recruiter/FilterDropdown";
import JobTableView from "@/components/recruiter/JobTableView";
import JobCardView from "@/components/recruiter/JobCardView";
import JobDetailsModal from "@/components/recruiter/JobDetailsModal";
import ATSMatcherModal from "@/components/recruiter/ATSMatcherModal";
import UpdateCVModal from "@/components/recruiter/UpdateCVModal";
import GenerateEmailModal from "@/components/recruiter/GenerateEmailModal";
import CreateJobModal from "@/components/recruiter/CreateJobModal";
import ApplyToJobModal from "@/components/recruiter/ApplyToJobModal";
import BatchATSModal from "@/components/recruiter/BatchATSModal";

const platformOptions = [
  { value: "", label: "All Platforms" },
  { value: "linkedin", label: "WaveLynk Max" },
  { value: "jsearch", label: "WaveLynk Pro" },
];

const dateOptions = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

const contractOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Temporary", label: "Temporary" },
  { value: "Internship", label: "Internship" },
  { value: "Volunteer", label: "Volunteer" },
];

const workModeOptions = [
  { value: "", label: "All Modes" },
  { value: "On-site", label: "On-site" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
];

const applicantsOptions = [
  { value: "", label: "All Jobs" },
  { value: "has_applicants", label: "With Applicant Data" },
  { value: "none", label: "No Applicant Data" },
];

const applyTypeOptions = [
  { value: "", label: "All Apply Types" },
  { value: "Easy_Apply", label: "Easy Apply" },
  { value: "External", label: "External" },
];

const ITEMS_PER_PAGE = 10;

const RecruiterScrapedJobs = () => {
  const navigate = useNavigate();
  const { recruiterId } = useAuth();

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [contractFilter, setContractFilter] = useState<string[]>([]);
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [applicantsFilter, setApplicantsFilter] = useState("");
  const [applyTypeFilter, setApplyTypeFilter] = useState("");

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [sortField, setSortField] = useState("scraped_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [detailJob, setDetailJob] = useState<ScrapedJob | null>(null);
  const [atsJob, setAtsJob] = useState<ScrapedJob | null>(null);
  const [updateCVJob, setUpdateCVJob] = useState<ScrapedJob | null>(null);
  const [viewATSResult, setViewATSResult] = useState<{ result: ATSAnalysisResult; job: ScrapedJob } | null>(null);
  const [emailJob, setEmailJob] = useState<ScrapedJob | null>(null);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<ScrapedJob | null>(null);
  const [batchATSOpen, setBatchATSOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteJob, setDeleteJob] = useState<ScrapedJob | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useScrapedJobs(recruiterId, {
    search, platform: platformFilter, contractType: contractFilter,
    workMode: workModeFilter, dateRange: dateFilter,
    sortField, sortDir, page, perPage: ITEMS_PER_PAGE,
    applicantsRange: applicantsFilter, applyType: applyTypeFilter,
  });

  const { data: candidatesData = [] } = useRecruiterCandidates();
  const { data: cvsData = [] } = useRecruiterCVs();

  const jobs: ScrapedJob[] = (data?.jobs || []).map(mapDbJob);
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const jobIds = jobs.map((j) => j.id);
  const { data: atsAnalyses = {} } = useJobATSAnalyses(jobIds);
  const { data: updatedCVsMap = {} } = useJobUpdatedCVs(jobIds);
  const { data: generatedEmailsMap = {} } = useJobGeneratedEmails(jobIds);
  const { data: jobApplicationsMap = {} } = useJobApplicationsMap(jobIds);

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (platformFilter) activeFilters.push({ label: `Platform: ${platformFilter === "linkedin" ? "WaveLynk Max" : "WaveLynk Pro"}`, onRemove: () => setPlatformFilter("") });
  if (dateFilter) activeFilters.push({ label: `Date: ${dateOptions.find((d) => d.value === dateFilter)?.label}`, onRemove: () => setDateFilter("") });
  if (contractFilter.length > 0) activeFilters.push({ label: `Type: ${contractFilter.join(", ")}`, onRemove: () => setContractFilter([]) });
  if (workModeFilter) activeFilters.push({ label: `Mode: ${workModeFilter}`, onRemove: () => setWorkModeFilter("") });
  if (applicantsFilter) activeFilters.push({ label: `Applicants: ${applicantsOptions.find((a) => a.value === applicantsFilter)?.label}`, onRemove: () => setApplicantsFilter("") });
  if (applyTypeFilter) activeFilters.push({ label: `Apply: ${applyTypeFilter === "Easy_Apply" ? "Easy Apply" : "External"}`, onRemove: () => setApplyTypeFilter("") });

  const clearAllFilters = () => {
    setSearch(""); setPlatformFilter(""); setDateFilter(""); setContractFilter([]); setWorkModeFilter(""); setApplicantsFilter(""); setApplyTypeFilter(""); setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const selectAll = () => {
    if (selectedIds.size === jobs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(jobs.map((j) => j.id)));
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const handleViewATSResult = (job: ScrapedJob) => {
    const analyses = atsAnalyses[job.id];
    if (analyses && analyses.length > 0) {
      const analysis = analyses[0];
      let result = analysis.analysis_result;
      if (Array.isArray(result) && result[0]?.text) {
        result = result[0].text;
      }
      setViewATSResult({ result: result as ATSAnalysisResult, job });
    }
  };

  const handleExportCSV = async () => {
    if (!recruiterId) return;
    setIsExporting(true);
    try {
      const { success, count } = await exportJobsToCSV({
        recruiterId, search, platform: platformFilter,
        contractType: contractFilter, workMode: workModeFilter,
        dateRange: dateFilter, applicantsRange: applicantsFilter,
      });
      if (success) {
        toast({ title: "Export Complete", description: `${count} jobs exported to CSV` });
      } else {
        toast({ title: "No Data", description: "No jobs match the current filters to export", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const queryClient = useQueryClient();

  const performJobDelete = async (jobIds: string[]) => {
    if (jobIds.length === 0) return;
    setIsDeleting(true);
    try {
      // Cascade-delete dependent rows that may not have ON DELETE CASCADE
      await supabase.from("ats_analyses").delete().in("job_id", jobIds);
      await supabase.from("updated_cvs").delete().in("job_id", jobIds);
      await supabase.from("generated_emails").delete().in("job_id", jobIds);
      await supabase.from("job_applications").delete().in("job_id", jobIds);
      const { error } = await supabase.from("scraped_jobs").delete().in("job_id", jobIds);
      if (error) throw error;
      toast({ title: jobIds.length > 1 ? `${jobIds.length} jobs deleted` : "Job deleted" });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "scraped-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "job-ats"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "job-updated-cvs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "job-generated-emails"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "job-applications-map"] });
      setSelectedIds(new Set());
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message || "", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteJob(null);
      setBulkDeleteOpen(false);
    }
  };

  return (
    <>
      <JobDetailsModal job={detailJob} onClose={() => setDetailJob(null)} onRunATS={(j) => { setDetailJob(null); setAtsJob(j); }} />
      <ATSMatcherModal job={atsJob} candidates={candidatesData} cvs={cvsData} onClose={() => setAtsJob(null)} />
      <UpdateCVModal job={updateCVJob} candidates={candidatesData} cvs={cvsData} onClose={() => setUpdateCVJob(null)} />
      <GenerateEmailModal job={emailJob} onClose={() => setEmailJob(null)} />
      {recruiterId && <CreateJobModal open={createJobOpen} onOpenChange={setCreateJobOpen} recruiterId={recruiterId} />}
      <ApplyToJobModal
        job={applyJob}
        candidates={candidatesData}
        cvs={cvsData}
        updatedCVs={applyJob ? (updatedCVsMap[applyJob.id] || []) : []}
        atsAnalyses={applyJob ? (atsAnalyses[applyJob.id] || []) : []}
        onClose={() => setApplyJob(null)}
      />
      <BatchATSModal
        open={batchATSOpen}
        jobs={jobs}
        candidates={candidatesData}
        cvs={cvsData}
        atsAnalyses={atsAnalyses}
        onClose={() => { setBatchATSOpen(false); setSelectedIds(new Set()); }}
      />

      {viewATSResult && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewATSResult(null)}>
          <div className="bg-card rounded-xl border border-border max-w-3xl w-full max-h-[92vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">ATS Analysis Results</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{viewATSResult.job.job_title} at {viewATSResult.job.company_name}</p>
              </div>
              <button onClick={() => setViewATSResult(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <ATSResultsView result={viewATSResult.result} />
            </div>
            <div className="px-6 py-3 border-t border-border flex items-center justify-end shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewATSResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <nav className="flex items-center gap-1.5 text-sm mb-3">
            <button onClick={() => navigate("/recruiter/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Job Board</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Job Board</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your recruitment pipeline</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting || totalCount === 0}>
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBatchATSOpen(true)}>
                <Sparkles className="w-3.5 h-3.5" /> Batch ATS
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCreateJobOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Add Job
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/recruiter/find-jobs")}>
                <Plus className="w-3.5 h-3.5" /> Find New Jobs
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }} className="bg-card border border-border rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search jobs, companies, locations..."
                className="w-full h-10 pl-9 pr-8 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <FilterDropdown label="All Platforms" icon={<Globe className="w-3.5 h-3.5" />} value={platformFilter} options={platformOptions} onChange={(v) => { setPlatformFilter(v as string); setPage(1); }} />
            <FilterDropdown label="All Time" icon={<Calendar className="w-3.5 h-3.5" />} value={dateFilter} options={dateOptions} onChange={(v) => { setDateFilter(v as string); setPage(1); }} />
            <FilterDropdown label="All Types" icon={<Briefcase className="w-3.5 h-3.5" />} value={contractFilter} options={contractOptions} onChange={(v) => { setContractFilter(v as string[]); setPage(1); }} multi />
            <FilterDropdown label="All Modes" icon={<Building className="w-3.5 h-3.5" />} value={workModeFilter} options={workModeOptions} onChange={(v) => { setWorkModeFilter(v as string); setPage(1); }} />
            <FilterDropdown label="Applicant Data" icon={<Users className="w-3.5 h-3.5" />} value={applicantsFilter} options={applicantsOptions} onChange={(v) => { setApplicantsFilter(v as string); setPage(1); }} />
            <FilterDropdown label="All Apply Types" icon={<Briefcase className="w-3.5 h-3.5" />} value={applyTypeFilter} options={applyTypeOptions} onChange={(v) => { setApplyTypeFilter(v as string); setPage(1); }} />
            <div className="flex gap-1 ml-auto">
              <button onClick={() => setViewMode("table")} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")} title="Table view"><List className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode("card")} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", viewMode === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")} title="Card view"><LayoutGrid className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
              {activeFilters.map((f) => (
                <span key={f.label} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
                  {f.label}
                  <button onClick={f.onRemove} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">Clear all</button>
            </div>
          )}
        </motion.div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="sticky top-16 z-20 bg-primary rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-primary-foreground">{selectedIds.size} job{selectedIds.size > 1 ? "s" : ""} selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs h-8" onClick={() => setBatchATSOpen(true)}><Sparkles className="w-3 h-3" /> Run ATS</Button>
              <Button size="sm" className="bg-card text-foreground border border-border hover:bg-muted text-xs h-8" onClick={handleExportCSV} disabled={isExporting}>
                {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                Export
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 text-xs h-8"><Trash className="w-3 h-3" /></Button>
              <button onClick={() => setSelectedIds(new Set())} className="text-primary-foreground/70 hover:text-primary-foreground ml-1"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}

        {/* Jobs View */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20 bg-card border border-border rounded-xl">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-3 text-sm text-muted-foreground">Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No jobs found</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-5">
                {search || activeFilters.length > 0 ? "Try adjusting your filters or search term." : "Start finding jobs to build your database."}
              </p>
              {search || activeFilters.length > 0 ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>Clear Filters</Button>
              ) : (
                <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => navigate("/recruiter/find-jobs")}>
                  <Plus className="w-3.5 h-3.5" /> Find New Jobs
                </Button>
              )}
            </div>
          ) : viewMode === "table" ? (
            <JobTableView
              jobs={jobs} selectedIds={selectedIds} onToggleSelect={toggleSelect} onSelectAll={selectAll}
              allSelected={jobs.length > 0 && selectedIds.size === jobs.length}
              onViewDetails={setDetailJob} onRunATS={setAtsJob} onUpdateCV={setUpdateCVJob} onGenerateEmail={setEmailJob}
              onViewATSResult={handleViewATSResult}
              onApplyToJob={setApplyJob}
              atsAnalyses={atsAnalyses}
              updatedCVsMap={updatedCVsMap}
              generatedEmailsMap={generatedEmailsMap}
              jobApplicationsMap={jobApplicationsMap}
              sortField={sortField} sortDir={sortDir} onSort={handleSort}
            />
          ) : (
            <JobCardView
              jobs={jobs} selectedIds={selectedIds} onToggleSelect={toggleSelect}
              onViewDetails={setDetailJob} onRunATS={setAtsJob} onUpdateCV={setUpdateCVJob} onGenerateEmail={setEmailJob}
              onViewATSResult={handleViewATSResult}
              onApplyToJob={setApplyJob}
              atsAnalyses={atsAnalyses}
              updatedCVsMap={updatedCVsMap}
              generatedEmailsMap={generatedEmailsMap}
              jobApplicationsMap={jobApplicationsMap}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {totalCount > 0 && totalPages > 1 && (() => {
          const GROUP_SIZE = 5;
          const currentGroup = Math.floor((page - 1) / GROUP_SIZE);
          const groupStart = currentGroup * GROUP_SIZE + 1;
          const groupEnd = Math.min(groupStart + GROUP_SIZE - 1, totalPages);
          const hasPrevGroup = groupStart > 1;
          const hasNextGroup = groupEnd < totalPages;

          return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-xl px-5 py-4">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} jobs
              </p>
              <div className="flex items-center gap-1.5">
                {/* Prev page */}
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>

                {/* Prev group indicator */}
                {hasPrevGroup && (
                  <>
                    <button onClick={() => setPage(1)} className="w-8 h-8 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors">1</button>
                    <button onClick={() => setPage(groupStart - 1)} className="w-8 h-8 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors">«</button>
                  </>
                )}

                {/* Current group pages */}
                {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={cn("w-8 h-8 rounded-lg text-xs font-medium transition-colors", page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted")}>{p}</button>
                ))}

                {/* Next group indicator */}
                {hasNextGroup && (
                  <>
                    <button onClick={() => setPage(groupEnd + 1)} className="w-8 h-8 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors">»</button>
                    <button onClick={() => setPage(totalPages)} className="w-8 h-8 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors">{totalPages}</button>
                  </>
                )}

                {/* Next page */}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
};

export default RecruiterScrapedJobs;
