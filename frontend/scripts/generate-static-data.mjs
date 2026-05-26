/**
 * Build-time mock dataset for Vercel/static deploy (no serverless API).
 */
import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/data");

const SAMPLES = [
  ["google", "Software Engineer", "l5", "bangalore", 6, 3500000, 500000, 1000000, "ambitionbox"],
  ["google", "Software Engineer", "l4", "hyderabad", 3, 2200000, 200000, 400000, "glassdoor"],
  ["microsoft", "Software Engineer", "l5", "bangalore", 7, 3800000, 600000, 800000, "ambitionbox"],
  ["amazon", "Software Engineer", "sde-ii", "bangalore", 4, 2800000, 300000, 600000, "ambitionbox"],
  ["flipkart", "Software Engineer", "l4", "bangalore", 4, 2500000, 250000, 500000, "glassdoor"],
  ["infosys", "Software Engineer", "l3", "pune", 2, 900000, 50000, 0, "ambitionbox"],
  ["tcs", "Data Scientist", "l4", "mumbai", 5, 1800000, 100000, 200000, "glassdoor"],
  ["swiggy", "Data Scientist", "l5", "bangalore", 6, 3200000, 400000, 700000, "ambitionbox"],
  ["zomato", "Data Scientist", "l4", "delhi", 4, 2400000, 200000, 300000, "ambitionbox"],
  ["razorpay", "Software Engineer", "l5", "bangalore", 5, 3000000, 350000, 900000, "glassdoor"],
  ["phonepe", "Software Engineer", "l4", "mumbai", 3, 2100000, 150000, 400000, "ambitionbox"],
  ["wipro", "Software Engineer", "l3", "chennai", 2, 800000, 0, 0, "glassdoor"],
];

const INR_PER_LPA = 100_000;

function stableId(company, role, level) {
  const h = createHash("sha1").update(`${company}-${role}-${level}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function toRecord(s) {
  const [company, role, level, location, exp, base, bonus, stock, source] = s;
  const total = base + bonus + stock;
  return {
    id: stableId(company, role, level),
    company,
    role,
    level,
    location,
    experience_years: exp,
    base_salary_inr: base,
    base_salary_lpa: round2(base / INR_PER_LPA),
    bonus_inr: bonus,
    stock_inr: stock,
    total_compensation_inr: total,
    total_compensation_lpa: round2(total / INR_PER_LPA),
    confidence_score: 0.82,
    source,
    source_url: `https://example.com/${company}/${role}`,
    created_at: "2024-05-01T12:00:00Z",
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function lpaBucket(lpa) {
  const edges = [0, 10, 20, 30, 40, 50, 100];
  for (let i = 0; i < edges.length - 1; i++) {
    if (lpa < edges[i + 1]) return `${edges[i]}-${edges[i + 1]} LPA`;
  }
  return "50+ LPA";
}

const salaries = SAMPLES.map(toRecord);

function filters() {
  return {
    roles: [...new Set(salaries.map((r) => r.role))].sort(),
    levels: [...new Set(salaries.map((r) => r.level))].sort(),
    locations: [...new Set(salaries.map((r) => r.location))].sort(),
    companies: [...new Set(salaries.map((r) => r.company))].sort(),
  };
}

function stats() {
  const by_source = {};
  const by_location = {};
  for (const r of salaries) {
    by_source[r.source] = (by_source[r.source] || 0) + 1;
    by_location[r.location] = (by_location[r.location] || 0) + 1;
  }
  return {
    total_records: salaries.length,
    total_companies: new Set(salaries.map((r) => r.company)).size,
    avg_confidence: 0.82,
    records_by_source: by_source,
    records_by_location: by_location,
  };
}

function companies() {
  const by = {};
  for (const r of salaries) {
    (by[r.company] ||= []).push(r);
  }
  return Object.entries(by)
    .map(([company, recs]) => {
      const lpas = recs.map((r) => r.total_compensation_lpa);
      const roleCounts = {};
      for (const r of recs) roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      const top_roles = Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([role]) => role);
      return {
        company,
        record_count: recs.length,
        avg_total_lpa: round2(lpas.reduce((a, b) => a + b, 0) / lpas.length),
        min_total_lpa: Math.min(...lpas),
        max_total_lpa: Math.max(...lpas),
        top_roles,
      };
    })
    .sort((a, b) => a.company.localeCompare(b.company));
}

function analytics() {
  const hist = {};
  const by_level = {};
  const by_location = {};
  const by_role = {};
  const by_company = {};

  for (const r of salaries) {
    const lpa = r.total_compensation_lpa;
    const bucket = lpaBucket(lpa);
    (hist[bucket] ||= []).push(lpa);
    (by_level[r.level] ||= []).push(lpa);
    by_location[r.location] = (by_location[r.location] || 0) + 1;
    by_role[r.role] = (by_role[r.role] || 0) + 1;
    (by_company[r.company] ||= []).push(lpa);
  }

  const order = ["0-10 LPA", "10-20 LPA", "20-30 LPA", "30-40 LPA", "40-50 LPA", "50+ LPA"];
  const lpa_histogram = order
    .filter((label) => hist[label]?.length)
    .map((label) => {
      const vals = hist[label];
      return { label, count: vals.length, avg_lpa: round2(vals.reduce((a, b) => a + b, 0) / vals.length) };
    });

  return {
    lpa_histogram,
    by_level: Object.entries(by_level).map(([label, vals]) => ({
      label,
      count: vals.length,
      avg_lpa: round2(vals.reduce((a, b) => a + b, 0) / vals.length),
    })),
    by_location: Object.entries(by_location)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count, avg_lpa: null })),
    by_role: Object.entries(by_role)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count, avg_lpa: null })),
    company_leaderboard: Object.entries(by_company)
      .map(([label, vals]) => ({
        label,
        count: vals.length,
        avg_lpa: round2(vals.reduce((a, b) => a + b, 0) / vals.length),
      }))
      .sort((a, b) => b.avg_lpa - a.avg_lpa)
      .slice(0, 10),
  };
}

await mkdir(OUT, { recursive: true });
const bundle = { salaries, filters: filters(), stats: stats(), companies: companies(), analytics: analytics() };
await writeFile(join(OUT, "bundle.json"), JSON.stringify(bundle));
console.log(`Wrote ${salaries.length} records to public/data/bundle.json`);
