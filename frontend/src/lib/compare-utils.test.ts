import { describe, expect, it } from "vitest";
import type { SalaryRecord } from "@/lib/types";
import {
  bestByTotal,
  buildShareUrl,
  deltaVsBest,
  formatDeltaLpa,
  lowestByTotal,
  percentGap,
} from "./compare-utils";

function record(id: string, total: number): SalaryRecord {
  return {
    id,
    company: "co",
    role: "eng",
    level: "l5",
    location: "blr",
    experience_years: 5,
    base_salary_inr: 0,
    base_salary_lpa: 0,
    bonus_inr: 0,
    stock_inr: 0,
    total_compensation_inr: total * 100_000,
    total_compensation_lpa: total,
    confidence_score: 0.8,
    source: "test",
    source_url: null,
    created_at: "2024-01-01T00:00:00Z",
  };
}

describe("compare-utils", () => {
  it("bestByTotal returns all ties at max", () => {
    const records = [record("a", 40), record("b", 50), record("c", 50)];
    const winners = bestByTotal(records);
    expect(winners).toHaveLength(2);
    expect(winners.map((r) => r.id).sort()).toEqual(["b", "c"]);
  });

  it("lowestByTotal picks minimum", () => {
    const records = [record("a", 40), record("b", 50)];
    expect(lowestByTotal(records)?.id).toBe("a");
  });

  it("deltaVsBest and formatDeltaLpa", () => {
    expect(deltaVsBest(45, 50)).toBe(5);
    expect(deltaVsBest(50, 50)).toBeNull();
    expect(formatDeltaLpa(5)).toBe("+5.0 LPA");
    expect(formatDeltaLpa(null)).toBeNull();
  });

  it("percentGap", () => {
    expect(percentGap(50, 40)).toBeCloseTo(25);
    expect(percentGap(10, 0)).toBeNull();
  });

  it("buildShareUrl", () => {
    const url = buildShareUrl(["id1", "id2"]);
    expect(url).toContain("/compare?ids=id1,id2");
  });
});
