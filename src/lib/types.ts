export type Mark = { start: number; end: number; word: string };

export type PageData = { page: number; text: string; marks: Mark[] };

export type WordEntry = { word: string; count: number; pages: number[] };

export type Analysis = {
  fileName: string;
  pages: PageData[];
  words: WordEntry[];
  savedId?: string;
};

export type Meaning = { partOfSpeech: string; definition: string };

export type Definition = {
  phonetic: string;
  meanings: Meaning[];
  synonyms: string[];
};