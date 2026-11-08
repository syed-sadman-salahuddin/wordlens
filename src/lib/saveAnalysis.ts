import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchDefinition } from "@/lib/define";
import type { Analysis, Definition } from "@/lib/types";

const MAX_WORDS = 500;
const CONCURRENCY = 4;

export async function saveAnalysis(
  uid: string,
  analysis: Analysis,
  onProgress: (done: number, total: number) => void
) {
  const words = analysis.words.slice(0, MAX_WORDS);
  const defs: (Definition | null)[] = new Array(words.length).fill(null);

  let next = 0;
  let done = 0;
  async function worker() {
    while (next < words.length) {
      const i = next++;
      defs[i] = await fetchDefinition(words[i].word);
      onProgress(++done, words.length);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const documents = collection(db, "users", uid, "documents");
  const existing = await getDocs(query(documents, orderBy("createdAt", "desc")));
  const normalizedName = analysis.fileName.trim().toLowerCase();
  const matchingDocument = existing.docs.find(
    (saved) =>
      (saved.data().fileName as string | undefined)?.trim().toLowerCase() ===
      normalizedName
  );
  const docRef = matchingDocument
    ? doc(db, "users", uid, "documents", matchingDocument.id)
    : doc(documents);
  const wordsCol = collection(docRef, "words");
  const savedWords = matchingDocument ? await getDocs(wordsCol) : null;
  const wordNames = new Set(words.map((word) => word.word));

  let batch = writeBatch(db);
  let ops = 0;
  async function commitAtLimit() {
    if (ops < 400) return;
    await batch.commit();
    batch = writeBatch(db);
    ops = 0;
  }

  for (const savedWord of savedWords?.docs ?? []) {
    if (wordNames.has(savedWord.id)) continue;
    batch.delete(savedWord.ref);
    ops++;
    await commitAtLimit();
  }

  batch.set(docRef, {
    fileName: analysis.fileName,
    pageCount: analysis.pages.length,
    wordCount: words.length,
    createdAt: serverTimestamp(),
  });
  ops++;
  await commitAtLimit();

  for (let i = 0; i < words.length; i++) {
    const d = defs[i];
    batch.set(doc(wordsCol, words[i].word), {
      word: words[i].word,
      count: words[i].count,
      pages: words[i].pages,
      order: i,
      phonetic: d?.phonetic ?? "",
      meanings: d?.meanings ?? [],
      synonyms: d?.synonyms ?? [],
    });
    ops++;
    await commitAtLimit();
  }
  if (ops > 0) await batch.commit();

  return docRef.id;
}