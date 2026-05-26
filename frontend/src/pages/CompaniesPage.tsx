import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyCard } from "@/components/company/CompanyCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function CompaniesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useCompanies(page);

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Companies"
        title="Employer directory"
        description="Browse compensation benchmarks by company"
      />

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((c) => (
              <CompanyCard key={c.company} company={c} />
            ))}
          </div>
          {data.meta.total_pages > 1 && (
            <div className="flex justify-center gap-3">
              <Button variant="outline" disabled={!data.meta.has_prev} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={!data.meta.has_next} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
