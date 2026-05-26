import { Trash2, AlertTriangle } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCompareSalaries } from "@/hooks/useCompareSalaries";
import { CompareTable } from "@/components/compare/CompareTable";
import { CompareSummary } from "@/components/compare/CompareSummary";
import { ComparePicker } from "@/components/compare/ComparePicker";
import { CompareShare } from "@/components/compare/CompareShare";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_COMPARE } from "@/lib/compare-utils";

export function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { data, isLoading, isError, error } = useCompareSalaries(ids);

  const records = data?.data ?? [];
  const missing = data?.missing_ids ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Compare"
        title="Offer comparison"
        description={`Side-by-side compensation analysis (up to ${MAX_COMPARE} offers)`}
        action={
          <div className="flex flex-wrap gap-2">
            {ids.length > 0 && <CompareShare ids={ids} />}
            {ids.length > 0 && (
              <Button variant="outline" className="gap-2" onClick={clear}>
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        }
      />

      {missing.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#FFB400]/30 bg-[#FFB400]/10 p-4 text-sm text-[#222222]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB400]" />
          <p>Could not load {missing.length} offer(s): {missing.join(", ")}</p>
        </div>
      )}

      {isError && (
        <p className="rounded-2xl border border-[#FF385C]/20 bg-[#FFF1F2] p-4 text-sm font-medium text-[#FF385C]">
          {(error as Error).message}
        </p>
      )}

      {isLoading && ids.length > 0 && (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      )}

      {!isLoading && records.length > 0 && <CompareSummary records={records} />}

      {!isLoading && <CompareTable records={records} onRemove={remove} />}

      {ids.length < MAX_COMPARE && <ComparePicker />}
    </div>
  );
}
