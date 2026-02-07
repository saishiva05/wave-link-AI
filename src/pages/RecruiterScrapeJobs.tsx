import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Calendar,
  Building,
  FileText,
  Search,
  RotateCcw,
  ArrowRight,
  X,
  Info,
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ScrapeFormField from "@/components/recruiter/ScrapeFormField";
import ScrapeFormSelect from "@/components/recruiter/ScrapeFormSelect";
import PlatformSelector from "@/components/recruiter/PlatformSelector";
import ScrapeLoadingOverlay from "@/components/recruiter/ScrapeLoadingOverlay";
import ScrapeResultModal from "@/components/recruiter/ScrapeResultModal";

const publishedTimeOptions = [
  { value: "30 Days ago", label: "30 Days ago" },
  { value: "7 Days ago", label: "7 Days ago" },
  { value: "1 Day ago", label: "1 Day ago" },
  { value: "", label: "Any time" },
];

const workTypeOptions = [
  { value: "", label: "Any" },
  { value: "On-site", label: "On-site" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
];

const contractTypeOptions = [
  { value: "", label: "Any" },
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Temporary", label: "Temporary" },
  { value: "Internship", label: "Internship" },
  { value: "Volunteer", label: "Volunteer" },
];

interface ScrapeHistory {
  id: number;
  platform: "linkedin" | "jsearch";
  jobTitle: string;
  location: string;
  jobCount: number;
  time: string;
}

const mockHistory: ScrapeHistory[] = [
  { id: 1, platform: "linkedin", jobTitle: "AI Developer", location: "Hyderabad", jobCount: 45, time: "2 hours ago" },
  { id: 2, platform: "jsearch", jobTitle: "React Engineer", location: "Remote", jobCount: 32, time: "1 day ago" },
  { id: 3, platform: "linkedin", jobTitle: "Product Manager", location: "Bangalore", jobCount: 28, time: "3 days ago" },
];

const RecruiterScrapeJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [publishedTime, setPublishedTime] = useState("");
  const [workType, setWorkType] = useState("");
  const [contractType, setContractType] = useState("");
  const [platform, setPlatform] = useState<"linkedin" | "jsearch" | "">("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [resultModal, setResultModal] = useState<{
    type: "success" | "error";
    message: string;
    jobCount?: number;
  } | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!jobLocation.trim()) newErrors.jobLocation = "Job location is required";
    if (!platform) newErrors.platform = "Please select a platform";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const payload = {
      "Job Title": jobTitle.trim(),
      "Job Location": jobLocation.trim(),
      "Published time": publishedTime || undefined,
      WorkType: workType || undefined,
      ContractType: contractType || undefined,
      platform,
      recruiter_id: "demo-recruiter-id",
    };

    try {
      const response = await fetch("https://n8n.srv1340079.hstgr.cloud/webhook/jobscraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        setResultModal({
          type: "success",
          message: `Jobs have been scraped from ${platform === "linkedin" ? "LinkedIn" : "JSearch"} and saved to your database.`,
          jobCount: data?.count || data?.jobCount || 0,
        });
      } else {
        setResultModal({
          type: "error",
          message: `Failed to scrape jobs from ${platform === "linkedin" ? "LinkedIn" : "JSearch"}. Please try again.`,
        });
      }
    } catch {
      setResultModal({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJobTitle("");
    setJobLocation("");
    setPublishedTime("");
    setWorkType("");
    setContractType("");
    setPlatform("");
    setErrors({});
    toast({ title: "Form cleared", description: "All fields have been reset" });
  };

  const handleResultClose = () => {
    if (resultModal?.type === "success") {
      handleClear();
    }
    setResultModal(null);
  };

  return (
    <>
      <ScrapeLoadingOverlay isLoading={isLoading} platform={platform} />
      <ScrapeResultModal
        result={resultModal}
        platform={platform}
        location={jobLocation}
        onClose={handleResultClose}
        onViewJobs={() => navigate("/recruiter/scraped-jobs")}
        onScrapeMore={() => { handleClear(); setResultModal(null); }}
      />

      <div className="space-y-8 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate("/recruiter/dashboard")} className="text-neutral-500 hover:text-primary transition-colors">
              Dashboard
            </button>
            <span className="text-neutral-300">/</span>
            <span className="text-secondary-900 font-semibold">Scrape Jobs</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">Scrape Jobs</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl leading-relaxed">
            Find and scrape job postings from LinkedIn and JSearch based on your criteria. Scraped jobs will be saved to your database for candidate matching.
          </p>
        </motion.div>

        {/* Pro Tip Banner */}
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="notice-info flex items-start gap-3 relative"
          >
            <Info className="w-5 h-5 text-info-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "hsl(215, 60%, 14%)" }}>Pro Tip: Refine your search</p>
              <p className="text-sm mt-1">Use specific job titles and locations for better results. The 'Published Time' filter helps you find the freshest opportunities.</p>
            </div>
            <button onClick={() => setShowTip(false)} className="text-info-500 hover:text-info-700 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Scraping Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-card max-w-[900px] mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-secondary-900 font-display mb-2">Job Search Criteria</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8">Fill in the details below to scrape jobs matching your requirements</p>

            <div className="space-y-6">
              {/* Job Title */}
              <ScrapeFormField
                label="Job Title"
                required
                icon={Briefcase}
                placeholder="e.g. AI Automation Developer"
                value={jobTitle}
                onChange={setJobTitle}
                error={errors.jobTitle}
                helper="Enter the job position you're looking for (e.g., Senior React Developer, Product Manager)"
              />

              {/* Job Location */}
              <ScrapeFormField
                label="Job Location"
                required
                icon={MapPin}
                placeholder="e.g. Hyderabad, India"
                value={jobLocation}
                onChange={setJobLocation}
                error={errors.jobLocation}
                helper="City, State or Country (be specific for better results)"
              />

              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrapeFormSelect
                  label="Posted Within"
                  icon={Calendar}
                  placeholder="Select time range"
                  value={publishedTime}
                  onChange={setPublishedTime}
                  options={publishedTimeOptions}
                  helper="Filter jobs by how recently they were posted"
                  optional
                />
                <ScrapeFormSelect
                  label="Work Mode"
                  icon={Building}
                  placeholder="Select work mode"
                  value={workType}
                  onChange={setWorkType}
                  options={workTypeOptions}
                  optional
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrapeFormSelect
                  label="Job Type"
                  icon={FileText}
                  placeholder="Select job type"
                  value={contractType}
                  onChange={setContractType}
                  options={contractTypeOptions}
                  optional
                />
                <div /> {/* Spacer */}
              </div>

              {/* Platform Selection */}
              <PlatformSelector
                value={platform}
                onChange={setPlatform}
                error={errors.platform}
              />
            </div>

            {/* Form Actions */}
            <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button type="button" variant="ghost" onClick={handleClear} className="text-neutral-600">
                <RotateCcw className="w-4 h-4" />
                Clear Form
              </Button>
              <Button type="submit" variant="portal" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scraping Jobs...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Scrape Jobs
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Recent Scraping History */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="max-w-[900px] mx-auto"
        >
          <h2 className="text-xl font-bold text-secondary-900 font-display mb-5">Recent Scraping Activity</h2>
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            {mockHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-12 h-12 text-neutral-300 mb-3" />
                <p className="text-sm text-muted-foreground">No scraping activity yet</p>
              </div>
            ) : (
              mockHistory.map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors",
                    i < mockHistory.length - 1 && "border-b border-border"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    item.platform === "linkedin" ? "bg-blue-50" : "bg-secondary-100"
                  )}>
                    {item.platform === "linkedin" ? (
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    ) : (
                      <Search className="w-5 h-5 text-secondary-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900">
                      Scraped {item.jobCount} jobs from {item.platform === "linkedin" ? "LinkedIn" : "JSearch"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{item.jobTitle}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/recruiter/scraped-jobs")}
                    className="text-sm text-primary font-medium hover:underline shrink-0 hidden sm:block"
                  >
                    View Jobs →
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RecruiterScrapeJobs;
