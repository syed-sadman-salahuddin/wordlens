"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { ArrowLeft, FileText, Loader2, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import DefinitionView from "@/components/DefinitionView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Definition } from "@/lib/types";

type Meta = {
  fileName: string;
  pageCount: number;
  wordCount: number;
  createdAt?: Timestamp;
};
type Saved = Definition & { word: string; count: number; pages: number[] };

const pageLabel = (pages: number[]) =>
  pages.length > 5 ? `${pages.slice(0, 5).join(", ")}...` : pages.join(", ");

function DocumentPageContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [meta, setMeta] = useState<Meta | null | undefined>(undefined);
  const [words, setWords] = useState<Saved[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=/doc/${id}`);
  }, [user, loading, router, id]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "documents", id);
    Promise.all([getDoc(ref), getDocs(query(collection(ref, "words"), orderBy("order")))])
      .then(([m, w]) => {
        setMeta(m.exists() ? (m.data() as Meta) : null);
        setWords(w.docs.map((d) => d.data() as Saved));
      })
      .catch(() => setMeta(null));
  }, [user, id]);

  if (loading || !user || meta === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (meta === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Document not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This document may have been removed.</p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/profile">Back to profile</Link>
        </Button>
      </div>
    );
  }

  const term = filter.trim().toLowerCase();
  const shown = words.filter((w) => w.word.includes(term));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Profile
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">{meta.fileName}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {meta.pageCount} pages · {meta.wordCount} words
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search words"
            aria-label="Search words"
            className="pl-9"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/70 py-16 text-center">
          <Search className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No matching words</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((w) => (
            <Card
              key={w.word}
              className="rounded-2xl border-border/80 bg-card/90 shadow-sm"
            >
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-5 pb-3">
                <h2 className="text-lg font-semibold capitalize">{w.word}</h2>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {w.count}x · p. {pageLabel(w.pages)}
                </span>
              </CardHeader>
              <CardContent className="px-5 pb-5">
              {w.meanings.length ? (
                <DefinitionView
                  phonetic={w.phonetic}
                  meanings={w.meanings}
                  synonyms={w.synonyms}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No definition found</p>
              )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentPage() {
  return (
    <Suspense>
      <DocumentPageContent />
    </Suspense>
  );
}