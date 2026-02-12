import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCVManagement } from "@/hooks/useCVManagement";
import type { CVFile, UpdatedCVFile } from "@/hooks/useCVManagement";
import CVStatsCards from "@/components/recruiter/cv/CVStatsCards";
import CVFilters from "@/components/recruiter/cv/CVFilters";
import CandidateCVSection from "@/components/recruiter/cv/CandidateCVSection";
import CVEmptyState from "@/components/recruiter/cv/CVEmptyState";
import UploadCVModal from "@/components/recruiter/cv/UploadCVModal";
import CVPreviewModal from "@/components/recruiter/cv/CVPreviewModal";
import UpdatedCVPreviewModal from "@/components/recruiter/cv/UpdatedCVPreviewModal";
import { DeleteCVModal, SetPrimaryModal } from "@/components/recruiter/cv/CVConfirmationModals";

const RecruiterCVManagement = () => {
  const navigate = useNavigate();
  const cm = useCVManagement();

  // Modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewCV, setPreviewCV] = useState<CVFile | null>(null);
  const [previewUpdatedCV, setPreviewUpdatedCV] = useState<UpdatedCVFile | null>(null);
  const [deleteCV, setDeleteCV] = useState<CVFile | null>(null);
  const [primaryCV, setPrimaryCV] = useState<CVFile | null>(null);

  const hasAnyCVs = cm.stats.totalCVs > 0 || cm.stats.totalUpdatedCVs > 0;
  const hasResults = cm.candidateGroups.length > 0;

  const currentPrimaryName = primaryCV
    ? cm.allFilteredCVs.find((cv) => cv.candidate_id === primaryCV.candidate_id && cv.is_primary)?.file_name
    : undefined;

  return (
    <>
      {/* Modals */}
      <UploadCVModal open={uploadOpen} onClose={() => setUploadOpen(false)} candidates={cm.candidates} />
      <CVPreviewModal cv={previewCV} onClose={() => setPreviewCV(null)} onDownload={cm.handleDownload} />
      <UpdatedCVPreviewModal ucv={previewUpdatedCV} onClose={() => setPreviewUpdatedCV(null)} />
      <DeleteCVModal cv={deleteCV} onClose={() => setDeleteCV(null)} onConfirm={cm.handleDelete} />
      <SetPrimaryModal cv={primaryCV} currentPrimaryName={currentPrimaryName} onClose={() => setPrimaryCV(null)} onConfirm={cm.handleSetPrimary} />

      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate("/recruiter/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-semibold">CV Management</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">CV Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage original and AI-rewritten resumes for all candidates
              </p>
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

        {/* Filters - remove view mode toggle, use candidate-grouped view */}
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

        {/* Loading */}
        {cm.isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Content - Candidate Grouped */}
        {!cm.isLoading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
            {!hasAnyCVs ? (
              <CVEmptyState type="no-cvs" onUpload={() => setUploadOpen(true)} />
            ) : !hasResults ? (
              <CVEmptyState type="no-results" onUpload={() => setUploadOpen(true)} onClearFilters={cm.clearAllFilters} />
            ) : (
              <div className="space-y-4">
                {cm.candidateGroups.map((group) => (
                  <CandidateCVSection
                    key={group.candidate_id}
                    group={group}
                    onPreview={setPreviewCV}
                    onPreviewUpdated={setPreviewUpdatedCV}
                    onDownload={cm.handleDownload}
                    onDownloadUpdated={cm.handleDownloadUpdated}
                    onSetPrimary={setPrimaryCV}
                    onDelete={setDeleteCV}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default RecruiterCVManagement;
