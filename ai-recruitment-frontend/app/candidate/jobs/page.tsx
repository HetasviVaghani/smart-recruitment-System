"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/candidate/JobCard";
import API from "@/lib/api";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/jobs");

      if (!Array.isArray(res.data)) {
        setJobs([]);
        setFilteredJobs([]);
        return;
      }

      setJobs(res.data);
      setFilteredJobs(res.data);

    } catch {
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [search, jobs]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold text-white">
          💼 Explore Jobs
        </h1>

        {/* SEARCH */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-72">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 text-sm text-white w-full"
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-slate-400 animate-pulse">
          Fetching jobs...
        </p>
      )}

      {/* JOB GRID */}
      <motion.div
        layout
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </motion.div>

      {/* EMPTY */}
      {!loading && filteredJobs.length === 0 && (
        <p className="text-center text-slate-500 mt-10">
          No jobs found 🚫
        </p>
      )}
    </div>
  );
}