import { FileUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CVEmptyStateProps {
  type: "no-cvs" | "no-results";
  onUpload: () => void;
  onClearFilters?: () => void;
}

const CVEmptyState = ({ type, onUpload, onClearFilters }: CVEmptyStateProps) => {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <Search className="w-10 h-10 text-neutral-400" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-700 font-display">No CVs match your filters</h3>
        <p className="text-base text-neutral-600 mt-2">Try adjusting your filters or search term</p>
        {onClearFilters && (
          <Button variant="outline" className="mt-6" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <FileUp className="w-10 h-10 text-neutral-400" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-700 font-display">No CVs uploaded yet</h3>
      <p className="text-base text-neutral-600 mt-2 max-w-md">
        Upload your first CV to start matching candidates with jobs using AI-powered ATS analysis.
      </p>
      <Button variant="portal" size="lg" className="mt-8" onClick={onUpload}>
        <FileUp className="w-4 h-4" /> Upload Your First CV
      </Button>
    </div>
  );
};

export default CVEmptyState;
