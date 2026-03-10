import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useRecruiterChartData } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Calendar } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const dateRanges = ["7D", "30D", "3M", "6M", "1Y"];

const RecruiterCharts = () => {
  const [activeRange, setActiveRange] = useState("30D");
  const { data, isLoading } = useRecruiterChartData(activeRange);
  const { theme } = useTheme();

  const jobsTrendData = data?.jobsTrendData || [];
  const applicationStatusData = data?.applicationStatusData || [];
  const topJobs = data?.topJobs || [];
  const totalApplications = applicationStatusData.reduce((sum: number, d: any) => sum + d.value, 0);

  const isDark = theme === "dark";
  const gridColor = isDark ? "hsl(220, 14%, 25%)" : "hsl(214, 20%, 92%)";
  const axisColor = isDark ? "hsl(218, 8%, 50%)" : "hsl(215, 10%, 55%)";
  const tooltipBg = isDark ? "hsl(220, 16%, 20%)" : "hsl(0, 0%, 100%)";
  const tooltipText = isDark ? "#fff" : "hsl(215, 60%, 14%)";
  const tooltipBorder = isDark ? "hsl(220, 14%, 30%)" : "hsl(214, 20%, 90%)";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Jobs Bar Chart - spans 3 cols */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">Jobs History</h3>
                <Info className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Check out the jobs found and applications submitted
              </p>
            </div>
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <select
                value={activeRange}
                onChange={(e) => setActiveRange(e.target.value)}
                className="bg-transparent outline-none text-sm text-foreground cursor-pointer"
              >
                {dateRanges.map((r) => (
                  <option key={r} value={r}>{r === "7D" ? "Weekly" : r === "30D" ? "Monthly" : r === "3M" ? "Quarterly" : r === "6M" ? "Half Year" : "Yearly"}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-[280px]">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : jobsTrendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsTrendData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: axisColor }}
                    axisLine={{ stroke: gridColor }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "10px",
                      color: tooltipText,
                      fontSize: "13px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    labelStyle={{ color: axisColor, fontSize: "12px" }}
                    formatter={(value: number) => [`${value}`, "Jobs"]}
                  />
                  <Bar
                    dataKey="jobs"
                    fill="hsl(215, 60%, 18%)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    name="Jobs Found"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend dots */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs text-muted-foreground">Jobs Found</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Applications</span>
            </div>
          </div>
        </div>

        {/* Top Jobs as Table - spans 2 cols */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground">Top Positions</h3>
            <Info className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-48" />
            ) : topJobs.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No application data yet
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left pb-3 font-medium">Title</th>
                      <th className="text-left pb-3 font-medium">Company</th>
                      <th className="text-center pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topJobs.slice(0, 5).map((job: any, i: number) => (
                      <tr key={i} className="group">
                        <td className="py-3 pr-2 text-foreground font-medium truncate max-w-[120px]">
                          {job.title}
                        </td>
                        <td className="py-3 pr-2 text-muted-foreground truncate max-w-[100px]">
                          {job.company}
                        </td>
                        <td className="py-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
                            job.applications > 2
                              ? "text-success-600 bg-success-50"
                              : job.applications > 0
                                ? "text-info-600 bg-info-50"
                                : "text-warning-600 bg-warning-50"
                          )}>
                            {job.applications > 2 ? "✓" : job.applications > 0 ? "◷" : "○"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {topJobs.length > 5 && (
                  <button className="text-sm text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1 transition-colors">
                    View All →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Status Donut - full width */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">Application Status</h3>
          <p className="text-sm text-muted-foreground">Distribution of submitted applications</p>
        </div>
        <div className="h-[240px] relative">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : applicationStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No applications yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {applicationStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "10px",
                    color: tooltipText,
                    fontSize: "13px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} (${totalApplications > 0 ? Math.round((value / totalApplications) * 100) : 0}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-foreground font-display">{totalApplications}</span>
            <span className="text-xs text-muted-foreground">Applications</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {applicationStatusData.map((item: any) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
              <div className="min-w-0">
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground ml-1">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterCharts;
