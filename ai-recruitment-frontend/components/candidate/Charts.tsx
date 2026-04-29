"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Charts({ apps }: any) {

  const data = [
    { name: "Shortlisted", value: apps.filter((a:any)=>a.status==="shortlisted").length },
    { name: "Rejected", value: apps.filter((a:any)=>a.status==="rejected").length },
    { name: "Pending", value: apps.filter((a:any)=>a.status==="pending").length },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">

      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Application Analytics
      </h2>

      <div className="h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={100}>
              <Cell fill="#4ade80" />
              <Cell fill="#f87171" />
              <Cell fill="#facc15" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}