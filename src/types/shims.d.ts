declare module "mammoth/mammoth.browser" {
  type Input = { arrayBuffer: ArrayBuffer };
  export function extractRawText(input: Input): Promise<{ value: string }>;
  const api: { extractRawText: typeof extractRawText };
  export default api;
}

declare module "word-extractor" {
  export default class WordExtractor {
    extract(input: Buffer | string): Promise<{ getBody(): string }>;
  }
}

declare module "wink-lemmatizer" {
  const lemmatizer: {
    noun(word: string): string;
    verb(word: string): string;
    adjective(word: string): string;
  };
  export default lemmatizer;
}