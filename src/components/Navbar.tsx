"use client";

import Link from "next/link";
import { BookOpen, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ghost =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          Wordlens
        </Link>

        {!loading && (
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link href="/profile" className={ghost}>
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button onClick={logout} className={ghost}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}