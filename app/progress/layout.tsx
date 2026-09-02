import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress & Grafik - Gym Tracker",
  description: "Lihat grafik progress kekuatan dan volume latihanmu.",
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
