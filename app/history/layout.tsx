import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riwayat Latihan - Gym Tracker",
  description: "Pantau histori dan catatan sesi latihan gym-mu.",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
