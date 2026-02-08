import CVCard from "./CVCard";
import type { CVFile } from "@/hooks/useCVManagement";

interface CVGridViewProps {
  cvs: CVFile[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onPreview: (cv: CVFile) => void;
  onRunATS: (cv: CVFile) => void;
  onDownload: (cv: CVFile) => void;
  onSetPrimary: (cv: CVFile) => void;
  onDelete: (cv: CVFile) => void;
}

const CVGridView = ({ cvs, selectedIds, onToggleSelect, onPreview, onRunATS, onDownload, onSetPrimary, onDelete }: CVGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {cvs.map((cv) => (
        <CVCard
          key={cv.cv_id}
          cv={cv}
          selected={selectedIds.has(cv.cv_id)}
          onToggleSelect={() => onToggleSelect(cv.cv_id)}
          onPreview={() => onPreview(cv)}
          onRunATS={() => onRunATS(cv)}
          onDownload={() => onDownload(cv)}
          onSetPrimary={() => onSetPrimary(cv)}
          onDelete={() => onDelete(cv)}
        />
      ))}
    </div>
  );
};

export default CVGridView;
