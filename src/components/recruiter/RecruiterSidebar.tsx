import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileUp,
  Users,
  ClipboardCheck,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import wavelynkLogo from "@/assets/wavelynk-logo.jpeg";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const mainMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, route: "/recruiter/dashboard" },
  { title: "Scrape Jobs", icon: Search, route: "/recruiter/scrape-jobs", badgeText: "New", badgeType: "primary" as const },
  { title: "Scraped Jobs", icon: Briefcase, route: "/recruiter/scraped-jobs", badgeText: "1,284", badgeType: "neutral" as const },
  { title: "CV Management", icon: FileUp, route: "/recruiter/cv-management" },
  { title: "Candidates", icon: Users, route: "/recruiter/candidates", badgeText: "23", badgeType: "neutral" as const },
  { title: "Applications", icon: ClipboardCheck, route: "/recruiter/applications", badgeText: "5", badgeType: "warning" as const },
];

const secondaryMenuItems = [
  { title: "Settings", icon: Settings, route: "/recruiter/settings" },
  { title: "Help & Support", icon: HelpCircle, route: "/recruiter/support" },
];

interface RecruiterSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const badgeStyles = {
  primary: "bg-primary text-primary-foreground",
  neutral: "bg-neutral-200 text-neutral-700",
  warning: "bg-warning-500 text-white",
};

const RecruiterSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: RecruiterSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (route: string) => location.pathname === route;

  const MenuItem = ({ item }: { item: typeof mainMenuItems[0] }) => {
    const active = isActive(item.route);
    const content = (
      <NavLink
        to={item.route}
        onClick={onMobileClose}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
          collapsed ? "justify-center px-2 mx-1" : "mx-3",
          active
            ? "bg-primary-100 text-primary-700 font-semibold"
            : "text-neutral-600 hover:text-primary-700 hover:bg-primary-50"
        )}
        activeClassName=""
      >
        {active && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}
        <item.icon
          className={cn(
            "shrink-0 w-5 h-5",
            active ? "text-primary" : "text-neutral-500 group-hover:text-primary"
          )}
        />
        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
        {!collapsed && item.badgeText && (
          <span className={cn(
            "ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold",
            badgeStyles[item.badgeType || "neutral"]
          )}>
            {item.badgeText}
          </span>
        )}
        {collapsed && item.badgeText && (
          <span className={cn(
            "absolute -top-1 -right-1 text-[9px] w-auto min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-semibold",
            badgeStyles[item.badgeType || "neutral"]
          )}>
            {item.badgeType === "primary" ? "!" : item.badgeText}
          </span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-secondary-900 text-white border-secondary-800">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <img src={wavelynkLogo} alt="Wave Lynk AI" className="w-28 rounded bg-white p-1" />
        )}
        {collapsed && (
          <img src={wavelynkLogo} alt="Wave Lynk AI" className="w-8 h-8 rounded bg-white p-0.5 mx-auto object-cover" />
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded bg-muted hover:bg-neutral-200 text-neutral-500 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded bg-muted hover:bg-neutral-200 text-neutral-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => (
          <MenuItem key={item.route} item={item} />
        ))}

        <div className="mx-3 my-4 border-t border-border" />

        {secondaryMenuItems.map((item) => (
          <MenuItem key={item.route} item={item} />
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="border-t border-border p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0 border-2 border-card">
                JS
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary-900 truncate">John Smith</p>
                <p className="text-xs text-neutral-500 truncate">TechCorp Inc.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-destructive hover:bg-error-50 w-full px-2 py-2 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold mx-auto hover:ring-2 hover:ring-primary-400 transition-all"
              >
                JS
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-secondary-900 text-white border-secondary-800">
              John Smith - TechCorp
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out",
          "shadow-sm",
          collapsed ? "w-[60px]" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default RecruiterSidebar;
