import lemmatizer from "wink-lemmatizer";
import common from "./commonWords.json";
import type { Analysis, Mark, PageData, WordEntry } from "@/lib/types";

const EXTRA =
  "cannot ours hers theirs eleven thirteen fourteen sixteen seventeen eighteen nineteen sixty seventy eighty ninety monday tuesday wednesday thursday friday saturday sunday january february april june july august september october november december further fascinate".split(
    " "
  );

const commonSet = new Set<string>([...(common as string[]), ...EXTRA]);
const SENTENCE_START = new Set([
  ".", "!", "?", ":", ";", '"', "“", "”", "‘", "'", "(", "•", "-", "–", "—", "*",
]);
const TOKEN = /\p{L}+(?:['’]\p{L}+)*/gu;
const NOISE = /https?:\/\/\S+|www\.\S+|\S+@\S+/g;
const cache = new Map<string, boolean>();

function americanize(w: string) {
  return w
    .replace(/our(s|ed|ing)?$/, "or$1")
    .replace(/is(e|es|ed|ing|ation|ations)$/, "iz$1")
    .replace(/yse(s|d)?$/, "yze$1")
    .replace(/tre(s|d)?$/, "ter$1");
}

function forms(word: string) {
  const out = new Set<string>();
  for (const v of [word, americanize(word)]) {
    const stems = [v];
    if (v.endsWith("ily")) stems.push(v.slice(0, -3) + "y");
    if (v.endsWith("ally")) stems.push(v.slice(0, -4));
    if (v.endsWith("ly")) stems.push(v.slice(0, -2));
    if (v.endsWith("iness")) stems.push(v.slice(0, -5) + "y");
    if (v.endsWith("ness")) stems.push(v.slice(0, -4));
    const prefixed = v.match(/^(?:un|re|non)(.{4,})$/);
    if (prefixed) stems.push(prefixed[1]);

    for (const s of stems) {
      out.add(s);
      out.add(lemmatizer.noun(s));
      out.add(lemmatizer.verb(s));
      out.add(lemmatizer.adjective(s));
    }
  }
  return out;
}

function isCommon(word: string) {
  const hit = cache.get(word);
  if (hit !== undefined) return hit;
  const result = [...forms(word)].some((f) => commonSet.has(f));
  cache.set(word, result);
  return result;
}

function prevChar(text: string, index: number) {
  let j = index - 1;
  while (j >= 0 && /\s/.test(text[j])) j--;
  return j >= 0 ? text[j] : "";
}

export function analyze(fileName: string, texts: string[]): Analysis {
  const entries = new Map<string, WordEntry>();
  const lowercaseWords = new Set<string>();

  for (const text of texts) {
    const masked = text.replace(NOISE, (m) => " ".repeat(m.length));
    for (const match of masked.matchAll(TOKEN)) {
      const token = match[0]
        .replace(/’/g, "'")
        .replace(/(?:n't|'s|'re|'ve|'ll|'d|'m)$/i, "");
      if (token.length >= 3 && /^[a-z]+$/.test(token)) {
        lowercaseWords.add(token);
      }
    }
  }

  const pages: PageData[] = texts.map((text, i) => {
    const masked = text.replace(NOISE, (m) => " ".repeat(m.length));
    const marks: Mark[] = [];

    for (const m of masked.matchAll(TOKEN)) {
      const start = m.index ?? 0;
      const token = m[0]
        .replace(/’/g, "'")
        .replace(/(?:n't|'s|'re|'ve|'ll|'d|'m)$/i, "");

      if (token.length < 3 || !/^[A-Za-z]+$/.test(token)) continue;

      if (/[A-Z]/.test(token)) {
        const prev = prevChar(text, start);
        const sentenceStart = prev === "" || SENTENCE_START.has(prev);
        if (
          !/^[A-Z][a-z]+$/.test(token) ||
          !sentenceStart ||
          !lowercaseWords.has(token.toLowerCase())
        ) {
          continue;
        }
      }

      const word = token.toLowerCase();
      if (isCommon(word)) continue;

      marks.push({ start, end: start + token.length, word });

      const entry = entries.get(word) ?? { word, count: 0, pages: [] };
      entry.count++;
      if (!entry.pages.includes(i + 1)) entry.pages.push(i + 1);
      entries.set(word, entry);
    }

    return { page: i + 1, text, marks };
  });

  return { fileName, pages, words: [...entries.values()] };
}