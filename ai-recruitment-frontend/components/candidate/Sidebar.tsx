"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Home,
  Briefcase,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { name: "Dashboard", icon: Home, path: "/candidate" },
    { name: "Jobs", icon: Briefcase, path: "/candidate/jobs" },
    { name: "Applications", icon: FileText, path: "/candidate/applications" },
    { name: "Interviews", icon: Calendar, path: "/candidate/interview" },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen fixed bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-xl flex flex-col justify-between"
    >
      {/* TOP */}
      <div>
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <h2 className="text-white text-xl font-bold">
              AI Recruit
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 flex flex-col gap-2 px-2">
          {menu.map((item, i) => (
            <Link
              key={i}
              href={item.path}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <item.icon size={18} className="text-white" />
              {!collapsed && (
                <span className="text-white text-sm">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="p-4 text-xs text-slate-400">
        {!collapsed && "© 2026 AI Recruit"}
      </div>
    </motion.div>
  );
}