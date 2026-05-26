import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, IndianRupee, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStats } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  {
    icon: IndianRupee,
    title: "LPA-native",
    description: "Salaries in Lakhs Per Annum with full INR breakdown — built for India.",
  },
  {
    icon: Shield,
    title: "Confidence scores",
    description: "Every record includes validation quality and source reliability weighting.",
  },
  {
    icon: BarChart3,
    title: "Comparable data",
    description: "Standardized levels, locations, and compensation fields for fair comparison.",
  },
];

export function LandingPage() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-16 py-8">
      <section className="text-center">
        <p className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
          India-first compensation intelligence
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Know your worth in{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            Indian tech
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Structured salary data from top sources. Explore, compare offers, and make decision-ready
          compensation choices.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild className="gap-2">
            <Link to="/explore">
              Explore salaries
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/insights">View insights</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
          : stats && (
              <>
                <StatCard label="Salary records" value={String(stats.total_records)} />
                <StatCard label="Companies" value={String(stats.total_companies)} />
                <StatCard label="Avg confidence" value={`${Math.round(stats.avg_confidence * 100)}%`} />
              </>
            )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-border/80">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-6 text-center">
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
