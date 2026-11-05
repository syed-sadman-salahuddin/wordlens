"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FileText, Loader2, UploadCloud } from "lucide-react";
import { ACCEPT, MAX_MB, extractPages } from "@/lib/extract";
import { analyze } from "@/lib/words/findUncommon";
import { useAnalysis } from "@/context/AnalysisContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UploadCard() {
  const router = useRouter();
  const { setAnalysis } = useAnalysis();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handle(file: File | undefined) {
    if (!file || busy) return;
    setError("");
    if (!/\.(pdf|docx?)$/i.test(file.name)) return setError("PDF, DOC or DOCX only");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Maximum size is ${MAX_MB} MB`);

    setBusy(true);
    setProgress(0);
    try {
      const pages = await extractPages(file, setProgress);
      if (pages.join("").trim().length < 20) throw new Error("No readable text found");
      setAnalysis(analyze(file.name, pages));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read file");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-lg shadow-slate-900/[0.03]">
      <CardHeader className="pb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg">Upload a document</CardTitle>
            <CardDescription>Find useful words in a file you already have.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handle(e.dataTransfer.files[0]);
          }}
          className={`flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            drag
              ? "border-primary bg-accent/70"
              : "border-border bg-background/70 hover:border-primary/40 hover:bg-accent/40"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Choose a PDF, DOC or DOCX file"
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !busy) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          {busy ? (
            <>
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Preparing your document…</p>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(progress, 5)}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-medium">Drop your file here</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse your device</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["PDF", "DOC", "DOCX"].map((format) => (
                  <span
                    key={format}
                    className="rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {format}
                  </span>
                ))}
                <span className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
                  Up to {MAX_MB} MB
                </span>
              </div>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {error && (
          <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
