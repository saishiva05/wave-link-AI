import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, Calendar as CalendarIcon, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import type { CandidateApplication } from "@/hooks/useCandidateDashboard";
import ApplicationFilters from "@/components/candidate/ApplicationFilters";
import RecentApplicationsList from "@/components/candidate/RecentApplicationsList";
import ApplicationCard from "@/components/candidate/ApplicationCard";
import ApplicationDetailsModal from "@/components/candidate/ApplicationDetailsModal";
import ApplicationStatusChart from "@/components/candidate/ApplicationStatusChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const CandidateApplicationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cd = useCandidateDashboard();
  const [detailApp, setDetailApp] = useState<CandidateApplication | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) cd.setStatusFilter(statusParam as any);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Daily submissions chart data (last 30 days)
  const dailyData = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 29);
    const days = eachDayOfInterval({ start, end });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const count = cd.allFilteredApplications.filter((a) => {
        return format(new Date(a.applied_at), "yyyy-MM-dd") === dayStr;
      }).length;
      return { date: format(day, "MMM d"), fullDate: dayStr, count };
    });
  }, [cd.allFilteredApplications]);

  // Filter by calendar date
  const displayedApplications = useMemo(() => {
    if (!calendarDate) return cd.applications;
    const dateStr = format(calendarDate, "yyyy-MM-dd");
    return cd.allFilteredApplications.filter((a) => format(new Date(a.applied_at), "yyyy-MM-dd") === dateStr);
  }, [cd.applications, cd.allFilteredApplications, calendarDate]);

  const calendarLabel = calendarDate ? format(calendarDate, "MMM d, yyyy") : "All Dates";

  return (
    <>
      <ApplicationDetailsModal application={detailApp} onClose={() => setDetailApp(null)} />
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate("/candidate/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-semibold">My Applications</span>
          </nav>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground font-display">My Applications</h1>
              <p className="text-base text-muted-foreground mt-1">{cd.allFilteredApplications.length} job applications submitted on your behalf</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAnalytics(!showAnalytics)}>
              <BarChart3 className="w-4 h-4" /> {showAnalytics ? "Hide" : "Show"} Analytics
            </Button>
          </div>
        </motion.div>

        {/* Analytics Section */}
        {showAnalytics && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown Chart */}
            <ApplicationStatusChart data={cd.chartData} total={cd.stats.total} />

            {/* Daily Submissions */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Daily Submissions
                </h3>
                <span className="text-xs text-muted-foreground">Last 30 days</span>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => [value, "Applications"]}
                    />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#colorApps)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total", value: cd.stats.total, color: "text-foreground", bg: "bg-muted/50" },
                { label: "Pending", value: cd.stats.pending, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-50" },
                { label: "Interviews", value: cd.stats.interviews, color: "text-primary", bg: "bg-primary-50" },
                { label: "Offers", value: cd.stats.offers, color: "text-success-600", bg: "bg-success-50 dark:bg-success-50" },
                { label: "Rejected", value: cd.stats.rejected, color: "text-error-600", bg: "bg-error-50 dark:bg-error-50" },
              ].map((s) => (
                <div key={s.label} className={cn("rounded-xl p-4 text-center border border-border", s.bg)}>
                  <p className={cn("text-2xl font-bold font-display", s.color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Calendar Date Filter + Standard Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", calendarDate && "border-primary text-primary")}>
                  <CalendarIcon className="w-4 h-4" />
                  {calendarLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={setCalendarDate}
                  className={cn("p-3 pointer-events-auto")}
                />
                {calendarDate && (
                  <div className="px-3 pb-3">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setCalendarDate(undefined)}>Clear Date</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {calendarDate && (
              <span className="text-sm text-muted-foreground">
                {displayedApplications.length} application{displayedApplications.length !== 1 ? "s" : ""} on {format(calendarDate, "MMM d, yyyy")}
              </span>
            )}
          </div>
          <ApplicationFilters
            search={cd.search} onSearchChange={(v) => { cd.setSearch(v); cd.setPage(1); }}
            statusFilter={cd.statusFilter} onStatusFilterChange={(v) => { cd.setStatusFilter(v); cd.setPage(1); }}
            dateFilter={cd.dateFilter} onDateFilterChange={(v) => { cd.setDateFilter(v); cd.setPage(1); }}
            typeFilter={cd.typeFilter} onTypeFilterChange={(v) => { cd.setTypeFilter(v); cd.setPage(1); }}
            locationFilter={cd.locationFilter} onLocationFilterChange={(v) => { cd.setLocationFilter(v); cd.setPage(1); }}
            viewMode={cd.viewMode} onViewModeChange={cd.setViewMode}
            locations={cd.uniqueLocations} activeFilters={cd.activeFilters} clearAllFilters={cd.clearAllFilters}
            totalCount={cd.stats.total} filteredCount={cd.allFilteredApplications.length}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {displayedApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No matching applications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {calendarDate ? `No applications found on ${format(calendarDate, "MMM d, yyyy")}` : "Try adjusting your filters or search term"}
              </p>
              <button onClick={() => { cd.clearAllFilters(); setCalendarDate(undefined); }} className="mt-4 text-sm font-medium text-primary hover:underline">Clear Filters</button>
            </div>
          ) : cd.viewMode === "list" ? (
            <RecentApplicationsList applications={displayedApplications} onViewDetails={setDetailApp} onViewAll={() => {}} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedApplications.map((app) => (
                <ApplicationCard key={app.application_id} application={app} onViewDetails={() => setDetailApp(app)} />
              ))}
            </div>
          )}
        </motion.div>

        {!calendarDate && cd.allFilteredApplications.length > cd.perPage && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 shadow-xs">
            <p className="text-sm text-muted-foreground">Showing {(cd.page - 1) * cd.perPage + 1}–{Math.min(cd.page * cd.perPage, cd.allFilteredApplications.length)} of {cd.allFilteredApplications.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => cd.setPage(Math.max(1, cd.page - 1))} disabled={cd.page === 1} className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(cd.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => cd.setPage(p)} className={cn("w-8 h-8 rounded text-sm font-medium transition-colors", cd.page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted")}>{p}</button>
              ))}
              <button onClick={() => cd.setPage(Math.min(cd.totalPages, cd.page + 1))} disabled={cd.page === cd.totalPages} className="w-8 h-8 rounded flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateApplicationsPage;
