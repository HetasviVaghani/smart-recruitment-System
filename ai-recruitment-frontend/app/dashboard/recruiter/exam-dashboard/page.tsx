"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useSearchParams } from "next/navigation";

export default function CheatingDashboard() {
  const params = useSearchParams();
  const jobId = params?.get("job_id") || "";

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    fetchAll();
    const interval = setInterval(fetchAll, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  const fetchAll = async () => {
    try {
      const [res1, res2] = await Promise.all([
        API.get(`/admin/exam-results/${jobId}`), // FIXED ENDPOINT
        API.get(`/admin/live-cheating/${jobId}`)
      ]);

      setAnalytics(res1.data || []);
      setLiveLogs(res2.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SAFE KPI =================
  const high = analytics.filter(a => (a.cheating_score || 0) >= 60).length;
  const medium = analytics.filter(a => {
    const s = a.cheating_score || 0;
    return s >= 30 && s < 60;
  }).length;
  const low = analytics.filter(a => (a.cheating_score || 0) < 30).length;

  const avgScore =
    analytics.reduce((a, b) => a + (b.cheating_score || 0), 0) /
    (analytics.length || 1);

  if (!jobId) {
    return <div className="text-white p-6">No Job Selected</div>;
  }

  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl font-bold mb-4">
        Cheating Dashboard
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>Total: {analytics.length}</div>
        <div>High: {high}</div>
        <div>Medium: {medium}</div>
      </div>

      {/* LIVE LOGS */}
      <div className="bg-white/10 p-4 rounded mb-6">
        <h2 className="mb-2">Live Logs</h2>

        {liveLogs.map((l, i) => (
          <div key={i} className="text-sm border-b py-1">
            👤 {l.candidate_name || l.candidate_id} → {l.violation || "N/A"}
          </div>
        ))}
      </div>

      {/* TABLE */}
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {analytics.map((c, i) => (
            <tr key={i} className="border-t">
              <td>{c.candidate_name || "Unknown"}</td>
              <td>{c.cheating_score || 0}</td>
              <td>
                {(c.cheating_score || 0) > 60
                  ? "HIGH"
                  : (c.cheating_score || 0) > 30
                  ? "MEDIUM"
                  : "LOW"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        Avg Score: {avgScore.toFixed(2)}
      </div>

    </div>
  );
}