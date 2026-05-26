import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFilters, useSalaries } from "@/hooks/useSalaries";
import { FilterBar, type FilterValues } from "@/components/salary/FilterBar";
import { SalaryCard } from "@/components/salary/SalaryCard";
import { SalaryDetailSheet } from "@/components/salary/SalaryDetailSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { SalaryRecord } from "@/lib/types";
import { useCompare } from "@/context/CompareContext";
import { Scale } from "lucide-react";

const defaultFilters: FilterValues = {
  company: "",
  role: "",
  location: "",
  level: "",
  minLpa: "",
  maxLpa: "",
  sort: "total_desc",
};

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [detail, setDetail] = useState<SalaryRecord | null>(null);
  const { ids: compareIds, toggle: toggleCompare } = useCompare();

  const filters: FilterValues = {
    company: searchParams.get("company") ?? "",
    role: searchParams.get("role") ?? "",
    location: searchParams.get("location") ?? "",
    level: searchParams.get("level") ?? "",
    minLpa: searchParams.get("min_lpa") ?? "",
    maxLpa: searchParams.get("max_lpa") ?? "",
    sort: searchParams.get("sort") ?? "total_desc",
  };

  const page = Number(searchParams.get("page") ?? "1");

  const queryParams = useMemo(
    () => ({
      company: filters.company || undefined,
      role: filters.role || undefined,
      location: filters.location || undefined,
      level: filters.level || undefined,
      min_lpa: filters.minLpa ? Number(filters.minLpa) : undefined,
      max_lpa: filters.maxLpa ? Number(filters.maxLpa) : undefined,
      sort: filters.sort,
      page,
      page_size: 20,
    }),
    [filters, page],
  );

  const { data: filterOptions } = useFilters();
  const { data, isLoading, isError, error } = useSalaries(queryParams);

  const applyFilters = useCallback(
    (f: FilterValues, p = 1) => {
      const next = new URLSearchParams();
      if (f.company) next.set("company", f.company);
      if (f.role) next.set("role", f.role);
      if (f.location) next.set("location", f.location);
      if (f.level) next.set("level", f.level);
      if (f.minLpa) next.set("min_lpa", f.minLpa);
      if (f.maxLpa) next.set("max_lpa", f.maxLpa);
      if (f.sort) next.set("sort", f.sort);
      next.set("page", String(p));
      setSearchParams(next);
    },
    [setSearchParams],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Explore"
        title="Salary explorer"
        description="Search India tech compensation with AI-powered filters"
        action={
          compareIds.length > 0 ? (
            <Button asChild variant="outline" className="gap-2">
              <Link to={`/compare?ids=${compareIds.join(",")}`}>
                <Scale className="h-4 w-4" />
                Compare ({compareIds.length})
              </Link>
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        values={filters}
        filters={filterOptions}
        onChange={(f) => applyFilters(f, 1)}
        onSearch={() => applyFilters(filters, 1)}
        onClear={() => applyFilters(defaultFilters, 1)}
      />

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-2xl border border-[#FF385C]/20 bg-[#FFF1F2] p-4 text-sm font-medium text-[#FF385C]">
          {(error as Error).message}
        </p>
      )}

      {data && (
        <>
          <p className="text-sm font-medium text-muted-foreground">
            {data.meta.total} results · page {data.meta.page} of {data.meta.total_pages}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((record) => (
              <SalaryCard
                key={record.id}
                record={record}
                selected={compareIds.includes(record.id)}
                onSelect={toggleCompare}
                onClick={setDetail}
              />
            ))}
          </div>
          {data.meta.total_pages > 1 && (
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" disabled={!data.meta.has_prev} onClick={() => applyFilters(filters, page - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={!data.meta.has_next} onClick={() => applyFilters(filters, page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <SalaryDetailSheet record={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
