import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={className}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
