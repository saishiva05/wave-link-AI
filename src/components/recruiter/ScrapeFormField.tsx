import { LucideIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrapeFormFieldProps {
  label: string;
  required?: boolean;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
}

const ScrapeFormField = ({
  label,
  required,
  icon: Icon,
  placeholder,
  value,
  onChange,
  error,
  helper,
}: ScrapeFormFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full h-12 pl-11 pr-4 text-base rounded-lg border bg-card text-foreground placeholder:text-muted-foreground outline-none transition-all",
            error
              ? "border-destructive focus:ring-2 focus:ring-destructive/30 animate-shake"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          )}
        />
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-neutral-500">{helper}</p>
      ) : null}
    </div>
  );
};

export default ScrapeFormField;
