"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import WordDetail from "@/components/WordDetail";
import WordLookup from "@/components/WordLookup";
import type { WordEntry } from "@/lib/types";

type Props = {
  words: WordEntry[];
  unlocked: Set<string>;
  selected: string | null;
  onSelect: (word: string) => void;
  lockedTotal: number;
};

export default function WordList({ words, unlocked, selected, onSelect, lockedTotal }: Props) {
  useEffect(() => {
    if (!selected) return;
    document
      .getElementById(`word-${selected}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <div className="space-y-3">
      {words.length === 0 && (
        <p className="rounded-xl border border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
          No uncommon words
        </p>
      )}

      {words.map((w) =>
        unlocked.has(w.word) ? (
          <div
            key={w.word}
            id={`word-${w.word}`}
            className={`overflow-hidden rounded-2xl border bg-card transition-colors ${
              selected === w.word
                ? "border-primary/30 bg-accent/50 shadow-sm"
                : "border-border/80 hover:border-primary/25 hover:shadow-sm"
            }`}
          >
            <button
              onClick={() => onSelect(w.word)}
              aria-expanded={selected === w.word}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span className="font-medium capitalize text-foreground">{w.word}</span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {w.count}
              </span>
            </button>

            {selected === w.word && (
              <div className="border-t border-border/70 px-4 py-4">
                <WordDetail word={w.word} />
              </div>
            )}
          </div>
        ) : (
          <div
            key={w.word}
            className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/60 px-4 py-3 text-muted-foreground"
          >
            <span className="select-none tracking-widest">••••••</span>
            <LockKeyhole className="h-4 w-4" />
          </div>
        )
      )}

      {lockedTotal > 0 && (
        <div className="rounded-2xl border border-primary/15 bg-accent/70 p-5 text-center">
          <LockKeyhole className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold text-foreground">{lockedTotal} more words to discover</p>
          <Link
            href="/login?next=/results"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Create a free account
          </Link>
        </div>
      )}

      <WordLookup />
    </div>
  );
}
