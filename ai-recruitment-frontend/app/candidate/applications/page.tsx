"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { motion } from "framer-motion";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const router = useRouter();

  const loadApplications = async () => {
    try {
      const res = await API.get("/my-applications");
      setApps(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to load applications");
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  /* 🎨 STATUS STYLE SYSTEM */
  const statusStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "shortlisted":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "technical_scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "hr_scheduled":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  /* 🚀 PROGRESS SYSTEM */
  const progress = (status: string) => {
    switch (status) {
      case "applied":
        return 20;
      case "shortlisted":
        return 40;
      case "technical_scheduled":
        return 60;
      case "technical_passed":
        return 75;
      case "hr_scheduled":
        return 90;
      case "selected":
        return 100;
      case "rejected":
        return 100;
      default:
        return 10;
    }
  };

  return (
    <div className="p-8 space-y-8">

      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          My Applications 📄
        </h1>
        <p className="text-slate-400 text-sm">
          Track your hiring progress in real-time
        </p>
      </div>

      {/* 🚀 LIST */}
      <div className="space-y-6">
        {apps.map((app, i) => {
          const interview = app.interview;
          const status = app.status?.toLowerCase();

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition shadow-xl"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {app.job_title}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Application ID: #{app.job_id}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full border ${statusStyle(status)}`}
                >
                  {app.status}
                </span>
              </div>

              {/* STATS */}
              <div className="flex flex-wrap gap-3 mb-4">

                <div className="px-3 py-1 text-xs rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                  🎯 Match: {app.match_score || 0}%
                </div>

                <div className="px-3 py-1 text-xs rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  📝 Exam: {app.exam_status || "pending"}
                </div>

              </div>

              {/* PROGRESS BAR */}
              <div className="mb-5">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress(status)}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"
                  />
                </div>
              </div>

              {/* 🎤 INTERVIEW */}
              {interview?.meeting_link &&
                status !== "selected" &&
                status !== "rejected" && (
                  <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl mb-4">

                    <p className="text-purple-400 font-semibold">
                      🎤 {interview.round?.toUpperCase()} Interview
                    </p>

                    <p className="text-sm text-slate-300">
                      📅 {new Date(interview.slot_time).toLocaleString()}
                    </p>

                    <a
                      href={interview.meeting_link}
                      target="_blank"
                      className="inline-block mt-2 text-purple-400 hover:underline"
                    >
                      🔗 Join Meeting
                    </a>

                  </div>
                )}

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3">

                {/* EXAM */}
                {status === "shortlisted" &&
                  app.exam_status === "pending" && (
                    <button
                      onClick={() =>
                        router.push(`/candidate/exam?job_id=${app.job_id}`)
                      }
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition shadow"
                    >
                      🚀 Start Exam
                    </button>
                )}

                {/* INTERVIEW */}
                {interview?.meeting_link &&
                  status !== "selected" &&
                  status !== "rejected" && (
                    <a
                      href={interview.meeting_link}
                      target="_blank"
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition shadow"
                    >
                      🎤 Join Interview
                    </a>
                )}

                {/* WAITING */}
                {status === "applied" && (
                  <span className="text-slate-400 text-sm">
                    ⏳ Waiting for AI Screening
                  </span>
                )}

                {status === "technical_passed" && (
                  <span className="text-orange-400 text-sm">
                    ⏳ Waiting for HR Round
                  </span>
                )}

                {/* SELECTED */}
                {status === "selected" && (
                  <button
                    onClick={() =>
                      router.push(`/candidate/offer?job_id=${app.job_id}`)
                    }
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition shadow"
                  >
                    🎉 View Offer
                  </button>
                )}

                {/* REJECTED */}
                {status === "rejected" && (
                  <span className="text-red-400 text-sm font-medium">
                    ❌ Not Selected
                  </span>
                )}

              </div>

            </motion.div>
          );
        })}
      </div>

      {/* EMPTY */}
      {apps.length === 0 && (
        <div className="text-center text-slate-400 mt-10">
          No applications found
        </div>
      )}
    </div>
  );
}