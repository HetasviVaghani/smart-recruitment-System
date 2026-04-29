"use client";

import { useEffect, useState } from "react";
import { getAllApplications } from "../../../../lib/api";

export default function AllApplicationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const f = data.filter((a) =>
      a.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, data]);

  const fetchData = async () => {
    try {
      const res = await getAllApplications();
      setData(res);
      setFiltered(res);
    } catch {
      alert("Error fetching data ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS COLOR =================
  const getStatusStyle = (status: string) => {
    if (status === "rejected") return "bg-red-500/20 text-red-400";
    if (status === "selected") return "bg-green-500/20 text-green-400";
    if (status.includes("hr")) return "bg-purple-500/20 text-purple-400";
    if (status.includes("technical")) return "bg-blue-500/20 text-blue-400";
    if (status === "shortlisted") return "bg-green-400/20 text-green-300";
    return "bg-gray-500/20 text-gray-300";
  };

  return (
    <div className="p-6 text-white">

      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          📊 Applicants Overview
        </h1>
        <p className="text-gray-400 text-sm">
          Monitor all candidate applications in real-time
        </p>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="mb-5">
        <input
          placeholder="🔍 Search by candidate or job..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <p className="text-gray-400">Loading applications...</p>
      )}

      {/* ================= TABLE ================= */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">

          <table className="w-full text-sm">

            {/* HEADER */}
            <thead className="bg-white/10 text-gray-300 sticky top-0">
              <tr>
                <th className="p-3 text-left">#ID</th>
                <th className="p-3 text-left">Job</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Match Score</th>
                <th className="p-3 text-left">Exam Score</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.application_id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >

                  {/* ID */}
                  <td className="p-3 text-gray-400">
                    #{a.application_id}
                  </td>

                  {/* JOB */}
                  <td className="p-3">
                    <p className="font-semibold">
                      {a.job_title}
                    </p>
                    <p className="text-xs text-gray-400">
                      Job ID: {a.job_id}
                    </p>
                  </td>

                  {/* ✅ COMPANY NAME */}
                  <td className="p-3 text-blue-400 font-medium">
                    {a.company_name || "N/A"}
                  </td>

                  {/* ✅ COMPANY CODE */}
                  <td className="p-3 text-purple-400 font-medium">
                    {a.company_code || "N/A"}
                  </td>

                  {/* CANDIDATE */}
                  <td className="p-3 font-medium">
                    {a.candidate_name}
                  </td>

                  {/* EMAIL */}
                  <td className="p-3 text-gray-400">
                    {a.email}
                  </td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(a.status)}`}
                    >
                      {a.status}
                    </span>
                  </td>

                  {/* MATCH SCORE */}
                  <td className="p-3 w-48">
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="bg-green-400 h-3 rounded-full text-[10px] flex items-center justify-center text-white font-semibold"
                        style={{ width: `${a.match_score}%` }}
                      >
                        {a.match_score}%
                      </div>
                    </div>
                  </td>

                  {/* ✅ EXAM SCORE */}
                  <td className="p-3">
                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                      {a.exam_score ?? 0} / 100
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          🚫 No applications found
        </div>
      )}

    </div>
  );
}