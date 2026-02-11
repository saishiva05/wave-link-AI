import { useState } from "react";
import { FileText, Download, ExternalLink, X, User, Clock, Eye, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface UpdatedCV {
  updated_cv_id: string;
  job_id: string;
  candidate_name: string;
  updated_file_name: string;
  updated_file_url: string;
  updated_file_size_bytes: number | null;
  created_at: string;
  original_file_name: string;
}

interface UpdatedCVsBadgeProps {
  updatedCVs: UpdatedCV[];
  compact?: boolean;
}

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UpdatedCVsBadge = ({ updatedCVs, compact = false }: UpdatedCVsBadgeProps) => {
  const [showModal, setShowModal] = useState(false);
  const [previewCV, setPreviewCV] = useState<UpdatedCV | null>(null);

  if (!updatedCVs || updatedCVs.length === 0) return null;

  const count = updatedCVs.length;

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        className={cn(
          "inline-flex items-center gap-1.5 font-bold border transition-all hover:scale-105 hover:shadow-md rounded-full",
          compact ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs",
          "bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700 border-teal-200 shadow-sm"
        )}
        title={`${count} updated CV${count > 1 ? "s" : ""} available`}
      >
        <FileText className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
        {count} Updated
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { e.stopPropagation(); setShowModal(false); setPreviewCV(null); }}
        >
          <div
            className={cn(
              "bg-card rounded-2xl shadow-2xl flex flex-col animate-scale-in overflow-hidden",
              previewCV ? "max-w-5xl w-full max-h-[92vh]" : "max-w-lg w-full max-h-[80vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0 bg-gradient-to-r from-teal-50/80 to-emerald-50/80">
              <div className="flex items-center gap-3">
                {previewCV && (
                  <button
                    onClick={() => setPreviewCV(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/80 text-teal-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold text-secondary-900 font-display">
                    {previewCV ? "Resume Preview" : "Updated CVs"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {previewCV
                      ? `${previewCV.candidate_name} — ${previewCV.updated_file_name}`
                      : `${count} AI-rewritten resume${count > 1 ? "s" : ""} for this job`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); setPreviewCV(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewCV ? (
              /* Preview View */
              <>
                <div className="flex-1 overflow-hidden bg-muted/30">
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewCV.updated_file_url)}&embedded=true`}
                    className="w-full h-full min-h-[60vh] border-0"
                    title={`Preview of ${previewCV.updated_file_name}`}
                  />
                </div>
                <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={previewCV.updated_file_url}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                    <a
                      href={previewCV.updated_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Open in New Tab
                    </a>
                  </div>
                  <button
                    onClick={() => setPreviewCV(null)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Back to List
                  </button>
                </div>
              </>
            ) : (
              /* List View */
              <>
                <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3">
                  {updatedCVs.map((ucv) => (
                    <div
                      key={ucv.updated_cv_id}
                      className="border border-border rounded-xl p-4 hover:border-teal-200 hover:bg-teal-50/30 transition-all group/card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span className="text-sm font-semibold text-secondary-900 truncate">
                              {ucv.candidate_name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            <span className="font-medium">Updated:</span> {ucv.updated_file_name}
                          </p>
                          <p className="text-xs text-muted-foreground/70 truncate">
                            <span className="font-medium">Original:</span> {ucv.original_file_name}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(ucv.created_at), { addSuffix: true })}
                            </span>
                            {ucv.updated_file_size_bytes && (
                              <span>{formatBytes(ucv.updated_file_size_bytes)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setPreviewCV(ucv)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-100 text-teal-500 transition-colors"
                            title="Preview Updated CV"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={ucv.updated_file_url}
                            download
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="Download Updated CV"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-border shrink-0">
                  <button
                    onClick={() => { setShowModal(false); setPreviewCV(null); }}
                    className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UpdatedCVsBadge;
