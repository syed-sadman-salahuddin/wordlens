"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import {
  ChevronRight,
  FileText,
  Files,
  Loader2,
  Mail,
  Phone,
  Upload,
  UserRound,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Profile = { name: string; email: string; phone: string };
type Item = {
  id: string;
  fileName: string;
  pageCount: number;
  wordCount: number;
  createdAt?: Timestamp;
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [items, setItems] = useState<Item[] | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/profile");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const docsQuery = query(
      collection(db, "users", user.uid, "documents"),
      orderBy("createdAt", "desc")
    );
    Promise.all([getDoc(doc(db, "users", user.uid)), getDocs(docsQuery)])
      .then(([p, d]) => {
        setProfile(p.exists() ? (p.data() as Profile) : null);
        const seenNames = new Set<string>();
        const documents = d.docs
          .map((x) => ({ id: x.id, ...(x.data() as Omit<Item, "id">) }))
          .filter((item) => {
            const name = item.fileName.trim().toLowerCase();
            if (seenNames.has(name)) return false;
            seenNames.add(name);
            return true;
          });
        setItems(documents);
      })
      .catch(() => {
        setProfile(null);
        setItems([]);
       });
  }, [user]);

  if (loading || !user || profile === undefined || items === undefined) {
    return (
      <div role="status" className="flex justify-center py-28">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-9 px-4 py-10 sm:py-14">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <UserRound className="h-4 w-4" />
          Your account
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">
            {(profile?.name || "U").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <CardTitle className="text-xl">{profile?.name ?? "Account"}</CardTitle>
              <CardDescription className="mt-1">Your Wordlens account details</CardDescription>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-5">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary/80" />
                {user.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary/80" />
                {profile?.phone ?? "No phone number"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Files className="h-5 w-5 text-primary" />
              Saved documents
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "document" : "documents"} in your library
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/70 px-5 py-14 text-center text-muted-foreground">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium text-foreground">Your library is empty</p>
              <p className="mt-1 text-sm">Documents you analyze will appear here.</p>
            </div>
            <Button asChild className="mt-1 gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Analyze a document
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/doc/${item.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.createdAt
                      ?.toDate()
                      .toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                    · {item.pageCount} pages · {item.wordCount} words
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
