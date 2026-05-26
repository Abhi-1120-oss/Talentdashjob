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

interface DataBundle {
  salaries: SalaryRecord[];
  filters: FilterOptions;
  stats: PlatformStats;
  companies: CompanyListResponse["data"];
  analytics: AnalyticsResponse;
}

let cache: Promise<DataBundle> | null = null;

function loadBundle(): Promise<DataBundle> {
  if (!cache) {
    cache = fetch("/data/bundle.json", { cache: "force-cache" }).then((res) => {
      if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
      return res.json() as Promise<DataBundle>;
    });
  }
  return cache;
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const total_pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    meta: {
      page,
      page_size: pageSize,
      total,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    },
  };
}

function filterSalaries(all: SalaryRecord[], params: SalarySearchParams): SalaryRecord[] {
  let rows = [...all];
  if (params.company) {
    const q = params.company.toLowerCase();
    rows = rows.filter((r) => r.company.toLowerCase().includes(q));
  }
  if (params.role) {
    const q = params.role.toLowerCase();
    rows = rows.filter((r) => r.role.toLowerCase().includes(q));
  }
  if (params.level) {
    rows = rows.filter((r) => r.level === params.level.toLowerCase());
  }
  if (params.location) {
    const q = params.location.toLowerCase();
    rows = rows.filter((r) => r.location.toLowerCase().includes(q));
  }
  if (params.min_lpa != null) {
    rows = rows.filter((r) => r.total_compensation_lpa >= params.min_lpa!);
  }
  if (params.max_lpa != null) {
    rows = rows.filter((r) => r.total_compensation_lpa <= params.max_lpa!);
  }
  const sort = params.sort ?? "total_desc";
  if (sort === "total_desc") rows.sort((a, b) => b.total_compensation_lpa - a.total_compensation_lpa);
  else if (sort === "total_asc") rows.sort((a, b) => a.total_compensation_lpa - b.total_compensation_lpa);
  else if (sort === "confidence_desc") rows.sort((a, b) => b.confidence_score - a.confidence_score);
  return rows;
}

export const staticApi = {
  async getSalaries(params: SalarySearchParams): Promise<SalaryListResponse> {
    const { salaries } = await loadBundle();
    const filtered = filterSalaries(salaries, params);
    const page = params.page ?? 1;
    const page_size = params.page_size ?? 20;
    const { data, meta } = paginate(filtered, page, page_size);
    return { data, meta };
  },

  async getSalary(id: string): Promise<SalaryRecord> {
    const { salaries } = await loadBundle();
    const row = salaries.find((r) => r.id === id);
    if (!row) throw new Error("Salary record not found");
    return row;
  },

  async getCompareSalaries(ids: string[]): Promise<CompareSalariesResponse> {
    const { salaries } = await loadBundle();
    const byId = new Map(salaries.map((r) => [r.id, r]));
    const data: SalaryRecord[] = [];
    const missing_ids: string[] = [];
    for (const id of ids) {
      const row = byId.get(id);
      if (row) data.push(row);
      else missing_ids.push(id);
    }
    return { data, missing_ids };
  },

  async getCompanies(page = 1, pageSize = 20): Promise<CompanyListResponse> {
    const { companies } = await loadBundle();
    const { data, meta } = paginate(companies, page, pageSize);
    return { data, meta };
  },

  async getCompanySalaries(company: string, page = 1): Promise<SalaryListResponse> {
    return staticApi.getSalaries({ company, page, page_size: 20 });
  },

  async getFilters(): Promise<FilterOptions> {
    const { filters } = await loadBundle();
    return filters;
  },

  async getStats(): Promise<PlatformStats> {
    const { stats } = await loadBundle();
    return stats;
  },

  async getAnalytics(): Promise<AnalyticsResponse> {
    const { analytics } = await loadBundle();
    return analytics;
  },

  async getHealth() {
    const { salaries } = await loadBundle();
    return {
      status: "ok",
      database: "static (CDN bundle)",
      record_count: salaries.length,
    };
  },
};

/** Warm cache during app boot on static deploys. */
export function preloadStaticData(): void {
  loadBundle().catch(() => {
    /* ignore — api layer will surface errors */
  });
}
