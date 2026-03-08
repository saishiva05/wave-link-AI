import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import wavelynkIcon from "@/assets/wavelynk-icon.png";
import wavelynkLogoLight from "@/assets/wavelynk-logo-light.png";

interface PlatformSelectorProps {
  value: string;
  onChange: (value: "linkedin" | "jsearch") => void;
  error?: string;
}

const PlatformSelector = ({ value, onChange, error }: PlatformSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-3">
        Search Engine <span className="text-destructive">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* WaveLynk Max */}
        <button
          type="button"
          onClick={() => onChange("linkedin")}
          className={cn(
            "relative rounded-xl p-6 border-2 text-left transition-all duration-200 cursor-pointer group",
            value === "linkedin"
              ? "border-primary bg-primary-50 shadow-sm"
              : error
                ? "border-destructive bg-error-50"
                : "border-border hover:border-primary-400 hover:shadow-sm"
          )}
        >
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              value === "linkedin" ? "border-primary bg-primary" : "border-neutral-300"
            )}>
              {value === "linkedin" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <img src={wavelynkLogoLight} alt="WaveLynk Max" className="w-9 h-9 object-contain dark:hidden" />
            <img src={wavelynkIcon} alt="WaveLynk Max" className="w-9 h-9 object-contain hidden dark:block" />
            <span className="text-lg font-semibold text-foreground">WaveLynk Max</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Search professional job postings from the largest professional network
          </p>
          <span className="inline-block mt-3 text-[10px] font-semibold bg-success-50 text-success-700 px-2.5 py-1 rounded-full">
            Most Popular
          </span>
        </button>

        {/* WaveLynk Pro */}
        <button
          type="button"
          onClick={() => onChange("jsearch")}
          className={cn(
            "relative rounded-xl p-6 border-2 text-left transition-all duration-200 cursor-pointer group",
            value === "jsearch"
              ? "border-primary bg-primary-50 shadow-sm"
              : error
                ? "border-destructive bg-error-50"
                : "border-border hover:border-primary-400 hover:shadow-sm"
          )}
        >
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              value === "jsearch" ? "border-primary bg-primary" : "border-neutral-300"
            )}>
              {value === "jsearch" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <img src={wavelynkLogoLight} alt="WaveLynk Pro" className="w-9 h-9 object-contain dark:hidden" />
            <img src={wavelynkIcon} alt="WaveLynk Pro" className="w-9 h-9 object-contain hidden dark:block" />
            <span className="text-lg font-semibold text-foreground">WaveLynk Pro</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Access jobs from a broader aggregated search engine
          </p>
          <span className="inline-block mt-3 text-[10px] font-semibold bg-info-50 text-info-700 px-2.5 py-1 rounded-full">
            Broader Coverage
          </span>
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
};

export default PlatformSelector;
