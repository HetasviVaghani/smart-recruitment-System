"use client";

import { useState } from "react";
import API from "@/lib/api";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function CreateRecruiter() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔐 Password Strength
  const getPasswordStrength = () => {
    if (form.password.length > 8) return "Strong";
    if (form.password.length > 4) return "Medium";
    return "Weak";
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setMessage({ type: "error", text: "All fields are required ❌" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await API.post("/admin/create-recruiter", form);

      setMessage({
        type: "success",
        text: "Recruiter created successfully 🎉",
      });

      setForm({
        name: "",
        email: "",
        password: "",
      });

    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Something went wrong ❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen px-4">

      {/* 🌌 BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent)] -z-10" />

      {/* 💎 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl"
      >

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-purple-500/20 rounded-xl mb-3">
            <UserPlus className="text-purple-400" />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Create Recruiter
          </h1>

          <p className="text-slate-400 text-sm">
            Add a new recruiter to your platform
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm text-slate-400">Full Name</label>

          <div className="flex items-center gap-2 mt-1 bg-white/10 p-3 rounded-lg border border-white/10">
            <User size={18} className="text-slate-300" />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="bg-transparent outline-none w-full text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm text-slate-400">Email</label>

          <div className="flex items-center gap-2 mt-1 bg-white/10 p-3 rounded-lg border border-white/10">
            <Mail size={18} className="text-slate-300" />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="bg-transparent outline-none w-full text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <label className="text-sm text-slate-400">Password</label>

          <div className="flex items-center gap-2 mt-1 bg-white/10 p-3 rounded-lg border border-white/10">
            <Lock size={18} className="text-slate-300" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-transparent outline-none w-full text-white placeholder:text-slate-400"
            />
          </div>

          {/* 🔐 Strength Indicator */}
          {form.password && (
            <p
              className={`text-xs mt-1 ${
                getPasswordStrength() === "Strong"
                  ? "text-green-400"
                  : getPasswordStrength() === "Medium"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              Strength: {getPasswordStrength()}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Recruiter"}
        </button>

      </motion.div>
    </div>
  );
}