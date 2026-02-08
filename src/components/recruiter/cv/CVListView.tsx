import { useState, useRef, useEffect } from "react";
import {
  MoreVertical, Eye, Download, Sparkles, Star, Trash, FileText, Paperclip, Calendar,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CVFile } from "@/hooks/useCVManagement";
import { format, formatDistanceToNow } from "date-fns";

interface CVListViewProps {
  cvs: CVFile[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onPreview: (cv: CVFile) => void;
  onRunATS: (cv: CVFile) => void;
  onDownload: (cv: CVFile) => void;
  onSetPrimary: (cv: CVFile) => void;
  onDelete: (cv: CVFile) => void;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RowActionMenu({ cv, onPreview, onDownload, onRunATS, onSetPrimary, onDelete }: {
  cv: CVFile;
  onPreview: () => void;
  onDownload: () => void;
  onRunATS: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-primary transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 w-[200px] bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">
          <button onClick={() => { onPreview(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
            <Eye className="w-4 h-4 text-neutral-600" /> Preview CV
          </button>
          <button onClick={() => { onDownload(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
            <Download className="w-4 h-4 text-neutral-600" /> Download CV
          </button>
          <button onClick={() => { onRunATS(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
            <Sparkles className="w-4 h-4 text-primary" /> Run ATS Analysis
          </button>
          <div className="border-t border-border my-1" />
          <button onClick={() => { onSetPrimary(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-neutral-100 transition-colors">
            <Star className="w-4 h-4 text-warning-500" /> {cv.is_primary ? "Remove Primary" : "Set as Primary"}
          </button>
          <div className="border-t border-border my-1" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-error-500 hover:bg-error-50 transition-colors">
            <Trash className="w-4 h-4" /> Delete CV
          </button>
        </div>
      )}
    </div>
  );
}

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const CVListView = ({ cvs, selectedIds, onToggleSelect, onSelectAll, allSelected, onPreview, onRunATS, onDownload, onSetPrimary, onDelete }: CVListViewProps) => {
  const isPdf = (type: string | null) => type === "pdf";

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-100 hover:bg-neutral-100">
            <TableHead className="w-[40px]">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
            </TableHead>
            <TableHead className="w-[60px]">File</TableHead>
            <TableHead className="min-w-[200px]">Filename</TableHead>
            <TableHead className="min-w-[180px]">Candidate</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="w-[90px]">Size</TableHead>
            <TableHead className="w-[130px]">Uploaded</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cvs.map((cv) => (
            <TableRow
              key={cv.cv_id}
              className={cn(
                "transition-colors",
                selectedIds.has(cv.cv_id) && "bg-primary-50 border-l-4 border-l-primary"
              )}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(cv.cv_id)}
                  onCheckedChange={() => onToggleSelect(cv.cv_id)}
                />
              </TableCell>
              <TableCell>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", isPdf(cv.file_type) ? "bg-error-50" : "bg-info-50")}>
                  <FileText className={cn("w-5 h-5", isPdf(cv.file_type) ? "text-error-500" : "text-info-500")} />
                </div>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => onPreview(cv)}
                  className="flex items-center gap-2 text-sm font-medium text-secondary-900 hover:text-primary hover:underline transition-colors truncate max-w-[260px]"
                >
                  <Paperclip className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                  {cv.file_name}
                </button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                    {getInitials(cv.candidate_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">{cv.candidate_name}</p>
                    <p className="text-xs text-neutral-600 truncate">{cv.candidate_email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", isPdf(cv.file_type) ? "bg-info-100 text-info-700" : "bg-primary-100 text-primary-700")}>
                  {(cv.file_type || "pdf").toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="text-sm text-neutral-700">{formatBytes(cv.file_size_bytes)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-neutral-600">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  {format(new Date(cv.uploaded_at), "MMM d, yyyy")}
                </div>
              </TableCell>
              <TableCell>
                {cv.is_primary ? (
                  <span className="flex items-center gap-1 bg-success-100 text-success-700 text-xs font-medium px-2.5 py-1 rounded-full w-fit">
                    <Star className="w-3 h-3 fill-success-500" /> Primary
                  </span>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <RowActionMenu
                  cv={cv}
                  onPreview={() => onPreview(cv)}
                  onDownload={() => onDownload(cv)}
                  onRunATS={() => onRunATS(cv)}
                  onSetPrimary={() => onSetPrimary(cv)}
                  onDelete={() => onDelete(cv)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CVListView;
