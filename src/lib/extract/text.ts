export function cleanText(raw: string) {
  return raw
    .replace(/\r/g, "")
    .replace(/(\p{L})-\n\s*(\p{Ll})/gu, "$1$2")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function paginate(text: string, wordsPerPage = 350) {
  const paragraphs = text.split(/\n+/).filter((p) => p.trim());
  const pages: string[] = [];
  let current: string[] = [];
  let count = 0;

  for (const p of paragraphs) {
    const n = p.split(/\s+/).length;
    if (count + n > wordsPerPage && current.length) {
      pages.push(current.join("\n\n"));
      current = [];
      count = 0;
    }
    current.push(p);
    count += n;
  }
  if (current.length) pages.push(current.join("\n\n"));
  return pages;
}