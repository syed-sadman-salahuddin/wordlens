import { cleanText, paginate } from "./text";

export async function extractDocx(file: File) {
  const mod = await import("mammoth/mammoth.browser");
  const mammoth = mod.default ?? mod;
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return paginate(cleanText(value));
}

export async function extractDoc(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/parse-doc", { method: "POST", body });
  if (!res.ok) throw new Error("Could not read DOC file");
  const { text } = await res.json();
  return paginate(cleanText(text));
}