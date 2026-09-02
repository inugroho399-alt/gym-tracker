import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Gym Progress Tracker",
  description: "Lacak sesi latihan dan progressive overload secara terstruktur.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GymTracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen overflow-x-hidden flex flex-col`}>
        <Header />
        
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

