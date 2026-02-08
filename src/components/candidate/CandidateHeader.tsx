import { useState, useRef, useEffect } from "react";
import { Menu, Bell, User, Briefcase, FileText, HelpCircle, LogOut, CheckCircle, Send, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import { formatDistanceToNow } from "date-fns";

interface CandidateHeaderProps {
  onMenuClick: () => void;
}

const CandidateHeader = ({ onMenuClick }: CandidateHeaderProps) => {
  const navigate = useNavigate();
  const { fullName, email, signOut } = useAuth();
  const { notifications, unreadCount, markAllRead, stats } = useCandidateDashboard();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const initials = fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "C";
  const firstName = fullName?.split(" ")[0] || "there";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const getNotifIcon = (type: string) => {
    if (type === "status_update") return <CheckCircle className="w-5 h-5 text-success-500" />;
    if (type === "new_application") return <Send className="w-5 h-5 text-primary" />;
    if (type === "interview") return <Calendar className="w-5 h-5 text-warning-500" />;
    return <Bell className="w-5 h-5 text-neutral-500" />;
  };

  return (
    <header className="h-16 bg-card border-b border-border sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted text-neutral-600 transition-colors"><Menu className="w-5 h-5" /></button>
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 font-display">{greeting}, {firstName}</h2>
          <p className="text-xs text-neutral-600 flex items-center gap-1"><Briefcase className="w-3 h-3 text-neutral-500" /> You have {stats.total} application{stats.total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted text-neutral-600 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error-500 rounded-full animate-pulse" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[380px] bg-card border border-border rounded-xl shadow-elevated overflow-hidden animate-scale-in z-50">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-secondary-900">Notifications</h3>
                {unreadCount > 0 && <button onClick={markAllRead} className="text-sm text-primary hover:underline">Mark all as read</button>}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center"><Bell className="w-10 h-10 text-neutral-300 mx-auto mb-2" /><p className="text-sm text-neutral-500">No notifications</p></div>
                ) : notifications.map((n) => (
                  <div key={n.id} className={cn("px-4 py-3 border-b border-border last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer flex gap-3", !n.read && "bg-primary-50")}>
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", n.type === "status_update" ? "bg-success-50" : n.type === "interview" ? "bg-warning-50" : "bg-primary-50")}>
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900">{n.title}</p>
                      <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-neutral-500 mt-1">{formatDistanceToNow(new Date(n.time), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold border-2 border-primary-400 hover:ring-2 hover:ring-primary/30 transition-all">{initials}</button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-[240px] bg-card border border-border rounded-xl shadow-elevated overflow-hidden animate-scale-in z-50">
              <div className="p-4 text-center border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold mx-auto">{initials}</div>
                <p className="text-sm font-semibold text-secondary-900 mt-2">{fullName || "Candidate"}</p>
                <p className="text-xs text-neutral-600">{email || ""}</p>
              </div>
              <div className="py-1">
                {[
                  { icon: User, label: "My Profile", route: "/candidate/profile" },
                  { icon: Briefcase, label: "My Applications", route: "/candidate/applications" },
                  { icon: FileText, label: "My CVs", route: "/candidate/cvs" },
                ].map((item) => (
                  <button key={item.route} onClick={() => { navigate(item.route); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                    <item.icon className="w-4 h-4 text-neutral-500" /> {item.label}
                  </button>
                ))}
                <div className="border-t border-border my-1" />
                <button onClick={() => { navigate("/candidate/support"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                  <HelpCircle className="w-4 h-4 text-neutral-500" /> Help & Support
                </button>
                <div className="border-t border-border my-1" />
                <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-500 hover:bg-error-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CandidateHeader;
