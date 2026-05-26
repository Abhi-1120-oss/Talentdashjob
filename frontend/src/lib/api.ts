import type {
  AnalyticsResponse,
  CompareSalariesResponse,
  CompanyListResponse,
  FilterOptions,
  PlatformStats,
  SalaryListResponse,
  SalaryRecord,
  SalarySearchParams,
} from "./types";

/** Empty = same origin (Vercel). Set VITE_API_BASE for a separate API host. */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = (err as { detail?: string }).detail ?? `HTTP ${res.status}`;
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return res.json() as Promise<T>;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  getSalaries: (params: SalarySearchParams) =>
    fetchJson<SalaryListResponse>(
      `/api/v1/salaries${toQuery({
        company: params.company,
        role: params.role,
        level: params.level,
        location: params.location,
        min_lpa: params.min_lpa,
        max_lpa: params.max_lpa,
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
        sort: params.sort ?? "total_desc",
      })}`,
    ),

  getSalary: (id: string) => fetchJson<SalaryRecord>(`/api/v1/salaries/${id}`),

  getCompareSalaries: (ids: string[]) =>
    fetchJson<CompareSalariesResponse>(
      `/api/v1/salaries/compare?ids=${encodeURIComponent(ids.join(","))}`,
    ),

  getCompanies: (page = 1, pageSize = 20) =>
    fetchJson<CompanyListResponse>(
      `/api/v1/companies${toQuery({ page, page_size: pageSize })}`,
    ),

  getCompanySalaries: (company: string, page = 1) =>
    fetchJson<SalaryListResponse>(
      `/api/v1/companies/${encodeURIComponent(company)}/salaries${toQuery({ page, page_size: 20 })}`,
    ),

  getFilters: () => fetchJson<FilterOptions>("/api/v1/filters"),

  getStats: () => fetchJson<PlatformStats>("/api/v1/stats"),

  getAnalytics: () => fetchJson<AnalyticsResponse>("/api/v1/analytics"),

  getHealth: () =>
    fetchJson<{ status: string; database: string; record_count?: number }>("/health"),
};
