import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CVPaginationProps {
  page: number;
  totalPages: number;
  perPage: number;
  totalCount: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const CVPagination = ({ page, totalPages, perPage, totalCount, filteredCount, onPageChange, onPerPageChange }: CVPaginationProps) => {
  if (filteredCount === 0) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, filteredCount);

  // Generate page numbers
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-xl px-5 py-4 shadow-xs">
      <div className="flex items-center gap-3">
        <p className="text-sm text-neutral-600">
          Showing {start}–{end} of {filteredCount} CVs
        </p>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="h-8 px-2 text-sm border border-border rounded bg-card outline-none focus:border-primary"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="text-muted-foreground px-1">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "w-8 h-8 rounded text-sm font-medium transition-colors",
                page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CVPagination;
