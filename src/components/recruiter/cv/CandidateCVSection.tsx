import { useState } from "react";
import {
  User, FileText, Download, Eye, Star, Trash, MoreVertical, ChevronDown, ChevronUp,
  Sparkles, Briefcase, Clock, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CVFile, UpdatedCVFile, CandidateGroup } from "@/hooks/useCVManagement";
import { format, formatDistanceToNow } from "date-fns";

interface CandidateCVSectionProps {
  group: CandidateGroup;
  onPreview: (cv: CVFile) => void;
  onPreviewUpdated: (ucv: UpdatedCVFile) => void;
  onDownload: (cv: CVFile) => void;
  onDownloadUpdated: (url: string, name: string) => void;
  onSetPrimary: (cv: CVFile) => void;
  onDelete: (cv: CVFile) => void;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const CandidateCVSection = ({
  group, onPreview, onPreviewUpdated, onDownload, onDownloadUpdated, onSetPrimary, onDelete,
}: CandidateCVSectionProps) => {
  const [expanded, setExpanded] = useState(true);
  const totalDocs = group.originalCVs.length + group.updatedCVs.length;

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden hover:shadow-card transition-shadow">
      {/* Candidate Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
          {getInitials(group.candidate_name)}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-sm font-bold text-foreground truncate">{group.candidate_name}</h3>
          <p className="text-xs text-muted-foreground truncate">{group.candidate_email}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            <FileText className="w-3 h-3" /> {group.originalCVs.length} CV{group.originalCVs.length !== 1 ? "s" : ""}
          </span>
          {group.updatedCVs.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200">
              <Sparkles className="w-3 h-3" /> {group.updatedCVs.length} Rewritten
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {/* Original CVs */}
          {group.originalCVs.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Original CVs</p>
              <div className="space-y-2">
                {group.originalCVs.map((cv) => (
                  <div
                    key={cv.cv_id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all group/row"
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      cv.file_type === "pdf" ? "bg-red-50" : "bg-blue-50"
                    )}>
                      <FileText className={cn("w-4 h-4", cv.file_type === "pdf" ? "text-red-500" : "text-blue-500")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{cv.file_name}</p>
                        {cv.is_primary && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0">
                            <Star className="w-2.5 h-2.5 fill-emerald-500" /> Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{formatBytes(cv.file_size_bytes)}</span>
                        <span>{format(new Date(cv.uploaded_at), "MMM d, yyyy")}</span>
                        <span className={cn(
                          "uppercase font-medium px-1.5 py-0.5 rounded text-[10px]",
                          cv.file_type === "pdf" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {(cv.file_type || "pdf").toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => onPreview(cv)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 text-primary transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownload(cv)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSetPrimary(cv)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-50 text-amber-500 transition-colors"
                        title={cv.is_primary ? "Remove Primary" : "Set as Primary"}
                      >
                        <Star className={cn("w-4 h-4", cv.is_primary && "fill-amber-500")} />
                      </button>
                      <button
                        onClick={() => onDelete(cv)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Updated/Rewritten CVs */}
          {group.updatedCVs.length > 0 && (
            <div className={cn("px-5 py-3", group.originalCVs.length > 0 && "border-t border-dashed border-border/60")}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> AI-Rewritten Versions
              </p>
              <div className="space-y-2">
                {group.updatedCVs.map((ucv) => (
                  <div
                    key={ucv.updated_cv_id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-teal-100 bg-gradient-to-r from-teal-50/40 to-transparent hover:border-teal-200 transition-all group/row"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-teal-50">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ucv.updated_file_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {ucv.job_title}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(ucv.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        From: {ucv.original_file_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => onPreviewUpdated(ucv)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-100 text-teal-600 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={ucv.updated_file_url}
                        download
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-100 text-teal-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <a
                        href={ucv.updated_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                        title="Open in New Tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateCVSection;
