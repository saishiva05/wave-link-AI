import { motion } from "framer-motion";
import { Download, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface CVBulkActionsProps {
  count: number;
  onDownload: () => void;
  onDelete: () => void;
  onClear: () => void;
  onSelectAll: () => void;
  allSelected: boolean;
}

const CVBulkActions = ({ count, onDownload, onDelete, onClear, onSelectAll, allSelected }: CVBulkActionsProps) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="sticky top-16 z-20 bg-primary rounded-xl px-5 py-3.5 flex items-center justify-between shadow-card"
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={() => onSelectAll()}
          className="border-primary-foreground/50 data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
        />
        <span className="text-sm font-medium text-primary-foreground">
          {count} CV{count > 1 ? "s" : ""} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-white text-primary-700 hover:bg-white/90 text-xs font-semibold">
          <Download className="w-3.5 h-3.5" /> Download Selected
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-primary-foreground/30 text-primary-foreground hover:bg-error-500 hover:border-error-500 text-xs"
          onClick={onDelete}
        >
          <Trash className="w-3.5 h-3.5" /> Delete Selected
        </Button>
        <button onClick={onClear} className="text-primary-foreground/80 hover:text-white ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default CVBulkActions;
