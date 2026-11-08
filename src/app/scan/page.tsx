"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Images,
  Loader2,
  ScanLine,
  X,
} from "lucide-react";
import { ocrImages } from "@/lib/extract/ocr";
import { analyze } from "@/lib/words/findUncommon";
import { useAnalysis } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Shot = { id: string; blob: Blob; url: string };

const MAX_SHOTS = 20;
const UNCLEAR_TEXT = "The text is too blurry to read. Try a sharper, closer image.";

export default function ScanPage() {
  const router = useRouter();
  const { setAnalysis } = useAnalysis();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shotsRef = useRef<Shot[]>([]);

  const [shots, setShots] = useState<Shot[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, []);

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOn]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function startCamera() {
    setError("");
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setCameraOn(true);
    } catch {
      setError("Camera unavailable");
    }
  }

  function addShots(blobs: Blob[]) {
    const added = blobs.map((blob) => ({
      id: `${Date.now()}-${Math.random()}`,
      blob,
      url: URL.createObjectURL(blob),
    }));
    setShots((prev) => [...prev, ...added].slice(0, MAX_SHOTS));
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.92)
    );
    if (blob) addShots([blob]);
  }

  function remove(id: string) {
    const shot = shots.find((s) => s.id === id);
    if (shot) URL.revokeObjectURL(shot.url);
    setShots(shots.filter((s) => s.id !== id));
  }

  async function run() {
    if (!shots.length || busy) return;
    setError("");
    stopCamera();
    setBusy(true);
    setProgress(0);
    try {
      const pages = await ocrImages(
        shots.map((s) => s.blob),
        setProgress
      );
      if (pages.some((page) => page.length < 20)) throw new Error(UNCLEAR_TEXT);
      const date = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      setAnalysis(analyze(`Scan ${date}`, pages));
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error && err.message === UNCLEAR_TEXT
          ? UNCLEAR_TEXT
          : "Scan failed. Check your connection and try again"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <ScanLine className="h-4 w-4" />
          Page scanner
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Scan printed pages</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Capture pages with your camera or add images from your device. We’ll find the
          uncommon words for you.
        </p>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-lg shadow-slate-900/[0.03]">
        <CardHeader className="border-b border-border/70 bg-muted/30">
          <CardTitle className="text-base">Add pages</CardTitle>
          <CardDescription>Capture or select up to {MAX_SHOTS} images.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
        {cameraOn ? (
          <div>
            <div className="overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-[3/4] w-full object-contain sm:aspect-video"
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <button
                onClick={stopCamera}
                aria-label="Close camera"
                className="rounded-full border border-border bg-background p-3 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={capture}
                aria-label="Capture"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90 active:scale-95"
              >
                <Camera className="h-7 w-7" />
              </button>
              <div className="w-11" />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={startCamera}
              disabled={busy}
              className="group flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background px-5 text-center transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <Camera className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-medium">Use camera</span>
                <span className="mt-1 block text-sm text-muted-foreground">Capture a page at a time</span>
              </span>
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="group flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background px-5 text-center transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <Images className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-medium">Choose images</span>
                <span className="mt-1 block text-sm text-muted-foreground">Select multiple pages</span>
              </span>
            </button>
          </div>
        )}

        {shots.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-sm font-medium">
              Selected pages <span className="text-muted-foreground">({shots.length}/{MAX_SHOTS})</span>
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {shots.map((s, i) => (
              <div
                key={s.id}
                className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white">
                  {i + 1}
                </span>
                {!busy && (
                  <button
                    onClick={() => remove(s.id)}
                    aria-label="Remove"
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            </div>
          </div>
        )}

        {busy ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="h-1.5 w-56 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
          </div>
        ) : (
          shots.length > 0 && (
            <Button
              onClick={run}
              className="mt-6 w-full flex items-center justify-center gap-2"
            >
              Scan {shots.length} {shots.length === 1 ? "page" : "pages"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )
        )}

        {error && (
          <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addShots(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
