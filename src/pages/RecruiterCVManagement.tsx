import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCVManagement } from "@/hooks/useCVManagement";
import type { CVFile } from "@/hooks/useCVManagement";
import CVStatsCards from "@/components/recruiter/cv/CVStatsCards";
import CVFilters from "@/components/recruiter/cv/CVFilters";
import CVBulkActions from "@/components/recruiter/cv/CVBulkActions";
import CVGridView from "@/components/recruiter/cv/CVGridView";
import CVListView from "@/components/recruiter/cv/CVListView";
import CVPagination from "@/components/recruiter/cv/CVPagination";
import CVEmptyState from "@/components/recruiter/cv/CVEmptyState";
import UploadCVModal from "@/components/recruiter/cv/UploadCVModal";
import CVPreviewModal from "@/components/recruiter/cv/CVPreviewModal";
import CVATSModal from "@/components/recruiter/cv/CVATSModal";
import { DeleteCVModal, SetPrimaryModal } from "@/components/recruiter/cv/CVConfirmationModals";

const RecruiterCVManagement = () => {
  const navigate = useNavigate();
  const cm = useCVManagement();

  // Modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewCV, setPreviewCV] = useState<CVFile | null>(null);
  const [atsCV, setAtsCV] = useState<CVFile | null>(null);
  const [deleteCV, setDeleteCV] = useState<CVFile | null>(null);
  const [primaryCV, setPrimaryCV] = useState<CVFile | null>(null);

  const hasAnyCVs = cm.stats.totalCVs > 0;
  const hasResults = cm.allFilteredCVs.length > 0;

  const currentPrimaryName = primaryCV
    ? cm.allFilteredCVs.find((cv) => cv.candidate_id === primaryCV.candidate_id && cv.is_primary)?.file_name
    : undefined;

  return (
    <>
      {/* Modals */}
      <UploadCVModal open={uploadOpen} onClose={() => setUploadOpen(false)} candidates={cm.candidates} />
      <CVPreviewModal cv={previewCV} onClose={() => setPreviewCV(null)} onRunATS={(cv) => { setPreviewCV(null); setAtsCV(cv); }} onDownload={cm.handleDownload} />
      <CVATSModal cv={atsCV} jobs={cm.jobs} onClose={() => setAtsCV(null)} />
      <DeleteCVModal cv={deleteCV} onClose={() => setDeleteCV(null)} onConfirm={cm.handleDelete} />
      <SetPrimaryModal cv={primaryCV} currentPrimaryName={currentPrimaryName} onClose={() => setPrimaryCV(null)} onConfirm={cm.handleSetPrimary} />

      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Breadcrumbs & Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate("/recruiter/dashboard")} className="text-neutral-500 hover:text-primary transition-colors">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="text-secondary-900 font-semibold">CV Management</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">CV Management</h1>
              <p className="text-base text-muted-foreground mt-1">Upload and manage candidate resumes</p>
            </div>
            <Button variant="portal" size="lg" onClick={() => setUploadOpen(true)}>
              <FileUp className="w-5 h-5" />
              Upload CV
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <CVStatsCards stats={cm.stats} />
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <CVFilters
            search={cm.search}
            onSearchChange={(v) => { cm.setSearch(v); cm.setPage(1); }}
            candidateFilter={cm.candidateFilter}
            onCandidateFilterChange={(v) => { cm.setCandidateFilter(v); cm.setPage(1); }}
            fileTypeFilter={cm.fileTypeFilter}
            onFileTypeFilterChange={(v) => { cm.setFileTypeFilter(v); cm.setPage(1); }}
            dateFilter={cm.dateFilter}
            onDateFilterChange={(v) => { cm.setDateFilter(v); cm.setPage(1); }}
            primaryFilter={cm.primaryFilter}
            onPrimaryFilterChange={(v) => { cm.setPrimaryFilter(v); cm.setPage(1); }}
            viewMode={cm.viewMode}
            onViewModeChange={cm.setViewMode}
            candidates={cm.candidates}
            activeFilters={cm.activeFilters}
            clearAllFilters={cm.clearAllFilters}
            totalCount={cm.stats.totalCVs}
            filteredCount={cm.allFilteredCVs.length}
          />
        </motion.div>

        {/* Bulk Actions */}
        <CVBulkActions
          count={cm.selectedIds.size}
          onDownload={() => {}}
          onDelete={() => {}}
          onClear={cm.clearSelection}
          onSelectAll={cm.selectAll}
          allSelected={cm.cvs.length > 0 && cm.selectedIds.size === cm.cvs.length}
        />

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          {!hasAnyCVs ? (
            <CVEmptyState type="no-cvs" onUpload={() => setUploadOpen(true)} />
          ) : !hasResults ? (
            <CVEmptyState type="no-results" onUpload={() => setUploadOpen(true)} onClearFilters={cm.clearAllFilters} />
          ) : cm.viewMode === "grid" ? (
            <CVGridView
              cvs={cm.cvs}
              selectedIds={cm.selectedIds}
              onToggleSelect={cm.toggleSelect}
              onPreview={setPreviewCV}
              onRunATS={setAtsCV}
              onDownload={cm.handleDownload}
              onSetPrimary={setPrimaryCV}
              onDelete={setDeleteCV}
            />
          ) : (
            <CVListView
              cvs={cm.cvs}
              selectedIds={cm.selectedIds}
              onToggleSelect={cm.toggleSelect}
              onSelectAll={cm.selectAll}
              allSelected={cm.cvs.length > 0 && cm.selectedIds.size === cm.cvs.length}
              onPreview={setPreviewCV}
              onRunATS={setAtsCV}
              onDownload={cm.handleDownload}
              onSetPrimary={setPrimaryCV}
              onDelete={setDeleteCV}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {hasResults && (
          <CVPagination
            page={cm.page}
            totalPages={cm.totalPages}
            perPage={cm.perPage}
            totalCount={cm.stats.totalCVs}
            filteredCount={cm.allFilteredCVs.length}
            onPageChange={cm.setPage}
            onPerPageChange={(v) => { cm.setPerPage(v); cm.setPage(1); }}
          />
        )}
      </div>
    </>
  );
};

export default RecruiterCVManagement;
