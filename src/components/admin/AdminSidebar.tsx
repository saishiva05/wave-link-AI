import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import wavelynkLogo from "@/assets/wavelynk-logo.jpeg";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

const mainMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, route: "/admin/dashboard" },
  { title: "Recruiters", icon: Users, route: "/admin/recruiters" },
  { title: "Candidates", icon: GraduationCap, route: "/admin/candidates" },
  { title: "Analytics", icon: BarChart3, route: "/admin/analytics" },
  { title: "Activity Logs", icon: FileText, route: "/admin/activity-logs" },
];

const secondaryMenuItems = [
  { title: "Settings", icon: Settings, route: "/admin/settings" },
  { title: "Help & Support", icon: HelpCircle, route: "/admin/support" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fullName, email, signOut } = useAuth();
  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD";

  const isActive = (route: string) => location.pathname === route;

  const MenuItem = ({ item }: { item: typeof mainMenuItems[0] }) => {
    const active = isActive(item.route);
    const content = (
      <NavLink
        to={item.route}
        onClick={onMobileClose}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
          collapsed ? "justify-center px-2" : "mx-3",
          active
            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
            : "text-neutral-300 hover:text-white hover:bg-white/[0.08]"
        )}
        activeClassName=""
      >
        {active && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-100 rounded-r-full" />
        )}
        <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5", active ? "text-white" : "text-neutral-400 group-hover:text-primary-400")} />
        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-secondary-800 text-white border-secondary-700">
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
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <img src={wavelynkLogo} alt="Wave Lynk AI" className="w-28 rounded bg-white/90 p-1" />
        )}
        {collapsed && (
          <img src={wavelynkLogo} alt="Wave Lynk AI" className="w-8 h-8 rounded bg-white/90 p-0.5 mx-auto object-cover" />
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded bg-secondary-800 hover:bg-secondary-700 text-neutral-300 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded bg-secondary-800 hover:bg-secondary-700 text-neutral-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => (
          <MenuItem key={item.route} item={item} />
        ))}

        <div className="mx-3 my-4 border-t border-white/10" />

        {secondaryMenuItems.map((item) => (
          <MenuItem key={item.route} item={item} />
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="border-t border-white/10 p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{fullName || "Admin"}</p>
                <p className="text-xs text-neutral-400 truncate">{email || ""}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full px-2 py-2 rounded-md transition-colors"
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
                className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold mx-auto hover:ring-2 hover:ring-primary-400 transition-all"
              >
                {initials}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-secondary-800 text-white border-secondary-700">
              {fullName || "Admin"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-secondary-900 z-50 transition-all duration-300 ease-in-out",
          "shadow-lg",
          collapsed ? "w-[60px]" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
