import { X, Download, Sparkles, Calendar, HardDrive, User, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CVFile } from "@/hooks/useCVManagement";
import { format } from "date-fns";
import { useState } from "react";

interface CVPreviewModalProps {
  cv: CVFile | null;
  onClose: () => void;
  onRunATS: (cv: CVFile) => void;
  onDownload: (cv: CVFile) => void;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CVPreviewModal = ({ cv, onClose, onRunATS, onDownload }: CVPreviewModalProps) => {
  const [zoom, setZoom] = useState(100);

  if (!cv) return null;

  const isPdf = cv.file_type === "pdf";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-[1000px] w-full animate-scale-in max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-secondary-900 truncate">{cv.file_name}</h2>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-neutral-600">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {cv.candidate_name}</span>
              <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatBytes(cv.file_size_bytes)}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(cv.uploaded_at), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={() => onDownload(cv)}
              className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Download CV"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => { onClose(); onRunATS(cv); }}
              className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Run ATS Analysis"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Controls */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="w-8 h-8 rounded border border-border bg-card flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-neutral-700 min-w-[40px] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="w-8 h-8 rounded border border-border bg-card flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="w-8 h-8 rounded border border-border bg-card flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
              title="Fit to width"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 bg-neutral-100 overflow-auto min-h-[400px]">
          {isPdf ? (
            <div className="bg-card rounded-lg shadow-card flex items-center justify-center min-h-[500px]" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
              <div className="text-center p-12">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Download className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">PDF Preview</h3>
                <p className="text-sm text-neutral-600 mb-6 max-w-md">
                  PDF preview will be available when connected to Supabase Storage. For now, download the file to view it.
                </p>
                <button
                  onClick={() => onDownload(cv)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download CV
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-card flex items-center justify-center min-h-[300px] p-12 text-center">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Word Document</h3>
                <p className="text-sm text-neutral-600 mb-6">Download to view Word documents</p>
                <button
                  onClick={() => onDownload(cv)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download CV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVPreviewModal;
