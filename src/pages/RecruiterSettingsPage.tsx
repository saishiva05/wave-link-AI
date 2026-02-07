import { Settings } from "lucide-react";

const RecruiterSettings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">Manage your account preferences and settings</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-neutral-500" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Account Settings</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Settings and account preferences coming soon.
        </p>
      </div>
    </div>
  );
};

export default RecruiterSettings;
