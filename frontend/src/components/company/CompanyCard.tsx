import { Link } from "react-router-dom";
import { Building2, TrendingUp } from "lucide-react";
import type { CompanySummary } from "@/lib/types";
import { formatLpa } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function CompanyCard({ company }: { company: CompanySummary }) {
  return (
    <Link to={`/companies/${encodeURIComponent(company.company)}`} className="block h-full">
      <article className="glass-card-hover group h-full p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#FF385C]">
            <Building2 className="h-5 w-5" />
          </div>
          <TrendingUp className="h-4 w-4 text-success opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <h3 className="mt-4 text-lg font-semibold capitalize text-foreground">{company.company}</h3>
        <p className="mt-2 text-[28px] font-semibold tracking-tight text-[#FF385C]">
          {formatLpa(company.avg_total_lpa)}
        </p>
        <p className="text-xs font-medium text-muted-foreground">average total compensation</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge variant="secondary">{company.record_count} records</Badge>
          <Badge variant="outline">
            {company.min_total_lpa}–{company.max_total_lpa} LPA
          </Badge>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{company.top_roles.join(", ")}</p>
      </article>
    </Link>
  );
}
