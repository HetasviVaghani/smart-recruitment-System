"use client";

import { useState, useEffect } from "react";
import API from "@/lib/api";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function JobCard({ job }: any) {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ CHECK IF ALREADY APPLIED
  useEffect(() => {
    const checkApplied = async () => {
      try {
        const res = await API.get("/my-applications");
        const already = res.data.some((app: any) => app.job_id === job.id);
        setApplied(already);
      } catch {}
    };

    checkApplied();
  }, [job.id]);

  // 🚀 UPLOAD RESUME
  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/upload-resume", formData);
      setResumeId(res.data.resume_id);

      toast.success("Resume uploaded successfully 🚀");

    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  // 🚀 APPLY JOB
  const handleApply = async () => {
    if (!resumeId) {
      toast.warning("Upload resume first ⚠️");
      return;
    }

    try {
      setLoading(true);

      await API.post(`/apply-job?job_id=${job.id}&resume_id=${resumeId}`);

      const res = await API.post(
        `/match-resume?job_id=${job.id}&resume_id=${resumeId}`
      );

      toast.success(`Applied! Match Score: ${res.data.match_score}% 🎯`);

      setApplied(true);

    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Application failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl transition"
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-semibold text-white">
          {job.title}
        </h2>

        {applied && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
            Applied
          </span>
        )}
      </div>

      {/* COMPANY */}
      <p className="text-sm text-slate-400">
        🏢 {job.company_name}
      </p>

      <p className="text-sm text-slate-400">
        📍 {job.location} • 💰 {job.salary}
      </p>

      {/* DESCRIPTION */}
      <p className="mt-3 text-slate-300 text-sm line-clamp-3">
        {job.description}
      </p>

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2 mt-3">
        {job.skills?.split(",").map((skill: string, i: number) => (
          <span
            key={i}
            className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="mt-5 space-y-3">

        {/* UPLOAD */}
        <label className="flex items-center justify-center gap-2 cursor-pointer border border-dashed border-white/20 rounded-lg py-2 hover:bg-white/10 transition text-sm text-slate-300">
          {uploading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <UploadCloud size={16} />
          )}
          Upload Resume
          <input
            type="file"
            hidden
            onChange={(e) =>
              e.target.files && handleUpload(e.target.files[0])
            }
          />
        </label>

        {/* APPLY BUTTON */}
        <button
          onClick={handleApply}
          disabled={applied || loading}
          className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2
            ${
              applied
                ? "bg-green-500/20 text-green-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105"
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Processing...
            </>
          ) : applied ? (
            <>
              <CheckCircle size={16} />
              Applied
            </>
          ) : (
            "Apply Now"
          )}
        </button>

      </div>
    </motion.div>
  );
}