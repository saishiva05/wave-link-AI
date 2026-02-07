import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecruiterCVManagement = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">CV Management</h1>
        <p className="text-base text-muted-foreground mt-1">Upload and manage candidate CVs and resumes</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <FileUp className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Upload CVs</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Upload candidate resumes for ATS analysis and matching with scraped job opportunities.
        </p>
        <Button variant="portal" size="lg">
          <FileUp className="w-4 h-4" />
          Upload CV
        </Button>
      </div>
    </div>
  );
};

export default RecruiterCVManagement;
