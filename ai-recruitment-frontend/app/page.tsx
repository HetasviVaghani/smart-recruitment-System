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

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await API.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = res.data.access_token;
      document.cookie = `token=${token}; path=/`;

      let role = "";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        role = payload.role?.toLowerCase() || "";
      } catch {}

      localStorage.setItem("role", role);

      if (role === "admin" || role === "recruiter") {
        router.push("/dashboard");
      } else {
        router.push("/candidate");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      
      {/* 🧠 Neural Background */}
      <NeuralBackground />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-transparent to-slate-950/90" />

      {/* Logo */}
      <div className="absolute top-6 left-10 flex items-center gap-3 z-20">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          🤖
        </div>
        <span className="text-xl font-bold text-white">
          AI Recruit
        </span>
      </div>

      {/* MAIN GRID */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-24 xl:gap-32 items-center px-6 z-10">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center pr-10">
          <h1 className="text-6xl font-bold text-white leading-tight mb-6">
            Hire Smarter with
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-lg mb-10">
            Automate hiring, evaluate candidates, and make smarter decisions with AI-powered recruitment workflows.
          </p>

          <Link href="/register">
            <Button
              size="lg"
              className="px-8 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition"
            >
              Get Started 🚀
            </Button>
          </Link>
        </div>

        {/* RIGHT SIDE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl ml-auto lg:scale-[1.05]"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] rounded-2xl p-10 lg:p-12">
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl text-white font-bold">
                Welcome Back 👋
              </CardTitle>
              <CardDescription className="text-slate-400">
                Sign in to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-7">

              {error && (
                <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">

                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-12 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={show ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-3 text-sm text-blue-400"
                    >
                      {show ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

               

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

              </form>

              

              <p className="text-center text-sm text-slate-400 mt-4">
                Don’t have an account?{" "}
                <Link href="/register" className="text-blue-400 hover:underline">
                  Create Account
                </Link>
              </p>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}