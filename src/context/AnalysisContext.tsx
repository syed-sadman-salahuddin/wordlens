"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Analysis } from "@/lib/types";

const KEY = "wordlens:analysis";

type Value = {
  analysis: Analysis | null;
  ready: boolean;
  setAnalysis: (a: Analysis | null) => void;
};

const AnalysisContext = createContext<Value>({
  analysis: null,
  ready: false,
  setAnalysis: () => {},
});

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysis, setState] = useState<Analysis | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restored: Analysis | null = null;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) restored = JSON.parse(raw) as Analysis;
    } catch {}

    const timer = window.setTimeout(() => {
      if (restored) setState(restored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setAnalysis = useCallback((a: Analysis | null) => {
    setState(a);
    try {
      if (a) sessionStorage.setItem(KEY, JSON.stringify(a));
      else sessionStorage.removeItem(KEY);
    } catch {}
  }, []);

  return (
    <AnalysisContext.Provider value={{ analysis, ready, setAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = () => useContext(AnalysisContext);