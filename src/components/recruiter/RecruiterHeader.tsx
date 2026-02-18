import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Menu,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Search,
  Upload,
  UserPlus,
  Sparkles,
  CheckCircle,
  Download,
  BellOff,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

interface RecruiterHeaderProps {
  onMenuClick: () => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const mockNotifications = [
  { id: 1, text: "Job scraping completed: 45 jobs added from LinkedIn", time: "2 hours ago", read: false, icon: Download, iconBg: "bg-primary-100", iconColor: "text-primary" },
  { id: 2, text: "ATS analysis ready for Frontend Developer at TechCorp", time: "4 hours ago", read: false, icon: Sparkles, iconBg: "bg-warning-50", iconColor: "text-warning-500" },
  { id: 3, text: "Application submitted for John Doe", time: "1 day ago", read: true, icon: CheckCircle, iconBg: "bg-success-50", iconColor: "text-success-500" },
];

const RecruiterHeader = ({ onMenuClick }: RecruiterHeaderProps) => {
  const { fullName, email, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "R";
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setShowQuickActions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications((n) => n.map((item) => ({ ...item, read: true })));

  const closeAll = () => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowQuickActions(false);
  };

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

        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground font-display">
            {getGreeting()}, {fullName?.split(" ")[0] || "there"}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Manage your recruitment pipeline
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* Quick Actions */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => { setShowQuickActions(!showQuickActions); setShowNotifications(false); setShowUserMenu(false); }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Quick Actions
          </button>
          <button
            onClick={() => { setShowQuickActions(!showQuickActions); setShowNotifications(false); setShowUserMenu(false); }}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground"
            aria-label="Quick actions"
          >
            <Plus className="w-4 h-4" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 top-12 w-64 bg-card rounded-xl border border-border shadow-elevated overflow-hidden animate-scale-in z-50">
              <div className="p-1.5">
                {[
                  { icon: Search, label: "Scrape New Jobs", route: "/recruiter/scrape-jobs" },
                  { icon: Upload, label: "Upload CV", route: "/recruiter/cv-management" },
                  { icon: UserPlus, label: "Add Candidate", route: "/recruiter/candidates" },
                  { icon: Sparkles, label: "Run ATS Analysis", route: "/recruiter/scraped-jobs" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.route}
                    onClick={closeAll}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-primary-50 transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); setShowQuickActions(false); }}
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-primary-50 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-[340px] bg-card rounded-xl border border-border shadow-elevated overflow-hidden animate-scale-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                      !n.read && "bg-primary-50"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", n.iconBg)}>
                      <n.icon className={cn("w-4 h-4", n.iconColor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground leading-snug">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowQuickActions(false); }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold border-2 border-primary-400 shadow-sm hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
          >
            {initials}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-56 bg-card rounded-xl border border-border shadow-elevated overflow-hidden animate-scale-in z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{fullName || "Recruiter"}</p>
                <p className="text-xs text-muted-foreground">{email || ""}</p>
              </div>
              <div className="p-1.5">
                {[
                  { icon: User, label: "My Profile" },
                  { icon: Settings, label: "Account Settings" },
                  { icon: Sliders, label: "Preferences" },
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
                <Link
                  to="/recruiter/support"
                  onClick={closeAll}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  Help & Support
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-error-50 transition-colors"
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

export default RecruiterHeader;
