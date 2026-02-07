import { Briefcase } from "lucide-react";

const RecruiterScrapedJobs = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Scraped Jobs</h1>
        <p className="text-base text-muted-foreground mt-1">View and manage all jobs you've scraped</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-info-50 flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-info-500" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Your Scraped Jobs</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          All your scraped jobs from LinkedIn and JSearch will appear here with ATS analysis and application tracking.
        </p>
      </div>
    </div>
  );
};

export default RecruiterScrapedJobs;
