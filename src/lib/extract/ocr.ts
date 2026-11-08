import { cleanText } from "./text";

const MAX_IMAGE_DIMENSION = 3000;
const MAX_UPSCALE = 4;
const MIN_WORD_CONFIDENCE = 70;
const MIN_PAGE_CONFIDENCE = 40;
const MIN_RECOGNIZED_WORDS = 5;

type OCRWord = { text: string; confidence: number };
type OCRLine = { words: OCRWord[] };
type OCRPage = {
  confidence: number;
  blocks: Array<{
    paragraphs: Array<{ lines: OCRLine[] }>;
  }> | null;
};

async function prepare(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  try {
    const largestDimension = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(
      MAX_UPSCALE,
      MAX_IMAGE_DIMENSION / largestDimension
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare image for text recognition");
    ctx.imageSmoothingQuality = "high";
    ctx.filter = "grayscale(1) contrast(1.35)";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (prepared) =>
          prepared
            ? resolve(prepared)
            : reject(new Error("Could not prepare image for text recognition")),
        "image/png"
      )
    );
  } finally {
    bitmap.close();
  }
}

function confidentText(page: OCRPage) {
  const paragraphs = (page.blocks ?? []).flatMap((block) =>
    block.paragraphs.map((paragraph) =>
      paragraph.lines
        .map((line) =>
          line.words
            .filter(
              (word) =>
                word.confidence >= MIN_WORD_CONFIDENCE && word.text.trim()
            )
            .map((word) => word.text)
            .join(" ")
        )
        .filter(Boolean)
        .join("\n")
    )
  );
  const text = cleanText(paragraphs.filter(Boolean).join("\n\n"));
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (page.confidence < MIN_PAGE_CONFIDENCE || wordCount < MIN_RECOGNIZED_WORDS) {
    return "";
  }
  return text;
}

export async function ocrImages(images: Blob[], onProgress?: (percent: number) => void) {
  const { createWorker, PSM } = await import("tesseract.js");

  let current = 0;
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.(Math.round(((current + m.progress) / images.length) * 100));
      }
    },
  });

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      user_defined_dpi: "300",
      preserve_interword_spaces: "1",
    });

    const pages: string[] = [];
    for (current = 0; current < images.length; current++) {
      const input = await prepare(images[current]);
      const { data } = await worker.recognize(input, {}, { blocks: true });
      pages.push(confidentText(data));
    }
    return pages;
  } finally {
    await worker.terminate();
  }
}