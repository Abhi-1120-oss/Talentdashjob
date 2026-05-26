import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCompanySalaries } from "@/hooks/useCompanies";
import { SalaryCard } from "@/components/salary/SalaryCard";
import { SalaryDetailSheet } from "@/components/salary/SalaryDetailSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { SalaryRecord } from "@/lib/types";
import { formatLpa } from "@/lib/format";

export function CompanyDetailPage() {
  const { company } = useParams<{ company: string }>();
  const decoded = company ? decodeURIComponent(company) : "";
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<SalaryRecord | null>(null);
  const { data, isLoading, isError, error } = useCompanySalaries(decoded, page);

  const avgLpa =
    data?.data.length &&
    data.data.reduce((s, r) => s + r.total_compensation_lpa, 0) / data.data.length;

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link to="/companies">
          <ArrowLeft className="h-4 w-4" />
          All companies
        </Link>
      </Button>

      <div>
        <h1 className="page-title capitalize">{decoded}</h1>
        {avgLpa ? (
          <p className="page-subtitle">
            Avg <span className="font-semibold text-[#FF385C]">{formatLpa(avgLpa)}</span> on this page ·{" "}
            {data?.meta.total ?? 0} total records
          </p>
        ) : null}
      </div>

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm font-medium text-danger">
          {(error as Error).message}
        </p>
      )}

      {data && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((r) => (
              <SalaryCard key={r.id} record={r} onClick={setDetail} />
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

      <SalaryDetailSheet record={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
