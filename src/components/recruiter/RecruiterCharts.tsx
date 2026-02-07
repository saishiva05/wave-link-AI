import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";

const jobsTrendData = [
  { date: "Feb 1", jobs: 32 },
  { date: "Feb 3", jobs: 28 },
  { date: "Feb 5", jobs: 45 },
  { date: "Feb 7", jobs: 38 },
  { date: "Feb 9", jobs: 52 },
  { date: "Feb 11", jobs: 41 },
  { date: "Feb 13", jobs: 58 },
  { date: "Feb 15", jobs: 48 },
  { date: "Feb 17", jobs: 63 },
  { date: "Feb 19", jobs: 72 },
  { date: "Feb 21", jobs: 55 },
  { date: "Feb 23", jobs: 68 },
];

const applicationStatusData = [
  { name: "Pending", value: 75, color: "hsl(38, 92%, 50%)" },
  { name: "Interview", value: 47, color: "hsl(210, 70%, 50%)" },
  { name: "Hired", value: 37, color: "hsl(142, 71%, 45%)" },
  { name: "Rejected", value: 28, color: "hsl(0, 84%, 60%)" },
];

const topJobsData = [
  { title: "Senior Frontend Dev", company: "TechCorp", applications: 24 },
  { title: "Full Stack Engineer", company: "StartupXYZ", applications: 19 },
  { title: "UI/UX Designer", company: "DesignCo", applications: 16 },
  { title: "Backend Developer", company: "CloudTech", applications: 14 },
  { title: "DevOps Engineer", company: "InfraSys", applications: 12 },
];

const dateRanges = ["7D", "30D", "3M", "6M", "1Y"];

const RecruiterCharts = () => {
  const [activeRange, setActiveRange] = useState("30D");

  const totalApplications = applicationStatusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-secondary-900 font-display">Analytics & Trends</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Scraped Trend - Full width */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-semibold text-secondary-900">Jobs Scraped Trend</h3>
              <p className="text-sm text-muted-foreground">Track your daily scraping activity</p>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {dateRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jobsTrendData}>
                <defs>
                  <linearGradient id="recruiterJobsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 33%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(174, 72%, 33%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "hsl(215, 10%, 55%)" }}
                  axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(215, 10%, 55%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(215, 60%, 14%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  labelStyle={{ color: "hsl(210, 12%, 82%)", fontSize: "12px" }}
                  formatter={(value: number) => [`${value} jobs scraped`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="hsl(174, 72%, 33%)"
                  strokeWidth={2.5}
                  fill="url(#recruiterJobsGradient)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: "hsl(174, 72%, 33%)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status - Donut */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-secondary-900">Application Status</h3>
            <p className="text-sm text-muted-foreground">Distribution of submitted applications</p>
          </div>
          <div className="h-[240px] relative">
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
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(215, 60%, 14%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} (${Math.round((value / totalApplications) * 100)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-secondary-900 font-display">{totalApplications}</span>
              <span className="text-xs text-muted-foreground">Applications</span>
            </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {applicationStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                <div className="min-w-0">
                  <span className="text-sm text-neutral-700">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {item.value} ({Math.round((item.value / totalApplications) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Jobs - Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-secondary-900">Top Jobs by Applications</h3>
            <p className="text-sm text-muted-foreground">Most applied positions this month</p>
          </div>
          <div className="space-y-4">
            {topJobsData.map((job, i) => {
              const maxVal = topJobsData[0].applications;
              const pct = (job.applications / maxVal) * 100;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary ml-3 shrink-0">
                      {job.applications}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 group-hover:bg-primary-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterCharts;
