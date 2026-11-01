import { extractPdf } from "./pdf";
import { extractDoc, extractDocx } from "./word";

export const ACCEPT = ".pdf,.doc,.docx";
export const MAX_MB = 25;

export async function extractPages(file: File, onProgress?: (percent: number) => void) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return extractPdf(file, onProgress);
  if (ext === "docx") return extractDocx(file);
  if (ext === "doc") return extractDoc(file);
  throw new Error("Unsupported file");
}