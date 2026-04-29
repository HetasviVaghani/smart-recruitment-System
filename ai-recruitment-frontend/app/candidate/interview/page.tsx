"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { motion } from "framer-motion";

export default function MyInterviews() {
  const [data, setData] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());

  const loadData = async () => {
    try {
      const res = await API.get("/my-applications");
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      setData([]);
    }
  };

  useEffect(() => {
    loadData();

    // 🔄 refresh data
    const interval = setInterval(loadData, 5000);

    // ⏳ live clock
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const interviews = data.filter(
    (i) =>
      i.interview?.round &&
      ["technical_scheduled", "hr_scheduled"].includes(i.status)
  );

  /* ⏳ TIME LOGIC */
  const getTimeLeft = (time: string) => {
    const diff = new Date(time).getTime() - now;

    if (diff <= 0) return "Started";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    return `${min}m ${sec}s`;
  };

  /* 🚀 JOIN ENABLE LOGIC (10 MIN BEFORE) */
  const canJoin = (time: string) => {
    const diff = new Date(time).getTime() - now;
    return diff <= 10 * 60 * 1000; // 10 min
  };

  return (
    <div className="p-8 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          My Interviews 🎤
        </h1>
        <p className="text-slate-400 text-sm">
          Live interview tracking system
        </p>
      </div>

      {/* EMPTY */}
      {interviews.length === 0 && (
        <div className="text-center text-slate-400 mt-20">
          No interviews scheduled
        </div>
      )}

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-6">

        {interviews.map((i, idx) => {
          const interview = i.interview;
          const isHR = interview.round === "hr";
          const timeLeft = getTimeLeft(interview.slot_time);
          const joinEnabled = canJoin(interview.slot_time);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:bg-white/10 transition"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">

                <div>
                  <h2 className="text-xl text-white font-semibold">
                    {interview.round.toUpperCase()} Interview
                  </h2>
                  <p className="text-sm text-slate-400">
                    💼 {i.job_title}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    isHR
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {i.status}
                </span>

              </div>

              {/* TIME */}
              <p className="text-slate-300 text-sm mb-2">
                📅 {new Date(interview.slot_time).toLocaleString()}
              </p>

              {/* ⏳ COUNTDOWN */}
              <div className="mb-4">
                <div className="text-xs text-slate-400 mb-1">
                  Starts In
                </div>

                <div className="text-lg font-bold text-cyan-400">
                  {timeLeft}
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mb-5">
                <div className="w-full h-2 bg-white/10 rounded-full">
                  <div
                    className={`h-2 ${
                      isHR
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                    }`}
                    style={{
                      width: joinEnabled ? "90%" : "60%",
                    }}
                  />
                </div>
              </div>

              {/* 🚀 JOIN BUTTON */}
              {interview.meeting_link && (
                <button
                  disabled={!joinEnabled}
                  onClick={() =>
                    joinEnabled &&
                    window.open(interview.meeting_link, "_blank")
                  }
                  className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                    joinEnabled
                      ? isHR
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 text-white"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {joinEnabled
                    ? "🔗 Join Interview"
                    : "🔒 Available 10 min before"}
                </button>
              )}

            </motion.div>
          );
        })}

      </div>
    </div>
  );
}