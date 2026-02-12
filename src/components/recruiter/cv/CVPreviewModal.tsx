import { X, Download, ExternalLink, Calendar, HardDrive, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CVFile } from "@/hooks/useCVManagement";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CVPreviewModalProps {
  cv: CVFile | null;
  onClose: () => void;
  onDownload: (cv: CVFile) => void;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CVPreviewModal = ({ cv, onClose, onDownload }: CVPreviewModalProps) => {
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Generate a signed URL for preview
  const getSignedUrl = async (fileUrl: string) => {
    const urlParts = fileUrl.split("/cvs-bucket/");
    if (urlParts[1]) {
      const { data, error } = await supabase.storage
        .from("cvs-bucket")
        .createSignedUrl(urlParts[1], 3600); // 1 hour
      if (!error && data?.signedUrl) return data.signedUrl;
    }
    return fileUrl;
  };

  // Load preview URL when cv changes
  useState(() => {
    if (cv) {
      setLoading(true);
      setError(false);
      getSignedUrl(cv.file_url).then((url) => {
        setPreviewUrl(url);
        setLoading(false);
      }).catch(() => {
        setError(true);
        setLoading(false);
      });
    }
  });

  if (!cv) return null;

  const googleViewerUrl = previewUrl
    ? `https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`
    : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-5xl w-full animate-scale-in max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground font-display truncate">{cv.file_name}</h2>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {cv.candidate_name}</span>
              <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatBytes(cv.file_size_bytes)}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(cv.uploaded_at), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={() => onDownload(cv)}
              className="h-9 px-3 rounded-lg border border-border flex items-center gap-2 text-sm font-medium hover:bg-muted transition-colors"
              title="Download CV"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-lg border border-border flex items-center gap-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open
              </a>
            )}
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
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center">
              <p className="text-muted-foreground mb-4">Preview unavailable. Download to view the file.</p>
              <button
                onClick={() => onDownload(cv)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" /> Download CV
              </button>
            </div>
          )}
          {!loading && !error && googleViewerUrl && (
            <iframe
              src={googleViewerUrl}
              className="w-full h-full min-h-[500px] border-0"
              title={`Preview of ${cv.file_name}`}
              onLoad={() => setLoading(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CVPreviewModal;
