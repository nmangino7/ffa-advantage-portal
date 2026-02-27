import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { ClientProviders } from "@/components/layout/ClientProviders";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "FFA Advantage — Marketing Outreach Platform",
  description: "Enterprise Contact & Lead Regeneration Platform for FFA North",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ClientProviders>
          <Sidebar />
          {/* Mobile top bar spacer */}
          <div className="md:hidden h-14" />
          <main className="ml-0 md:ml-[240px] min-h-screen p-4 md:p-8 lg:p-10">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
