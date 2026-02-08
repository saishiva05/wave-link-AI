import { useState, useRef, useEffect } from "react";
import {
  MoreVertical, Eye, Download, Sparkles, Star, Trash, User, HardDrive, Clock, FileText,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CVFile } from "@/hooks/useCVManagement";
import { formatDistanceToNow } from "date-fns";

interface CVCardProps {
  cv: CVFile;
  selected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  onRunATS: () => void;
  onDownload: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CVCard = ({ cv, selected, onToggleSelect, onPreview, onRunATS, onDownload, onSetPrimary, onDelete }: CVCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isPdf = cv.file_type === "pdf";
  const fileColor = isPdf ? "text-error-500" : "text-info-500";
  const fileBg = isPdf ? "bg-error-50" : "bg-info-50";

  const timeAgo = formatDistanceToNow(new Date(cv.uploaded_at), { addSuffix: true });

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-h-[280px] relative group",
        selected ? "border-2 border-primary bg-primary-50 shadow-focus" : "border-border hover:border-primary-300"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            className="w-5 h-5"
          />
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-primary transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 w-[200px] bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">
              <button onClick={() => { onPreview(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
                <Eye className="w-4 h-4 text-neutral-600" /> Preview CV
              </button>
              <button onClick={() => { onDownload(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
                <Download className="w-4 h-4 text-neutral-600" /> Download CV
              </button>
              <button onClick={() => { onRunATS(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
                <Sparkles className="w-4 h-4 text-primary" /> Run ATS Analysis
              </button>
              <div className="border-t border-border my-1" />
              <button onClick={() => { onSetPrimary(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
                <Star className="w-4 h-4 text-warning-500" /> {cv.is_primary ? "Remove Primary" : "Set as Primary"}
              </button>
              <div className="border-t border-border my-1" />
              <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-error-500 hover:bg-error-50 transition-colors">
                <Trash className="w-4 h-4" /> Delete CV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Icon */}
      <div className="flex justify-center mb-4">
        <div className={cn("w-[100px] h-[100px] rounded-full flex items-center justify-center", fileBg)}>
          <FileText className={cn("w-12 h-12", fileColor)} />
        </div>
      </div>

      {/* File Details */}
      <p className="text-sm font-semibold text-secondary-900 text-center line-clamp-2 leading-5 mb-2">{cv.file_name}</p>
      <div className="flex items-center justify-center gap-1.5 text-sm text-primary-600 mb-3">
        <User className="w-3.5 h-3.5" />
        <span className="font-medium">{cv.candidate_name}</span>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-center gap-4 text-xs text-neutral-600 mb-3">
        <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatBytes(cv.file_size_bytes)}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo}</span>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
        {cv.is_primary && (
          <span className="flex items-center gap-1 bg-success-100 text-success-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3 fill-success-500" /> Primary CV
          </span>
        )}
        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", isPdf ? "bg-info-100 text-info-700" : "bg-primary-100 text-primary-700")}>
          {(cv.file_type || "pdf").toUpperCase()}
        </span>
      </div>

      {/* Usage Stats */}
      {cv.ats_usage_count > 0 && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-md p-2 mt-auto">
          <p className="text-xs text-neutral-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-warning-500" /> Used in {cv.ats_usage_count} ATS analyses
          </p>
          {cv.last_used_for_ats_at && (
            <p className="text-xs text-neutral-500 mt-0.5">
              Last used: {formatDistanceToNow(new Date(cv.last_used_for_ats_at), { addSuffix: true })}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button
          onClick={onRunATS}
          className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md hover:bg-primary-600 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> Run ATS
        </button>
      </div>
    </div>
  );
};

export default CVCard;
