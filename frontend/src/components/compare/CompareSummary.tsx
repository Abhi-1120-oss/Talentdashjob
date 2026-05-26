import { Trophy, TrendingUp } from "lucide-react";
import type { SalaryRecord } from "@/lib/types";
import { formatLpa, capitalize } from "@/lib/format";
import { bestByTotal, lowestByTotal, percentGap } from "@/lib/compare-utils";
import { Badge } from "@/components/ui/badge";

export function CompareSummary({ records }: { records: SalaryRecord[] }) {
  if (records.length < 2) return null;

  const winners = bestByTotal(records);
  const lowest = lowestByTotal(records);
  const high = winners[0]?.total_compensation_lpa ?? 0;
  const low = lowest?.total_compensation_lpa ?? 0;
  const gap = high - low;
  const pct = percentGap(high, low);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {winners.map((w) => (
        <div
          key={w.id}
          className="glass-card relative overflow-hidden border-[#00A699]/20 bg-gradient-to-br from-[#00A699]/5 to-white p-7"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#00A699]/50 to-transparent" />
          <Badge variant="success" className="mb-4 gap-1">
            <Trophy className="h-3 w-3" />
            Best total comp
          </Badge>
          <p className="text-lg font-semibold capitalize text-[#222222]">{w.company}</p>
          <p className="text-sm text-[#717171]">{w.role}</p>
          <p className="mt-4 text-[32px] font-semibold leading-none text-[#00A699]">
            {formatLpa(w.total_compensation_lpa)}
          </p>
          <p className="mt-2 text-xs text-[#717171]">
            {capitalize(w.level)} · {capitalize(w.location)}
          </p>
        </div>
      ))}
      {records.length >= 2 && gap > 0 && (
        <div className="glass-card p-7">
          <div className="flex items-center gap-2 text-sm font-medium text-[#717171]">
            <TrendingUp className="h-4 w-4 text-[#FF385C]" />
            Spread vs lowest
          </div>
          <p className="mt-4 text-[32px] font-semibold text-[#222222]">+{gap.toFixed(1)} LPA</p>
          {pct !== null && (
            <span className="mt-3 inline-flex rounded-full bg-[#FFF1F2] px-3 py-1 text-xs font-semibold text-[#FF385C]">
              +{pct.toFixed(0)}% higher
            </span>
          )}
          {lowest && (
            <p className="mt-4 text-xs text-[#717171]">
              Lowest: {capitalize(lowest.company)} at {formatLpa(lowest.total_compensation_lpa)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
