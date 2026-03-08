import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, TrendingUp, Users, Calendar, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isToday, isYesterday, startOfDay } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { useTheme } from "@/components/ThemeProvider";

const statusStyles: Record<string, string> = {
  pending: "bg-warning-50 text-warning-700",
  submitted: "bg-info-50 text-info-700",
  rejected: "bg-error-50 text-error-700",
  interview_scheduled: "bg-primary-50 text-primary",
  interviewed: "bg-primary-100 text-primary-700",
  offer_received: "bg-success-50 text-success-700",
  hired: "bg-success-100 text-success-700",
  declined: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  submitted: "Submitted",
  rejected: "Rejected",
  interview_scheduled: "Interview",
  interviewed: "Interviewed",
  offer_received: "Offer",
  hired: "Hired",
  declined: "Declined",
};

const AdminApplications = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30D");
  const [expandedRecruiter, setExpandedRecruiter] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Fetch all applications with recruiter + candidate + job info
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin", "all-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          application_id, application_status, applied_at, status_updated_at, recruiter_notes,
          recruiter_id, candidate_id, job_id, cv_id,
          scraped_jobs!job_applications_job_id_fkey(job_title, company_name),
          candidates!job_applications_candidate_id_fkey(
            users!candidates_user_id_fkey(full_name, email)
          ),
          recruiters!job_applications_recruiter_id_fkey(
            recruiter_id,
            users!recruiters_user_id_fkey(full_name, email)
          )
        `)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Date range filter
  const rangeDays = dateRange === "7D" ? 7 : dateRange === "30D" ? 30 : dateRange === "3M" ? 90 : 365;
  const cutoffDate = subDays(new Date(), rangeDays);

  const filteredApps = useMemo(() => {
    return applications.filter((app: any) => {
      if (new Date(app.applied_at) < cutoffDate) return false;
      if (statusFilter !== "all" && app.application_status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const jobTitle = (app.scraped_jobs as any)?.job_title?.toLowerCase() || "";
        const company = (app.scraped_jobs as any)?.company_name?.toLowerCase() || "";
        const candidateName = (app.candidates as any)?.users?.full_name?.toLowerCase() || "";
        const recruiterName = (app.recruiters as any)?.users?.full_name?.toLowerCase() || "";
        if (!jobTitle.includes(s) && !company.includes(s) && !candidateName.includes(s) && !recruiterName.includes(s)) return false;
      }
      return true;
    });
  }, [applications, cutoffDate, statusFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredApps.length;
    const byStatus: Record<string, number> = {};
    const byRecruiter: Record<string, { name: string; email: string; count: number; apps: any[] }> = {};
    const byDate: Record<string, number> = {};

    filteredApps.forEach((app: any) => {
      byStatus[app.application_status] = (byStatus[app.application_status] || 0) + 1;

      const rid = app.recruiter_id;
      if (!byRecruiter[rid]) {
        byRecruiter[rid] = {
          name: (app.recruiters as any)?.users?.full_name || "Unknown",
          email: (app.recruiters as any)?.users?.email || "",
          count: 0,
          apps: [],
        };
      }
      byRecruiter[rid].count++;
      byRecruiter[rid].apps.push(app);

      const dateKey = format(new Date(app.applied_at), "MMM d");
      byDate[dateKey] = (byDate[dateKey] || 0) + 1;
    });

    const hired = byStatus["hired"] || 0;
    const successRate = total > 0 ? Math.round((hired / total) * 100) : 0;

    return { total, byStatus, byRecruiter, byDate, successRate, hired };
  }, [filteredApps]);

  const trendData = Object.entries(stats.byDate).map(([date, count]) => ({ date, applications: count }));
  const statusChartData = Object.entries(stats.byStatus).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
    status,
  }));

  const recruiterRanking = Object.entries(stats.byRecruiter)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count);

  const gridColor = isDark ? "hsl(220, 14%, 22%)" : "hsl(214, 20%, 92%)";
  const tickColor = isDark ? "hsl(215, 15%, 58%)" : "hsl(215, 10%, 55%)";
  const primaryStroke = isDark ? "hsl(174, 72%, 45%)" : "hsl(174, 72%, 33%)";
  const tooltipStyle = {
    background: isDark ? "hsl(220, 18%, 14%)" : "hsl(215, 60%, 14%)",
    border: isDark ? "1px solid hsl(220, 14%, 22%)" : "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "13px",
    boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.2)",
    padding: "10px 14px",
  };

  const statusColors = [
    "hsl(38, 92%, 50%)", "hsl(210, 70%, 50%)", "hsl(0, 84%, 60%)",
    "hsl(174, 72%, 33%)", "hsl(174, 72%, 45%)", "hsl(142, 71%, 45%)",
    "hsl(142, 60%, 38%)", "hsl(215, 15%, 55%)",
  ];

  const dateRanges = ["7D", "30D", "3M", "1Y"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">Applications</h1>
          </div>
          <p className="text-base text-muted-foreground ml-[52px]">Track all job application submissions across recruiters</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {dateRanges.map((r) => (
            <button key={r} onClick={() => setDateRange(r)}
              className={cn("px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                dateRange === r ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-card"
              )}>{r}</button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: stats.total, icon: ClipboardCheck, color: "bg-primary-50 text-primary" },
          { label: "Active Recruiters", value: Object.keys(stats.byRecruiter).length, icon: Users, color: "bg-info-50 text-info-500" },
          { label: "Hired", value: stats.hired, icon: TrendingUp, color: "bg-success-50 text-success-500" },
          { label: "Success Rate", value: `${stats.successRate}%`, icon: Calendar, color: "bg-warning-50 text-warning-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", s.color.split(" ")[0])}>
              <s.icon className={cn("w-5 h-5", s.color.split(" ")[1])} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-base font-semibold text-foreground mb-4">Applications Over Time</h3>
          <div className="h-[260px]">
            {isLoading ? <Skeleton className="w-full h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={primaryStroke} stopOpacity={isDark ? 0.3 : 0.2} />
                      <stop offset="100%" stopColor={primaryStroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}`, "Applications"]} />
                  <Area type="monotone" dataKey="applications" stroke={primaryStroke} strokeWidth={2.5} fill="url(#appGradient)" dot={false}
                    activeDot={{ r: 6, strokeWidth: 3, stroke: isDark ? "hsl(220, 18%, 12%)" : "#fff", fill: primaryStroke }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-base font-semibold text-foreground mb-4">Status Distribution</h3>
          <div className="h-[200px]">
            {isLoading ? <Skeleton className="w-full h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0} cornerRadius={3}>
                    {statusChartData.map((_, i) => (<Cell key={i} fill={statusColors[i % statusColors.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-1.5 mt-2">
            {statusChartData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[i % statusColors.length] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Per-Recruiter Breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
        className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground font-display">Applications by Recruiter</h2>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground outline-none focus:border-primary transition-all">
              <option value="all">All Status</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : recruiterRanking.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No applications found for this period.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recruiterRanking.map((rec, idx) => {
              const isExpanded = expandedRecruiter === rec.id;
              const maxCount = recruiterRanking[0]?.count || 1;
              const pct = Math.round((rec.count / maxCount) * 100);

              // Daily breakdown for this recruiter
              const dailyMap: Record<string, number> = {};
              rec.apps.forEach((app: any) => {
                const day = format(new Date(app.applied_at), "MMM d");
                dailyMap[day] = (dailyMap[day] || 0) + 1;
              });

              return (
                <div key={rec.id} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                  <button onClick={() => setExpandedRecruiter(isExpanded ? null : rec.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary font-bold text-sm shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-semibold text-foreground truncate">{rec.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{rec.email}</p>
                      </div>
                      <div className="hidden sm:flex flex-1 items-center gap-3 mx-4">
                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm font-bold">{rec.count}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Daily breakdown bar chart */}
                      {Object.keys(dailyMap).length > 1 && (
                        <div className="p-4 border-b border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Daily Submissions</p>
                          <div className="h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={Object.entries(dailyMap).map(([d, c]) => ({ date: d, count: c }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}`, "Applications"]} />
                                <Bar dataKey="count" fill={primaryStroke} radius={[4, 4, 0, 0]} barSize={20} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Application list */}
                      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                        {rec.apps.map((app: any) => (
                          <div key={app.application_id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{(app.scraped_jobs as any)?.job_title || "—"}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {(app.scraped_jobs as any)?.company_name} • {(app.candidates as any)?.users?.full_name || "Unknown"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-3">
                              <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium", statusStyles[app.application_status] || "bg-muted text-muted-foreground")}>
                                {statusLabels[app.application_status] || app.application_status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {isToday(new Date(app.applied_at)) ? "Today" : isYesterday(new Date(app.applied_at)) ? "Yesterday" : format(new Date(app.applied_at), "MMM d")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminApplications;
