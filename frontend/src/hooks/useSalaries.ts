import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SalarySearchParams } from "@/lib/types";

export function useSalaries(params: SalarySearchParams) {
  return useQuery({
    queryKey: ["salaries", params],
    queryFn: () => api.getSalaries(params),
  });
}

export function useSalary(id: string) {
  return useQuery({
    queryKey: ["salary", id],
    queryFn: () => api.getSalary(id),
    enabled: !!id,
  });
}

export function useFilters() {
  return useQuery({
    queryKey: ["filters"],
    queryFn: () => api.getFilters(),
    staleTime: 60_000,
  });
}
