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
      ? "bg-muted text-muted-foreground cursor-default"
      : selected === m.word
      ? "bg-primary text-primary-foreground cursor-pointer"
      : "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer";

    parts.push(
      <mark
        key={i}
        role={open ? "button" : undefined}
        tabIndex={open ? 0 : undefined}
        aria-label={open ? `Explore ${m.word}` : undefined}
        aria-pressed={open ? selected === m.word : undefined}
        onClick={open ? () => onSelect(m.word) : undefined}
        onKeyDown={
          open
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(m.word);
                }
              }
            : undefined
        }
        className={`rounded px-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${style}`}
      >
        {page.text.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  });
  parts.push(page.text.slice(cursor));

  return (
    <article className="whitespace-pre-wrap break-words rounded-2xl border border-border/80 bg-card p-6 text-[15px] leading-8 text-foreground shadow-sm sm:p-10">
      {parts}
    </article>
  );
}
