"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/services/jobService";
import { Search, Briefcase } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [minExp, setMinExp] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const [toast, setToast] = useState<any>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch {
      showToast("Failed to fetch jobs ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ================= FILTER =================
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.toLowerCase().includes(search.toLowerCase());

    const matchesExp =
      minExp === "" || job.experience >= parseInt(minExp);

    return matchesSearch && matchesExp;
  });

  const indexOfLast = currentPage * jobsPerPage;
  const currentJobs = filteredJobs.slice(
    indexOfLast - jobsPerPage,
    indexOfLast
  );

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#0f172a] to-black text-white">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-xl shadow">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Briefcase className="text-blue-400" />
        Jobs List
      </h1>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center bg-white/5 border border-white/10 px-3 rounded-lg w-1/2">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent p-2 w-full outline-none"
          />
        </div>

        <input
          type="number"
          placeholder="Min Experience"
          value={minExp}
          onChange={(e) => {
            setMinExp(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white/5 border border-white/10 p-2 rounded w-40"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/10 text-sm text-slate-300">
            <tr>
              <th className="p-3 text-left">Job</th>
              <th className="p-3">Skills</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Location</th>
              <th className="p-3">Salary</th>
              <th className="p-3">Company</th>
              <th className="p-3">Code</th>
            </tr>
          </thead>

          <tbody>
            {currentJobs.map((job) => (
              <tr
                key={job.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="p-3 font-semibold">{job.title}</td>

                <td className="p-3 text-sm text-slate-300">
                  {job.skills}
                </td>

                <td className="p-3">{job.experience} yrs</td>

                <td className="p-3">{job.location}</td>

                <td className="p-3">₹{job.salary}</td>

                {/* ✅ NEW */}
                <td className="p-3 text-blue-400">
                  {job.company_name || "N/A"}
                </td>

                <td className="p-3 text-purple-400">
                  {job.company_code || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white/10 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white/10 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}