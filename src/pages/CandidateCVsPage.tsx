import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Download, Eye, Star, HardDrive, Calendar, Mail, Loader2, Upload, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MAX_CVS = 3;
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const CandidateCVsPage = () => {
  const navigate = useNavigate();
  const { cvs, recruiter, isLoading } = useCandidateDashboard();
  const { toast } = useToast();
  const { candidateId, user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (cv: typeof cvs[0]) => {
    try {
      const urlParts = cv.file_url.split("/cvs-bucket/");
      if (urlParts[1]) {
        const { data, error } = await supabase.storage.from("cvs-bucket").download(urlParts[1]);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = cv.file_name;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        window.open(cv.file_url, "_blank");
      }
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target) e.target.value = "";

    if (cvs.length >= MAX_CVS) {
      toast({ title: "Maximum CVs reached", description: `You can upload up to ${MAX_CVS} resumes. Delete one to upload a new one.`, variant: "destructive" });
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Only PDF, DOC, and DOCX files are allowed.", variant: "destructive" });
      return;
    }

    if (file.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    if (!candidateId || !user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Get assigned recruiter id
      const { data: candData } = await supabase
        .from("candidates")
        .select("assigned_recruiter_id")
        .eq("candidate_id", candidateId)
        .single();

      if (!candData) throw new Error("Candidate record not found");

      const ext = file.name.split(".").pop() || "pdf";
      const filePath = `${candidateId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage.from("cvs-bucket").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("cvs-bucket").getPublicUrl(filePath);

      const isPrimary = cvs.length === 0; // First CV is auto-primary
      const { error: insertError } = await supabase.from("cvs").insert({
        candidate_id: candidateId,
        recruiter_id: candData.assigned_recruiter_id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: ext,
        file_size_bytes: file.size,
        is_primary: isPrimary,
      });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["candidate", "cvs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "cvs"] });
      toast({ title: "CV Uploaded!", description: `${file.name} has been uploaded successfully.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Could not upload CV.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (cvId: string) => {
    setSettingPrimary(cvId);
    try {
      // Unset all primary first
      for (const cv of cvs) {
        if (cv.is_primary && cv.cv_id !== cvId) {
          await supabase.from("cvs").update({ is_primary: false }).eq("cv_id", cv.cv_id);
        }
      }
      const { error } = await supabase.from("cvs").update({ is_primary: true }).eq("cv_id", cvId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["candidate", "cvs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "cvs"] });
      toast({ title: "Master Resume Updated", description: "Your master resume has been set." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleDelete = async (cv: typeof cvs[0]) => {
    setDeletingId(cv.cv_id);
    try {
      const urlParts = cv.file_url.split("/cvs-bucket/");
      if (urlParts[1]) {
        await supabase.storage.from("cvs-bucket").remove([urlParts[1]]);
      }
      const { error } = await supabase.from("cvs").delete().eq("cv_id", cv.cv_id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["candidate", "cvs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter", "cvs"] });
      toast({ title: "CV Deleted", description: `${cv.file_name} has been removed.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading CVs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => navigate("/candidate/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold">My Resumes</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground font-display">My Resumes</h1>
            <p className="text-base text-muted-foreground mt-1">
              Upload up to {MAX_CVS} resumes and select one as your master resume ({cvs.length}/{MAX_CVS} used)
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="portal"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || cvs.length >= MAX_CVS}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {cvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"><FileText className="w-10 h-10 text-muted-foreground" /></div>
            <h3 className="text-xl font-semibold text-foreground font-display">No resumes uploaded yet</h3>
            <p className="text-base text-muted-foreground mt-2 max-w-md">Upload your resume to get started. You can upload up to {MAX_CVS} resumes.</p>
            <Button variant="portal" className="mt-6" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload Your First Resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cvs.map((cv) => {
              const isPdf = cv.file_type === "pdf" || cv.file_name.toLowerCase().endsWith(".pdf");
              return (
                <div key={cv.cv_id} className={cn(
                  "bg-card border rounded-xl p-6 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 flex flex-col",
                  cv.is_primary ? "border-primary ring-1 ring-primary/20" : "border-border"
                )}>
                  <div className="flex justify-center mb-4">
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center", isPdf ? "bg-destructive/10" : "bg-info-50")}>
                      <FileText className={cn("w-12 h-12", isPdf ? "text-destructive" : "text-info-500")} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground text-center line-clamp-2 mb-2">{cv.file_name}</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatBytes(cv.file_size_bytes)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDistanceToNow(new Date(cv.uploaded_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {cv.is_primary && (
                      <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-primary" /> Master Resume
                      </span>
                    )}
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground")}>{(cv.file_type || "file").toUpperCase()}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleDownload(cv)} className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      {!cv.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(cv.cv_id)}
                          disabled={settingPrimary === cv.cv_id}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary/5 transition-colors disabled:opacity-50"
                        >
                          {settingPrimary === cv.cv_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                          Set as Master
                        </button>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleDelete(cv)}
                        disabled={deletingId === cv.cv_id}
                        className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
                      >
                        {deletingId === cv.cv_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CandidateCVsPage;
