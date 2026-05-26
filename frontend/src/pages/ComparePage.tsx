import { Trash2, AlertTriangle } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCompareSalaries } from "@/hooks/useCompareSalaries";
import { CompareTable } from "@/components/compare/CompareTable";
import { CompareSummary } from "@/components/compare/CompareSummary";
import { ComparePicker } from "@/components/compare/ComparePicker";
import { CompareShare } from "@/components/compare/CompareShare";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_COMPARE } from "@/lib/compare-utils";

export function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { data, isLoading, isError, error } = useCompareSalaries(ids);

  const records = data?.data ?? [];
  const missing = data?.missing_ids ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Compare offers</h1>
          <p className="text-muted-foreground">
            Side-by-side compensation comparison (up to {MAX_COMPARE})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ids.length > 0 && <CompareShare ids={ids} />}
          {ids.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={clear}>
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {missing.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Could not load {missing.length} offer(s): {missing.join(", ")}
          </p>
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {(error as Error).message}
        </p>
      )}

      {isLoading && ids.length > 0 && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && records.length > 0 && <CompareSummary records={records} />}

      {!isLoading && <CompareTable records={records} onRemove={remove} />}

      {ids.length < MAX_COMPARE && <ComparePicker />}
    </div>
  );
}
