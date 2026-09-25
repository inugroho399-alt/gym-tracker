import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SplitDayFlow from "@/components/SplitDayFlow";

export const metadata: Metadata = {
  title: "Tambah Latihan - Gym Tracker",
  description: "Catat sesi latihan gym baru kamu hari ini.",
};

export default function AddWorkoutPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Mulai Latihan</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Pilih split hari ini & catat hasil latihanmu.
          </p>
        </div>

        <Link
          href="/"
          id="back-to-home"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </Link>
      </div>

      <SplitDayFlow />
    </div>
  );
}

