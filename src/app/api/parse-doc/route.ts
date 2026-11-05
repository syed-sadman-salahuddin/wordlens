import { NextResponse } from "next/server";
import WordExtractor from "word-extractor";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const doc = await new WordExtractor().extract(buffer);
    return NextResponse.json({ text: doc.getBody() });
  } catch {
    return NextResponse.json({ error: "Could not read file" }, { status: 422 });
  }
}