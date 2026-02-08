import { Search, X, Filter, Calendar, Briefcase, MapPin, LayoutGrid, List, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { StatusFilter, DateFilterType, AppViewMode } from "@/hooks/useCandidateDashboard";

interface ApplicationFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  dateFilter: DateFilterType;
  onDateFilterChange: (v: DateFilterType) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  locationFilter: string;
  onLocationFilterChange: (v: string) => void;
  viewMode: AppViewMode;
  onViewModeChange: (v: AppViewMode) => void;
  locations: string[];
  activeFilters: { label: string; onRemove: () => void }[];
  clearAllFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

function DropdownFilter({ label, icon, children }: { label: string; icon: React.ReactNode; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 h-11 px-3.5 rounded-lg border border-border bg-card text-sm font-medium text-neutral-600 hover:bg-muted transition-all whitespace-nowrap">
        {icon}<span>{label}</span><svg className={cn("w-4 h-4 text-neutral-400 transition-transform", open && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && <div className="absolute z-30 mt-1 min-w-[200px] bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">{children(() => setOpen(false))}</div>}
    </div>
  );
}

const ApplicationFilters = ({
  search, onSearchChange, statusFilter, onStatusFilterChange, dateFilter, onDateFilterChange,
  typeFilter, onTypeFilterChange, locationFilter, onLocationFilterChange,
  viewMode, onViewModeChange, locations, activeFilters, clearAllFilters, totalCount, filteredCount,
}: ApplicationFiltersProps) => {

  const statuses: { value: StatusFilter; label: string }[] = [
    { value: "", label: "All Statuses" }, { value: "pending", label: "Pending" }, { value: "submitted", label: "In Review" },
    { value: "interview_scheduled", label: "Interview Scheduled" }, { value: "offer_received", label: "Offer Received" },
    { value: "hired", label: "Hired" }, { value: "rejected", label: "Rejected" },
  ];

  const dates: { value: DateFilterType; label: string }[] = [
    { value: "", label: "All Time" }, { value: "7d", label: "Last 7 Days" }, { value: "30d", label: "Last 30 Days" },
    { value: "month", label: "This Month" }, { value: "3months", label: "Last 3 Months" },
  ];

  const types = ["", "Full-time", "Part-time", "Contract", "Internship"];

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search by job title, company, or location..."
            className="w-full h-11 pl-10 pr-9 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
          {search && <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"><X className="w-4 h-4" /></button>}
        </div>

        <DropdownFilter label={statusFilter ? statuses.find((s) => s.value === statusFilter)?.label || "Status" : "All Statuses"} icon={<Filter className="w-4 h-4" />}>
          {(close) => <div className="py-1">{statuses.map((s) => (
            <button key={s.value} onClick={() => { onStatusFilterChange(s.value); close(); }} className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50", statusFilter === s.value && "bg-primary-50 text-primary-700")}>
              <span className="flex-1">{s.label}</span>{statusFilter === s.value && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}</div>}
        </DropdownFilter>

        <DropdownFilter label={dateFilter ? dates.find((d) => d.value === dateFilter)?.label || "Date" : "All Time"} icon={<Calendar className="w-4 h-4" />}>
          {(close) => <div className="py-1">{dates.map((d) => (
            <button key={d.value} onClick={() => { onDateFilterChange(d.value); close(); }} className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50", dateFilter === d.value && "bg-primary-50 text-primary-700")}>
              <span className="flex-1">{d.label}</span>{dateFilter === d.value && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}</div>}
        </DropdownFilter>

        <DropdownFilter label={typeFilter || "All Types"} icon={<Briefcase className="w-4 h-4" />}>
          {(close) => <div className="py-1">{types.map((t) => (
            <button key={t} onClick={() => { onTypeFilterChange(t); close(); }} className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50", typeFilter === t && "bg-primary-50 text-primary-700")}>
              <span className="flex-1">{t || "All Types"}</span>{typeFilter === t && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}</div>}
        </DropdownFilter>

        <DropdownFilter label={locationFilter || "All Locations"} icon={<MapPin className="w-4 h-4" />}>
          {(close) => <div className="py-1 max-h-[240px] overflow-y-auto">
            <button onClick={() => { onLocationFilterChange(""); close(); }} className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50", !locationFilter && "bg-primary-50 text-primary-700")}>
              <span className="flex-1">All Locations</span>{!locationFilter && <Check className="w-4 h-4 text-primary" />}
            </button>
            {locations.map((l) => (
              <button key={l} onClick={() => { onLocationFilterChange(l); close(); }} className={cn("w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-50", locationFilter === l && "bg-primary-50 text-primary-700")}>
                <span className="flex-1">{l}</span>{locationFilter === l && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>}
        </DropdownFilter>

        <div className="flex gap-1 ml-auto">
          <button onClick={() => onViewModeChange("list")} className={cn("w-9 h-9 rounded-l flex items-center justify-center transition-colors border border-border", viewMode === "list" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-neutral-500 hover:bg-neutral-100")} title="List view"><List className="w-4 h-4" /></button>
          <button onClick={() => onViewModeChange("grid")} className={cn("w-9 h-9 rounded-r flex items-center justify-center transition-colors border border-border -ml-px", viewMode === "grid" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-neutral-500 hover:bg-neutral-100")} title="Grid view"><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {(activeFilters.length > 0 || filteredCount !== totalCount) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
          {activeFilters.map((f) => (
            <span key={f.label} className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
              {f.label}<button onClick={f.onRemove} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200"><X className="w-3 h-3" /></button>
            </span>
          ))}
          {activeFilters.length > 0 && <button onClick={clearAllFilters} className="text-xs text-neutral-600 hover:text-foreground underline ml-1">Clear all</button>}
          <span className="text-sm text-neutral-600 ml-auto">Showing {filteredCount} of {totalCount} applications</span>
        </div>
      )}
    </div>
  );
};

export default ApplicationFilters;
