"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import AdminDashboard from "./admin/AdminDashboard";
import RecruiterDashboard from "./recruiter/RecruiterDashboard";
import CompanySetupInline from "@/components/CompanySetupInline";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile");
        setProfile(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-red-500">
        Failed to load profile ❌
      </div>
    );
  }

  // ===============================
  // 🔥 ADMIN FLOW (UNCHANGED SAFE)
  // ===============================
  if (profile.role === "admin") {
    return <AdminDashboard  />;
  }

  // ===============================
  // 🔥 RECRUITER FLOW (UNCHANGED SAFE)
  // ===============================
  if (profile.role === "recruiter") {
    if (!profile.company_complete) {
      return (
        <CompanySetupInline
          companyCode={profile.company_code}
          onSuccess={() =>
            setProfile({ ...profile, company_complete: true })
          }
        />
      );
    }

    return <RecruiterDashboard />;
  }

  return (
    <div className="text-center text-gray-500">
      Unauthorized access
    </div>
  );
}