import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Download, Eye, Star, HardDrive, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import { format, formatDistanceToNow } from "date-fns";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CandidateCVsPage = () => {
  const navigate = useNavigate();
  const { cvs, recruiter } = useCandidateDashboard();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => navigate("/candidate/dashboard")} className="text-neutral-500 hover:text-primary transition-colors">Dashboard</button>
          <span className="text-neutral-300">/</span>
          <span className="text-secondary-900 font-semibold">My CVs</span>
        </nav>
        <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">My CVs</h1>
        <p className="text-base text-muted-foreground mt-1">View and download your uploaded resumes</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {cvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4"><FileText className="w-10 h-10 text-neutral-400" /></div>
            <h3 className="text-xl font-semibold text-neutral-700 font-display">No CVs uploaded yet</h3>
            <p className="text-base text-neutral-600 mt-2 max-w-md">Your recruiter hasn't uploaded any CVs for you yet. Contact them if you need to update your resume.</p>
            <Button variant="portal" className="mt-6" onClick={() => window.open(`mailto:${recruiter.email}`)}><Mail className="w-4 h-4" /> Contact Recruiter</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cvs.map((cv) => {
              const isPdf = cv.file_type === "pdf";
              return (
                <div key={cv.cv_id} className="bg-card border border-border rounded-xl p-6 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                  <div className="flex justify-center mb-4">
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center", isPdf ? "bg-error-50" : "bg-info-50")}>
                      <FileText className={cn("w-12 h-12", isPdf ? "text-error-500" : "text-info-500")} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900 text-center line-clamp-2 mb-2">{cv.file_name}</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-neutral-600 mb-3">
                    <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatBytes(cv.file_size_bytes)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDistanceToNow(new Date(cv.uploaded_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {cv.is_primary && (
                      <span className="flex items-center gap-1 bg-success-100 text-success-700 text-xs font-medium px-2.5 py-1 rounded-full"><Star className="w-3 h-3 fill-success-500" /> Primary CV</span>
                    )}
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", isPdf ? "bg-info-100 text-info-700" : "bg-primary-100 text-primary-700")}>{cv.file_type.toUpperCase()}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-center gap-3">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors"><Eye className="w-3.5 h-3.5" /> Preview</button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md hover:bg-primary-600 transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
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
