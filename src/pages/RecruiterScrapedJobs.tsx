import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Globe,
  Calendar,
  Briefcase,
  Building,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  Trash,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockScrapedJobs, ScrapedJob } from "@/data/mockScrapedJobs";
import FilterDropdown from "@/components/recruiter/FilterDropdown";
import JobTableView from "@/components/recruiter/JobTableView";
import JobCardView from "@/components/recruiter/JobCardView";
import JobDetailsModal from "@/components/recruiter/JobDetailsModal";
import ATSMatcherModal from "@/components/recruiter/ATSMatcherModal";

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

  // Filter logic
  const filteredJobs = useMemo(() => {
    let jobs = [...mockScrapedJobs];

    // Search
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.job_title.toLowerCase().includes(q) ||
          j.company_name.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }

    // Platform
    if (platformFilter) {
      jobs = jobs.filter((j) => j.platform === platformFilter);
    }

    // Date
    if (dateFilter) {
      const now = new Date();
      jobs = jobs.filter((j) => {
        const d = new Date(j.published_date);
        if (dateFilter === "today") return d.toDateString() === now.toDateString();
        if (dateFilter === "7d") return now.getTime() - d.getTime() <= 7 * 86400000;
        if (dateFilter === "30d") return now.getTime() - d.getTime() <= 30 * 86400000;
        return true;
      });
    }

    // Contract type (multi)
    if (contractFilter.length > 0) {
      jobs = jobs.filter((j) => contractFilter.includes(j.contract_type));
    }

    // Work mode
    if (workModeFilter) {
      jobs = jobs.filter((j) => j.work_type === workModeFilter);
    }

    // Sort
    jobs.sort((a, b) => {
      const aVal = a[sortField as keyof ScrapedJob] || "";
      const bVal = b[sortField as keyof ScrapedJob] || "";
      if (sortDir === "asc") return String(aVal).localeCompare(String(bVal));
      return String(bVal).localeCompare(String(aVal));
    });

    return jobs;
  }, [search, platformFilter, dateFilter, contractFilter, workModeFilter, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Active filters
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (platformFilter) activeFilters.push({ label: `Platform: ${platformFilter === "linkedin" ? "LinkedIn" : "JSearch"}`, onRemove: () => setPlatformFilter("") });
  if (dateFilter) activeFilters.push({ label: `Date: ${dateOptions.find((d) => d.value === dateFilter)?.label}`, onRemove: () => setDateFilter("") });
  if (contractFilter.length > 0) activeFilters.push({ label: `Type: ${contractFilter.join(", ")}`, onRemove: () => setContractFilter([]) });
  if (workModeFilter) activeFilters.push({ label: `Mode: ${workModeFilter}`, onRemove: () => setWorkModeFilter("") });

  const clearAllFilters = () => {
    setSearch("");
    setPlatformFilter("");
    setDateFilter("");
    setContractFilter([]);
    setWorkModeFilter("");
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === paginatedJobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedJobs.map((j) => j.id)));
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <>
      <JobDetailsModal job={detailJob} onClose={() => setDetailJob(null)} onRunATS={(j) => setAtsJob(j)} />
      <ATSMatcherModal job={atsJob} onClose={() => setAtsJob(null)} />

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate("/recruiter/dashboard")} className="text-neutral-500 hover:text-primary transition-colors">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="text-secondary-900 font-semibold">Scraped Jobs</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">Scraped Jobs</h1>
              <p className="text-base text-muted-foreground mt-1">{filteredJobs.length.toLocaleString()} jobs in your database</p>
            </div>
            <Button variant="portal" onClick={() => navigate("/recruiter/scrape-jobs")}>
              <Plus className="w-4 h-4" />
              Scrape New Jobs
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-5 shadow-card"
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by job title, company, or location..."
                className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <FilterDropdown label="All Platforms" icon={<Globe className="w-4 h-4" />} value={platformFilter} options={platformOptions} onChange={(v) => { setPlatformFilter(v as string); setPage(1); }} />
            <FilterDropdown label="All Time" icon={<Calendar className="w-4 h-4" />} value={dateFilter} options={dateOptions} onChange={(v) => { setDateFilter(v as string); setPage(1); }} />
            <FilterDropdown label="All Types" icon={<Briefcase className="w-4 h-4" />} value={contractFilter} options={contractOptions} onChange={(v) => { setContractFilter(v as string[]); setPage(1); }} multi />
            <FilterDropdown label="All Modes" icon={<Building className="w-4 h-4" />} value={workModeFilter} options={workModeOptions} onChange={(v) => { setWorkModeFilter(v as string); setPage(1); }} />

            {/* View toggle */}
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => setViewMode("table")}
                className={cn("w-9 h-9 rounded flex items-center justify-center transition-colors", viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-muted text-neutral-500 hover:bg-neutral-200")}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={cn("w-9 h-9 rounded flex items-center justify-center transition-colors", viewMode === "card" ? "bg-primary text-primary-foreground" : "bg-muted text-neutral-500 hover:bg-neutral-200")}
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
              {activeFilters.map((f) => (
                <span key={f.label} className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
                  {f.label}
                  <button onClick={f.onRemove} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearAllFilters} className="text-xs text-neutral-600 hover:text-foreground underline ml-1">
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-16 z-20 bg-primary rounded-xl px-5 py-3.5 flex items-center justify-between shadow-card"
          >
            <span className="text-sm font-medium text-primary-foreground">{selectedIds.size} job{selectedIds.size > 1 ? "s" : ""} selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-white text-primary-700 hover:bg-white/90 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Run ATS
              </Button>
              <Button size="sm" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10 text-xs">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-white/10 text-xs">
                <Trash className="w-3.5 h-3.5" /> Delete
              </Button>
              <button onClick={() => setSelectedIds(new Set())} className="text-primary-foreground/80 hover:text-white ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Jobs View */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {viewMode === "table" ? (
            <JobTableView
              jobs={paginatedJobs}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelectAll={selectAll}
              allSelected={paginatedJobs.length > 0 && selectedIds.size === paginatedJobs.length}
              onViewDetails={setDetailJob}
              onRunATS={setAtsJob}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          ) : (
            <JobCardView
              jobs={paginatedJobs}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onViewDetails={setDetailJob}
              onRunATS={setAtsJob}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-xl px-5 py-4 shadow-card">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length} jobs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-8 h-8 rounded text-sm font-medium transition-colors",
                      page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-muted-foreground px-1">...</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecruiterScrapedJobs;
