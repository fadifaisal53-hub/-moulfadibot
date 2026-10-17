import type { Metadata } from "next";
import { Readex_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const ar = Readex_Pro({ subsets: ["arabic", "latin"], variable: "--font-ar" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "مولينكس — تعلّم البرمجة بالتطبيق",
  description: "دروس برمجة تشغّل كودك وتشرح أخطاءك.",
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${ar.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
