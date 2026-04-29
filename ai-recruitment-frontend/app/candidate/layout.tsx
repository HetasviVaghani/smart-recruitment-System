"use client";

import Sidebar from "@/components/candidate/Sidebar";
import Header from "@/components/candidate/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role) {
      router.push("/app");
      return;
    }

    if (role !== "candidate") {
      router.push("/dashboard");
      return;
    }

    getMe()
      .then(setProfile)
      .catch(() => {
        localStorage.clear();
        router.push("/app");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <p className="text-lg animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="ml-[260px] w-full">

        <Header name={profile?.name || "Candidate"} />

        <main className="p-8">
          {children}
        </main>

      </div>
    </div>
  );
}