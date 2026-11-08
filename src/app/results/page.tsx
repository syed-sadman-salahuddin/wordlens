"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { useAuth } from "@/context/AuthContext";
import { saveAnalysis } from "@/lib/saveAnalysis";
import PageViewer from "@/components/PageViewer";
import WordList from "@/components/WordList";
import { Button } from "@/components/ui/button";
import type { WordEntry } from "@/lib/types";

export default function ResultsPage() {
  const { analysis, ready, setAnalysis } = useAnalysis();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const savingRef = useRef(false);

  const save = useCallback(async () => {
    if (!analysis || !user || savingRef.current) return;
    savingRef.current = true;
    setStatus("saving");
    try {
      const id = await saveAnalysis(user.uid, analysis, (done, total) =>
        setProgress({ done, total })
      );
      setAnalysis({ ...analysis, savedId: id });
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      savingRef.current = false;
    }
  }, [analysis, user, setAnalysis]);

  useEffect(() => {
    if (ready && !analysis) router.replace("/");
  }, [ready, analysis, router]);

  useEffect(() => {
    if (!analysis || !user || analysis.savedId) return;
    const timer = window.setTimeout(() => {
      void save();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [analysis, user, save]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  const unlocked = useMemo(() => {
    const list = analysis?.words ?? [];
    return new Set((user ? list : list.slice(0, 2)).map((w) => w.word));
  }, [analysis, user]);

  const state = analysis?.savedId ? "saved" : status;

  if (!ready || loading || !analysis) {
    return (
      <div className="flex justify-center py-28">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const page = analysis.pages[index];
  const byWord = new Map<string, WordEntry>(analysis.words.map((w) => [w.word, w]));
  const pageWords = [...new Set(page.marks.map((m) => m.word))].map((w) => byWord.get(w)!);
  const lockedTotal = analysis.words.length - unlocked.size;
  const toggle = (w: string) => setSelected(selected === w ? null : w);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-lg">{analysis.fileName}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {analysis.pages.length} {analysis.pages.length === 1 ? "page" : "pages"} · {analysis.words.length} unique words
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user && state === "saving" && (
            <span role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {progress.done}/{progress.total}
            </span>
          )}
          {user && state === "saved" && (
            <span role="status" className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          {user && state === "error" && (
            <button
              onClick={save}
              className="flex items-center gap-1.5 text-sm text-destructive hover:underline"
            >
              <AlertCircle className="h-4 w-4" />
              Retry save
            </button>
          )}
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/">
              <Upload className="h-4 w-4" />
              New analysis
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Document preview <span className="mx-1 text-border">/</span> Page {index + 1} of {analysis.pages.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                disabled={index === analysis.pages.length - 1}
                onClick={() => setIndex(index + 1)}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <PageViewer
            page={page}
            unlocked={unlocked}
            selected={selected}
            onSelect={toggle}
          />
        </section>

        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Words to explore</h2>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {pageWords.length}
            </span>
          </div>
          <WordList
            words={pageWords}
            unlocked={unlocked}
            selected={selected}
            onSelect={toggle}
            lockedTotal={lockedTotal}
          />
        </aside>
      </div>
    </div>
  );
}
