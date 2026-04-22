import type { Metadata } from "next";
// import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Hivon Blog — Modern Blogging Platform",
  description: "A modern blogging platform with role-based access and AI-generated summaries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500">
          Built with Next.js · Supabase · Gemini · © Hivon Blog
        </footer>
      </body>
    </html>
  );
}
