import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Plus, Globe, Calendar, Briefcase, Building, LayoutGrid, List,
  Sparkles, Download, Trash, X, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrapedJob, mapDbJob } from "@/data/mockScrapedJobs";
import { useScrapedJobs, useRecruiterCandidates, useRecruiterCVs, useJobATSAnalyses, useJobUpdatedCVs } from "@/hooks/useRecruiterData";
import ATSResultsView, { type ATSAnalysisResult } from "@/components/recruiter/ATSResultsView";
import { useAuth } from "@/hooks/useAuth";
import FilterDropdown from "@/components/recruiter/FilterDropdown";
import JobTableView from "@/components/recruiter/JobTableView";
import JobCardView from "@/components/recruiter/JobCardView";
import JobDetailsModal from "@/components/recruiter/JobDetailsModal";
import ATSMatcherModal from "@/components/recruiter/ATSMatcherModal";
import UpdateCVModal from "@/components/recruiter/UpdateCVModal";
import GenerateEmailModal from "@/components/recruiter/GenerateEmailModal";

const platformOptions = [
  { value: "", label: "All Platforms" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "jsearch", label: "JSearch" },
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

const ITEMS_PER_PAGE = 10;

const RecruiterScrapedJobs = () => {
  const navigate = useNavigate();
  const { recruiterId } = useAuth();

  // Filters
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [contractFilter, setContractFilter] = useState<string[]>([]);
  const [workModeFilter, setWorkModeFilter] = useState("");

  // View & sort
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [sortField, setSortField] = useState("published_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [detailJob, setDetailJob] = useState<ScrapedJob | null>(null);
  const [atsJob, setAtsJob] = useState<ScrapedJob | null>(null);
  const [updateCVJob, setUpdateCVJob] = useState<ScrapedJob | null>(null);
  const [viewATSResult, setViewATSResult] = useState<{ result: ATSAnalysisResult; job: ScrapedJob } | null>(null);
  const [emailJob, setEmailJob] = useState<ScrapedJob | null>(null);
  // Fetch jobs
  const { data, isLoading } = useScrapedJobs(recruiterId, {
    search, platform: platformFilter, contractType: contractFilter,
    workMode: workModeFilter, dateRange: dateFilter,
    sortField, sortDir, page, perPage: ITEMS_PER_PAGE,
  });

  // Fetch candidates & CVs for ATS / Update CV modals
  const { data: candidatesData = [] } = useRecruiterCandidates();
  const { data: cvsData = [] } = useRecruiterCVs();

  const jobs: ScrapedJob[] = (data?.jobs || []).map(mapDbJob);
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Fetch ATS analyses for current page's jobs
  const jobIds = jobs.map((j) => j.id);
  const { data: atsAnalyses = {} } = useJobATSAnalyses(jobIds);
  const { data: updatedCVsMap = {} } = useJobUpdatedCVs(jobIds);

  // Active filters
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (platformFilter) activeFilters.push({ label: `Platform: ${platformFilter === "linkedin" ? "LinkedIn" : "JSearch"}`, onRemove: () => setPlatformFilter("") });
  if (dateFilter) activeFilters.push({ label: `Date: ${dateOptions.find((d) => d.value === dateFilter)?.label}`, onRemove: () => setDateFilter("") });
  if (contractFilter.length > 0) activeFilters.push({ label: `Type: ${contractFilter.join(", ")}`, onRemove: () => setContractFilter([]) });
  if (workModeFilter) activeFilters.push({ label: `Mode: ${workModeFilter}`, onRemove: () => setWorkModeFilter("") });

  const clearAllFilters = () => {
    setSearch(""); setPlatformFilter(""); setDateFilter(""); setContractFilter([]); setWorkModeFilter(""); setPage(1);
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
    const analysis = atsAnalyses[job.id];
    if (analysis) {
      // Unwrap the raw webhook format [{ text: { ... } }] if needed
      let result = analysis.analysis_result;
      if (Array.isArray(result) && result[0]?.text) {
        result = result[0].text;
      }
      setViewATSResult({ result: result as ATSAnalysisResult, job });
    }
  };

  return (
    <>
      <JobDetailsModal job={detailJob} onClose={() => setDetailJob(null)} onRunATS={(j) => { setDetailJob(null); setAtsJob(j); }} />
      <ATSMatcherModal job={atsJob} candidates={candidatesData} cvs={cvsData} onClose={() => setAtsJob(null)} />
      <UpdateCVModal job={updateCVJob} candidates={candidatesData} cvs={cvsData} onClose={() => setUpdateCVJob(null)} />
      <GenerateEmailModal job={emailJob} onClose={() => setEmailJob(null)} />

      {/* ATS Results Viewer Modal */}
      {viewATSResult && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewATSResult(null)}>
          <div className="bg-card rounded-2xl shadow-elevated max-w-3xl w-full max-h-[92vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-secondary-900 font-display">ATS Analysis Results</h2>
                <p className="text-sm text-muted-foreground mt-1">{viewATSResult.job.job_title} at {viewATSResult.job.company_name}</p>
              </div>
              <button onClick={() => setViewATSResult(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-neutral-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <ATSResultsView result={viewATSResult.result} />
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end shrink-0">
              <Button variant="portal" onClick={() => setViewATSResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate("/recruiter/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-secondary-900 font-semibold">Scraped Jobs</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">Scraped Jobs</h1>
              <p className="text-base text-muted-foreground mt-1">{totalCount.toLocaleString()} jobs in your database</p>
            </div>
            <Button variant="portal" onClick={() => navigate("/recruiter/scrape-jobs")}>
              <Plus className="w-4 h-4" /> Scrape New Jobs
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by job title, company, or location..."
                className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <FilterDropdown label="All Platforms" icon={<Globe className="w-4 h-4" />} value={platformFilter} options={platformOptions} onChange={(v) => { setPlatformFilter(v as string); setPage(1); }} />
            <FilterDropdown label="All Time" icon={<Calendar className="w-4 h-4" />} value={dateFilter} options={dateOptions} onChange={(v) => { setDateFilter(v as string); setPage(1); }} />
            <FilterDropdown label="All Types" icon={<Briefcase className="w-4 h-4" />} value={contractFilter} options={contractOptions} onChange={(v) => { setContractFilter(v as string[]); setPage(1); }} multi />
            <FilterDropdown label="All Modes" icon={<Building className="w-4 h-4" />} value={workModeFilter} options={workModeOptions} onChange={(v) => { setWorkModeFilter(v as string); setPage(1); }} />
            <div className="flex gap-1 ml-auto">
              <button onClick={() => setViewMode("table")} className={cn("w-9 h-9 rounded flex items-center justify-center transition-colors", viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")} title="Table view"><List className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("card")} className={cn("w-9 h-9 rounded flex items-center justify-center transition-colors", viewMode === "card" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")} title="Card view"><LayoutGrid className="w-4 h-4" /></button>
            </div>
          </div>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
              {activeFilters.map((f) => (
                <span key={f.label} className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
                  {f.label}
                  <button onClick={f.onRemove} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">Clear all filters</button>
            </div>
          )}
        </motion.div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="sticky top-16 z-20 bg-primary rounded-xl px-5 py-3.5 flex items-center justify-between shadow-card">
            <span className="text-sm font-medium text-primary-foreground">{selectedIds.size} job{selectedIds.size > 1 ? "s" : ""} selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-white text-primary hover:bg-white/90 text-xs font-semibold"><Sparkles className="w-3.5 h-3.5" /> Run ATS</Button>
              <Button size="sm" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-xs"><Download className="w-3.5 h-3.5" /> Export</Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 text-xs"><Trash className="w-3.5 h-3.5" /> Delete</Button>
              <button onClick={() => setSelectedIds(new Set())} className="text-primary-foreground/80 hover:text-primary-foreground ml-2"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}

        {/* Jobs View */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20 bg-card border border-border rounded-xl">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">No jobs found</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                {search || activeFilters.length > 0 ? "Try adjusting your filters or search term." : "Start scraping jobs to build your database."}
              </p>
              {search || activeFilters.length > 0 ? (
                <Button variant="outline" onClick={clearAllFilters}>Clear Filters</Button>
              ) : (
                <Button variant="portal" onClick={() => navigate("/recruiter/scrape-jobs")}>
                  <Plus className="w-4 h-4" /> Scrape New Jobs
                </Button>
              )}
            </div>
          ) : viewMode === "table" ? (
            <JobTableView
              jobs={jobs} selectedIds={selectedIds} onToggleSelect={toggleSelect} onSelectAll={selectAll}
              allSelected={jobs.length > 0 && selectedIds.size === jobs.length}
               onViewDetails={setDetailJob} onRunATS={setAtsJob} onUpdateCV={setUpdateCVJob} onGenerateEmail={setEmailJob}
              onViewATSResult={handleViewATSResult}
              atsAnalyses={atsAnalyses}
              updatedCVsMap={updatedCVsMap}
              sortField={sortField} sortDir={sortDir} onSort={handleSort}
            />
          ) : (
            <JobCardView
              jobs={jobs} selectedIds={selectedIds} onToggleSelect={toggleSelect}
               onViewDetails={setDetailJob} onRunATS={setAtsJob} onUpdateCV={setUpdateCVJob} onGenerateEmail={setEmailJob}
              onViewATSResult={handleViewATSResult}
              atsAnalyses={atsAnalyses}
              updatedCVsMap={updatedCVsMap}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-xl px-5 py-4 shadow-card">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} jobs
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted")}>{p}</button>
              ))}
              {totalPages > 5 && <span className="text-muted-foreground px-1">...</span>}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecruiterScrapedJobs;
