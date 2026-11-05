import type { Definition } from "@/lib/types";

const cache = new Map<string, Promise<Definition | null>>();

export function fetchDefinition(word: string) {
  let hit = cache.get(word);
  if (!hit) {
    hit = fetch(`/api/define?word=${encodeURIComponent(word)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Definition>) : null))
      .catch(() => null);
    cache.set(word, hit);
    hit.then((d) => {
      if (!d) cache.delete(word);
    });
  }
  return hit;
}