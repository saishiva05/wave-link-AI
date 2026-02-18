import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAdminChartData } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Globe, Trophy } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const dateRanges = ["7D", "30D", "3M", "1Y"];

const DashboardCharts = () => {
  const [activeRange, setActiveRange] = useState("30D");
  const { data, isLoading } = useAdminChartData(activeRange);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const jobsByDateData = data?.jobsTrendData || [];
  const platformData = [
    { name: "LinkedIn", value: data?.platformData.linkedin || 0, color: isDark ? "hsl(174, 72%, 45%)" : "hsl(174, 72%, 33%)" },
    { name: "JSearch", value: data?.platformData.jsearch || 0, color: isDark ? "hsl(215, 40%, 55%)" : "hsl(215, 60%, 18%)" },
  ];
  const total = data?.platformData.total || 0;
  const topRecruitersData = data?.topRecruiters || [];

  // Theme-aware chart colors
  const gridColor = isDark ? "hsl(215, 15%, 25%)" : "hsl(214, 20%, 92%)";
  const tickColor = isDark ? "hsl(210, 12%, 60%)" : "hsl(215, 10%, 55%)";
  const labelColor = isDark ? "hsl(210, 15%, 75%)" : "hsl(215, 15%, 35%)";
  const barBgColor = isDark ? "hsl(215, 20%, 18%)" : "hsl(210, 20%, 96%)";
  const primaryStroke = isDark ? "hsl(174, 72%, 45%)" : "hsl(174, 72%, 33%)";

  const CustomTooltipStyle = {
    background: isDark ? "hsl(215, 22%, 16%)" : "hsl(215, 60%, 14%)",
    border: isDark ? "1px solid hsl(215, 15%, 25%)" : "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "13px",
    boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.2)",
    padding: "10px 14px",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs Scraped Over Time */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Jobs Scraped Over Time</h3>
                <p className="text-xs text-muted-foreground">Track scraping activity trends</p>
              </div>
            </div>
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {dateRanges.map((range) => (
                <button key={range} onClick={() => setActiveRange(range)}
                  className={cn("px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
                    activeRange === range
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  )}>{range}</button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            {isLoading ? <Skeleton className="w-full h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={jobsByDateData}>
                  <defs>
                    <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={primaryStroke} stopOpacity={isDark ? 0.3 : 0.2} />
                      <stop offset="100%" stopColor={primaryStroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CustomTooltipStyle}
                    labelStyle={{ color: "hsl(210, 12%, 80%)", fontSize: "11px", marginBottom: "4px" }}
                    formatter={(value: number) => [`${value} jobs`, "Scraped"]}
                    cursor={{ stroke: primaryStroke, strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="jobs" stroke={primaryStroke} strokeWidth={2.5}
                    fill="url(#jobsGradient)" dot={false}
                    activeDot={{ r: 6, strokeWidth: 3, stroke: isDark ? "hsl(215, 22%, 13%)" : "hsl(0, 0%, 100%)", fill: primaryStroke }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Jobs by Platform - Donut */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Platform Split</h3>
              <p className="text-xs text-muted-foreground">{total.toLocaleString()} total jobs</p>
            </div>
          </div>
          <div className="h-[220px]">
            {isLoading ? <Skeleton className="w-full h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0} cornerRadius={4}>
                    {platformData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle}
                    formatter={(value: number, name: string) => [`${value} jobs`, name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {platformData.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                  <span className="text-sm text-muted-foreground font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{p.value}</span>
                  <span className="text-xs text-muted-foreground">({total > 0 ? Math.round((p.value / total) * 100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Recruiters */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Top Performing Recruiters</h3>
              <p className="text-xs text-muted-foreground">Ranked by jobs scraped</p>
            </div>
          </div>
          <div className="h-[260px]">
            {isLoading ? <Skeleton className="w-full h-full rounded-xl" /> : topRecruitersData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No recruiter data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRecruitersData} layout="vertical" margin={{ left: 10, right: 24, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: labelColor, fontWeight: 500 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={CustomTooltipStyle}
                    formatter={(value: number) => [`${value} jobs`, "Scraped"]} />
                  <Bar dataKey="jobs" fill={primaryStroke} radius={[0, 8, 8, 0]} barSize={28}
                    background={{ fill: barBgColor, radius: [0, 8, 8, 0] as any }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
