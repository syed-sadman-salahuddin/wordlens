import type { Definition } from "@/lib/types";

export default function DefinitionView({ phonetic, meanings, synonyms }: Definition) {
  return (
    <div className="space-y-3 text-sm">
      {phonetic && <p className="text-muted-foreground">{phonetic}</p>}

      <ol className="space-y-2">
        {meanings.map((m, i) => (
          <li key={i} className="flex gap-2">
            {m.partOfSpeech && (
              <span className="mt-0.5 h-fit shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs italic text-muted-foreground">
                {m.partOfSpeech}
              </span>
            )}
            <span className="text-foreground">{m.definition}</span>
          </li>
        ))}
      </ol>

      {synonyms.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Synonyms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {synonyms.map((s) => (
              <span
                key={s}
                className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
