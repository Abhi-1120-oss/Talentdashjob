import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompareProvider } from "@/context/CompareContext";
import { AppShell } from "@/components/layout/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyDetailPage } from "@/pages/CompanyDetailPage";
import { ComparePage } from "@/pages/ComparePage";
import { InsightsPage } from "@/pages/InsightsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
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
            <Route path="insights" element={<InsightsPage />} />
          </Route>
        </Routes>
        </CompareProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
