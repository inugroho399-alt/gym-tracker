import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Catatan latihan angkat beban minimalis dan tanpa distraksi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gym Tracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-black text-neutral-100 min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
