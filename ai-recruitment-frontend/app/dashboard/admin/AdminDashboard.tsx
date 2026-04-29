"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAdminDashboardAnalytics } from "@/lib/api";

import {
  Users,
  Briefcase,
  FileText,
  BarChart3
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function AdminDashboard() {

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await getAdminDashboardAnalytics();

        console.log("ADMIN DASHBOARD:", res);

        setData(res);

      } catch (err: any) {

        console.error(err);

        setError(
          err.response?.data?.detail ||
          "Failed to load admin dashboard"
        );

      } finally {

        setLoading(false);

      }
    };

    fetchData();

  }, []);


  if (loading) {
    return (
      <div className="text-white p-8">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-8">
        {error}
      </div>
    );
  }


  const cards = [
    {
      title: "Total Users",
      value: data?.total_users || 0,
      icon: <Users />,
    },
    {
      title: "Jobs",
      value: data?.total_jobs || 0,
      icon: <Briefcase />,
    },
    {
      title: "Applications",
      value: data?.total_applications || 0,
      icon: <FileText />,
    },
    {
      title: "Avg Score",
      value: `${data?.average_score?.toFixed(1) || 0}%`,
      icon: <BarChart3 />,
    },
  ];


  const chartData = [
    {
      name: "Users",
      value: data?.total_users || 0
    },
    {
      name: "Jobs",
      value: data?.total_jobs || 0
    },
    {
      name: "Applications",
      value: data?.total_applications || 0
    },
  ];


  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6"
  ];


  return (
    <div>

      <motion.div
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          Admin Dashboard 📊
        </h1>

        <p className="text-slate-400">
          Monitor platform performance and system analytics
        </p>

      </motion.div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {cards.map((c,i)=>(
          <motion.div
            key={i}
            whileHover={{ scale:1.05 }}
            className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg flex justify-between items-center"
          >
            <div>
              <p className="text-slate-400 text-sm">
                {c.title}
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {c.value}
              </h2>
            </div>

            <div className="p-3 bg-white/10 rounded-lg">
              {c.icon}
            </div>

          </motion.div>
        ))}

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Platform Growth 📈
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />

              <Bar
                dataKey="value"
                fill="#3B82F6"
                radius={[6,6,0,0]}
              />

            </BarChart>
          </ResponsiveContainer>

        </div>



        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Distribution 🧩
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={90}
              >
                {chartData.map((_,i)=>(
                  <Cell
                    key={i}
                    fill={COLORS[i % 3]}
                  />
                ))}
              </Pie>

              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}