export function formatLpa(lpa: number): string {
  return `${lpa.toFixed(1)} LPA`;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
