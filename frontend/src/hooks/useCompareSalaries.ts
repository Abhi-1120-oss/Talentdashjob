import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCompareSalaries(ids: string[]) {
  return useQuery({
    queryKey: ["compare", ids],
    queryFn: () => api.getCompareSalaries(ids),
    enabled: ids.length > 0,
  });
}
