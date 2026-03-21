import { useState, useMemo } from "react";
import { ScrapedJob } from "@/data/mockScrapedJobs";
import {
  X, Briefcase, MapPin, FileText, Info, FilePen, Loader2, CheckCircle,
  XCircle, Search, Download, Eye, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface UpdateCVModalProps {
  job: ScrapedJob | null;
  candidates: any[];
  cvs: any[];
  onClose: () => void;
}

type ModalState = "form" | "loading" | "success" | "error";
type CVSource = "existing" | "upload";

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

const UpdateCVModal = ({ job, candidates, cvs, onClose }: UpdateCVModalProps) => {
  const { recruiterId } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedCV, setSelectedCV] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [state, setState] = useState<ModalState>("form");
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [savedFileUrl, setSavedFileUrl] = useState("");
  const [savedFileName, setSavedFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cvSource, setCvSource] = useState<CVSource>("existing");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const candidateCVs = useMemo(
    () => cvs.filter((cv: any) => cv.candidate_id === selectedCandidate),
    [cvs, selectedCandidate]
  );

  const filteredCandidates = useMemo(
    () => candidates.filter((c: any) => {
      const name = c.users?.full_name || "";
      const email = c.users?.email || "";
      const q = candidateSearch.toLowerCase();
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    }),
    [candidates, candidateSearch]
  );

  if (!job) return null;

  const selectedCandidateObj = candidates.find((c: any) => c.candidate_id === selectedCandidate);

  const parseCV = async (cvObj: any, useSignedUrl = true): Promise<string> => {
    let parsePayload: any = {};
    const originalFileName = cvObj.file_name || cvObj.original_file_name || cvObj.updated_file_name || "";

    if (useSignedUrl) {
      const urlParts = cvObj.file_url.split("/cvs-bucket/");
      if (urlParts[1]) {
        parsePayload = { bucket: "cvs-bucket", filePath: decodeURIComponent(urlParts[1]), fileName: originalFileName };
      } else {
        const { data: signedData } = await supabase.storage
          .from("cvs-bucket")
          .createSignedUrl(decodeURIComponent(cvObj.file_url), 3600);
        parsePayload = { fileUrl: signedData?.signedUrl || cvObj.file_url, fileName: originalFileName };
      }
    } else {
      parsePayload = { fileUrl: cvObj.updated_file_url || cvObj.file_url, fileName: originalFileName };
    }

    const parseResp = await supabase.functions.invoke("parse-cv", { body: parsePayload });
    if (parseResp.error) throw new Error(`Failed to parse CV: ${parseResp.error.message}`);
    const parsed = parseResp.data;
    if (parsed?.error) throw new Error(`CV parse error: ${parsed.error}`);
    if (!parsed?.text) throw new Error("No text content extracted from CV");
    return parsed.text;
  };

  const parseUploadedFile = async (file: File): Promise<{ text: string; fileUrl: string; fileName: string }> => {
    // Upload to storage first
    const filePath = `${selectedCandidate}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cvs-bucket")
      .upload(filePath, file, { contentType: file.type });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Parse via edge function
    const parseResp = await supabase.functions.invoke("parse-cv", {
      body: { bucket: "cvs-bucket", filePath, fileName: file.name },
    });
    if (parseResp.error) throw new Error(`Failed to parse CV: ${parseResp.error.message}`);
    const parsed = parseResp.data;
    if (parsed?.error) throw new Error(`CV parse error: ${parsed.error}`);
    if (!parsed?.text) throw new Error("No text content extracted from CV");

    // Get public URL
    const { data: urlData } = supabase.storage.from("cvs-bucket").getPublicUrl(filePath);

    return { text: parsed.text, fileUrl: urlData.publicUrl || "", fileName: file.name };
  };

  const handleUpdate = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      let cvText: string;
      let originalFileName: string;
      let cvUrl: string;
      let cvId: string;

      if (cvSource === "upload" && uploadedFile) {
        const result = await parseUploadedFile(uploadedFile);
        cvText = result.text;
        originalFileName = result.fileName;
        cvUrl = result.fileUrl;
        // Use first CV id if available, or a placeholder
        cvId = candidateCVs[0]?.cv_id || "uploaded";
      } else {
        const cvObj = cvs.find((cv: any) => cv.cv_id === selectedCV);
        if (!cvObj) throw new Error("CV not found");
        cvText = await parseCV(cvObj, true);
        originalFileName = cvObj.file_name;
        cvUrl = cvObj.file_url;
        cvId = selectedCV;
      }

      const candidateName = selectedCandidateObj?.users?.full_name || "Unknown";
      const requestStartedAt = new Date().toISOString();

      // Fetch ATS analysis data for this job if available
      let atsAnalysisData: any = null;
      if (recruiterId) {
        const { data: atsData } = await supabase
          .from("ats_analyses")
          .select("*")
          .eq("job_id", job.id)
          .eq("recruiter_id", recruiterId)
          .order("analyzed_at", { ascending: false })
          .limit(1);
        if (atsData && atsData.length > 0) {
          atsAnalysisData = atsData[0];
        }
      }

      const payload: any = {
        job_id: job.id,
        cv_id: cvId,
        candidate_id: selectedCandidate,
        recruiter_id: recruiterId,
        original_file_name: originalFileName,
        candidate_name: candidateName,
        cv_content: cvText,
        cv_url: cvUrl,
        job_title: job.job_title,
        company_name: job.company_name,
        location: job.location,
        job_description: job.job_description,
        salary_range: job.salary_range || "",
        experience_level: job.experience_level || "",
        job_apply_url: job.job_apply_url,
        platform_type: job.platform,
        published_date: job.published_date,
        scraped_at: job.scraped_at || "",
      };

      if (atsAnalysisData) {
        payload.ats_analysis_id = atsAnalysisData.analysis_id;
        payload.ats_score = atsAnalysisData.ats_score;
        payload.ats_analysis_result = atsAnalysisData.analysis_result;
      }

      const response = await fetch("https://n8n.srv1340079.hstgr.cloud/webhook/update cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);

      const result = await response.json();
      setUpdateResult(result);

      const webhookUrl = (
        result?.updated_file_url ||
        result?.updated_cv_url ||
        result?.file_url ||
        result?.download_url ||
        ""
      ).trim();
      const finalFileName = result?.updated_file_name || `Updated_${originalFileName}`;

      if (recruiterId) {
        try {
          const { data: recentRows } = await supabase
            .from("updated_cvs")
            .select("updated_file_url, updated_file_name")
            .eq("job_id", job.id)
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
                job_id: job.id,
                cv_id: cvId === "uploaded" ? candidateCVs[0]?.cv_id : cvId,
                candidate_id: selectedCandidate,
                recruiter_id: recruiterId,
                original_file_name: originalFileName,
                updated_file_name: finalFileName,
                updated_file_url: webhookUrl,
                updated_file_size_bytes: result?.file_size || null,
                webhook_response: result,
                ats_analysis_id: atsAnalysisData?.analysis_id || null,
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
      } else {
        setSavedFileUrl(webhookUrl);
        setSavedFileName(finalFileName);
      }

      setState("success");
    } catch (err: any) {
      console.error("Update CV failed:", err);
      setErrorMsg(err.message || "Something went wrong");
      setState("error");
    }
  };

  const handleClose = () => {
    setSelectedCandidate(""); setSelectedCV(""); setCandidateSearch(""); setState("form"); setUpdateResult(null); setSavedFileUrl(""); setSavedFileName(""); setErrorMsg(""); setCvSource("existing"); setUploadedFile(null);
    onClose();
  };

  const handleDownloadUpdated = async () => {
    if (savedFileUrl) {
      const { downloadFile } = await import("@/lib/downloadFile");
      await downloadFile(savedFileUrl, savedFileName || "updated_cv.pdf");
    }
  };

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
    setUploadedFile(file);
  };

  const isReadyToUpdate = selectedCandidate && (
    (cvSource === "existing" && selectedCV) ||
    (cvSource === "upload" && uploadedFile)
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="bg-card rounded-2xl shadow-elevated max-w-xl w-full animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 font-display">Update CV</h2>
            <p className="text-sm text-muted-foreground mt-1">Select candidate & CV to rewrite based on job description</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {state === "form" && (
            <>
              {/* Job summary */}
              <div className="bg-info-50 border border-info-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-5 h-5 text-info-500" />
                  <span className="text-sm font-semibold text-secondary-900">{job.job_title}</span>
                </div>
                <p className="text-sm text-foreground/70">{job.company_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{job.location}</p>
              </div>

              {/* Candidate selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground/80 mb-2">Select Candidate <span className="text-destructive">*</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={candidateSearch} onChange={(e) => setCandidateSearch(e.target.value)} placeholder="Search candidates..." className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-2" />
                </div>
                <div className="max-h-[180px] overflow-y-auto border border-border rounded-lg">
                  {filteredCandidates.map((c: any) => (
                    <button key={c.candidate_id} type="button" onClick={() => { setSelectedCandidate(c.candidate_id); setSelectedCV(""); setUploadedFile(null); }}
                      className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors", selectedCandidate === c.candidate_id ? "bg-primary-100" : "hover:bg-muted/50")}>
                      <div className="w-8 h-8 rounded-full bg-info-500 flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">{getInitials(c.users?.full_name || "?")}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-secondary-900 truncate">{c.users?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{c.users?.email}</p>
                      </div>
                    </button>
                  ))}
                  {filteredCandidates.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No candidates found</p>}
                </div>
              </div>

              {/* CV Source Toggle */}
              {selectedCandidate && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Resume Source <span className="text-destructive">*</span></label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setCvSource("existing"); setUploadedFile(null); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                        cvSource === "existing" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <FileText className="w-4 h-4" /> Existing CVs
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCvSource("upload"); setSelectedCV(""); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                        cvSource === "upload" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <Upload className="w-4 h-4" /> Upload Resume
                    </button>
                  </div>
                </div>
              )}

              {/* Existing CV selection */}
              {selectedCandidate && cvSource === "existing" && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Select CV to Update</label>
                  {candidateCVs.length === 0 ? (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">No CVs uploaded for this candidate. Try uploading one instead.</p>
                  ) : (
                    <div className="space-y-2">
                      {candidateCVs.map((cv: any) => (
                        <button key={cv.cv_id} type="button" onClick={() => setSelectedCV(cv.cv_id)}
                          className={cn("w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all", selectedCV === cv.cv_id ? "border-info-500 bg-info-50" : "border-border hover:bg-muted/50")}>
                          <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-secondary-900 truncate">{cv.file_name}</span>
                              {cv.is_primary && <span className="text-[10px] font-semibold bg-success-50 text-success-700 px-1.5 py-0.5 rounded shrink-0">Primary</span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(cv.file_size_bytes)} • Uploaded {new Date(cv.uploaded_at).toLocaleDateString()}</p>
                          </div>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0", selectedCV === cv.cv_id ? "border-info-500 bg-info-500" : "border-muted-foreground/30")}>
                            {selectedCV === cv.cv_id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upload CV */}
              {selectedCandidate && cvSource === "upload" && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Upload Resume (PDF, DOC, DOCX)</label>
                  {uploadedFile ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                      <FileText className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(uploadedFile.size)}</p>
                      </div>
                      <button onClick={() => setUploadedFile(null)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors bg-muted/20">
                      <Upload className="w-8 h-8 text-muted-foreground/50" />
                      <span className="text-sm text-muted-foreground">Click to select a resume file</span>
                      <span className="text-xs text-muted-foreground/60">PDF, DOC, DOCX • Max 10MB</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                    </label>
                  )}
                  {errorMsg && state === "form" && (
                    <p className="text-xs text-destructive mt-2">{errorMsg}</p>
                  )}
                </div>
              )}

              <div className="notice-info flex items-start gap-2">
                <Info className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
                <p className="text-sm">This will send the selected CV along with the job description and ATS analysis data (if available) to our AI for resume rewriting.</p>
              </div>
            </>
          )}

          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="w-12 h-12 text-info-500 animate-spin" />
              <h3 className="text-lg font-bold text-secondary-900 font-display mt-6">Updating CV with AI...</h3>
              <p className="text-sm text-muted-foreground mt-2">Rewriting resume based on job description & ATS insights. This may take 30–60 seconds.</p>
            </div>
          )}

          {state === "success" && (() => {
            const candidateName = selectedCandidateObj?.users?.full_name || "Candidate";
            const googleViewerUrl = savedFileUrl ? `https://docs.google.com/gview?url=${encodeURIComponent(savedFileUrl)}&embedded=true` : "";
            return (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-success-500" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 font-display mt-4">CV Updated Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Resume for <span className="font-semibold text-foreground">{candidateName}</span> optimized for <span className="font-semibold text-foreground">{job?.job_title}</span>.
                </p>

                {googleViewerUrl && (
                  <div className="mt-4 w-full rounded-xl border border-border overflow-hidden bg-muted/30 relative" style={{ height: 320 }}>
                    <iframe
                      src={googleViewerUrl}
                      className="w-full h-full border-0"
                      title={`Preview of ${savedFileName}`}
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-4 w-full">
                  {savedFileUrl ? (
                    <>
                      <Button
                        variant="portal"
                        className="flex-1"
                        onClick={() => window.open(savedFileUrl, "_blank")}
                      >
                        <Eye className="w-4 h-4" /> View Resume
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleDownloadUpdated}>
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground w-full">No download URL returned from the webhook.</p>
                  )}
                </div>
                <Button variant="ghost" className="mt-2 w-full" onClick={handleClose}>Close</Button>
              </div>
            );
          })()}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"><XCircle className="w-10 h-10 text-destructive" /></div>
              <h3 className="text-xl font-bold text-secondary-900 font-display mt-6">Update Failed</h3>
              <p className="text-sm text-muted-foreground mt-2">{errorMsg || "Something went wrong. Please try again."}</p>
              <div className="flex gap-3 mt-8 w-full">
                <Button variant="portal" className="flex-1" onClick={() => setState("form")}>Try Again</Button>
                <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {state === "form" && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button variant="portal-info" onClick={handleUpdate} disabled={!isReadyToUpdate}><FilePen className="w-4 h-4" /> Update CV</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateCVModal;
