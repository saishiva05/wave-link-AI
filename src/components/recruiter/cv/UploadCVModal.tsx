import { useState, useRef, useCallback } from "react";
import {
  X, Upload, FolderOpen, FileText, Trash, CheckCircle, AlertCircle, Info, User, Search, Eye, Plus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CandidateOption } from "@/hooks/useCVManagement";

interface UploadCVModalProps {
  open: boolean;
  onClose: () => void;
  candidates: CandidateOption[];
}

interface SelectedFile {
  id: string;
  file: File;
  isPrimary: boolean;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const UploadCVModal = ({ open, onClose, candidates }: UploadCVModalProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [candidateDropdownOpen, setCandidateDropdownOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      const newFiles = e.dataTransfer.files;
      const errs: string[] = [];
      const valid: SelectedFile[] = [];

      Array.from(newFiles).forEach((file) => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
          errs.push(`File type not supported: ${ext}`);
        } else if (file.size > MAX_SIZE) {
          errs.push(`File too large: ${file.name} (${formatBytes(file.size)}) exceeds 10 MB limit`);
        } else {
          valid.push({
            id: Math.random().toString(36).slice(2),
            file,
            isPrimary: false,
            progress: 0,
            status: "pending",
          });
        }
      });

      if (errs.length > 0) setErrors(errs);
      if (valid.length > 0) setFiles((prev) => {
        const combined = [...prev, ...valid];
        if (!combined.some(f => f.isPrimary) && combined.length > 0) {
          combined[0].isPrimary = true;
        }
        return combined;
      });
    }
  }, []);

  if (!open) return null;

  const filteredCandidates = candidates.filter((c) =>
    c.full_name.toLowerCase().includes(candidateSearch.toLowerCase())
  );
  const selectedCandidateObj = candidates.find((c) => c.candidate_id === selectedCandidate);

  const validateFile = (file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      return `File type not supported: ${ext}`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large: ${file.name} (${formatBytes(file.size)}) exceeds 10 MB limit`;
    }
    if (files.some((f) => f.file.name === file.name)) {
      return `Duplicate file: ${file.name} already selected`;
    }
    return null;
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const errs: string[] = [];
    const valid: SelectedFile[] = [];

    Array.from(newFiles).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errs.push(error);
      } else {
        valid.push({
          id: Math.random().toString(36).slice(2),
          file,
          isPrimary: files.length === 0 && valid.length === 0,
          progress: 0,
          status: "pending",
        });
      }
    });

    if (errs.length > 0) setErrors(errs);
    if (valid.length > 0) setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      // If removed the primary, set first remaining as primary
      if (updated.length > 0 && !updated.some((f) => f.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimary = (id: string) => {
    setFiles((prev) => prev.map((f) => ({ ...f, isPrimary: f.id === id })));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setErrors([]);

    // Simulate upload with progress
    for (let i = 0; i < files.length; i++) {
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 200));
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, progress: p } : f));
      }
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "success", progress: 100 } : f));
    }

    setIsUploading(false);
    setUploadComplete(true);
  };

  const resetModal = () => {
    setSelectedCandidate("");
    setCandidateSearch("");
    setFiles([]);
    setErrors([]);
    setIsUploading(false);
    setUploadComplete(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-[700px] w-full animate-scale-in max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {uploadComplete ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 font-display mt-6">CVs Uploaded Successfully!</h2>
            <p className="text-base text-neutral-600 mt-3">
              {files.length} CV{files.length > 1 ? "s" : ""} have been uploaded for {selectedCandidateObj?.full_name}
            </p>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-5 mt-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {selectedCandidateObj ? getInitials(selectedCandidateObj.full_name) : "?"}
                </div>
                <span className="text-sm font-semibold text-secondary-900">{selectedCandidateObj?.full_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-neutral-600">New CVs</p>
                  <p className="font-semibold text-secondary-900">{files.length}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Total CVs</p>
                  <p className="font-semibold text-secondary-900">{(selectedCandidateObj?.cv_count || 0) + files.length}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Primary</p>
                  <p className="font-semibold text-secondary-900 truncate">{files.find((f) => f.isPrimary)?.file.name || "—"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <Button variant="portal" onClick={handleClose}>
                <Eye className="w-4 h-4" /> View CVs
              </Button>
              <Button variant="outline" onClick={resetModal}>
                <Plus className="w-4 h-4" /> Upload More
              </Button>
              <Button variant="ghost" onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border relative">
              <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 font-display">Upload CV</h2>
              <p className="text-sm text-neutral-600 mt-1">Upload resume files for your candidates. Supported formats: PDF, DOC, DOCX (Max 10 MB)</p>
              <button onClick={handleClose} className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Step 1: Select Candidate */}
              <h3 className="text-base font-semibold text-secondary-900 mb-4">1. Select Candidate</h3>
              <div className="relative mb-8">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Candidate <span className="text-destructive">*</span></label>
                <button
                  type="button"
                  onClick={() => setCandidateDropdownOpen(!candidateDropdownOpen)}
                  className="w-full h-12 px-3 flex items-center gap-3 border border-border rounded-lg bg-card text-sm text-left hover:bg-muted/50 transition-colors"
                >
                  {selectedCandidateObj ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                        {getInitials(selectedCandidateObj.full_name)}
                      </div>
                      <span className="font-medium text-secondary-900">{selectedCandidateObj.full_name}</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 text-neutral-400" />
                      <span className="text-neutral-500">Select a candidate</span>
                    </>
                  )}
                </button>

                {candidateDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full bg-card border border-border rounded-lg shadow-elevated overflow-hidden animate-scale-in">
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          placeholder="Search candidates..."
                          className="w-full h-9 pl-8 pr-3 text-sm rounded border border-border outline-none focus:border-primary"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto">
                      {filteredCandidates.map((c) => (
                        <button
                          key={c.candidate_id}
                          onClick={() => { setSelectedCandidate(c.candidate_id); setCandidateDropdownOpen(false); }}
                          className={cn("w-full flex items-center gap-3 px-3 py-3 hover:bg-primary-50 transition-colors", selectedCandidate === c.candidate_id && "bg-primary-100")}
                        >
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                            {getInitials(c.full_name)}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-secondary-900">{c.full_name}</p>
                            <p className="text-xs text-neutral-600">{c.email}</p>
                          </div>
                          <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">{c.cv_count} CVs</span>
                        </button>
                      ))}
                      {filteredCandidates.length === 0 && (
                        <p className="text-sm text-neutral-500 text-center py-4">No candidates found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Upload Files */}
              <h3 className="text-base font-semibold text-secondary-900 mb-4">2. Upload CV File(s)</h3>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="notice-error flex items-start gap-2 mb-4 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 text-error-500 shrink-0 mt-0.5" />
                  <div>
                    {errors.map((err, i) => (
                      <p key={i} className="text-sm">{err}</p>
                    ))}
                  </div>
                  <button onClick={() => setErrors([])} className="ml-auto text-neutral-400 hover:text-neutral-600 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
                  isDragActive
                    ? "border-primary bg-primary-100 shadow-focus"
                    : "border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50"
                )}
              >
                <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold text-secondary-900 mb-2">Drag and drop files here</p>
                <p className="text-base text-neutral-600 mb-4">or click to browse your computer</p>
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary-50" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <FolderOpen className="w-4 h-4" /> Choose Files
                </Button>
                <p className="text-sm text-neutral-500 mt-4">Supported: PDF, DOC, DOCX • Max size: 10 MB per file</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
              />

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mt-6 bg-card border border-border rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-700 mb-3">Files to Upload ({files.length})</p>
                  <div className="space-y-3">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-lg bg-neutral-50",
                          f.status === "success" && "border-success-500 bg-success-50",
                          f.status === "error" && "border-error-500 bg-error-50",
                          f.status === "pending" && "border-border",
                          f.status === "uploading" && "border-primary-300 bg-primary-50"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", isPdf(f.file.name) ? "bg-error-50" : "bg-info-50")}>
                          <FileText className={cn("w-5 h-5", isPdf(f.file.name) ? "text-error-500" : "text-info-500")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">{f.file.name}</p>
                          {f.status === "uploading" ? (
                            <div className="mt-1.5">
                              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${f.progress}%` }} />
                              </div>
                              <p className="text-xs text-primary-600 mt-1">{f.progress}%</p>
                            </div>
                          ) : f.status === "success" ? (
                            <p className="text-xs text-success-600 mt-0.5">Uploaded successfully</p>
                          ) : (
                            <p className="text-xs text-neutral-600 mt-0.5">{formatBytes(f.file.size)}</p>
                          )}
                        </div>
                        {f.status === "pending" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="primary-cv"
                                checked={f.isPrimary}
                                onChange={() => setPrimary(f.id)}
                                className="accent-primary w-4 h-4"
                              />
                              <span className="text-xs text-neutral-700">Primary</span>
                            </label>
                            <button onClick={() => removeFile(f.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-error-50 hover:text-error-500 transition-colors">
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {f.status === "success" && <CheckCircle className="w-5 h-5 text-success-500 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                <Info className="w-4 h-4 text-info-500" />
                <span>{files.length} file{files.length !== 1 ? "s" : ""} ready to upload</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleClose} disabled={isUploading}>Cancel</Button>
                <Button
                  variant="portal"
                  onClick={handleUpload}
                  disabled={!selectedCandidate || files.length === 0 || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Upload CVs
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadCVModal;
