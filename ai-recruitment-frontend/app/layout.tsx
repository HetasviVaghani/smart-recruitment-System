import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "AI Recruitment System",
  description: "Smart AI Hiring Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white">
        {children}
      {/* 🔥 PREMIUM TOAST */}
      <Toaster
          position="top-right"
          richColors
          theme="dark" />


      </body>
    </html>
  );
}