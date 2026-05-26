import { useAnalytics, useStats } from "@/hooks/useAnalytics";
import { MetricCard } from "@/components/analytics/MetricCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_COLORS, CHART_PALETTE, chartGrid, chartTick, legendStyle } from "@/lib/chart-theme";
import { Database, Building2, ShieldCheck, MapPin } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function InsightsPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const roleDonut =
    analytics?.by_role.map((r, i) => ({
      name: r.label,
      value: r.count,
      fill: CHART_PALETTE[i % CHART_PALETTE.length],
    })) ?? [];

  return (
    <div className="space-y-10">
      <PageHeader
        badge="Analytics"
        title="Insights"
        description="Market trends, compensation distributions, and employer benchmarks"
      />

      {statsLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-[20px]" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Salary records" value={stats.total_records} icon={Database} accent="coral" trend={12} />
          <MetricCard label="Companies tracked" value={stats.total_companies} icon={Building2} accent="teal" trend={8} />
          <MetricCard
            label="Avg confidence"
            value={Math.round(stats.avg_confidence * 100)}
            suffix="%"
            icon={ShieldCheck}
            accent="blue"
            trend={5}
          />
          <MetricCard
            label="Cities covered"
            value={Object.keys(stats.records_by_location).length}
            icon={MapPin}
            accent="orange"
            trend={15}
          />
        </div>
      ) : null}

      {analyticsLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] rounded-[20px]" />
          ))}
        </div>
      )}

      {analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="LPA distribution" description="Salary band spread across the market" accent="coral">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.lpa_histogram}>
                <defs>
                  <linearGradient id="lpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.coral} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.coral} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGrid} />
                <XAxis dataKey="label" tick={chartTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartTick} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Records"
                  stroke={CHART_COLORS.coral}
                  strokeWidth={2.5}
                  fill="url(#lpaGrad)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="By level" description="Average total compensation by seniority" accent="teal">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.by_level}>
                <CartesianGrid {...chartGrid} />
                <XAxis dataKey="label" tick={chartTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartTick} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={legendStyle} />
                <Line
                  type="monotone"
                  dataKey="avg_lpa"
                  name="Avg LPA"
                  stroke={CHART_COLORS.teal}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.teal, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.teal }}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Role mix" description="Distribution of records by job role" accent="pink">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={900}
                >
                  {roleDonut.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="#fff" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={legendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="By location" description="Record volume by city" accent="blue">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.by_location}>
                <defs>
                  <linearGradient id="locGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGrid} />
                <XAxis dataKey="label" tick={chartTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartTick} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Records" fill="url(#locGrad)" radius={[10, 10, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Company leaderboard"
            description="Highest average total compensation"
            accent="orange"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.company_leaderboard} layout="vertical" margin={{ left: 80 }}>
                <defs>
                  <linearGradient id="coGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={CHART_COLORS.coralSoft} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={CHART_COLORS.coral} stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGrid} horizontal={false} />
                <XAxis type="number" tick={chartTick} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={chartTick} width={76} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="avg_lpa" name="Avg LPA" fill="url(#coGrad)" radius={[0, 10, 10, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
