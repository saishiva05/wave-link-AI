import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecruiterCandidates = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Candidates</h1>
          <p className="text-base text-muted-foreground mt-1">Manage your candidate pipeline</p>
        </div>
        <Button variant="portal">
          <UserPlus className="w-4 h-4" />
          Add Candidate
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-success-500" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">No candidates yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Add candidates to start matching them with opportunities and submitting applications.
        </p>
        <Button variant="portal" size="lg">
          <UserPlus className="w-4 h-4" />
          Add Your First Candidate
        </Button>
      </div>
    </div>
  );
};

export default RecruiterCandidates;
