"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function useAuth(allowedRoles: string[]) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let role = localStorage.getItem("role");

    // ✅ Normalize role
    role = role?.toLowerCase() || "";

    console.log("AUTH CHECK:", token, role);

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.replace("/login");
      return;
    }

    setLoading(false);
  }, []);

  return loading;
}