import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpectraIS | AI Procurement Standards & Compliance Copilot",
  description: "Production-grade AI Copilot for Government Procurement, BIS Standards repository mapping, tender analysis, and compliance audit reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
