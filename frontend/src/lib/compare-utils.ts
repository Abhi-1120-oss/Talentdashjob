import type { SalaryRecord } from "@/lib/types";

export const MAX_COMPARE = 3;

export function buildShareUrl(ids: string[]): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const q = ids.length ? `?ids=${ids.join(",")}` : "";
  return `${base}/compare${q}`;
}

export function bestByTotal(records: SalaryRecord[]): SalaryRecord[] {
  if (records.length === 0) return [];
  const max = Math.max(...records.map((r) => r.total_compensation_lpa));
  return records.filter((r) => r.total_compensation_lpa === max);
}

export function lowestByTotal(records: SalaryRecord[]): SalaryRecord | null {
  if (records.length === 0) return null;
  return records.reduce((a, b) =>
    a.total_compensation_lpa <= b.total_compensation_lpa ? a : b,
  );
}

export function deltaVsBest(value: number, best: number): number | null {
  if (value >= best) return null;
  return best - value;
}

export function percentGap(high: number, low: number): number | null {
  if (low <= 0) return null;
  return ((high - low) / low) * 100;
}

export function formatDeltaLpa(delta: number | null): string | null {
  if (delta === null || delta <= 0) return null;
  return `+${delta.toFixed(1)} LPA`;
}
