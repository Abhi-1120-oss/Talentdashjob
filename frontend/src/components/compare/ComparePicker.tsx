import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCompare } from "@/context/CompareContext";
import { formatLpa, capitalize } from "@/lib/format";
import { MAX_COMPARE } from "@/lib/compare-utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export function ComparePicker() {
  const { ids, toggle, isSelected, canAdd } = useCompare();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["compare-picker", search],
    queryFn: () =>
      api.getSalaries({
        company: search || undefined,
        sort: "total_desc",
        page: 1,
        page_size: 12,
      }),
  });

  if (ids.length >= MAX_COMPARE) return null;

  return (
    <div className="rounded-lg border border-dashed border-border p-4 space-y-4">
      <div>
        <h2 className="font-semibold">Add offers to compare</h2>
        <p className="text-sm text-muted-foreground">
          Search by company name · {ids.length}/{MAX_COMPARE} selected
        </p>
      </div>
      <Input
        placeholder="Filter by company (e.g. google)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}
      {data && (
        <ul className="divide-y divide-border rounded-md border border-border">
          {data.data.map((record) => {
            const selected = isSelected(record.id);
            const disabled = !selected && !canAdd;
            return (
              <li
                key={record.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected}
                  disabled={disabled}
                  onCheckedChange={() => toggle(record.id)}
                  aria-label={`Compare ${record.company}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium capitalize truncate">{record.company}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {record.role} · {capitalize(record.level)} · {capitalize(record.location)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {formatLpa(record.total_compensation_lpa)}
                </span>
              </li>
            );
          })}
          {data.data.length === 0 && (
            <li className="p-4 text-center text-sm text-muted-foreground">No offers found</li>
          )}
        </ul>
      )}
    </div>
  );
}
