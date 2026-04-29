"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, PlusCircle, Trophy, FileText } from "lucide-react";

export default function RecruiterDashboard() {
  const router = useRouter();

  const actions = [
    {
      title: "Company Profile",
      desc: "Manage your company details",
      icon: <Briefcase />,
      path: "/dashboard/recruiter/company",
    },
    {
      title: "Post Job",
      desc: "Create new job openings",
      icon: <PlusCircle />,
      path: "/dashboard/post-job",
    },
    {
      title: "Applicants",
      desc: "View and manage candidates",
      icon: <FileText />,
      path: "/dashboard/applicants",
    },
    {
      title: "AI Ranking",
      desc: "Analyze top candidates",
      icon: <Trophy />,
      path: "/dashboard/ranking",
    },
  ];

  return (
    <div>

      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          Recruiter Dashboard 💼
        </h1>
        <p className="text-slate-400">
          Manage hiring pipeline, jobs, and candidates efficiently
        </p>
      </motion.div>

      {/* ================= ACTION CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {actions.map((a, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push(a.path)}
            className="cursor-pointer p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg hover:bg-white/10 transition"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                {a.icon}
              </div>
            </div>

            <h2 className="text-lg font-semibold">
              {a.title}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {a.desc}
            </p>
          </motion.div>
        ))}

      </div>

    </div>
  );
}