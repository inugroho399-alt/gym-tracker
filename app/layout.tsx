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
  themeColor: "#090a0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "IRONLOG — Progressive Overload Gym Tracker",
  description: "Buku catatan latihan angkat beban & progressive overload tanpa distraksi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IRONLOG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="antialiased selection:bg-volt-400/20 selection:text-volt-300">
      <body className={`${inter.className} bg-carbon-950 bg-tech-grid text-slate-100 min-h-screen overflow-x-hidden flex flex-col font-sans`}>
        <Header />
        
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 sm:py-7">
          {children}
        </main>
      </body>
    </html>
  );
}

