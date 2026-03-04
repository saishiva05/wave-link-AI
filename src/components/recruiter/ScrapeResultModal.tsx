import { CheckCircle, XCircle, ArrowRight, Plus, Briefcase, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrapeResultModalProps {
  result: {
    type: "success" | "error";
    message: string;
    jobCount?: number;
  } | null;
  platform: string;
  location: string;
  onClose: () => void;
  onViewJobs: () => void;
  onScrapeMore: () => void;
}

const ScrapeResultModal = ({ result, platform, location, onClose, onViewJobs, onScrapeMore }: ScrapeResultModalProps) => {
  if (!result) return null;

  const platformName = platform === "linkedin" ? "LinkedIn" : "JSearch";

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-elevated max-w-lg w-full p-8 md:p-12 text-center animate-scale-in">
        {result.type === "success" ? (
          <>
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display mt-6">
              Jobs Successfully Found!
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed">{result.message}</p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-primary-50 rounded-lg">
              {result.jobCount !== undefined && result.jobCount > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-secondary-900">
                  <Briefcase className="w-4 h-4 text-primary" />
                  {result.jobCount} jobs
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-medium text-secondary-900">
                {platform === "linkedin" ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                ) : (
                  <Search className="w-4 h-4 text-secondary" />
                )}
                {platformName}
              </div>
              {location && (
                <div className="flex items-center gap-2 text-sm font-medium text-secondary-900">
                  <MapPin className="w-4 h-4 text-primary" />
                  {location}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button onClick={onViewJobs} variant="portal" size="lg" className="flex-1">
                View Job Board
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={onScrapeMore} variant="outline" size="lg" className="flex-1">
                <Plus className="w-4 h-4" />
                Find More Jobs
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display mt-6">
              Search Failed
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed">{result.message}</p>

            <div className="mt-6 p-4 bg-error-50 border border-destructive/20 rounded-lg text-left">
              <p className="text-sm text-destructive">
                The job search service may be temporarily unavailable. Please try again in a few moments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button onClick={onClose} variant="portal" size="lg" className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => window.open("mailto:support@wavelynk.ai")} variant="outline" size="lg" className="flex-1">
                Contact Support
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScrapeResultModal;
