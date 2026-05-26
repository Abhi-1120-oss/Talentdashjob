import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, IndianRupee, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/analytics/MetricCard";
import { useStats } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Building2, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: IndianRupee,
    title: "LPA-native intelligence",
    description: "Salaries in Lakhs Per Annum with full INR breakdown — built for India tech.",
    accent: "coral" as const,
  },
  {
    icon: Shield,
    title: "Confidence scoring",
    description: "Every record includes validation quality and source reliability weighting.",
    accent: "teal" as const,
  },
  {
    icon: BarChart3,
    title: "Decision-ready analytics",
    description: "Standardized levels, locations, and compensation for fair comparison.",
    accent: "blue" as const,
  },
];

export function LandingPage() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-16 py-2 lg:py-6">
      <section className="section-shell relative overflow-hidden text-center">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FFF1F2] blur-2xl" />
        <p className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-[#EBEBEB] bg-[#FFF1F2] px-4 py-1.5 text-sm font-semibold text-[#FF385C]">
          India-first compensation intelligence
        </p>
        <h1 className="relative mx-auto max-w-3xl text-[40px] font-semibold leading-tight tracking-tight text-[#222222] sm:text-[48px] lg:text-[56px]">
          Know your worth in <span className="gradient-text">Indian tech</span>
        </h1>
        <p className="relative mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#717171]">
          Explore structured salary data, compare offers side by side, and make confident compensation
          decisions — with an analytics experience built for professionals.
        </p>
        <div className="relative mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild className="gap-2 rounded-xl px-8">
            <Link to="/explore">
              Explore salaries
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8">
            <Link to="/insights">View analytics</Link>
          </Button>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-[20px]" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <MetricCard label="Salary records" value={stats.total_records} icon={Database} accent="coral" trend={12} />
            <MetricCard label="Companies" value={stats.total_companies} icon={Building2} accent="teal" trend={8} />
            <MetricCard
              label="Avg confidence"
              value={Math.round(stats.avg_confidence * 100)}
              suffix="%"
              icon={ShieldCheck}
              accent="blue"
              trend={5}
            />
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article key={title} className="glass-card-hover group p-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1F2] text-[#FF385C] transition-transform duration-200 group-hover:scale-105">
              <Icon className="h-6 w-6" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-[#222222]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#717171]">{description}</p>
          </article>
        ))}
      </section>

      <section className="section-shell relative overflow-hidden text-center">
        <Zap className="mx-auto h-10 w-10 text-[#FF385C]" strokeWidth={2} />
        <h2 className="mt-5 text-2xl font-semibold text-[#222222] md:text-3xl">Ready to compare your offer?</h2>
        <p className="mx-auto mt-3 max-w-md text-[#717171]">
          Side-by-side compensation analysis with clarity you can trust.
        </p>
        <Button size="lg" className="mt-8 rounded-xl px-8" asChild>
          <Link to="/compare">Start comparing</Link>
        </Button>
      </section>
    </div>
  );
}
