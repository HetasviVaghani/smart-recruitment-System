"use client";

import { useEffect, useState, useMemo } from "react";
import API from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function CheatingDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>("");

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ================= LOAD JOBS =================
  useEffect(() => {
    API.get("/jobs")
      .then((res) => setJobs(res.data || []))
      .catch(() => {});
  }, []);

  // ================= FETCH =================
  const fetchAll = async (silent = false) => {
    if (!activeJobId) return;

    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const [res1, res2] = await Promise.all([
        API.get(`/admin/cheating-dashboard/${activeJobId}`),
        API.get(`/admin/live-cheating/${activeJobId}`),
      ]);

      setAnalytics(res1.data || []);
      setLiveLogs(res2.data || []);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError("❌ Access Denied");
        setActiveJobId("");
      } else {
        setError("⚠ Failed to load dashboard");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeJobId) fetchAll();
  }, [activeJobId]);

  useEffect(() => {
    if (!activeJobId) return;
    const i = setInterval(() => fetchAll(true), 5000);
    return () => clearInterval(i);
  }, [activeJobId]);

  // ================= FILTER =================
  const filtered = useMemo(() => {
    return analytics.filter((c) =>
      (c.candidate_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [analytics, search]);

  // ================= KPI =================
  const high = analytics.filter((a) => a.risk_level === "HIGH").length;
  const medium = analytics.filter((a) => a.risk_level === "MEDIUM").length;
  const low = analytics.filter((a) => a.risk_level === "LOW").length;

  const avgScore =
    analytics.length > 0
      ? analytics.reduce((a, b) => a + b.cheating_score, 0) /
        analytics.length
      : 0;

  // ================= HELPERS =================
  const getRiskColor = (r: string) => {
    if (r === "HIGH") return "text-red-400";
    if (r === "MEDIUM") return "text-yellow-400";
    return "text-green-400";
  };

  const getCard = (title: string, value: any, color: string) => (
    <div className={`p-4 rounded-xl bg-white/5 border ${color}`}>
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );

  return (
    <div className="p-6 text-white space-y-6 bg-gradient-to-br from-black to-slate-900 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          🚨 AI Cheating Monitoring System
        </h1>

        <div className="flex gap-3 items-center">
          {refreshing && (
            <span className="text-xs animate-pulse text-gray-400">
              Live updating...
            </span>
          )}

          <select
            value={activeJobId}
            onChange={(e) => setActiveJobId(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
          >
            <option value="">Select Job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          <input
            placeholder="Search candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 p-3 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {!activeJobId && (
        <div className="text-center text-gray-400 py-10">
          Select a job to view analytics
        </div>
      )}

      {loading && <div>Loading...</div>}

      {/* MAIN */}
      {activeJobId && !loading && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-4 gap-4">
            {getCard("Total Candidates", analytics.length, "border-white/20")}
            {getCard("High Risk", high, "border-red-500/40")}
            {getCard("Medium Risk", medium, "border-yellow-500/40")}
            {getCard("Low Risk", low, "border-green-500/40")}
          </div>

          {/* AVG */}
          <div className="bg-blue-500/20 p-4 rounded-xl">
            ⚠ Avg Cheating Score: {avgScore.toFixed(1)}
          </div>

          {/* LIVE FEED */}
          <div className="bg-black/50 p-4 rounded-xl h-64 overflow-y-auto">
            <h2 className="mb-2 font-semibold">🔴 Live Violations</h2>

            {liveLogs.length === 0 ? (
              <p className="text-gray-400">No live activity</p>
            ) : (
              liveLogs.map((l, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-1 border-b border-white/10"
                >
                  <span>{l.candidate_name}</span>
                  <span className="text-red-400">
                    {l.violation_type} ({l.score})
                  </span>
                </div>
              ))
            )}
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-3 text-left">Candidate</th>
                  <th>Violations</th>
                  <th>Score</th>
                  <th>Risk</th>
                  <th>Latest Violation</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => {
                  const latest = liveLogs.find(
                    (l) => l.candidate_id === c.candidate_id
                  );

                  return (
                    <tr
                      key={c.candidate_id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="p-3">{c.candidate_name}</td>
                      <td>{c.total_violations}</td>
                      <td>{c.cheating_score}</td>
                      <td className={getRiskColor(c.risk_level)}>
                        {c.risk_level}
                      </td>
                      <td className="text-red-400">
                        {latest?.violation_type || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-white/5 rounded-xl p-2">
              <ResponsiveContainer>
                <BarChart data={filtered}>
                  <XAxis dataKey="candidate_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_violations" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64 bg-white/5 rounded-xl p-2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: "High", value: high },
                      { name: "Medium", value: medium },
                      { name: "Low", value: low },
                    ]}
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}