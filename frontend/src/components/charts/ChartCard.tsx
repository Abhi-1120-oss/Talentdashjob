import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  accent?: "coral" | "teal" | "blue" | "orange" | "pink";
}

const accentBorder = {
  coral: "from-[#FF385C]/30 via-[#FF6B81]/10 to-transparent",
  teal: "from-[#00A699]/30 via-[#00A699]/5 to-transparent",
  blue: "from-[#3B82F6]/30 via-[#3B82F6]/5 to-transparent",
  orange: "from-[#FFB400]/40 via-[#FFB400]/10 to-transparent",
  pink: "from-[#FF6B81]/30 to-transparent",
};

export function ChartCard({ title, description, children, className, accent = "coral" }: ChartCardProps) {
  return (
    <div className={cn("glass-card relative overflow-hidden p-6 md:p-7 animate-fade-in", className)}>
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r", accentBorder[accent])} />
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#222222]">{title}</h3>
        {description && <p className="mt-1 text-sm text-[#717171]">{description}</p>}
      </div>
      <div className="animate-slide-up">{children}</div>
    </div>
  );
}
