import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecruiterScrapeJobs = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Scrape Jobs</h1>
        <p className="text-base text-muted-foreground mt-1">Search and scrape jobs from LinkedIn and JSearch</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Start Scraping Jobs</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Search for jobs across LinkedIn and JSearch platforms. Configure your filters and let AI find the best matches.
        </p>
        <Button variant="portal" size="lg">
          <Download className="w-4 h-4" />
          Begin Job Scraping
        </Button>
      </div>
    </div>
  );
};

export default RecruiterScrapeJobs;
