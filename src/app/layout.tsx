import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import { ClientProviders } from "@/components/layout/ClientProviders";

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
      <body className="antialiased font-sans">
        <ClientProviders>
          <TopNav />
          <div className="h-14" />
          <main className="min-h-[calc(100vh-56px)]">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
