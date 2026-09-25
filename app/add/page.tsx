import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SplitDayFlow from "@/components/SplitDayFlow";

export const metadata: Metadata = {
  title: "Catat Latihan — Gym Tracker",
  description: "Catat beban dan repetisi latihan hari ini.",
};

export default function AddWorkoutPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          ← Kembali
        </Link>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-xs text-neutral-400">Memuat...</div>}>
        <SplitDayFlow />
      </Suspense>
    </div>
  );
}
