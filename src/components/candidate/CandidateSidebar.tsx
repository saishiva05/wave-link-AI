import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Briefcase, FileText, User, HelpCircle, LogOut, ChevronLeft, ChevronRight, X, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import wavelynkLogo from "@/assets/wavelynk-logo.png";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

const mainMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, route: "/candidate/dashboard" },
  { title: "My Applications", icon: Briefcase, route: "/candidate/applications", badgeType: "primary" as const },
  { title: "My CVs", icon: FileText, route: "/candidate/cvs", badgeType: "neutral" as const },
  { title: "Messages", icon: MessageSquare, route: "/candidate/messages", badgeType: "neutral" as const },
];

const secondaryMenuItems = [
  { title: "Profile", icon: User, route: "/candidate/profile" },
  { title: "Help & Support", icon: HelpCircle, route: "/candidate/support" },
];

interface CandidateSidebarProps {
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

const CandidateSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: CandidateSidebarProps) => {
  const location = useLocation();
  const { fullName, signOut } = useAuth();
  const isActive = (route: string) => location.pathname === route;
  const initials = fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "C";

  const MenuItem = ({ item }: { item: typeof mainMenuItems[0] }) => {
    const active = isActive(item.route);
    const content = (
      <NavLink to={item.route} onClick={onMobileClose}
        className={cn("flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
          collapsed ? "justify-center px-2 mx-1" : "mx-3",
          active ? "bg-primary-100 text-primary font-semibold" : "text-muted-foreground hover:text-primary hover:bg-primary-50"
        )} activeClassName="">
        {active && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
        <item.icon className={cn("shrink-0 w-5 h-5", active ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
      </NavLink>
    );
    if (collapsed) {
      return (<Tooltip delayDuration={200}><TooltipTrigger asChild>{content}</TooltipTrigger><TooltipContent side="right" className="bg-secondary-900 text-white border-secondary-800">{item.title}</TooltipContent></Tooltip>);
    }
    return content;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-24 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && <img src={wavelynkLogo} alt="WaveLynk" className="h-16 w-auto object-contain rounded-lg bg-white p-2 shadow-sm" />}
        {collapsed && <img src={wavelynkLogo} alt="WaveLynk" className="w-11 h-11 rounded-lg bg-white p-1 mx-auto object-contain shadow-sm" />}
        <button onClick={onToggle} className="hidden lg:flex items-center justify-center w-7 h-7 rounded bg-muted hover:bg-neutral-200 text-neutral-500 transition-colors shrink-0">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button onClick={onMobileClose} className="lg:hidden flex items-center justify-center w-7 h-7 rounded bg-muted hover:bg-neutral-200 text-neutral-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => <MenuItem key={item.route} item={item} />)}
        <div className="mx-3 my-4 border-t border-border" />
        {secondaryMenuItems.map((item) => <MenuItem key={item.route} item={item} />)}
      </nav>
      <div className="border-t border-border p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0 border-2 border-card">{initials}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{fullName || "Candidate"}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-destructive hover:bg-error-50 w-full px-2 py-2 rounded-md transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        ) : (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button onClick={() => signOut()} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold mx-auto hover:ring-2 hover:ring-primary-400 transition-all">{initials}</button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-secondary-900 text-white border-secondary-800">{fullName || "Candidate"}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />}
      <aside className={cn("fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out shadow-sm",
        collapsed ? "w-[60px]" : "w-[280px]", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default CandidateSidebar;
