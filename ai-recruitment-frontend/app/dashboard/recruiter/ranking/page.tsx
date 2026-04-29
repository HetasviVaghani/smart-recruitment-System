"use client";

import { useState } from "react";
import { getRanking } from "@/lib/api";
import API from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function RankingPage() {
  const [jobId, setJobId] = useState("");
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [scheduleData, setScheduleData] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [form, setForm] = useState({
    time: "",
    interviewer: "",
    round: "technical",
    salary: ""
  });

  // ================= FETCH =================
  const fetchRanking = async () => {
    if (!jobId) {
      setMessage("Enter Job ID");
      return;
    }

    try {
      setLoading(true);
      const data = await getRanking(Number(jobId));
      setRanking([...data]);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS STYLE =================
  const getStatusUI = (status: string) => {
    if (status === "rejected") return "bg-red-500/20 text-red-400";
    if (status === "selected") return "bg-green-500/20 text-green-400";
    if (status?.includes("hr")) return "bg-purple-500/20 text-purple-400";
    if (status?.includes("technical")) return "bg-blue-500/20 text-blue-400";
    if (status === "shortlisted") return "bg-green-400/20 text-green-300";
    return "bg-gray-500/20 text-gray-300";
  };

  // ================= OPEN SCHEDULE =================
  const openSchedule = (candidate: any, round: string) => {
    setScheduleData(candidate);
    setForm({
      time: "",
      interviewer: "",
      round,
      salary: ""
    });
  };

  // ================= SCHEDULE =================
  const scheduleInterview = async () => {
    try {
      setActionLoading(scheduleData.candidate_id);

      const res = await API.post("/schedule-interview", {
        candidate_id: scheduleData.candidate_id,
        job_id: Number(jobId),
        slot_time: form.time,
        interviewer: form.interviewer,
        round: form.round,
      });

      setMessage(res.data.message);
      setScheduleData(null);
      await fetchRanking();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ================= TECH RESULT =================
  const updateTech = async (id: number, status: string) => {
    try {
      setActionLoading(id);

      await API.post("/technical-result", {
        candidate_id: id,
        job_id: Number(jobId),
        status,
      });

      setMessage("Technical updated");
      await fetchRanking();
    } catch {
      setMessage("Failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ================= HR RESULT =================
  const updateHR = async (id: number, status: string) => {
    try {
      setActionLoading(id);

      await API.post("/hr-result", {
        candidate_id: id,
        job_id: Number(jobId),
        status,
        salary: form.salary || 500000
      });

      setMessage("Final decision updated");
      await fetchRanking();
    } catch {
      setMessage("Failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-white space-y-6">

      <div>
        <h1 className="text-3xl font-bold">AI Hiring Pipeline</h1>
        <p className="text-slate-400">
          Smart candidate ranking & hiring workflow
        </p>
      </div>

      {message && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-lg">
          {message}
        </div>
      )}

      <div className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <input
          type="number"
          placeholder="Enter Job ID..."
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg outline-none"
        />

        <button
          onClick={fetchRanking}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          Load Candidates
        </button>
      </div>

      {loading && <p className="text-slate-400">Loading...</p>}

      {!loading && ranking.length > 0 && (
        <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-4">Rank</th>
                <th>Candidate</th>
                <th>Match</th>
                <th>Exam</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.candidate_id} className="border-t border-white/5">

                  <td className="p-4 font-bold text-cyan-400">#{i + 1}</td>

                  <td>
                    <p className="font-semibold">{r.candidate_name}</p>
                    <p className="text-xs text-slate-400">{r.email}</p>
                  </td>

                  <td className="w-40">
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full"
                        style={{ width: `${r.match_score}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1">{r.match_score}%</p>
                  </td>

                  <td className="text-center">
                    {r.exam_status === "pending" && (
                      <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400">
                        Pending
                      </span>
                    )}

                    {r.exam_status === "pass" && (
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                        Pass ({r.exam_percentage?.toFixed(1)}%)
                      </span>
                    )}

                    {r.exam_status === "fail" && (
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">
                        Fail ({r.exam_percentage?.toFixed(1)}%)
                      </span>
                    )}
                  </td>

                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusUI(r.status)}`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="flex flex-wrap gap-2 py-3">

                    {r.resume_path && (
                      <a
                        href={`http://127.0.0.1:8000/${r.resume_path}`}
                        target="_blank"
                        className="px-2 py-1 bg-gray-700 rounded text-xs"
                      >
                        Resume
                      </a>
                    )}

                    {/* Schedule Technical */}
                    {r.exam_status === "pass" && r.status === "shortlisted" && (
                      <button
                        onClick={() => openSchedule(r, "technical")}
                        className="px-2 py-1 bg-cyan-600 rounded text-xs"
                      >
                        Schedule Tech
                      </button>
                    )}

                    {/* Technical Result */}
                    {r.status === "technical_scheduled" && (
                      <>
                        <button
                          disabled={actionLoading === r.candidate_id}
                          onClick={() => updateTech(r.candidate_id, "pass")}
                          className="px-2 py-1 bg-green-600 rounded text-xs"
                        >
                          Pass
                        </button>

                        <button
                          disabled={actionLoading === r.candidate_id}
                          onClick={() => updateTech(r.candidate_id, "fail")}
                          className="px-2 py-1 bg-red-600 rounded text-xs"
                        >
                          Fail
                        </button>
                      </>
                    )}

                    {/* Schedule HR (after tech pass) */}
                    {(r.status === "technical_passed") && (
                      <button
                        onClick={() => openSchedule(r, "hr")}
                        className="px-2 py-1 bg-purple-600 rounded text-xs"
                      >
                        Schedule HR
                      </button>
                    )}

                    {/* HR Result */}
                    {r.status === "hr_scheduled" && (
                      <>
                        <button
                          disabled={actionLoading === r.candidate_id}
                          onClick={() => updateHR(r.candidate_id, "pass")}
                          className="px-2 py-1 bg-green-600 rounded text-xs"
                        >
                          Select
                        </button>

                        <button
                          disabled={actionLoading === r.candidate_id}
                          onClick={() => updateHR(r.candidate_id, "fail")}
                          className="px-2 py-1 bg-red-600 rounded text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && ranking.length === 0 && (
        <p className="text-slate-500 text-center">No candidates found</p>
      )}

      <AnimatePresence>
        {scheduleData && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-slate-900 p-6 rounded-xl w-96 border border-white/10 space-y-4"
            >
              <h2 className="text-lg font-bold">
                Schedule {form.round} Interview
              </h2>

              <input
                type="datetime-local"
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full p-2 rounded bg-white/10"
              />

              <input
                placeholder="Interviewer"
                onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                className="w-full p-2 rounded bg-white/10"
              />

              <div className="flex gap-3">
                <button
                  onClick={scheduleInterview}
                  className="flex-1 bg-blue-600 py-2 rounded"
                >
                  Confirm
                </button>

                <button
                  onClick={() => setScheduleData(null)}
                  className="flex-1 bg-gray-600 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}