import type { Metadata } from "next";
import Link from "next/link";
import SplitDayFlow from "@/components/SplitDayFlow";

export const metadata: Metadata = {
  title: "Tambah Latihan — Gym Progress Tracker",
  description: "Catat sesi latihan gym baru kamu hari ini.",
};

export default function AddWorkoutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        id="back-to-home"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        ← Kembali
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Mulai Latihan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pilih jadwal split hari ini, lalu catat pencapaianmu.
        </p>
      </div>

      <SplitDayFlow />
    </div>
  );
}
