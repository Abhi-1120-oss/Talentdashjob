import { Link, Outlet, useLocation } from "react-router-dom";
import { Building2, BarChart3, Home, Search, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompare } from "@/context/CompareContext";
import { CompareTray } from "@/components/compare/CompareTray";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Search, label: "Explore" },
  { to: "/companies", icon: Building2, label: "Companies" },
  { to: "/compare", icon: Scale, label: "Compare" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
];

export function AppShell() {
  const location = useLocation();
  const { ids: compareIds } = useCompare();
  const compareCount = compareIds.length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              TD
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">TalentDash</p>
              <p className="text-xs text-muted-foreground">India compensation intelligence</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.slice(1).map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  location.pathname === to || location.pathname.startsWith(to + "/")
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground",
                )}
              >
                {label}
                {to === "/compare" && compareCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                    {compareCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card md:hidden">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active =
              to === "/"
                ? location.pathname === "/"
                : location.pathname === to || location.pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <CompareTray />

      <footer className="hidden border-t border-border py-4 text-center text-xs text-muted-foreground md:block">
        <a href="/docs" className="hover:text-primary" target="_blank" rel="noreferrer">
          API Docs
        </a>
        {" · "}
        <a href="/openapi.json" className="hover:text-primary" target="_blank" rel="noreferrer">
          OpenAPI
        </a>
      </footer>
    </div>
  );
}
