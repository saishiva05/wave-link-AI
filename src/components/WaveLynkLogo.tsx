import wavelynkIcon from "@/assets/wavelynk-icon.png";
import wavelynkLogoLight from "@/assets/wavelynk-logo-light.png";
import { cn } from "@/lib/utils";

interface WaveLynkLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-10 h-10",
  xl: "w-12 h-12",
};

const WaveLynkLogo = ({ className, size = "md" }: WaveLynkLogoProps) => {
  return (
    <>
      <img
        src={wavelynkLogoLight}
        alt="WaveLynk"
        className={cn(sizeMap[size], "object-contain dark:hidden", className)}
      />
      <img
        src={wavelynkIcon}
        alt="WaveLynk"
        className={cn(sizeMap[size], "object-contain hidden dark:block", className)}
      />
    </>
  );
};

export default WaveLynkLogo;
