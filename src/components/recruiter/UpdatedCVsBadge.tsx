import { useState } from "react";
import { FileText, Download, ExternalLink, X, User, Clock } from "lucide-react";
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

  if (!updatedCVs || updatedCVs.length === 0) return null;

  const count = updatedCVs.length;

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        className={cn(
          "inline-flex items-center gap-1 font-semibold border transition-all hover:scale-105 hover:shadow-sm rounded-full",
          compact
            ? "px-2 py-0.5 text-[10px]"
            : "px-2.5 py-1 text-xs",
          "bg-info-50 text-info-600 border-info-200"
        )}
        title={`${count} updated CV${count > 1 ? "s" : ""} available`}
      >
        <FileText className={cn(compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
        {count} Updated CV{count > 1 ? "s" : ""}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
        >
          <div
            className="bg-card rounded-2xl shadow-elevated max-w-lg w-full max-h-[80vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-secondary-900 font-display">Updated CVs</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {count} AI-rewritten resume{count > 1 ? "s" : ""} for this job
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3">
              {updatedCVs.map((ucv) => (
                <div
                  key={ucv.updated_cv_id}
                  className="border border-border rounded-xl p-4 hover:border-info-200 hover:bg-info-50/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3.5 h-3.5 text-info-500 shrink-0" />
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
                      <a
                        href={ucv.updated_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-info-100 text-info-500 transition-colors"
                        title="Preview Updated CV"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={ucv.updated_file_url}
                        download
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-success-50 text-success-600 transition-colors"
                        title="Download Updated CV"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdatedCVsBadge;
