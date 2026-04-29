"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Trophy,
  Users,
  Briefcase,
  FileText,
  LogOut
} from "lucide-react";

export default function DashboardLayout({ children }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("role");

    if (!r) {
      router.push("/");
      return;
    }

    if (r === "candidate") {
      router.push("/candidate");
      return;
    }

    setRole(r);
  }, []);

  if (!role) return null;

  // ================= MENU =================
  const adminMenu = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { label: "Create Recruiter", icon: <Users size={18} />, path: "/dashboard/admin/create-recruiter" },
    { label: "Companies", icon: <Briefcase size={18} />, path: "/dashboard/admin/companies" },
    { label: "Jobs", icon: <Briefcase size={18} />, path: "/dashboard/admin/jobs" },
    { label: "Applicants", icon: <FileText size={18} />, path: "/dashboard/admin/applicants" },
   
  ];

  const recruiterMenu = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { label: "Company Profile", icon: <Briefcase size={18} />, path: "/dashboard/recruiter/company" },
    { label: "Post Job", icon: <PlusCircle size={18} />, path: "/dashboard/recruiter/post-job" },
    { label: "Manage Jobs", icon: <List size={18} />, path: "/dashboard/recruiter/jobs" },
    { label: "Applicants", icon: <FileText size={18} />, path: "/dashboard/recruiter/applicants" },
    { label: "AI Ranking", icon: <Trophy size={18} />, path: "/dashboard/recruiter/ranking" },
    { label: "Exam Cheating", icon: <List size={18} />, path: "/dashboard/recruiter/cheating-dashboard" },
  ];

  const menu = role === "admin" ? adminMenu : recruiterMenu;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 fixed h-full z-20 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col p-5">

        {/* LOGO */}
        <h2 className="text-2xl font-bold mb-8 tracking-wide">
          🚀 Smart Recruit
        </h2>

        {/* MENU */}
        <nav className="flex flex-col gap-2 text-sm">

          {menu.map((item, i) => {
            const active = pathname === item.path;

            return (
              <div
                key={i}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
                ${
                  active
                    ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                    : "hover:bg-white/10 text-gray-300"
                }`}
              >
                {item.icon}
                {item.label}
              </div>
            );
          })}

        </nav>

        {/* FOOTER */}
        <div className="mt-auto pt-6 border-t border-white/10 text-xs text-gray-400">
          <p>Logged in as:</p>
          <p className="capitalize font-semibold text-white">{role}</p>
        </div>

      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center">

          <h1 className="font-semibold text-lg capitalize">
            {pathname.replace("/dashboard", "") || "Dashboard"}
         </h1>
         
          <button
            onClick={() => {
              localStorage.clear();
              document.cookie = "token=; Max-Age=0; path=/";
              router.push("/");
            }}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        <main className="p-6">
          {children}
        </main>

      </div>
    </div>
  );
}