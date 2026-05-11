import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FilePen, Upload, Search, Loader2, CheckCircle, XCircle,
  Download, Eye, FileText, X, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 10 * 1024 * 1024;

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

type PageState = "form" | "loading" | "success" | "error";

const RecruiterUpdateCV = () => {
  const navigate = useNavigate();
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();

  const [pageState, setPageState] = useState<PageState>("form");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [savedFileUrl, setSavedFileUrl] = useState("");
  const [savedFileName, setSavedFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch candidates
  const { data: candidates = [] } = useQuery({
    queryKey: ["recruiter", "candidates-for-update-cv"],
    queryFn: async () => {
      const { data } = await supabase
        .from("candidates")
        .select("candidate_id, user_id, users!candidates_user_id_fkey(full_name, email, avatar_url)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filteredCandidates = useMemo(
    () => candidates.filter((c: any) => {
      const name = c.users?.full_name || "";
      const email = c.users?.email || "";
      const q = candidateSearch.toLowerCase();
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    }),
    [candidates, candidateSearch]
  );

  const selectedCandidateObj = candidates.find((c: any) => c.candidate_id === selectedCandidate);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg("Only PDF, DOC, and DOCX files are allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrorMsg("File size must be under 10MB");
      return;
    }
    setErrorMsg("");
    setResumeFile(file);
  };

  const handleUpdate = async () => {
    if (!resumeFile || !jobDescription.trim() || !selectedCandidate) return;
    setPageState("loading");
    setErrorMsg("");

    try {
      // Upload file to storage
      const filePath = `${selectedCandidate}/${Date.now()}_${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("cvs-bucket")
        .upload(filePath, resumeFile, { contentType: resumeFile.type });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Parse CV text
      const parseResp = await supabase.functions.invoke("parse-cv", {
        body: { bucket: "cvs-bucket", filePath, fileName: resumeFile.name },
      });
      if (parseResp.error) throw new Error(`Failed to parse CV: ${parseResp.error.message}`);
      const parsed = parseResp.data;
      if (parsed?.error) throw new Error(`CV parse error: ${parsed.error}`);
      if (!parsed?.text) throw new Error("No text content extracted from CV");

      const { data: urlData } = supabase.storage.from("cvs-bucket").getPublicUrl(filePath);
      const candidateName = selectedCandidateObj?.users?.full_name || "Unknown";

      // Ensure a cv record exists for the uploaded file
      const { data: cvRecord } = await supabase
        .from("cvs")
        .insert({
          candidate_id: selectedCandidate,
          recruiter_id: recruiterId!,
          file_name: resumeFile.name,
          file_url: urlData.publicUrl || "",
          file_type: resumeFile.type,
          file_size_bytes: resumeFile.size,
          is_primary: false,
        })
        .select("cv_id")
        .single();

      const cvId = cvRecord?.cv_id || "uploaded";

      // Use a placeholder job_id for standalone updates
      // We'll create a temporary scraped_jobs record
      const { data: tempJob } = await supabase
        .from("scraped_jobs")
        .insert({
          job_title: jobTitle || "Manual Update",
          company_name: companyName || "Manual",
          location: "N/A",
          job_description: jobDescription,
          job_apply_url: "N/A",
          platform_type: "manual",
          recruiter_id: recruiterId!,
          is_active: false,
          is_admin_posting: false,
        })
        .select("job_id")
        .single();

      const jobId = tempJob?.job_id;
      if (!jobId) throw new Error("Failed to create job reference");

      const requestStartedAt = new Date().toISOString();

      const payload: any = {
        job_id: jobId,
        cv_id: cvId,
        candidate_id: selectedCandidate,
        recruiter_id: recruiterId,
        original_file_name: resumeFile.name,
        candidate_name: candidateName,
        cv_content: parsed.text,
        cv_url: urlData.publicUrl || "",
        job_title: jobTitle || "Manual Update",
        company_name: companyName || "",
        location: "N/A",
        job_description: jobDescription,
        salary_range: "",
        experience_level: "",
        job_apply_url: "N/A",
        platform_type: "manual",
      };

      const { callUpdateCvWebhook } = await import("@/lib/updateCvWebhook");
      const result = await callUpdateCvWebhook(payload);

      const webhookUrl = (
        result?.updated_file_url ||
        result?.updated_cv_url ||
        result?.file_url ||
        result?.download_url ||
        ""
      ).trim();
      const finalFileName = result?.updated_file_name || `Updated_${resumeFile.name}`;

      if (recruiterId) {
        try {
          const { data: recentRows } = await supabase
            .from("updated_cvs")
            .select("updated_file_url, updated_file_name")
            .eq("job_id", jobId)
            .eq("candidate_id", selectedCandidate)
            .eq("recruiter_id", recruiterId)
            .gte("created_at", requestStartedAt)
            .order("created_at", { ascending: false })
            .limit(5);

          const latestValidRow = (recentRows || []).find((row) => (row.updated_file_url || "").trim());

          if (latestValidRow?.updated_file_url) {
            setSavedFileUrl(latestValidRow.updated_file_url);
            setSavedFileName(latestValidRow.updated_file_name || finalFileName);
          } else if (webhookUrl) {
            const { data: insertedRow } = await supabase
              .from("updated_cvs")
              .insert({
                job_id: jobId,
                cv_id: cvId,
                candidate_id: selectedCandidate,
                recruiter_id: recruiterId,
                original_file_name: resumeFile.name,
                updated_file_name: finalFileName,
                updated_file_url: webhookUrl,
                updated_file_size_bytes: result?.file_size || null,
                webhook_response: result,
              })
              .select("updated_file_url, updated_file_name")
              .single();

            setSavedFileUrl(insertedRow?.updated_file_url || webhookUrl);
            setSavedFileName(insertedRow?.updated_file_name || finalFileName);
          } else {
            setSavedFileUrl("");
            setSavedFileName(finalFileName);
          }

          queryClient.invalidateQueries({ queryKey: ["recruiter", "job-updated-cvs"] });
          queryClient.invalidateQueries({ queryKey: ["recruiter", "updated-cvs"] });
          queryClient.invalidateQueries({ queryKey: ["recruiter", "cvs"] });
        } catch (dbErr) {
          console.error("Failed to resolve updated CV record:", dbErr);
          setSavedFileUrl(webhookUrl);
          setSavedFileName(finalFileName);
        }
      }

      setPageState("success");
    } catch (err: any) {
      console.error("Update CV failed:", err);
      setErrorMsg(err.message || "Something went wrong");
      setPageState("error");
    }
  };

  const handleDownloadUpdated = async () => {
    if (savedFileUrl) {
      const { downloadFile } = await import("@/lib/downloadFile");
      await downloadFile(savedFileUrl, savedFileName || "updated_cv.pdf");
    }
  };

  const handleReset = () => {
    setPageState("form");
    setJobDescription("");
    setJobTitle("");
    setCompanyName("");
    setSelectedCandidate("");
    setCandidateSearch("");
    setResumeFile(null);
    setSavedFileUrl("");
    setSavedFileName("");
    setErrorMsg("");
  };

  const isReady = selectedCandidate && resumeFile && jobDescription.trim().length > 10;

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => navigate("/recruiter/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-semibold">Update CV</span>
        </nav>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">Update CV</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a job description and upload a resume to generate an AI-optimized version
          </p>
        </div>
      </motion.div>

      {/* FORM */}
      {pageState === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="space-y-6">
          {/* Candidate Selection */}
          <div className="bg-card border border-border rounded-xl p-5">
            <label className="block text-sm font-semibold text-foreground mb-3">
              <User className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Select Candidate <span className="text-destructive">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={candidateSearch} onChange={(e) => setCandidateSearch(e.target.value)} placeholder="Search candidates..." className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            {selectedCandidateObj && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg mb-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{getInitials(selectedCandidateObj.users?.full_name || "?")}</div>
                <span className="text-sm font-medium text-foreground">{selectedCandidateObj.users?.full_name}</span>
                <button onClick={() => setSelectedCandidate("")} className="ml-auto text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
            )}
            <div className="max-h-[180px] overflow-y-auto border border-border rounded-lg">
              {filteredCandidates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No candidates found</p>
              )}
              {filteredCandidates.map((c: any) => (
                <button key={c.candidate_id} type="button" onClick={() => setSelectedCandidate(c.candidate_id)}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors", selectedCandidate === c.candidate_id ? "bg-primary/10" : "hover:bg-muted/50")}>
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-foreground text-xs font-semibold shrink-0">{getInitials(c.users?.full_name || "?")}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{c.users?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{c.users?.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Info (optional title & company) */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              <FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Job Information
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Job Title (optional)</label>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Company Name (optional)</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-card border border-border rounded-xl p-5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              <FilePen className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Job Description <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">Paste the full job description here. The AI will optimize the resume to match this.</p>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              className="min-h-[200px] bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1.5">{jobDescription.length} characters</p>
          </div>

          {/* Resume Upload */}
          <div className="bg-card border border-border rounded-xl p-5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              <Upload className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Upload Resume <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">Upload the candidate's resume (PDF, DOC, DOCX — max 10MB)</p>

            {resumeFile ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{resumeFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(resumeFile.size)}</p>
                </div>
                <button onClick={() => setResumeFile(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to select a file</span>
                <span className="text-xs text-muted-foreground/60">PDF, DOC, DOCX — Max 10MB</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
              </label>
            )}

            {errorMsg && pageState === "form" && (
              <p className="text-sm text-destructive mt-2">{errorMsg}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button variant="portal" size="lg" disabled={!isReady} onClick={handleUpdate}>
              <FilePen className="w-5 h-5" />
              Update Resume
            </Button>
          </div>
        </motion.div>
      )}

      {/* LOADING */}
      {pageState === "loading" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <h3 className="text-lg font-semibold text-foreground">Optimizing Resume...</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            AI is analyzing the job description and rewriting the resume to maximize ATS compatibility. This may take a minute.
          </p>
        </motion.div>
      )}

      {/* SUCCESS */}
      {pageState === "success" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Resume Updated Successfully!</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The AI-optimized resume has been generated and saved.
            </p>
          </div>

          {savedFileUrl && (
            <>
              <div className="border border-border rounded-lg overflow-hidden bg-background">
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(savedFileUrl)}&embedded=true`}
                  className="w-full h-[400px]"
                  title="Updated CV Preview"
                />
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => window.open(savedFileUrl, "_blank")}>
                  <Eye className="w-4 h-4" /> View
                </Button>
                <Button variant="portal" onClick={handleDownloadUpdated}>
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>
            </>
          )}

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              Update Another Resume
            </Button>
          </div>
        </motion.div>
      )}

      {/* ERROR */}
      {pageState === "error" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Update Failed</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">{errorMsg || "Something went wrong. Please try again."}</p>
          <Button variant="outline" onClick={() => setPageState("form")}>
            Try Again
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default RecruiterUpdateCV;
