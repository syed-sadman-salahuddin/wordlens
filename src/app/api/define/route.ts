import { NextResponse } from "next/server";

type Meaning = { partOfSpeech: string; definition: string };
type Found = { phonetic: string; meanings: Meaning[]; synonyms: string[] };

const POS: Record<string, string> = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
};

async function getJson(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function dictionary(word: string): Promise<Found | null> {
  const data = await getJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  if (!Array.isArray(data)) return null;

  const meanings: Meaning[] = [];
  const synonyms: string[] = [];
  let phonetic = "";

  for (const entry of data) {
    if (!phonetic) {
      phonetic =
        entry.phonetic ||
        entry.phonetics?.find((p: { text?: string }) => p.text)?.text ||
        "";
    }
    for (const m of entry.meanings ?? []) {
      const first = m.definitions?.[0]?.definition;
      if (first && meanings.length < 3) {
        meanings.push({ partOfSpeech: m.partOfSpeech ?? "", definition: first });
      }
      synonyms.push(...(m.synonyms ?? []));
      for (const d of m.definitions ?? []) synonyms.push(...(d.synonyms ?? []));
    }
  }

  return meanings.length ? { phonetic, meanings, synonyms } : null;
}

async function datamuseMeaning(word: string): Promise<Found | null> {
  const data = await getJson(`https://api.datamuse.com/words?sp=${word}&md=d&max=1`);
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit || hit.word !== word || !hit.defs?.length) return null;

  const meanings: Meaning[] = hit.defs.slice(0, 3).map((d: string) => {
    const [pos, ...rest] = d.split("\t");
    return { partOfSpeech: POS[pos] ?? "", definition: rest.join(" ") };
  });
  return { phonetic: "", meanings, synonyms: [] };
}

async function datamuseSynonyms(word: string): Promise<string[]> {
  const data = await getJson(`https://api.datamuse.com/words?rel_syn=${word}&max=8`);
  return Array.isArray(data) ? data.map((d: { word: string }) => d.word) : [];
}

export async function GET(req: Request) {
  const word = (new URL(req.url).searchParams.get("word") ?? "").toLowerCase().trim();
  if (!/^[a-z]{2,40}$/.test(word)) {
    return NextResponse.json({ error: "Invalid word" }, { status: 400 });
  }

  const bases = [
    word,
    word.replace(/ies$/, "y"),
    word.replace(/(es|s)$/, ""),
    word.replace(/(ed|ing|ly)$/, ""),
  ];

  for (const base of new Set(bases)) {
    if (base.length < 3) continue;
    const found = (await dictionary(base)) ?? (await datamuseMeaning(base));
    if (!found) continue;

    const extra = await datamuseSynonyms(base);
    const synonyms = [...new Set([...found.synonyms, ...extra])]
      .filter((s) => s !== word && s !== base)
      .slice(0, 8);

    return NextResponse.json({
      phonetic: found.phonetic,
      meanings: found.meanings,
      synonyms,
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}