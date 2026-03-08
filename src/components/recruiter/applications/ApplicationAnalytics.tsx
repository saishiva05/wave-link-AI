import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck, TrendingUp, CalendarCheck, Users, Award,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";
import { format, subDays, isToday, isYesterday, startOfDay, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface ApplicationAnalyticsProps {
  applications: any[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(var(--warning))",
  submitted: "hsl(var(--info))",
  interview_scheduled: "hsl(var(--primary))",
  interviewed: "hsl(var(--primary))",
  offer_received: "hsl(var(--success))",
  hired: "hsl(142, 70%, 35%)",
  rejected: "hsl(var(--destructive))",
  declined: "hsl(var(--destructive))",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  submitted: "Submitted",
  interview_scheduled: "Interview",
  interviewed: "Interviewed",
  offer_received: "Offer",
  hired: "Hired",
  rejected: "Rejected",
  declined: "Declined",
};

const ApplicationAnalytics = ({ applications }: ApplicationAnalyticsProps) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const todayApps = applications.filter((a) => isToday(new Date(a.applied_at)));
    const yesterdayApps = applications.filter((a) => isYesterday(new Date(a.applied_at)));
    const last7 = applications.filter((a) => differenceInDays(now, new Date(a.applied_at)) < 7);
    const last30 = applications.filter((a) => differenceInDays(now, new Date(a.applied_at)) < 30);

    // Status distribution
    const statusCounts: Record<string, number> = {};
    applications.forEach((a) => {
      statusCounts[a.application_status] = (statusCounts[a.application_status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts)
      .map(([key, value]) => ({ name: STATUS_LABELS[key] || key, value, key }))
      .sort((a, b) => b.value - a.value);

    // Daily trend (last 14 days)
    const trendData = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(now, 13 - i);
      const dayStr = format(date, "yyyy-MM-dd");
      const count = applications.filter((a) =>
        format(new Date(a.applied_at), "yyyy-MM-dd") === dayStr
      ).length;
      return { date: format(date, "MMM dd"), count };
    });

    // Per-candidate breakdown
    const candidateMap: Record<string, { name: string; total: number; statuses: Record<string, number> }> = {};
    applications.forEach((a) => {
      const name = a.candidates?.users?.full_name || "Unknown";
      const cid = a.candidate_id;
      if (!candidateMap[cid]) {
        candidateMap[cid] = { name, total: 0, statuses: {} };
      }
      candidateMap[cid].total++;
      candidateMap[cid].statuses[a.application_status] =
        (candidateMap[cid].statuses[a.application_status] || 0) + 1;
    });
    const candidateBreakdown = Object.entries(candidateMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);

    // Success rate
    const positiveStatuses = ["interview_scheduled", "interviewed", "offer_received", "hired"];
    const positiveCount = applications.filter((a) => positiveStatuses.includes(a.application_status)).length;
    const successRate = applications.length > 0 ? Math.round((positiveCount / applications.length) * 100) : 0;

    // Daily change
    const dailyChange = todayApps.length - yesterdayApps.length;

    return {
      total: applications.length,
      today: todayApps.length,
      yesterday: yesterdayApps.length,
      last7: last7.length,
      last30: last30.length,
      statusData,
      statusCounts,
      trendData,
      candidateBreakdown,
      successRate,
      dailyChange,
      uniqueCandidates: Object.keys(candidateMap).length,
    };
  }, [applications]);

  const statsCards = [
    {
      label: "Total Applications",
      value: analytics.total,
      icon: ClipboardCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Today's Submissions",
      value: analytics.today,
      icon: CalendarCheck,
      color: "text-success-600",
      bg: "bg-success/10",
      change: analytics.dailyChange,
    },
    {
      label: "This Week",
      value: analytics.last7,
      icon: TrendingUp,
      color: "text-info-600",
      bg: "bg-info/10",
    },
    {
      label: "Candidates Applied",
      value: analytics.uniqueCandidates,
      icon: Users,
      color: "text-secondary-600",
      bg: "bg-secondary/10",
    },
    {
      label: "Success Rate",
      value: `${analytics.successRate}%`,
      icon: Award,
      color: "text-warning-600",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon className={cn("w-4.5 h-4.5", card.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-900 font-display">{card.value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{card.label}</p>
            {card.change !== undefined && (
              <div className={cn("flex items-center gap-0.5 mt-1 text-xs font-semibold",
                card.change >= 0 ? "text-success-600" : "text-error-600"
              )}>
                {card.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(card.change)} vs yesterday
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-secondary-900 uppercase tracking-wider mb-4">
            Daily Submissions (14 Days)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData}>
                <defs>
                  <linearGradient id="appTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="url(#appTrendGrad)"
                  strokeWidth={2}
                  name="Applications"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-secondary-900 uppercase tracking-wider mb-4">
            Status Distribution
          </h3>
          {analytics.statusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                    >
                      {analytics.statusData.map((entry) => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || "hsl(var(--muted))"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                {analytics.statusData.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.key] }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          )}
        </motion.div>
      </div>

      {/* Per-Candidate Breakdown */}
      {analytics.candidateBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-bold text-secondary-900 uppercase tracking-wider mb-4">
            Per-Candidate Breakdown
          </h3>
          <div className="space-y-3">
            {analytics.candidateBreakdown.map((c) => {
              const maxCount = analytics.candidateBreakdown[0]?.total || 1;
              return (
                <div key={c.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-secondary-900 truncate">{c.name}</p>
                      <span className="text-sm font-bold text-secondary-900 ml-2">{c.total}</span>
                    </div>
                    <div className="flex items-center gap-1 h-5">
                      {Object.entries(c.statuses).map(([status, count]) => (
                        <div
                          key={status}
                          className="h-full rounded-sm transition-all"
                          style={{
                            width: `${(count / c.total) * 100}%`,
                            minWidth: 6,
                            background: STATUS_COLORS[status] || "hsl(var(--muted))",
                          }}
                          title={`${STATUS_LABELS[status] || status}: ${count}`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                      {Object.entries(c.statuses).map(([status, count]) => (
                        <span key={status} className="text-[10px] text-muted-foreground">
                          {STATUS_LABELS[status] || status}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ApplicationAnalytics;
