import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import type { CandidateApplication } from "@/hooks/useCandidateDashboard";
import ApplicationFilters from "@/components/candidate/ApplicationFilters";
import RecentApplicationsList from "@/components/candidate/RecentApplicationsList";
import ApplicationCard from "@/components/candidate/ApplicationCard";
import ApplicationDetailsModal from "@/components/candidate/ApplicationDetailsModal";

const CandidateApplicationsPage = () => {
  const navigate = useNavigate();
  const cd = useCandidateDashboard();
  const [detailApp, setDetailApp] = useState<CandidateApplication | null>(null);

  return (
    <>
      <ApplicationDetailsModal application={detailApp} onClose={() => setDetailApp(null)} />
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate("/candidate/dashboard")} className="text-neutral-500 hover:text-primary transition-colors">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="text-secondary-900 font-semibold">My Applications</span>
          </nav>
          <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">My Applications</h1>
          <p className="text-base text-muted-foreground mt-1">{cd.allFilteredApplications.length} job applications submitted on your behalf</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <ApplicationFilters
            search={cd.search} onSearchChange={(v) => { cd.setSearch(v); cd.setPage(1); }}
            statusFilter={cd.statusFilter} onStatusFilterChange={(v) => { cd.setStatusFilter(v); cd.setPage(1); }}
            dateFilter={cd.dateFilter} onDateFilterChange={(v) => { cd.setDateFilter(v); cd.setPage(1); }}
            typeFilter={cd.typeFilter} onTypeFilterChange={(v) => { cd.setTypeFilter(v); cd.setPage(1); }}
            locationFilter={cd.locationFilter} onLocationFilterChange={(v) => { cd.setLocationFilter(v); cd.setPage(1); }}
            viewMode={cd.viewMode} onViewModeChange={cd.setViewMode}
            locations={cd.uniqueLocations} activeFilters={cd.activeFilters} clearAllFilters={cd.clearAllFilters}
            totalCount={cd.stats.total} filteredCount={cd.allFilteredApplications.length}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {cd.allFilteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-700">No matching applications</h3>
              <p className="text-sm text-neutral-600 mt-1">Try adjusting your filters or search term</p>
              <button onClick={cd.clearAllFilters} className="mt-4 text-sm font-medium text-primary hover:underline">Clear Filters</button>
            </div>
          ) : cd.viewMode === "list" ? (
            <RecentApplicationsList applications={cd.applications} onViewDetails={setDetailApp} onViewAll={() => {}} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {cd.applications.map((app) => (
                <ApplicationCard key={app.application_id} application={app} onViewDetails={() => setDetailApp(app)} />
              ))}
            </div>
          )}
        </motion.div>

        {cd.allFilteredApplications.length > cd.perPage && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 shadow-xs">
            <p className="text-sm text-neutral-600">Showing {(cd.page - 1) * cd.perPage + 1}–{Math.min(cd.page * cd.perPage, cd.allFilteredApplications.length)} of {cd.allFilteredApplications.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => cd.setPage(Math.max(1, cd.page - 1))} disabled={cd.page === 1} className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(cd.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => cd.setPage(p)} className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", cd.page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted")}>{p}</button>
              ))}
              <button onClick={() => cd.setPage(Math.min(cd.totalPages, cd.page + 1))} disabled={cd.page === cd.totalPages} className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateApplicationsPage;
