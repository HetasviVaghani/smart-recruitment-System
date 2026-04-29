import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");

  // ❌ No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // ✅ Decode JWT safely
    const payload = JSON.parse(atob(token.value.split(".")[1]));
    const role = payload.role?.toLowerCase();

    // 🔐 Protect dashboard (admin + recruiter)
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (role !== "admin" && role !== "recruiter") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // 🔐 Protect candidate routes
    if (req.nextUrl.pathname.startsWith("/candidate")) {
      if (role !== "candidate") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

  } catch (err) {
    // ❌ Invalid token
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ✅ Apply middleware only to these routes
export const config = {
  matcher: ["/dashboard/:path*", "/candidate/:path*"],
};