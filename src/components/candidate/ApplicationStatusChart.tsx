import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface ApplicationStatusChartProps {
  data: ChartDataItem[];
  total: number;
}

const ApplicationStatusChart = ({ data, total }: ApplicationStatusChartProps) => {
  const validData = data.filter((d) => d.value > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-xs">
      <h3 className="text-xl font-semibold text-secondary-900 font-display mb-6">Application Progress</h3>
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Donut Chart */}
        <div className="relative w-[260px] h-[260px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={validData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {validData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0];
                    const pct = total > 0 ? Math.round(((d.value as number) / total) * 100) : 0;
                    return (
                      <div className="bg-secondary-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
                        {d.name}: {d.value} applications ({pct}%)
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-secondary-900 font-display">{total}</span>
            <span className="text-sm text-neutral-600">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full">
          <h4 className="text-base font-semibold text-secondary-900 mb-4">Status Breakdown</h4>
          <div className="space-y-3">
            {data.map((item) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-neutral-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{item.value}</span>
                    <span className="text-xs text-neutral-500">{pct}%</span>
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

export default ApplicationStatusChart;
