import type { TooltipProps } from "recharts";

export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white px-4 py-3 shadow-airbnb-lg">
      {label && <p className="mb-1.5 text-xs font-medium text-[#717171]">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-semibold text-[#222222]">
          <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString("en-IN") : entry.value}
        </p>
      ))}
    </div>
  );
}
