import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./AnimatedCounter";

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  trend?: number;
  accent?: "coral" | "teal" | "blue" | "orange" | "pink";
}

const iconBg = {
  coral: "bg-[#FFF1F2] text-[#FF385C]",
  teal: "bg-[#00A699]/10 text-[#00A699]",
  blue: "bg-[#3B82F6]/10 text-[#3B82F6]",
  orange: "bg-[#FFB400]/15 text-[#B8860B]",
  pink: "bg-[#FFF1F2] text-[#FF385C]",
};

const topGlow = {
  coral: "from-[#FF385C]/40",
  teal: "from-[#00A699]/40",
  blue: "from-[#3B82F6]/40",
  orange: "from-[#FFB400]/50",
  pink: "from-[#FF6B81]/40",
};

export function MetricCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  icon: Icon,
  trend,
  accent = "coral",
}: MetricCardProps) {
  const positive = trend !== undefined && trend >= 0;

  return (
    <div className="glass-card-hover relative overflow-hidden p-6 md:p-7">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent", topGlow[accent])} />
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", iconBg[accent])}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
              positive ? "bg-[#00A699]/10 text-[#00A699]" : "bg-[#FF385C]/10 text-[#FF385C]",
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="mt-5 text-[32px] font-semibold leading-none tracking-tight text-[#222222] md:text-[36px]">
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
      </p>
      <p className="mt-2 text-sm font-normal text-[#717171]">{label}</p>
    </div>
  );
}
