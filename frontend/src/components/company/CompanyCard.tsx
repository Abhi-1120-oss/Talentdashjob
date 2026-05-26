import { Link } from "react-router-dom";
import type { CompanySummary } from "@/lib/types";
import { formatLpa } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CompanyCard({ company }: { company: CompanySummary }) {
  return (
    <Link to={`/companies/${encodeURIComponent(company.company)}`}>
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold capitalize">{company.company}</h3>
          <p className="mt-2 text-2xl font-bold text-success">{formatLpa(company.avg_total_lpa)}</p>
          <p className="text-xs text-muted-foreground">average total compensation</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{company.record_count} records</Badge>
            <Badge variant="outline">
              {company.min_total_lpa}–{company.max_total_lpa} LPA
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{company.top_roles.join(", ")}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
