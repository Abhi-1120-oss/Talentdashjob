export interface SalaryRecord {
  id: string;
  company: string;
  role: string;
  level: string;
  location: string;
  experience_years: number;
  base_salary_inr: number;
  base_salary_lpa: number;
  bonus_inr: number;
  stock_inr: number;
  total_compensation_inr: number;
  total_compensation_lpa: number;
  confidence_score: number;
  source: string;
  source_url: string | null;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SalaryListResponse {
  data: SalaryRecord[];
  meta: PaginationMeta;
}

export interface CompareSalariesResponse {
  data: SalaryRecord[];
  missing_ids: string[];
}

export interface CompanySummary {
  company: string;
  record_count: number;
  avg_total_lpa: number;
  min_total_lpa: number;
  max_total_lpa: number;
  top_roles: string[];
}

export interface CompanyListResponse {
  data: CompanySummary[];
  meta: PaginationMeta;
}

export interface FilterOptions {
  roles: string[];
  levels: string[];
  locations: string[];
  companies: string[];
}

export interface PlatformStats {
  total_records: number;
  total_companies: number;
  avg_confidence: number;
  records_by_source: Record<string, number>;
  records_by_location: Record<string, number>;
}

export interface AnalyticsBucket {
  label: string;
  count: number;
  avg_lpa?: number;
}

export interface AnalyticsResponse {
  lpa_histogram: AnalyticsBucket[];
  by_level: AnalyticsBucket[];
  by_location: AnalyticsBucket[];
  by_role: AnalyticsBucket[];
  company_leaderboard: AnalyticsBucket[];
}

export interface SalarySearchParams {
  company?: string;
  role?: string;
  level?: string;
  location?: string;
  min_lpa?: number;
  max_lpa?: number;
  page?: number;
  page_size?: number;
  sort?: string;
}
