import { useAnalytics, useStats } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const chartStyle = { fontSize: 12, fill: "#94a3b8" };

export function InsightsPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Compensation trends and distributions</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_records}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_companies}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{Math.round(stats.avg_confidence * 100)}%</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {analyticsLoading && <Skeleton className="h-64 w-full" />}

      {analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="LPA distribution">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.lpa_histogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={chartStyle} />
                <YAxis tick={chartStyle} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="By level (avg LPA)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.by_level}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={chartStyle} />
                <YAxis tick={chartStyle} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                />
                <Bar dataKey="avg_lpa" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="By location">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.by_location}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={chartStyle} />
                <YAxis tick={chartStyle} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top companies (avg LPA)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.company_leaderboard} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={chartStyle} />
                <YAxis type="category" dataKey="label" tick={chartStyle} width={55} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                />
                <Bar dataKey="avg_lpa" fill="#a78bfa" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
