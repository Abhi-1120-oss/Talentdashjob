const STORAGE_KEY = "talentdash_compare";

export function getCompareIds(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function setCompareIds(ids: string[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 3)));
}

export function toggleCompareId(id: string): string[] {
  const current = getCompareIds();
  if (current.includes(id)) {
    const next = current.filter((x) => x !== id);
    setCompareIds(next);
    return next;
  }
  if (current.length >= 3) {
    const next = [...current.slice(1), id];
    setCompareIds(next);
    return next;
  }
  const next = [...current, id];
  setCompareIds(next);
  return next;
}

export function clearCompare(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
