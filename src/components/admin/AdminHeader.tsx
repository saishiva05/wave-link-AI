import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  User,
  Settings,
  HelpCircle,
  LogOut,
  UserPlus,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const breadcrumbMap: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/recruiters": "Recruiters",
  "/admin/candidates": "Candidates",
  "/admin/analytics": "Analytics",
  "/admin/activity-logs": "Activity Logs",
  "/admin/settings": "Settings",
  "/admin/support": "Help & Support",
};

const mockNotifications = [
  { id: 1, text: "New recruiter Sarah Johnson created", time: "2 hours ago", read: false, icon: UserPlus },
  { id: 2, text: "Recruiter Mike Chen found 45 new jobs", time: "4 hours ago", read: false, icon: UserPlus },
  { id: 3, text: "System update completed successfully", time: "1 day ago", read: true, icon: CheckCheck },
];

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const location = useLocation();
  const { fullName, email, signOut } = useAuth();
  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD";
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const currentPage = breadcrumbMap[location.pathname] || "Dashboard";
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications((n) => n.map((item) => ({ ...item, read: true })));

  return (
    <header className="h-16 bg-card border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          <Link to="/admin/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground font-semibold">{currentPage}</span>
        </nav>

        {/* Mobile title */}
        <h1 className="md:hidden text-base font-semibold text-foreground">{currentPage}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* Search */}
        <div className="hidden lg:flex items-center bg-muted rounded-lg px-3 py-2 w-[260px] border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
          <Search className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            type="text"
            placeholder="Search platform..."
            className="ml-2 bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-primary-50 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card rounded-xl border border-border shadow-elevated overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
                      !n.read && "bg-primary-50"
                    )}
                  >
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                    <div className={cn("min-w-0", n.read && "ml-4")}>
                      <p className="text-sm text-foreground">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-sm font-semibold border-2 border-white shadow-sm hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
          >
            {initials}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-56 bg-card rounded-xl border border-border shadow-elevated overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{fullName || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{email || ""}</p>
              </div>
              <div className="p-1.5">
                {[
                  { icon: User, label: "My Profile" },
                  { icon: Settings, label: "Settings" },
                  { icon: HelpCircle, label: "Help & Support" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    {item.label}
                  </button>
                ))}
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
