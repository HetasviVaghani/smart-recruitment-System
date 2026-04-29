"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ name }: { name: string }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  };

  return (
    <div className="flex justify-between items-center px-8 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">

      {/* LEFT */}
      <div>
        <h1 className="text-white text-xl font-semibold">
          Welcome, {name} 👋
        </h1>
        <p className="text-slate-400 text-sm">
          Here's what's happening today
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/10">
          <Bell className="text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm">
            {name?.[0]}
          </div>
          <span className="text-white text-sm">{name}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-500/20"
        >
          <LogOut className="text-red-400" />
        </button>

      </div>
    </div>
  );
}