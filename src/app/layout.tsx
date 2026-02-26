import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "FFA Advantage — Marketing Outreach Platform",
  description: "Enterprise Contact & Lead Regeneration Platform for FFA North",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Sidebar />
        <main className="ml-[240px] min-h-screen p-8 lg:p-10">
          {children}
        </main>
      </body>
    </html>
  );
}
