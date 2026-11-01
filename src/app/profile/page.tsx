"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { Loader2, Mail, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Profile = { name: string; email: string; phone: string };

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/profile");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) =>
      setProfile(snap.exists() ? (snap.data() as Profile) : null)
    );
  }, [user]);

  if (loading || !user || profile === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
            {(profile?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{profile?.name ?? "Account"}</h1>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-4 w-4" />
              {profile?.phone ?? "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}