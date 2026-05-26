import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompareProvider } from "@/context/CompareContext";
import { AppShell } from "@/components/layout/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyDetailPage } from "@/pages/CompanyDetailPage";
import { ComparePage } from "@/pages/ComparePage";
import { Skeleton } from "@/components/ui/skeleton";
import { isStaticApi } from "@/lib/api";

const InsightsPage = lazy(() =>
  import("@/pages/InsightsPage").then((m) => ({ default: m.InsightsPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: isStaticApi ? 10 * 60_000 : 0,
      gcTime: isStaticApi ? 30 * 60_000 : 5 * 60_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CompareProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="companies/:company" element={<CompanyDetailPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route
              path="insights"
              element={
                <Suspense fallback={<Skeleton className="mx-auto mt-8 h-96 max-w-4xl" />}>
                  <InsightsPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
        </CompareProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
