"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  AlertCircle,
  ArrowRight,
  BookOpenText,
  Loader2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function errorMessage(code: string) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email already registered";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password";
    case "auth/weak-password":
      return "Password must be at least 6 characters";
    case "auth/invalid-email":
      return "Invalid email";
    case "auth/too-many-requests":
      return "Too many attempts, try later";
    default:
      return `Something went wrong (${code || "unknown"})`;
  }
}

function Field({
  icon: Icon,
  ...props
}: { icon: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative flex items-center">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        className="pl-10"
      />
    </div>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const next = params.get("next");
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  useEffect(() => {
    if (!loading && user && !busy) router.replace(target);
  }, [user, loading, busy, target, router]);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await setDoc(doc(db, "users", cred.user.uid), {
          name: form.name.trim(),
          email: form.email,
          phone: form.phone.trim(),
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
    } catch (err) {
      console.error(err);
      setError(errorMessage((err as { code?: string }).code ?? ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-xl shadow-slate-900/[0.05]">
        <CardHeader className="items-center pb-2 pt-8 text-center sm:pt-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <BookOpenText className="h-6 w-6" />
          </div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {isSignup ? "Start your reading journey" : "Welcome back"}
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {isSignup ? "Create account" : "Log in"}
          </CardTitle>
          <CardDescription className="max-w-xs pt-1">
            {isSignup
              ? "Save your documents and keep your word discoveries close."
              : "Log in to revisit your saved documents and discoveries."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-8 sm:px-8 sm:pb-10">
          <form onSubmit={submit} className="mt-2 space-y-4">
            {isSignup && (
              <div className="space-y-1">
                <Label htmlFor="name">Full name</Label>
                <Field
                  icon={User}
                  id="name"
                  placeholder="Full name"
                  autoComplete="name"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Field
                icon={Mail}
                id="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
            {isSignup && (
              <div className="space-y-1">
                <Label htmlFor="phone">Phone number</Label>
                <Field
                  icon={Phone}
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  autoComplete="tel"
                  pattern="[0-9+ ]{7,15}"
                  title="Digits only, 7 to 15 characters"
                  value={form.phone}
                  onChange={set("phone")}
                  required
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Field
                icon={Lock}
                id="password"
                type="password"
                placeholder="Password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            {error && (
              <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignup ? "Sign up" : "Log in"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Have an account?" : "New here?"}{" "}
            <Link
              href={`${isSignup ? "/login" : "/signup"}${query}`}
              className="font-medium text-primary hover:underline"
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
