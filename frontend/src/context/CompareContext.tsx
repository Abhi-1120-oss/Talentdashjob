import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  clearCompare,
  getCompareIds,
  setCompareIds as persistCompareIds,
} from "@/lib/compare-store";
import { MAX_COMPARE } from "@/lib/compare-utils";

interface CompareContextValue {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  setIds: (ids: string[]) => void;
  isSelected: (id: string) => boolean;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function normalizeIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_COMPARE) break;
  }
  return out;
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const onComparePage = location.pathname === "/compare";

  const [ids, setIdsState] = useState<string[]>(() => {
    const fromUrl = searchParams.get("ids");
    if (fromUrl && location.pathname === "/compare") {
      return normalizeIds(fromUrl.split(","));
    }
    return normalizeIds(getCompareIds());
  });

  const applyIds = useCallback(
    (next: string[]) => {
      const normalized = normalizeIds(next);
      setIdsState(normalized);
      persistCompareIds(normalized);
      if (onComparePage) {
        if (normalized.length) {
          setSearchParams({ ids: normalized.join(",") }, { replace: true });
        } else {
          setSearchParams({}, { replace: true });
        }
      }
    },
    [onComparePage, setSearchParams],
  );

  useEffect(() => {
    if (!onComparePage) return;
    const fromUrl = searchParams.get("ids");
    if (fromUrl) {
      const parsed = normalizeIds(fromUrl.split(","));
      setIdsState(parsed);
      persistCompareIds(parsed);
    }
  }, [onComparePage, searchParams]);

  const add = useCallback(
    (id: string) => {
      if (ids.includes(id)) return;
      if (ids.length >= MAX_COMPARE) {
        applyIds([...ids.slice(1), id]);
        return;
      }
      applyIds([...ids, id]);
    },
    [ids, applyIds],
  );

  const remove = useCallback(
    (id: string) => {
      applyIds(ids.filter((x) => x !== id));
    },
    [ids, applyIds],
  );

  const toggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) {
        remove(id);
      } else {
        add(id);
      }
    },
    [ids, add, remove],
  );

  const clear = useCallback(() => {
    clearCompare();
    setIdsState([]);
    if (onComparePage) {
      setSearchParams({}, { replace: true });
    }
  }, [onComparePage, setSearchParams]);

  const setIds = useCallback(
    (next: string[]) => {
      applyIds(next);
    },
    [applyIds],
  );

  const value = useMemo(
    () => ({
      ids,
      add,
      remove,
      toggle,
      clear,
      setIds,
      isSelected: (id: string) => ids.includes(id),
      canAdd: ids.length < MAX_COMPARE,
    }),
    [ids, add, remove, toggle, clear, setIds],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return ctx;
}
