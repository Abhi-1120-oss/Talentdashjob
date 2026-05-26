import { Link, useLocation } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCompareSalaries } from "@/hooks/useCompareSalaries";
import { formatLpa } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function CompareTray() {
  const location = useLocation();
  const { ids, remove, clear } = useCompare();
  const { data } = useCompareSalaries(ids);

  if (location.pathname === "/compare" || ids.length === 0) return null;

  const records = data?.data ?? [];

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-[#EBEBEB] bg-white px-5 py-4 shadow-airbnb-lg lg:bottom-0 lg:left-[260px]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-4">
        <Scale className="hidden h-5 w-5 text-[#FF385C] sm:block" />
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {ids.map((id) => {
            const record = records.find((r) => r.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-2 rounded-full border border-[#EBEBEB] bg-[#F7F7F7] px-4 py-2 text-sm transition-colors hover:border-[#222222]/20"
              >
                <span className="font-semibold capitalize text-[#222222]">
                  {record ? record.company : id.slice(0, 8)}
                </span>
                {record && (
                  <span className="font-medium text-[#FF385C]">{formatLpa(record.total_compensation_lpa)}</span>
                )}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-[#717171] hover:bg-white hover:text-[#222222]"
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
            <Link to={`/compare?ids=${ids.join(",")}`}>Compare ({ids.length})</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
