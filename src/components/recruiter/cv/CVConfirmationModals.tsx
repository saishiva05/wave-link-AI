import { AlertTriangle, Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CVFile } from "@/hooks/useCVManagement";

interface DeleteCVModalProps {
  cv: CVFile | null;
  onClose: () => void;
  onConfirm: (cvId: string) => void;
}

export const DeleteCVModal = ({ cv, onClose, onConfirm }: DeleteCVModalProps) => {
  if (!cv) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-[400px] w-full animate-scale-in p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-error-50 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-error-500" />
        </div>
        <h3 className="text-lg font-bold text-secondary-900 font-display mt-4">Delete CV?</h3>
        <p className="text-sm text-neutral-700 mt-2">
          Are you sure you want to delete "<span className="font-medium">{cv.file_name}</span>"? This action cannot be undone.
        </p>
        {cv.is_primary && (
          <div className="notice-warning mt-4 text-left text-xs">
            This is the primary CV for {cv.candidate_name}. Another CV will need to be set as primary.
          </div>
        )}
        <div className="flex items-center gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => { onConfirm(cv.cv_id); onClose(); }}
          >
            <Trash className="w-4 h-4" /> Delete CV
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SetPrimaryModalProps {
  cv: CVFile | null;
  currentPrimaryName?: string;
  onClose: () => void;
  onConfirm: (cvId: string) => void;
}

export const SetPrimaryModal = ({ cv, currentPrimaryName, onClose, onConfirm }: SetPrimaryModalProps) => {
  if (!cv) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-[400px] w-full animate-scale-in p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-warning-50 flex items-center justify-center mx-auto">
          <Star className="w-7 h-7 text-warning-500" />
        </div>
        <h3 className="text-lg font-bold text-secondary-900 font-display mt-4">Set as Primary CV?</h3>
        <p className="text-sm text-neutral-700 mt-2">
          {currentPrimaryName
            ? `This will replace "${currentPrimaryName}" as the primary CV for ${cv.candidate_name}.`
            : `This will set "${cv.file_name}" as the primary CV for ${cv.candidate_name}.`
          }
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="portal"
            className="flex-1"
            onClick={() => { onConfirm(cv.cv_id); onClose(); }}
          >
            <Star className="w-4 h-4" /> Set as Primary
          </Button>
        </div>
      </div>
    </div>
  );
};
