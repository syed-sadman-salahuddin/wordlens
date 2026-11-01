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
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

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
      return "Something went wrong";
  }
}

function Field({
  icon: Icon,
  ...props
}: { icon: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
      setError(errorMessage((err as { code?: string }).code ?? ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">
          {isSignup ? "Create account" : "Log in"}
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {isSignup && (
            <Field
              icon={User}
              placeholder="Full name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              required
            />
          )}
          <Field
            icon={Mail}
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            required
          />
          {isSignup && (
            <Field
              icon={Phone}
              type="tel"
              placeholder="Phone number"
              autoComplete="tel"
              pattern="[0-9+ ]{7,15}"
              title="Digits only, 7 to 15 characters"
              value={form.phone}
              onChange={set("phone")}
              required
            />
          )}
          <Field
            icon={Lock}
            type="password"
            placeholder="Password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={6}
            value={form.password}
            onChange={set("password")}
            required
          />

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isSignup ? "Have an account?" : "New here?"}{" "}
          <Link
            href={`${isSignup ? "/login" : "/signup"}${query}`}
            className="font-medium text-indigo-600 hover:underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}