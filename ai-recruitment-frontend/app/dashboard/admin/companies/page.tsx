"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ================= FETCH =================
  const fetchCompanies = async () => {
    try {
      const res = await API.get("/admin/companies");
      setCompanies(res.data);
    } catch {
      alert("Failed to fetch companies ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this company?")) return;

    try {
      await API.delete(`/admin/company/${id}`);
      fetchCompanies();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Delete failed ❌");
    }
  };

  // ================= FILTER =================
  const filtered = companies.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-4">
        🏢 Company Management
      </h1>

      {/* SEARCH */}
      <input
        placeholder="Search company..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-4 py-2 bg-white/10 rounded w-full md:w-1/3"
      />

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* TABLE */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">

          <table className="w-full text-sm">

            <thead className="bg-white/10">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Code</th>
                <th className="p-3">Website</th>
                <th className="p-3">Recruiter</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-white/10">

                  <td className="p-3">
                    <p className="font-semibold">{c.name || "Not Set"}</p>
                    <p className="text-xs text-gray-400">
                      {c.description || "No description"}
                    </p>
                  </td>

                  <td className="p-3 text-blue-400">
                    {c.company_code}
                  </td>

                  <td className="p-3">
                    <a
                      href={c.website}
                      target="_blank"
                      className="text-blue-400"
                    >
                      {c.website || "N/A"}
                    </a>
                  </td>

                  <td className="p-3">
                    <p>{c.recruiter_name || "N/A"}</p>
                    <p className="text-xs text-gray-400">
                      {c.recruiter_email}
                    </p>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        c.is_profile_complete
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {c.is_profile_complete ? "Complete" : "Pending"}
                    </span>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p>No companies found</p>
      )}

    </div>
  );
}