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

  const isActive = (to: string) =>
    to === "/"
      ? location.pathname === "/"
      : location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <div className="flex min-h-dvh bg-[#F7F7F7]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[#EBEBEB] bg-white lg:flex">
        <div className="flex h-[72px] items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF385C] shadow-airbnb">
            <span className="text-sm font-bold text-white">TD</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#222222]">TalentDash</p>
            <p className="text-[11px] text-[#717171]">Compensation analytics</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-4 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-all duration-200",
                isActive(to)
                  ? "nav-item-active"
                  : "text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={isActive(to) ? 2.25 : 2} />
              {label}
              {to === "/compare" && compareCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF385C] px-1.5 text-[10px] font-bold text-white">
                  {compareCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[#EBEBEB] p-6">
          <p className="text-xs leading-relaxed text-[#717171]">
            Enterprise salary intelligence for India tech professionals.
          </p>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-[#EBEBEB] bg-white/95 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center justify-between px-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF385C]">
                <span className="text-xs font-bold text-white">TD</span>
              </div>
              <span className="text-[15px] font-semibold text-[#222222]">TalentDash</span>
            </Link>
            {compareCount > 0 && (
              <Link
                to="/compare"
                className="rounded-full bg-[#FF385C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-airbnb"
              >
                Compare · {compareCount}
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-8 pb-28 lg:px-10 lg:py-10 lg:pb-12">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EBEBEB] bg-white px-2 py-2 shadow-airbnb-lg lg:hidden">
          <div className="flex justify-around">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium",
                  isActive(to) ? "text-[#FF385C]" : "text-[#717171]",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive(to) ? 2.25 : 2} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <CompareTray />

        <footer className="hidden border-t border-[#EBEBEB] bg-white py-6 text-center text-xs text-[#717171] lg:block">
          <a href="/docs" className="font-medium hover:text-[#222222]" target="_blank" rel="noreferrer">
            API Docs
          </a>
          <span className="mx-2">·</span>
          <a href="/openapi.json" className="font-medium hover:text-[#222222]" target="_blank" rel="noreferrer">
            OpenAPI
          </a>
        </footer>
      </div>
    </div>
  );
}
