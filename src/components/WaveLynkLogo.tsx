import wavelynkLogo from "@/assets/wavelynk-logo-unified.png";
import { cn } from "@/lib/utils";

interface WaveLynkLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  sm: "w-7 h-7",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-14 h-14",
  "2xl": "w-20 h-20",
};

const WaveLynkLogo = ({ className, size = "md" }: WaveLynkLogoProps) => {
  return (
    <img
      src={wavelynkLogo}
      alt="WaveLynk"
      className={cn(sizeMap[size], "object-contain", className)}
    />
  );
};

export default WaveLynkLogo;
