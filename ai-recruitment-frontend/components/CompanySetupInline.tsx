"use client";

import { useState } from "react";
import API from "@/lib/api";
import { motion } from "framer-motion";

export default function CompanySetupInline({ companyCode, onSuccess }: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.website || !form.description) {
      setMessage("⚠ Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await API.post("/company/setup", {
        ...form,
        company_code: companyCode,
      });

      setMessage("✅ Company profile completed successfully!");

      setTimeout(() => {
        onSuccess();
      }, 1200);

    } catch (err: any) {
      setMessage(err.response?.data?.detail || "❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent)]" />

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center px-6 z-10">

        {/* LEFT SIDE (INFO) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <h1 className="text-5xl font-bold mb-6">
            Setup Your
            <span className="block text-cyan-400">
              Company Profile
            </span>
          </h1>

          <p className="text-slate-400 text-lg mb-8 max-w-md">
            Complete your company details to start posting jobs, managing candidates, and using AI hiring tools.
          </p>

          <div className="space-y-3 text-slate-300">
            <p>🚀 Post jobs instantly</p>
            <p>📊 Track candidate pipeline</p>
            <p>🤖 AI-based hiring insights</p>
          </div>
        </motion.div>

        {/* RIGHT SIDE (FORM) */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8">

            <h2 className="text-2xl font-bold text-center mb-2">
              🏢 Company Setup
            </h2>

            <p className="text-center text-slate-400 mb-6">
              Enter your company details
            </p>

            {/* COMPANY CODE */}
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-center py-2 rounded-lg mb-6">
              Company Code: <span className="font-semibold">{companyCode}</span>
            </div>

            {/* MESSAGE */}
            {message && (
              <div className="mb-4 text-center text-sm text-cyan-400">
                {message}
              </div>
            )}

            {/* FORM */}
            <div className="space-y-4">

              <input
                name="name"
                placeholder="Company Name"
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <input
                name="website"
                placeholder="Website URL"
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <textarea
                name="description"
                placeholder="Company Description"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={4}
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save & Continue 🚀"}
              </button>

            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}