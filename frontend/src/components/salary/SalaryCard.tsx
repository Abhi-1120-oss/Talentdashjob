import { MapPin, Briefcase } from "lucide-react";
import type { SalaryRecord } from "@/lib/types";
import { formatLpa, formatInr, formatPercent } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface SalaryCardProps {
  record: SalaryRecord;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (record: SalaryRecord) => void;
}

export function SalaryCard({ record, selected, onSelect, onClick }: SalaryCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
        selected && "border-primary ring-1 ring-primary",
      )}
      onClick={() => onClick?.(record)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold capitalize">{record.company}</h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              {record.role}
            </p>
          </div>
          {onSelect && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(record.id);
              }}
            >
              <Checkbox checked={selected} aria-label="Add to compare" />
            </div>
          )}
        </div>
        <p className="mt-3 text-2xl font-bold text-success">{formatLpa(record.total_compensation_lpa)}</p>
        <p className="text-xs text-muted-foreground">{formatInr(record.total_compensation_inr)} total</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="outline">{record.level.toUpperCase()}</Badge>
          <Badge variant="secondary">
            <MapPin className="mr-0.5 inline h-3 w-3" />
            {record.location}
          </Badge>
          <Badge variant="secondary">{record.experience_years} yrs</Badge>
          <Badge variant="success">{formatPercent(record.confidence_score)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
