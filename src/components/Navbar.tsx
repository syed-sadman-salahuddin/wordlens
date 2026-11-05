"use client";

import Link from "next/link";
import { BookOpenText, LogIn, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
            <BookOpenText className="h-5 w-5" />
          </span>
          <span>Wordlens</span>
        </Link>

        {!loading && (
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/profile" className="gap-2">
                    <UserRound className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="gap-2 px-4">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Log in
                </Link>
              </Button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
