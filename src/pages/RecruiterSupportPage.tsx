import { HelpCircle } from "lucide-react";

const RecruiterSupport = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Help & Support</h1>
        <p className="text-base text-muted-foreground mt-1">Get help with Wave Lynk AI features</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-info-50 flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-info-500" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Need Help?</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Contact your administrator or reach us at support@wavelynk.ai for assistance.
        </p>
      </div>
    </div>
  );
};

export default RecruiterSupport;
