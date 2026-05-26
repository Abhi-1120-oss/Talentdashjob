import type { SalaryRecord } from "@/lib/types";
import { formatLpa } from "@/lib/format";
import { bestByTotal, lowestByTotal, percentGap } from "@/lib/compare-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/format";

export function CompareSummary({ records }: { records: SalaryRecord[] }) {
  if (records.length < 2) return null;

  const winners = bestByTotal(records);
  const lowest = lowestByTotal(records);
  const high = winners[0]?.total_compensation_lpa ?? 0;
  const low = lowest?.total_compensation_lpa ?? 0;
  const gap = high - low;
  const pct = percentGap(high, low);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {winners.map((w) => (
        <Card key={w.id} className="border-success/40 bg-success/5 p-4">
          <Badge className="mb-2 bg-success text-success-foreground">Best total comp</Badge>
          <p className="text-lg font-bold capitalize">{w.company}</p>
          <p className="text-sm text-muted-foreground">{w.role}</p>
          <p className="mt-2 text-2xl font-bold text-success">{formatLpa(w.total_compensation_lpa)}</p>
          <p className="text-xs text-muted-foreground">
            {capitalize(w.level)} · {capitalize(w.location)}
          </p>
        </Card>
      ))}
      {records.length >= 2 && gap > 0 && (
        <Card className="p-4 sm:col-span-1 lg:col-span-1">
          <p className="text-sm font-medium text-muted-foreground">Spread vs lowest</p>
          <p className="mt-2 text-2xl font-bold">+{gap.toFixed(1)} LPA</p>
          {pct !== null && (
            <p className="text-sm text-muted-foreground">+{pct.toFixed(0)}% higher</p>
          )}
          {lowest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Lowest: {capitalize(lowest.company)} at {formatLpa(lowest.total_compensation_lpa)}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
