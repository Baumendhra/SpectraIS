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
    <html lang="en">
      <body className="bg-[#f8f5f0] text-[#3d2b1f] antialiased selection:bg-[#c4a484]/40 selection:text-[#3d2b1f]">
        {children}
      </body>
    </html>
  );
}
