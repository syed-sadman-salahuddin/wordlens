"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Loader2, Upload } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { useAuth } from "@/context/AuthContext";
import PageViewer from "@/components/PageViewer";
import WordList from "@/components/WordList";

const pagerButton =
  "rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-100 disabled:opacity-40";

export default function ResultsPage() {
  const { analysis, ready } = useAnalysis();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !analysis) router.replace("/");
  }, [ready, analysis, router]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  const unlocked = useMemo(() => {
    const list = analysis?.words ?? [];
    return new Set((user ? list : list.slice(0, 2)).map((w) => w.word));
  }, [analysis, user]);

  if (!ready || loading || !analysis) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const page = analysis.pages[index];
  const byWord = new Map<string, (typeof analysis.words)[number]>(
    analysis.words.map((w) => [w.word, w])
  );
  const pageWords = [...new Set(page.marks.map((m) => m.word))].map((w) => byWord.get(w)!);
  const lockedTotal = analysis.words.length - unlocked.size;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{analysis.fileName}</h1>
            <p className="text-sm text-slate-500">
              {analysis.pages.length} pages · {analysis.words.length} words
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
        >
          <Upload className="h-4 w-4" />
          New
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Page {index + 1} / {analysis.pages.length}
            </span>
            <div className="flex gap-2">
              <button
                aria-label="Previous page"
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
                className={pagerButton}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next page"
                disabled={index === analysis.pages.length - 1}
                onClick={() => setIndex(index + 1)}
                className={pagerButton}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <PageViewer
            page={page}
            unlocked={unlocked}
            selected={selected}
            onSelect={(w) => setSelected(selected === w ? null : w)}
          />
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <WordList
            words={pageWords}
            unlocked={unlocked}
            selected={selected}
            onSelect={(w) => setSelected(selected === w ? null : w)}
            lockedTotal={lockedTotal}
          />
        </aside>
      </div>
    </div>
  );
}