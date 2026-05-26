import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCompanies(page = 1) {
  return useQuery({
    queryKey: ["companies", page],
    queryFn: () => api.getCompanies(page),
  });
}

export function useCompanySalaries(company: string, page = 1) {
  return useQuery({
    queryKey: ["company-salaries", company, page],
    queryFn: () => api.getCompanySalaries(company, page),
    enabled: !!company,
  });
}
