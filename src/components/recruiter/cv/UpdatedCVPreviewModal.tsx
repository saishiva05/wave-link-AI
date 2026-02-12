import { X, Download, ExternalLink, ArrowLeft, Loader2, Briefcase, User, Clock } from "lucide-react";
import type { UpdatedCVFile } from "@/hooks/useCVManagement";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface UpdatedCVPreviewModalProps {
  ucv: UpdatedCVFile | null;
  onClose: () => void;
}

const UpdatedCVPreviewModal = ({ ucv, onClose }: UpdatedCVPreviewModalProps) => {
  const [loading, setLoading] = useState(true);

  if (!ucv) return null;

  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(ucv.updated_file_url)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-5xl w-full animate-scale-in max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0 bg-gradient-to-r from-teal-50/80 to-emerald-50/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700 rounded">AI Rewritten</span>
            </div>
            <h2 className="text-lg font-bold text-foreground font-display truncate">{ucv.updated_file_name}</h2>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ucv.candidate_name}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {ucv.job_title} @ {ucv.company_name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(ucv.created_at), { addSuffix: true })}</span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1">Original: {ucv.original_file_name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <a
              href={ucv.updated_file_url}
              download
              className="h-9 px-3 rounded-lg bg-teal-600 text-white flex items-center gap-2 text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </a>
            <a
              href={ucv.updated_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg border border-border flex items-center gap-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Open
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden bg-muted/30 min-h-[500px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}
          <iframe
            src={googleViewerUrl}
            className="w-full h-full min-h-[500px] border-0"
            title={`Preview of ${ucv.updated_file_name}`}
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdatedCVPreviewModal;
