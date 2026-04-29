"use client";

import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Code,
  FileText,
  Loader2,
} from "lucide-react";

export default function PostJob() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    skills: "",
    experience: "",
    location: "",
    salary: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.title || !form.description || !form.skills) {
      showToast("error", "Please fill required fields ❌");
      return false;
    }

    if (parseInt(form.experience) < 0) {
      showToast("error", "Invalid experience ❌");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      await API.post("/post_job", {
        title: form.title,
        description: form.description,
        skills: form.skills,
        experience: parseInt(form.experience),
        location: form.location,
        salary: parseInt(form.salary),
      });

      showToast("success", "Job posted successfully 🚀");

      setForm({
        title: "",
        description: "",
        skills: "",
        experience: "",
        location: "",
        salary: "",
      });

      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (err: any) {
      showToast("error", err.response?.data?.detail || "Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white flex justify-center items-center">

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm z-50 ${
            toast.type === "success"
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {toast.message}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
      >
        {/* HEADER */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Briefcase className="text-blue-400" />
            Post New Job
          </h1>
          <p className="text-slate-400 text-sm">
            Create job listings with AI-powered hiring
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* TITLE */}
          <InputField
            icon={<Briefcase />}
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Job Title"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Job Description"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* SKILLS */}
          <InputField
            icon={<Code />}
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Skills (React, AI, Python...)"
          />

          {/* GRID */}
          <div className="grid grid-cols-2 gap-4">

            <InputField
              icon={<FileText />}
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Experience (years)"
              type="number"
            />

            <InputField
              icon={<MapPin />}
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location"
            />

          </div>

          {/* SALARY */}
          <InputField
            icon={<DollarSign />}
            name="salary"
            value={form.salary}
            onChange={handleChange}
            placeholder="Salary"
          />

          {/* BUTTON */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold flex justify-center items-center gap-2 hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Posting...
              </>
            ) : (
              "Post Job 🚀"
            )}
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
}

/* 🔥 INPUT COMPONENT */
function InputField({ icon, ...props }: any) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
      <span className="text-blue-400">{icon}</span>
      <input
        {...props}
        className="bg-transparent w-full outline-none text-white placeholder-gray-400"
      />
    </div>
  );
}