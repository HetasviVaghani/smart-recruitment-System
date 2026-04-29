"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { motion } from "framer-motion";
import { Building2, Globe, FileText, CheckCircle } from "lucide-react";

export default function CompanyProfile() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
  });

  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // ================= FETCH =================
  useEffect(() => {
    API.get("/company/me")
      .then((res) => {
        setForm({
          name: res.data.name || "",
          description: res.data.description || "",
          website: res.data.website || "",
        });
        setCompanyCode(res.data.company_code);
      })
      .catch(() => {
        setSuccess("❌ Failed to load company");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      setSaving(true);
      setSuccess("");

      await API.put("/company/update", form);

      setSuccess("Company updated successfully 🚀");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setSuccess(err.response?.data?.detail || "Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="p-6">
        <div className="h-10 w-60 bg-white/10 rounded mb-6 animate-pulse" />
        <div className="space-y-4">
          <div className="h-12 bg-white/10 rounded animate-pulse" />
          <div className="h-12 bg-white/10 rounded animate-pulse" />
          <div className="h-28 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">
          Company Profile 🏢
        </h1>
        <p className="text-slate-400 mt-1">
          Manage your organization details & branding
        </p>
      </motion.div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl"
        >
          <CheckCircle size={18} />
          {success}
        </motion.div>
      )}

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-5"
      >

        {/* COMPANY CODE */}
        <div>
          <label className="text-slate-400 text-sm">Company Code</label>
          <input
            value={companyCode}
            disabled
            className="w-full mt-1 p-3 rounded-lg bg-white/10 text-white border border-white/10"
          />
        </div>

        {/* COMPANY NAME */}
        <div>
          <label className="text-slate-300 text-sm flex items-center gap-2">
            <Building2 size={16} /> Company Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter company name"
            className="w-full mt-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* WEBSITE */}
        <div>
          <label className="text-slate-300 text-sm flex items-center gap-2">
            <Globe size={16} /> Website
          </label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://yourcompany.com"
            className="w-full mt-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-slate-300 text-sm flex items-center gap-2">
            <FileText size={16} /> Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your company..."
            rows={4}
            className="w-full mt-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition font-medium"
        >
          {saving ? "Updating..." : "Update Company"}
        </button>

      </motion.div>
    </div>
  );
}