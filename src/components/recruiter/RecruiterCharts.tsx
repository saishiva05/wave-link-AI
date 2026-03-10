import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useRecruiterChartData } from "@/hooks/useRecruiterData";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
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
  const gridColor = isDark ? "hsl(100, 8%, 16%)" : "hsl(80, 8%, 90%)";
  const axisColor = isDark ? "hsl(80, 6%, 40%)" : "hsl(80, 5%, 55%)";
  const tooltipBg = isDark ? "hsl(100, 10%, 12%)" : "hsl(0, 0%, 100%)";
  const tooltipText = isDark ? "hsl(70, 20%, 92%)" : "hsl(100, 8%, 12%)";
  const tooltipBorder = isDark ? "hsl(100, 8%, 20%)" : "hsl(80, 8%, 88%)";
  const barFill = isDark ? "hsl(72, 100%, 50%)" : "hsl(100, 8%, 18%)";

  // Status colors using lime-green palette
  const statusColors = isDark
    ? ["hsl(72, 100%, 50%)", "hsl(72, 60%, 35%)", "hsl(100, 8%, 30%)", "hsl(38, 82%, 56%)"]
    : ["hsl(72, 100%, 45%)", "hsl(100, 8%, 18%)", "hsl(80, 6%, 55%)", "hsl(38, 92%, 50%)"];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Jobs Bar Chart */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Jobs History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Jobs found over time</p>
            </div>
            <div className="flex items-center gap-1.5 border border-border rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <select
                value={activeRange}
                onChange={(e) => setActiveRange(e.target.value)}
                className="bg-transparent outline-none text-xs text-foreground cursor-pointer"
              >
                {dateRanges.map((r) => (
                  <option key={r} value={r}>{r === "7D" ? "Weekly" : r === "30D" ? "Monthly" : r === "3M" ? "Quarterly" : r === "6M" ? "Half Year" : "Yearly"}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-[240px]">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : jobsTrendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsTrendData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "10px", color: tooltipText, fontSize: "12px" }}
                    formatter={(value: number) => [`${value}`, "Jobs"]}
                  />
                  <Bar dataKey="jobs" fill={barFill} radius={[4, 4, 0, 0]} maxBarSize={28} name="Jobs Found" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Positions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Positions</h3>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : topJobs.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    <th className="text-left pb-2.5 font-medium">Title</th>
                    <th className="text-left pb-2.5 font-medium">Company</th>
                    <th className="text-center pb-2.5 font-medium">Apps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topJobs.slice(0, 5).map((job: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-2 text-foreground font-medium truncate max-w-[110px]">{job.title}</td>
                      <td className="py-2.5 pr-2 text-muted-foreground truncate max-w-[90px]">{job.company}</td>
                      <td className="py-2.5 text-center">
                        <span className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold",
                          job.applications > 2 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {job.applications}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Application Status Donut */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground">Application Status</h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">Distribution of submitted applications</p>
        <div className="h-[200px] relative">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : applicationStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No applications yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={applicationStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {applicationStatusData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "10px", color: tooltipText, fontSize: "12px" }}
                  formatter={(value: number, name: string) => [`${value} (${totalApplications > 0 ? Math.round((value / totalApplications) * 100) : 0}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground font-display">{totalApplications}</span>
            <span className="text-[10px] text-muted-foreground">Total</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {applicationStatusData.map((item: any, i: number) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: statusColors[i % statusColors.length] }} />
              <span className="text-xs text-muted-foreground">{item.name} <span className="text-foreground font-medium">{item.value}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterCharts;