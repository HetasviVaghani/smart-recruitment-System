"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
} from "lucide-react";
import { getcandidateAnalytics } from "@/lib/api";

export default function CandidateDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getcandidateAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 p-6 text-white">

      {/* ================= HEADER ================= */}
      
      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-white/10 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {/* ================= CONTENT ================= */}
      {!loading && data && (
        <>
          {/* ================= KPI ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Card
              title="Total Applications"
              value={data.jobs || 0}
              icon={<Briefcase />}
              color="blue"
            />

            <Card
              title="Profile"
              value="Active"
              icon={<Users />}
              color="green"
            />

            <Card
              title="Applications"
              value={data.applications || 0}
              icon={<FileText />}
              color="purple"
            />

            <Card
              title="Avg Score"
              value={`${data.rate || 0}%`}
              icon={<TrendingUp />}
              color="pink"
            />
          </div>

          {/* ================= PIPELINE ================= */}
          <div className="grid lg:grid-cols-3 gap-6">

            {[ "shortlisted", "rejected"].map((stage, i) => (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <h2 className="text-lg font-semibold capitalize mb-4">
                  {stage}
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">

                  {(data.pipeline?.[stage] || []).length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No {stage} applications
                    </p>
                  ) : (
                    data.pipeline[stage].map((c: any, i: number) => (
                      <div
                        key={i}
                        className="bg-white/10 hover:bg-white/20 transition p-4 rounded-lg text-sm flex justify-between items-center"
                      >
                        {/* LEFT */}
                        <div>
                          <p className="font-medium text-white">
                            {c.job_title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {c.company}
                          </p>
                          {c.applied_at && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              {new Date(c.applied_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {/* RIGHT STATUS */}
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            stage === "applied"
                              ? "bg-blue-500/20 text-blue-400"
                              : stage === "shortlisted"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {stage}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}

          </div>
        </>
      )}
    </div>
  );
}

/* ================= CARD ================= */
function Card({ title, value, icon, color }: any) {

  const colorMap: any = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    pink: "bg-pink-500/20 text-pink-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center transition"
    >
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <h2 className="text-2xl text-white font-bold mt-1">
          {value}
        </h2>
      </div>

      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
    </motion.div>
  );
}