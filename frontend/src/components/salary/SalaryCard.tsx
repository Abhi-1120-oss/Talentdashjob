import { MapPin, Briefcase } from "lucide-react";
import type { SalaryRecord } from "@/lib/types";
import { formatLpa, formatInr, formatPercent } from "@/lib/format";
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
    <article
      className={cn(
        "glass-card-hover group cursor-pointer p-5",
        selected && "border-[#FF385C]/40 ring-2 ring-[#FF385C]/15 shadow-airbnb-hover",
      )}
      onClick={() => onClick?.(record)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold capitalize text-foreground">{record.company}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
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
      <p className="mt-4 text-[28px] font-semibold tracking-tight text-[#00A699]">
        {formatLpa(record.total_compensation_lpa)}
      </p>
      <p className="text-xs font-medium text-muted-foreground">{formatInr(record.total_compensation_inr)} total</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="default">{record.level.toUpperCase()}</Badge>
        <Badge variant="secondary">
          <MapPin className="mr-0.5 inline h-3 w-3" />
          {record.location}
        </Badge>
        <Badge variant="outline">{record.experience_years} yrs</Badge>
        <Badge variant="success">{formatPercent(record.confidence_score)}</Badge>
      </div>
    </article>
  );
}
