import { cleanText } from "./text";

async function prepare(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.filter = "grayscale(1) contrast(1.2)";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? blob), "image/png")
  );
}

export async function ocrImages(images: Blob[], onProgress?: (percent: number) => void) {
  const { createWorker } = await import("tesseract.js");

  let current = 0;
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.(Math.round(((current + m.progress) / images.length) * 100));
      }
    },
  });

  try {
    const pages: string[] = [];
    for (current = 0; current < images.length; current++) {
      const input = await prepare(images[current]);
      const { data } = await worker.recognize(input);
      pages.push(cleanText(data.text));
    }
    return pages;
  } finally {
    await worker.terminate();
  }
}