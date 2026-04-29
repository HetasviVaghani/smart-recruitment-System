"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Download, Briefcase, Loader2 } from "lucide-react";
import API from "@/lib/api";

export default function OfferPage() {
  const params = useSearchParams();
  const job_id = params.get("job_id");

  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError("");

      const res = await API.get(
        `/download-offer?job_id=${job_id}`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Offer_Letter.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      setDownloaded(true);

      // Reset downloaded state after 3 sec (so user can download again)
      setTimeout(() => {
        setDownloaded(false);
      }, 3000);

    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to download offer letter"
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10 text-center overflow-hidden"
      >

        {/* Glow Effect (FIXED — does not block hover) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 blur-2xl opacity-50"></div>

        {/* ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 flex justify-center mb-6"
        >
          <div className="bg-green-500/20 p-4 rounded-full">
            <CheckCircle size={50} className="text-green-400" />
          </div>
        </motion.div>

        <h1 className="relative z-10 text-4xl font-bold mb-4 tracking-tight">
          🎉 Congratulations!
        </h1>

        <p className="relative z-10 text-gray-300 mb-6 text-lg">
          You have been{" "}
          <span className="text-green-400 font-semibold">
            successfully selected
          </span>{" "}
          for this role.
        </p>

        <div className="relative z-10 flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
          <Briefcase size={16} />
          <span>Job ID: {job_id}</span>
        </div>

        {/* DOWNLOAD BUTTON */}
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 bg-green-600 hover:bg-green-700 active:scale-95"
        >
          {downloading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Downloading...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle size={18} />
              Downloaded ✓
            </>
          ) : (
            <>
              <Download size={18} />
              Download Offer Letter
            </>
          )}
        </motion.button>

        {/* SUCCESS MESSAGE */}
        {downloaded && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 text-green-400 mt-4 text-sm"
          >
            ✅ Offer letter downloaded successfully!
          </motion.p>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 text-red-400 mt-4 text-sm"
          >
            ❌ {error}
          </motion.p>
        )}

        <p className="relative z-10 text-xs text-gray-500 mt-6">
          Please review your offer letter carefully and contact HR for further
          steps.
        </p>
      </motion.div>
    </div>
  );
}