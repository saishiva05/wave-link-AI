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

// Mock data
const jobsByDateData = [
  { date: "Jan 1", jobs: 28 },
  { date: "Jan 5", jobs: 35 },
  { date: "Jan 9", jobs: 22 },
  { date: "Jan 13", jobs: 45 },
  { date: "Jan 17", jobs: 52 },
  { date: "Jan 21", jobs: 38 },
  { date: "Jan 25", jobs: 61 },
  { date: "Jan 29", jobs: 48 },
  { date: "Feb 2", jobs: 56 },
  { date: "Feb 6", jobs: 72 },
];

const platformData = [
  { name: "LinkedIn", value: 856, color: "hsl(174, 72%, 33%)" },
  { name: "JSearch", value: 428, color: "hsl(215, 60%, 18%)" },
];

const topRecruitersData = [
  { name: "John Smith", jobs: 156 },
  { name: "Sarah Johnson", jobs: 142 },
  { name: "Mike Chen", jobs: 98 },
  { name: "Emma Davis", jobs: 87 },
  { name: "Alex Brown", jobs: 76 },
];

const dateRanges = ["7D", "30D", "3M", "1Y"];

const DashboardCharts = () => {
  const [activeRange, setActiveRange] = useState("30D");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-secondary-900 font-display">Platform Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Scraped Over Time - Full width */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h3 className="text-base font-semibold text-secondary-900">Jobs Scraped by Date</h3>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {dateRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeRange === range
                      ? "bg-primary-100 text-primary-700"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jobsByDateData}>
                <defs>
                  <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 33%)" stopOpacity={0.15} />
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
                  formatter={(value: number) => [`${value} jobs`, "Scraped"]}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="hsl(174, 72%, 33%)"
                  strokeWidth={2.5}
                  fill="url(#jobsGradient)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs by Platform - Donut */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-base font-semibold text-secondary-900 mb-1">Jobs by Platform</h3>
          <p className="text-sm text-muted-foreground mb-4">1,284 total</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {platformData.map((entry, index) => (
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
                  formatter={(value: number, name: string) => [`${value} jobs`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {platformData.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: p.color }} />
                <span className="text-sm text-neutral-700">
                  {p.name}: {p.value} ({Math.round((p.value / 1284) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Recruiters - Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-base font-semibold text-secondary-900 mb-1">Top 5 Active Recruiters</h3>
          <p className="text-sm text-muted-foreground mb-4">By jobs scraped this month</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRecruitersData} layout="vertical" margin={{ left: 10, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "hsl(215, 10%, 55%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(215, 15%, 35%)" }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(215, 60%, 14%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value} jobs`, "Scraped"]}
                />
                <Bar
                  dataKey="jobs"
                  fill="hsl(174, 72%, 33%)"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
