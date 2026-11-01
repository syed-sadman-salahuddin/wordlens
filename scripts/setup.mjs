import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

const EF = "https://www.ef.com/wwen/english-resources/english-vocabulary/top-3000-words/";
const FALLBACK =
  "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt";

mkdirSync("public", { recursive: true });
mkdirSync("src/lib/words", { recursive: true });

copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/pdf.worker.min.mjs");
console.log("PDF worker copied");

async function fromEf() {
  const res = await fetch(EF, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`EF responded ${res.status}`);
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>|<\/(p|li|div|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x?27;|&#39;/g, "'");
  const marker = "fully functional.";
  const start = text.indexOf(marker);
  const end = text.indexOf("Learn English with EF", start);
  if (start < 0 || end < 0) throw new Error("List not found in page");
  return text.slice(start + marker.length, end).split(/\s+/);
}

async function fromFallback() {
  const res = await fetch(FALLBACK);
  if (!res.ok) throw new Error(`Fallback responded ${res.status}`);
  return (await res.text()).split(/\s+/).slice(0, 3000);
}

let source = "EF top 3000";
let raw = [];
try {
  raw = await fromEf();
  if (raw.length < 2500) throw new Error("Too few words found");
} catch (err) {
  console.log(`EF list failed (${err.message}), using fallback list`);
  source = "Google 10000, top 3000";
  raw = await fromFallback();
}

const words = new Set();
for (const item of raw) {
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(item)) continue;
  const w = item.toLowerCase();
  words.add(w);
  for (const part of w.split("-")) {
    if (part.length > 1) words.add(part);
  }
}

writeFileSync("src/lib/words/commonWords.json", JSON.stringify([...words]));
console.log(`Common words saved: ${words.size} (${source})`);