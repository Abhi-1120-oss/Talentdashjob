import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyCard } from "@/components/company/CompanyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function CompaniesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useCompanies(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Companies</h1>
        <p className="text-muted-foreground">Browse compensation by employer</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {(error as Error).message}
        </p>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((c) => (
              <CompanyCard key={c.company} company={c} />
            ))}
          </div>
          {data.meta.total_pages > 1 && (
            <div className="flex justify-center gap-2">
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
