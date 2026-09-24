import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SplitDayFlow from "@/components/SplitDayFlow";

export const metadata: Metadata = {
  title: "Catat Sesi Baru — IRONLOG",
  description: "Pilih menu latihan hari ini dan dokumentasikan repetisi serta beban.",
};

export default function AddWorkoutPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-carbon-800 pb-4 animate-fade-in">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-volt-400">
            SESSION ENTRY
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Catat Latihan Baru
          </h1>
        </div>

        <Link
          href="/"
          id="back-to-home"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-carbon-750 bg-carbon-900 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-carbon-600 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="p-8 text-center font-mono text-xs text-slate-400">
          Memuat program latihan...
        </div>
      }>
        <SplitDayFlow />
      </Suspense>
    </div>
  );
}

