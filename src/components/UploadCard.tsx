"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { ACCEPT, MAX_MB, extractPages } from "@/lib/extract";
import { analyze } from "@/lib/words/findUncommon";
import { useAnalysis } from "@/context/AnalysisContext";

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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <FileText className="h-5 w-5 text-indigo-600" />
        Upload
      </h2>

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
        className={`flex h-72 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition ${
          drag
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <Upload className="h-7 w-7 text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="font-medium">Drop a file or click</p>
              <p className="mt-1 text-sm text-slate-400">PDF, DOC, DOCX</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}