import type { Metadata } from "next";
import Link from "next/link";
import WorkoutForm from "@/components/WorkoutForm";

export const metadata: Metadata = {
  title: "Tambah Latihan — Gym Progress Tracker",
  description: "Catat sesi latihan gym baru kamu hari ini.",
};

export default function AddWorkoutPage() {
  return (
    <div className="max-w-lg mx-auto">
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
        <h1 className="text-2xl font-bold text-white">Tambah Latihan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Catat exercise, sets, dan beban yang kamu angkat hari ini.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <WorkoutForm />
      </div>
    </div>
  );
}
