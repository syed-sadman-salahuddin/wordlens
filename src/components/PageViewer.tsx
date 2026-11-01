import type { PageData } from "@/lib/types";

type Props = {
  page: PageData;
  unlocked: Set<string>;
  selected: string | null;
  onSelect: (word: string) => void;
};

export default function PageViewer({ page, unlocked, selected, onSelect }: Props) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  page.marks.forEach((m, i) => {
    parts.push(page.text.slice(cursor, m.start));
    const open = unlocked.has(m.word);
    const style = !open
      ? "bg-slate-200 text-slate-500 cursor-default"
      : selected === m.word
      ? "bg-amber-400 text-slate-900 cursor-pointer"
      : "bg-amber-200 text-slate-900 hover:bg-amber-300 cursor-pointer";

    parts.push(
      <mark
        key={i}
        onClick={open ? () => onSelect(m.word) : undefined}
        className={`rounded px-0.5 transition ${style}`}
      >
        {page.text.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  });
  parts.push(page.text.slice(cursor));

  return (
    <article className="whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-white p-6 text-[15px] leading-8 text-slate-700 shadow-sm sm:p-10">
      {parts}
    </article>
  );
}