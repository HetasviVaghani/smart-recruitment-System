"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { motion } from "framer-motion";
import NeuralBackground from "@/components/ui/NeuralBackground";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await API.post("/register", { name, email, password });
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* 🧠 Background */}
      <NeuralBackground />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-transparent to-slate-950/90" />

      {/* Logo */}
      <div className="absolute top-6 left-10 flex items-center gap-3 z-20">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          🤖
        </div>
        <span className="text-xl font-bold text-white">AI Recruit</span>
      </div>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center px-6 z-10">
        
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center pr-10">
          <h1 className="text-6xl font-bold text-white leading-tight mb-6">
            AI Driven
            <span className="block text-cyan-400">
              Talent Intelligence
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-md mb-10">
            Intelligent hiring powered by machine learning, real-time analytics, and automated workflows.
          </p>

          <div className="space-y-4">
            {[
              "AI Resume Screening",
              "Predictive Candidate Ranking",
              "Automated Hiring Pipeline",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-3 text-slate-300"
              >
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl ml-auto lg:ml-10"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8">
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl text-white">
                Create Account ✨
              </CardTitle>
              <CardDescription className="text-slate-400">
                Start your AI hiring journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

              {error && (
                <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">

                <div>
                  <Label className="text-slate-300">Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-11 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-11 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 bg-white/5 border-white/10 text-white pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-2 text-sm text-blue-400"
                    >
                      {show ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 h-11 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition"
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>

              </form>

              <div className="text-center text-xs text-slate-500">
                🔒 Secure • ⚡ Fast • 🤖 AI Powered
              </div>

              <p className="text-center text-sm text-slate-400 mt-4">
                Already have an account?{" "}
                <Link href="/" className="text-blue-400 hover:underline">
                  Sign In
                </Link>
              </p>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}