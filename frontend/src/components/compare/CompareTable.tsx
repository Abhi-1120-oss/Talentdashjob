import { Fragment } from "react";
import type { SalaryRecord } from "@/lib/types";
import { formatInr, formatLpa, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deltaVsBest, formatDeltaLpa } from "@/lib/compare-utils";
import { X } from "lucide-react";

type RowDef = {
  key: string;
  label: string;
  group: "compensation" | "profile";
  format: (r: SalaryRecord) => string;
  numeric?: (r: SalaryRecord) => number;
  higherBetter?: boolean;
};

const ROWS: RowDef[] = [
  {
    key: "total",
    label: "Total (LPA)",
    group: "compensation",
    format: (r) => formatLpa(r.total_compensation_lpa),
    numeric: (r) => r.total_compensation_lpa,
    higherBetter: true,
  },
  {
    key: "base_salary_lpa",
    label: "Base (LPA)",
    group: "compensation",
    format: (r) => formatLpa(r.base_salary_lpa),
    numeric: (r) => r.base_salary_lpa,
    higherBetter: true,
  },
  {
    key: "bonus_inr",
    label: "Bonus",
    group: "compensation",
    format: (r) => formatInr(r.bonus_inr),
    numeric: (r) => r.bonus_inr,
    higherBetter: true,
  },
  {
    key: "stock_inr",
    label: "Stock",
    group: "compensation",
    format: (r) => formatInr(r.stock_inr),
    numeric: (r) => r.stock_inr,
    higherBetter: true,
  },
  {
    key: "level",
    label: "Level",
    group: "profile",
    format: (r) => r.level.toUpperCase(),
  },
  {
    key: "experience_years",
    label: "Experience",
    group: "profile",
    format: (r) => `${r.experience_years} yrs`,
  },
  {
    key: "location",
    label: "Location",
    group: "profile",
    format: (r) => r.location,
  },
  {
    key: "confidence_score",
    label: "Confidence",
    group: "profile",
    format: (r) => formatPercent(r.confidence_score),
    numeric: (r) => r.confidence_score,
    higherBetter: true,
  },
];

function bestIndex(records: SalaryRecord[], row: RowDef): number | null {
  if (!row.higherBetter || !row.numeric || records.length < 2) return null;
  let best = 0;
  let bestVal = -Infinity;
  records.forEach((r, i) => {
    const val = row.numeric!(r);
    if (val > bestVal) {
      bestVal = val;
      best = i;
    }
  });
  return best;
}

function CompareMobileCards({
  records,
  onRemove,
}: {
  records: SalaryRecord[];
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="space-y-4 md:hidden">
      {records.map((record) => (
        <div key={record.id} className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold capitalize">{record.company}</p>
              <p className="text-sm text-muted-foreground">{record.role}</p>
            </div>
            {onRemove && (
              <button
                type="button"
                className="rounded-md p-1 hover:bg-accent"
                onClick={() => onRemove(record.id)}
                aria-label="Remove offer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <dl className="space-y-2 text-sm">
            {ROWS.map((row) => {
              const best = bestIndex(records, row);
              const idx = records.indexOf(record);
              const isBest = best === idx;
              const bestVal = row.numeric
                ? Math.max(...records.map((r) => row.numeric!(r)))
                : 0;
              const delta =
                row.numeric && !isBest
                  ? formatDeltaLpa(deltaVsBest(row.numeric(record), bestVal))
                  : null;
              return (
                <div key={row.key} className="flex justify-between gap-4 border-b border-border/50 pb-2">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className={cn("text-right font-medium", isBest && "text-success")}>
                    {row.format(record)}
                    {delta && <span className="block text-xs text-muted-foreground">{delta}</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}

export function CompareTable({
  records,
  onRemove,
}: {
  records: SalaryRecord[];
  onRemove?: (id: string) => void;
}) {
  if (records.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        Select up to 3 offers below or from Explore to compare them here.
      </p>
    );
  }

  const groups: { id: "compensation" | "profile"; label: string }[] = [
    { id: "compensation", label: "Compensation" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <>
      <CompareMobileCards records={records} onRemove={onRemove} />
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left font-medium text-muted-foreground">Metric</th>
              {records.map((r) => (
                <th key={r.id} className="p-3 text-left font-semibold">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="capitalize">{r.company}</span>
                      <span className="block text-xs font-normal text-muted-foreground">{r.role}</span>
                    </div>
                    {onRemove && (
                      <button
                        type="button"
                        className="rounded-md p-1 hover:bg-accent"
                        onClick={() => onRemove(r.id)}
                        aria-label={`Remove ${r.company}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.id}>
                <tr className="bg-muted/30">
                  <td
                    colSpan={records.length + 1}
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {group.label}
                  </td>
                </tr>
                {ROWS.filter((row) => row.group === group.id).map((row) => {
                  const best = bestIndex(records, row);
                  const bestVal = row.numeric
                    ? Math.max(...records.map((r) => row.numeric!(r)))
                    : 0;
                  return (
                    <tr key={row.key} className="border-b border-border">
                      <td className="p-3 text-muted-foreground">{row.label}</td>
                      {records.map((r, i) => {
                        const delta =
                          row.numeric && best !== i
                            ? formatDeltaLpa(deltaVsBest(row.numeric(r), bestVal))
                            : null;
                        return (
                          <td
                            key={r.id}
                            className={cn("p-3 font-medium", best === i && "bg-success/10 text-success")}
                          >
                            {row.format(r)}
                            {delta && (
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                {delta}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
