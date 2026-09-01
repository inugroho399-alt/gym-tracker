"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, History, TrendingUp, Target, Activity, Flame } from "lucide-react";
import { getWorkoutEntries } from "@/lib/storage";
import type { WorkoutEntry } from "@/types/workout";

export default function HomePage() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(getWorkoutEntries());
    setMounted(true);
  }, []);

  // Compute stats
  const totalWorkouts = entries.length;
  const totalVolume = entries.reduce((sum, entry) => {
    return sum + entry.sets.reduce((setSum, set) => setSum + set.reps * set.weight, 0);
  }, 0);
  const totalSets = entries.reduce((sum, entry) => sum + entry.sets.length, 0);

  const stats = [
    { label: "Total Sesi", value: totalWorkouts, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Volume (kg)", value: totalVolume.toLocaleString(), icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Total Set", value: totalSets, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  if (!mounted) return null; // prevent hydration mismatch

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Siap hancurkan rekor hari ini?
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 tracking-tight">
          Lacak, Pantau, <br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Berkembang.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          Ubah setiap keringat menjadi data. Pantau progres latihanmu dengan analitik real-time.
        </p>
      </motion.div>

      {/* Quick Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-3 sm:gap-4"
      >
        {stats.map((stat, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-900/40 p-4 sm:p-5 backdrop-blur-sm group hover:bg-gray-900/60 transition-colors">
            <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Main Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <Link
          href="/add"
          className="group relative flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white font-bold text-lg shadow-xl shadow-indigo-500/25 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          <Plus className="w-5 h-5 relative z-10" strokeWidth={3} />
          <span className="relative z-10">Mulai Latihan Baru</span>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/history"
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border border-white/5 bg-gray-900/50 hover:bg-white/5 hover:border-white/10 text-gray-300 hover:text-white font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <History className="w-6 h-6 text-gray-400" />
            <span>Riwayat Sesi</span>
          </Link>

          <Link
            href="/progress"
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border border-white/5 bg-gray-900/50 hover:bg-white/5 hover:border-white/10 text-gray-300 hover:text-white font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <span>Grafik Progress</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
