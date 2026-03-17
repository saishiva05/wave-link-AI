import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileUp,
  Users,
  ClipboardCheck,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WaveLynkLogo from "@/components/WaveLynkLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

const mainMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, route: "/recruiter/dashboard" },
  { title: "Find Jobs", icon: Search, route: "/recruiter/find-jobs" },
  { title: "Job Board", icon: Briefcase, route: "/recruiter/job-board" },
  { title: "CV Management", icon: FileUp, route: "/recruiter/cv-management" },
  { title: "Job Postings", icon: Newspaper, route: "/recruiter/job-postings" },
  { title: "Candidates", icon: Users, route: "/recruiter/candidates" },
  { title: "Applications", icon: ClipboardCheck, route: "/recruiter/applications" },
  { title: "Messages", icon: MessageSquare, route: "/recruiter/messages" },
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

const RecruiterSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: RecruiterSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fullName, signOut } = useAuth();
  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "R";

  const isActive = (route: string) => location.pathname === route;

  const MenuItem = ({ item }: { item: typeof mainMenuItems[0] }) => {
    const active = isActive(item.route);
    const content = (
      <NavLink
        to={item.route}
        onClick={onMobileClose}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          collapsed ? "justify-center px-2 mx-1" : "mx-3",
          active
            ? "bg-primary text-primary-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        activeClassName=""
      >
        <item.icon
          className={cn(
            "shrink-0 w-[18px] h-[18px]",
            active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-card text-foreground border-border">
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
      <div className="h-16 flex items-center justify-between px-3 border-b border-border">
        <div className="flex-1 flex items-center justify-center gap-2">
          <WaveLynkLogo size={collapsed ? "md" : "lg"} />
          {!collapsed && (
            <span className="font-display text-base font-bold text-foreground tracking-tight">
              Wave<span className="text-primary">Lynk</span>
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-muted hover:bg-border text-muted-foreground transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-6 h-6 rounded-md bg-muted hover:bg-border text-muted-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
        {mainMenuItems.map((item) => (
          <MenuItem key={item.route} item={item} />
        ))}

        <div className="mx-3 my-3 border-t border-border" />

        {secondaryMenuItems.map((item) => (
          <MenuItem key={item.route} item={item} />
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="border-t border-border p-3">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{fullName || "Recruiter"}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
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
                onClick={() => signOut()}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold mx-auto hover:ring-2 hover:ring-primary/40 transition-all"
              >
                {initials}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card text-foreground border-border">
              {fullName || "Recruiter"}
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out",
          collapsed ? "w-[56px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default RecruiterSidebar;