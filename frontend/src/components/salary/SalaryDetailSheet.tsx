import type { SalaryRecord } from "@/lib/types";
import { formatInr, formatLpa, formatPercent } from "@/lib/format";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SalaryDetailSheetProps {
  record: SalaryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalaryDetailSheet({ record, open, onOpenChange }: SalaryDetailSheetProps) {
  if (!record) return null;

  const rows = [
    ["Total compensation", `${formatLpa(record.total_compensation_lpa)} (${formatInr(record.total_compensation_inr)})`],
    ["Base", `${formatLpa(record.base_salary_lpa)} (${formatInr(record.base_salary_inr)})`],
    ["Bonus", formatInr(record.bonus_inr)],
    ["Stock", formatInr(record.stock_inr)],
    ["Location", record.location],
    ["Experience", `${record.experience_years} years`],
    ["Level", record.level.toUpperCase()],
    ["Confidence", formatPercent(record.confidence_score)],
    ["Source", record.source],
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="mt-6">
          <h2 className="text-2xl font-bold capitalize">{record.company}</h2>
          <p className="text-muted-foreground">{record.role}</p>
          <p className="mt-4 text-3xl font-semibold text-[#00A699]">{formatLpa(record.total_compensation_lpa)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{record.level.toUpperCase()}</Badge>
            <Badge variant="secondary">{record.location}</Badge>
          </div>
          <dl className="mt-6 space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-border pb-2 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium capitalize">{value}</dd>
              </div>
            ))}
          </dl>
          {record.source_url && (
            <Button variant="outline" className="mt-6 w-full" asChild>
              <a href={record.source_url} target="_blank" rel="noreferrer">
                View source
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
