import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FilterOptions } from "@/lib/types";

export interface FilterValues {
  company: string;
  role: string;
  location: string;
  level: string;
  minLpa: string;
  maxLpa: string;
  sort: string;
}

interface FilterBarProps {
  values: FilterValues;
  filters?: FilterOptions;
  onChange: (values: FilterValues) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function FilterBar({ values, filters, onChange, onSearch, onClear }: FilterBarProps) {
  const set = (key: keyof FilterValues, val: string) => onChange({ ...values, [key]: val });

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder="Company"
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
        />
        <Input placeholder="Role" value={values.role} onChange={(e) => set("role", e.target.value)} />
        <Select value={values.location || "all"} onValueChange={(v) => set("location", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {filters?.locations.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={values.level || "all"} onValueChange={(v) => set("level", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {filters?.levels.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Min LPA"
          value={values.minLpa}
          onChange={(e) => set("minLpa", e.target.value)}
        />
        <Input
          type="number"
          placeholder="Max LPA"
          value={values.maxLpa}
          onChange={(e) => set("maxLpa", e.target.value)}
        />
        <Select value={values.sort} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total_desc">Highest pay</SelectItem>
            <SelectItem value="total_asc">Lowest pay</SelectItem>
            <SelectItem value="confidence_desc">Best confidence</SelectItem>
            <SelectItem value="created_at_desc">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
