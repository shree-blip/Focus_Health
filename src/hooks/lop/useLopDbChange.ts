"use client";

import { useEffect, useRef } from "react";
import {
  LOP_DB_CHANGE_EVENT,
  type LopDbChangeDetail,
} from "@/lib/lop/db";

/**
 * Subscribe to lopDb mutation events and re-run a refetch callback whenever
 * any of the watched tables changes — or when the tab regains focus.
 *
 * Tables can be a single table name or an array. Pass `"*"` to listen to every
 * mutation. The callback is debounced via a single rAF + visibility guard so
 * a flurry of writes only triggers one refetch.
 */
export function useLopDbChange(
  tables: string | string[] | "*",
  refetch: () => void | Promise<void>,
) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    const watched =
      tables === "*" ? null : new Set(Array.isArray(tables) ? tables : [tables]);

    let scheduled = false;
    const run = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        if (typeof document !== "undefined" && document.hidden) return;
        void refetchRef.current();
      });
    };

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<LopDbChangeDetail>).detail;
      if (!detail) return;
      if (watched && !watched.has(detail.table)) return;
      run();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refetchRef.current();
      }
    };

    window.addEventListener(LOP_DB_CHANGE_EVENT, onChange);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(LOP_DB_CHANGE_EVENT, onChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [Array.isArray(tables) ? tables.join(",") : tables]); // eslint-disable-line react-hooks/exhaustive-deps
}
