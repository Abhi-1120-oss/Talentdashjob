import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.getAnalytics(),
  });
}
