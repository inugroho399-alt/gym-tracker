"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, History, TrendingUp, Target, Activity, Flame, ChevronRight } from "lucide-react";
import { getWorkoutSessions } from "@/lib/storage";
import type { WorkoutSession } from "@/types/workout";

export default function HomePage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSessions(getWorkoutSessions());
    setMounted(true);
  }, []);

  // Compute stats
  const totalWorkouts = sessions.length;
  
  let totalVolume = 0;
  let totalSets = 0;
  
  sessions.forEach(session => {
    session.exercises.forEach(ex => {
      totalSets += ex.sets.length;
      ex.sets.forEach(set => {
        totalVolume += set.reps * set.weight;
      });
    });
  });

  const stats = [
    { label: "Total Sesi", value: totalWorkouts, icon: Activity, color: "text-emerald-400" },
    { label: "Volume (kg)", value: totalVolume.toLocaleString("id-ID"), icon: Flame, color: "text-emerald-400" },
    { label: "Total Set", value: totalSets, icon: Target, color: "text-emerald-400" },
  ];

  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3 pt-2">
          <div className="h-6 w-48 bg-zinc-800 rounded-lg"></div>
          <div className="h-10 w-64 bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-full max-w-sm bg-zinc-800/50 rounded mt-2"></div>
          <div className="h-4 w-64 bg-zinc-800/50 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-zinc-800/30 border border-zinc-800"></div>
          ))}
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-[56px] w-full rounded-xl bg-zinc-800/80"></div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="h-[74px] rounded-xl bg-zinc-800/30 border border-zinc-800"></div>
            <div className="h-[74px] rounded-xl bg-zinc-800/30 border border-zinc-800"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Progressive Overload Tracker
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight leading-tight">
          Lacak Beban, <br className="sm:hidden" />
          <span className="text-emerald-400">Tingkatkan Performa.</span>
        </h1>
        
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">
          Catat setiap set PR & normal secara otomatis. Dapatkan saran kenaikan beban progresif berdasarkan histori latihanmu.
        </p>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-4 pt-2">
        <Link
          href="/add"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-base shadow-lg shadow-emerald-500/10 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Mulai Sesi Latihan</span>
        </Link>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/history"
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-zinc-400" />
              <div className="text-left">
                <p className="text-sm font-semibold">Riwayat Sesi</p>
                <p className="text-xs text-zinc-500">Daftar latihan lalu</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </Link>

          <Link
            href="/progress"
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <p className="text-sm font-semibold">Grafik Progress</p>
                <p className="text-xs text-zinc-500">Tren kekuatan PR</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}

