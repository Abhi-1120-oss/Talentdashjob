import { Link, useLocation } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCompareSalaries } from "@/hooks/useCompareSalaries";
import { formatLpa, capitalize } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function CompareTray() {
  const location = useLocation();
  const { ids, remove, clear } = useCompare();
  const { data } = useCompareSalaries(ids);

  if (location.pathname === "/compare" || ids.length === 0) return null;

  const records = data?.data ?? [];

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur md:bottom-0">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <Scale className="hidden h-5 w-5 text-primary sm:block" />
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {ids.map((id) => {
            const record = records.find((r) => r.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-3 py-1 text-sm"
              >
                <span className="font-medium capitalize">
                  {record ? record.company : id.slice(0, 8)}
                </span>
                {record && (
                  <span className="text-muted-foreground">{formatLpa(record.total_compensation_lpa)}</span>
                )}
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-accent"
                  onClick={() => remove(id)}
                  aria-label="Remove from compare"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button asChild size="sm">
            <Link to={`/compare?ids=${ids.join(",")}`}>
              Compare ({ids.length})
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
