import { useState, useEffect, useRef } from "react";
import {
  Search, X, User, FileText, Calendar, Star, LayoutGrid, List, ChevronDown, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateOption, ViewMode, DateFilter, PrimaryFilter } from "@/hooks/useCVManagement";

interface CVFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  candidateFilter: string;
  onCandidateFilterChange: (v: string) => void;
  fileTypeFilter: string;
  onFileTypeFilterChange: (v: string) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (v: DateFilter) => void;
  primaryFilter: PrimaryFilter;
  onPrimaryFilterChange: (v: PrimaryFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  candidates: CandidateOption[];
  activeFilters: { label: string; onRemove: () => void }[];
  clearAllFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

/* Small dropdown reusable for filter buttons */
function FilterButton({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-11 px-3.5 rounded-lg border border-border bg-card text-sm font-medium text-neutral-600 hover:bg-muted transition-all whitespace-nowrap"
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 min-w-[220px] bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const CVFilters = ({
  search, onSearchChange,
  candidateFilter, onCandidateFilterChange,
  fileTypeFilter, onFileTypeFilterChange,
  dateFilter, onDateFilterChange,
  primaryFilter, onPrimaryFilterChange,
  viewMode, onViewModeChange,
  candidates,
  activeFilters, clearAllFilters,
  totalCount, filteredCount,
}: CVFiltersProps) => {
  const [candidateSearch, setCandidateSearch] = useState("");

  const filteredCandidates = candidates.filter((c) =>
    c.full_name.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const fileTypes = [
    { value: "", label: "All Types" },
    { value: "pdf", label: "PDF (.pdf)" },
    { value: "docx", label: "Word (.doc, .docx)" },
  ];

  const dateOptions: { value: DateFilter; label: string }[] = [
    { value: "", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "month", label: "This Month" },
    { value: "lastmonth", label: "Last Month" },
  ];

  const primaryOptions: { value: PrimaryFilter; label: string }[] = [
    { value: "", label: "All CVs" },
    { value: "primary", label: "Primary CVs Only" },
    { value: "non-primary", label: "Non-Primary CVs" },
  ];

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by candidate name, filename, or file type..."
            className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Candidate Filter */}
        <FilterButton
          label={candidateFilter ? candidates.find((c) => c.candidate_id === candidateFilter)?.full_name || "Candidate" : "All Candidates"}
          icon={<User className="w-4 h-4" />}
        >
          {(close) => (
            <div className="max-h-[300px] flex flex-col">
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    placeholder="Search candidates..."
                    className="w-full h-9 pl-8 pr-3 text-sm rounded border border-border outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[240px]">
                <button
                  onClick={() => { onCandidateFilterChange(""); close(); }}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-primary-50 transition-colors", !candidateFilter && "bg-primary-50 text-primary-700")}
                >
                  <span className="flex-1 text-left">All Candidates</span>
                  {!candidateFilter && <Check className="w-4 h-4 text-primary" />}
                </button>
                {filteredCandidates.map((c) => (
                  <button
                    key={c.candidate_id}
                    onClick={() => { onCandidateFilterChange(c.candidate_id); close(); }}
                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 transition-colors", candidateFilter === c.candidate_id && "bg-primary-100")}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                      {getInitials(c.full_name)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-secondary-900 truncate">{c.full_name}</p>
                    </div>
                    <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">{c.cv_count} CVs</span>
                    {candidateFilter === c.candidate_id && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </FilterButton>

        {/* File Type Filter */}
        <FilterButton label={fileTypeFilter ? fileTypes.find((f) => f.value === fileTypeFilter)?.label || "Type" : "All Types"} icon={<FileText className="w-4 h-4" />}>
          {(close) => (
            <div className="py-1">
              {fileTypes.map((ft) => (
                <button
                  key={ft.value}
                  onClick={() => { onFileTypeFilterChange(ft.value); close(); }}
                  className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50 transition-colors", fileTypeFilter === ft.value && "bg-primary-50 text-primary-700")}
                >
                  <span className="flex-1">{ft.label}</span>
                  {fileTypeFilter === ft.value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </FilterButton>

        {/* Date Filter */}
        <FilterButton label={dateFilter ? dateOptions.find((d) => d.value === dateFilter)?.label || "Date" : "All Time"} icon={<Calendar className="w-4 h-4" />}>
          {(close) => (
            <div className="py-1">
              {dateOptions.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { onDateFilterChange(d.value); close(); }}
                  className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50 transition-colors", dateFilter === d.value && "bg-primary-50 text-primary-700")}
                >
                  <span className="flex-1">{d.label}</span>
                  {dateFilter === d.value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </FilterButton>

        {/* Primary Filter */}
        <FilterButton label={primaryFilter ? primaryOptions.find((p) => p.value === primaryFilter)?.label || "Primary" : "All CVs"} icon={<Star className="w-4 h-4" />}>
          {(close) => (
            <div className="py-1">
              {primaryOptions.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { onPrimaryFilterChange(p.value); close(); }}
                  className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50 transition-colors", primaryFilter === p.value && "bg-primary-50 text-primary-700")}
                >
                  <span className="flex-1">{p.label}</span>
                  {primaryFilter === p.value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </FilterButton>

        {/* View Toggle */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn("w-9 h-9 rounded-l flex items-center justify-center transition-colors border border-border", viewMode === "grid" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-neutral-500 hover:bg-neutral-100")}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn("w-9 h-9 rounded-r flex items-center justify-center transition-colors border border-border -ml-px", viewMode === "list" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-neutral-500 hover:bg-neutral-100")}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filters & Results Count */}
      {(activeFilters.length > 0 || filteredCount !== totalCount) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
          {activeFilters.map((f) => (
            <span key={f.label} className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
              {f.label}
              <button onClick={f.onRemove} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-neutral-600 hover:text-foreground underline ml-1">
              Clear all filters
            </button>
          )}
          <span className="text-sm text-neutral-600 ml-auto">
            Showing {filteredCount} of {totalCount} CVs
          </span>
        </div>
      )}
    </div>
  );
};

export default CVFilters;
