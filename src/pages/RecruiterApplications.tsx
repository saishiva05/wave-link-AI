import { ClipboardCheck } from "lucide-react";

const RecruiterApplications = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Applications</h1>
        <p className="text-base text-muted-foreground mt-1">Track all submitted applications and their status</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-info-50 flex items-center justify-center mb-4">
          <ClipboardCheck className="w-8 h-8 text-info-500" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">No applications submitted</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Once you submit applications for your candidates, they'll appear here with real-time status tracking.
        </p>
      </div>
    </div>
  );
};

export default RecruiterApplications;
