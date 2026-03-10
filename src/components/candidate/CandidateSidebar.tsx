import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Briefcase, FileText, User, HelpCircle, LogOut, ChevronLeft, ChevronRight, X, MessageSquare, Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WaveLynkLogo from "@/components/WaveLynkLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, route: "/candidate/dashboard" },
  { title: "My Applications", icon: Briefcase, route: "/candidate/applications", badgeType: "primary" as const },
  { title: "Job Postings", icon: Newspaper, route: "/candidate/job-postings", badgeType: "neutral" as const },
  { title: "My Resumes", icon: FileText, route: "/candidate/cvs", badgeType: "neutral" as const },
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

const CandidateSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: CandidateSidebarProps) => {
  const location = useLocation();
  const { fullName, signOut, profile } = useAuth();
  const isActive = (route: string) => location.pathname === route;
  const initials = fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "C";

  const MenuItem = ({ item }: { item: typeof mainMenuItems[0] }) => {
    const active = isActive(item.route);
    const content = (
      <NavLink to={item.route} onClick={onMobileClose}
        className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          collapsed ? "justify-center px-2 mx-1" : "mx-3",
          active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )} activeClassName="">
        <item.icon className={cn("shrink-0 w-[18px] h-[18px]", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
      </NavLink>
    );
    if (collapsed) {
      return (<Tooltip delayDuration={200}><TooltipTrigger asChild>{content}</TooltipTrigger><TooltipContent side="right" className="bg-card text-foreground border-border">{item.title}</TooltipContent></Tooltip>);
    }
    return content;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-3 border-b border-border">
        <div className="flex-1 flex items-center justify-center gap-2">
          <WaveLynkLogo size={collapsed ? "md" : "lg"} />
          {!collapsed && (
            <span className="font-display text-base font-bold text-foreground tracking-tight">
              Wave<span className="text-primary">Lynk</span>
            </span>
          )}
        </div>
        <button onClick={onToggle} className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-muted hover:bg-border text-muted-foreground transition-colors shrink-0">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onMobileClose} className="lg:hidden flex items-center justify-center w-6 h-6 rounded-md bg-muted hover:bg-border text-muted-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
      </div>
      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
        {mainMenuItems.map((item) => <MenuItem key={item.route} item={item} />)}
        <div className="mx-3 my-3 border-t border-border" />
        {secondaryMenuItems.map((item) => <MenuItem key={item.route} item={item} />)}
      </nav>
      <div className="border-t border-border p-3">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} alt={fullName || "Candidate"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{fullName || "Candidate"}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-destructive hover:bg-error-50 w-full px-2 py-2 rounded-md transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        ) : (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button onClick={() => signOut()} className="mx-auto hover:ring-2 hover:ring-primary/40 transition-all rounded-full">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={fullName || "Candidate"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card text-foreground border-border">{fullName || "Candidate"}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onMobileClose} />}
      <aside className={cn("fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-[56px]" : "w-[260px]", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default CandidateSidebar;