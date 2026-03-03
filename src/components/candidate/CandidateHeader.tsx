import { useState, useRef, useEffect } from "react";
import { Menu, Bell, User, Briefcase, FileText, HelpCircle, LogOut, CheckCircle, Send, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CandidateHeaderProps {
  onMenuClick: () => void;
}

const CandidateHeader = ({ onMenuClick }: CandidateHeaderProps) => {
  const navigate = useNavigate();
  const { fullName, email, signOut, profile } = useAuth();
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
    return <Bell className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <header className="h-16 bg-card border-b border-border sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"><Menu className="w-5 h-5" /></button>
        <div>
          <h2 className="text-lg font-semibold text-foreground font-display">{greeting}, {firstName}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3 text-muted-foreground" /> You have {stats.total} application{stats.total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error-500 rounded-full animate-pulse" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[380px] bg-card border border-border rounded-xl shadow-elevated overflow-hidden animate-scale-in z-50">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && <button onClick={markAllRead} className="text-sm text-primary hover:underline">Mark all as read</button>}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center"><Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No notifications</p></div>
                ) : notifications.map((n) => (
                  <div key={n.id} className={cn("px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3", !n.read && "bg-primary-50")}>
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", n.type === "status_update" ? "bg-success-50" : n.type === "interview" ? "bg-warning-50" : "bg-primary-50")}>
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.time), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="rounded-full border-2 border-primary-400 hover:ring-2 hover:ring-primary/30 transition-all">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || undefined} alt={fullName || "Candidate"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-[240px] bg-card border border-border rounded-xl shadow-elevated overflow-hidden animate-scale-in z-50">
              <div className="p-4 text-center border-b border-border">
                <Avatar className="w-12 h-12 mx-auto">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={fullName || "Candidate"} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground mt-2">{fullName || "Candidate"}</p>
                <p className="text-xs text-muted-foreground">{email || ""}</p>
              </div>
              <div className="py-1">
                {[
                  { icon: User, label: "My Profile", route: "/candidate/profile" },
                  { icon: Briefcase, label: "My Applications", route: "/candidate/applications" },
                  { icon: FileText, label: "My CVs", route: "/candidate/cvs" },
                ].map((item) => (
                  <button key={item.route} onClick={() => { navigate(item.route); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                    <item.icon className="w-4 h-4 text-muted-foreground" /> {item.label}
                  </button>
                ))}
                <div className="border-t border-border my-1" />
                <button onClick={() => { navigate("/candidate/support"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" /> Help & Support
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
