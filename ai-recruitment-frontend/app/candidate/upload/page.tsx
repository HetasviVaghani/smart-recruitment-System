"use client";

import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/my-applications", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then(setApps);
  }, []);

  return (
    <div>

      <h1 className="text-xl font-bold mb-4">
        My Applications
      </h1>

      <table className="w-full bg-white shadow rounded">

        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Job</th>
            <th className="p-3">Status</th>
            <th className="p-3">Score</th>
          </tr>
        </thead>

        <tbody>
          {apps.map((a, i) => (
            <tr key={i} className="border-t text-center">
              <td className="p-3">{a.job_title}</td>
              <td className="p-3">{a.status}</td>
              <td className="p-3">{a.match_score}%</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}