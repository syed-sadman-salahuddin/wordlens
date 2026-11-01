import Link from "next/link";
import { Lock } from "lucide-react";
import type { WordEntry } from "@/lib/types";

type Props = {
  words: WordEntry[];
  unlocked: Set<string>;
  selected: string | null;
  onSelect: (word: string) => void;
  lockedTotal: number;
};

export default function WordList({ words, unlocked, selected, onSelect, lockedTotal }: Props) {
  return (
    <div className="space-y-3">
      {words.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
          No uncommon words
        </p>
      )}

      {words.map((w) =>
        unlocked.has(w.word) ? (
          <button
            key={w.word}
            onClick={() => onSelect(w.word)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              selected === w.word
                ? "border-amber-400 bg-amber-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="font-medium capitalize">{w.word}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {w.count}
            </span>
          </button>
        ) : (
          <div
            key={w.word}
            className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-slate-400"
          >
            <span className="select-none tracking-widest">••••••</span>
            <Lock className="h-4 w-4" />
          </div>
        )
      )}

      {lockedTotal > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
          <Lock className="mx-auto h-5 w-5 text-indigo-600" />
          <p className="mt-2 text-sm font-medium text-indigo-900">{lockedTotal} more words</p>
          <Link
            href="/login?next=/results"
            className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Please log in
          </Link>
        </div>
      )}
    </div>
  );
}