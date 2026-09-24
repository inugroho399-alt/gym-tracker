"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Dumbbell, 
  Flame, 
  Zap, 
  Footprints, 
  Activity, 
  Moon, 
  ArrowRight, 
  Trophy, 
  History,
  TrendingUp
} from "lucide-react";
import { getWorkoutSessions } from "@/lib/storage";
import { splitTemplates } from "@/lib/templates";
import type { WorkoutSession, SplitDay } from "@/types/workout";

const SPLIT_METADATA: Record<SplitDay, { label: string; focus: string; icon: any; tag: string }> = {
  Push: { label: "Push Day", focus: "Dada, Bahu Depan/Samping & Triceps", icon: Flame, tag: "CHEST • DELTS • TRIS" },
  Pull: { label: "Pull Day", focus: "Punggung, Biceps & Rear Delts", icon: Zap, tag: "BACK • BICEPS • TRAPS" },
  Arms: { label: "Arms & Shoulders", focus: "Bahu, Triceps & Biceps Isolasi", icon: Dumbbell, tag: "DELTS • TRIS • BICEPS" },
  Legs: { label: "Legs Day", focus: "Quads, Hamstrings & Betis", icon: Footprints, tag: "QUADS • HAMS • CALVES" },
  Upper: { label: "Upper Body", focus: "Kombinasi Seluruh Tubuh Atas", icon: Activity, tag: "FULL UPPER TORSO" },
  Lower: { label: "Lower Body", focus: "Kaki Bawah, Panggul & Abs", icon: Footprints, tag: "LOWER CHAIN & CORE" },
  Rest: { label: "Rest Day", focus: "Regenerasi Sendi, Tidur & Nutrisi", icon: Moon, tag: "RECOVERY & MOBILITY" },
};

const NEXT_SPLIT_SEQUENCE: Record<SplitDay, SplitDay> = {
  Push: "Pull",
  Pull: "Arms",
  Arms: "Legs",
  Legs: "Rest",
  Rest: "Push",
  Upper: "Lower",
  Lower: "Rest",
};

export default function HomePage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSessions(getWorkoutSessions());
    setMounted(true);
  }, []);

  // Compute telemetry
  const totalWorkouts = sessions.length;
  let totalVolumeKg = 0;
  let totalSets = 0;
  let prSetsCount = 0;

  sessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      totalSets += ex.sets.length;
      ex.sets.forEach((set) => {
        totalVolumeKg += set.reps * set.weight;
        if (set.type === "PR") {
          prSetsCount += 1;
        }
      });
    });
  });

  const lastSession = sessions.length > 0 ? sessions[0] : null;

  // Determine suggested next routine
  const suggestedSplit: SplitDay = useMemo(() => {
    if (!lastSession) return "Push";
    return NEXT_SPLIT_SEQUENCE[lastSession.day] || "Push";
  }, [lastSession]);

  const suggestedMeta = SPLIT_METADATA[suggestedSplit];
  const suggestedTemplate = splitTemplates[suggestedSplit];

  const formattedTonnage = useMemo(() => {
    if (totalVolumeKg >= 1000) {
      return {
        value: (totalVolumeKg / 1000).toFixed(1),
        unit: "TON",
      };
    }
    return {
      value: totalVolumeKg.toLocaleString("id-ID"),
      unit: "KG",
    };
  }, [totalVolumeKg]);

  const lastSessionDateStr = useMemo(() => {
    if (!lastSession) return null;
    const diffDays = Math.floor((Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    return `${diffDays} hari lalu`;
  }, [lastSession]);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 rounded-xl bg-carbon-900 border border-carbon-800" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-carbon-900 border border-carbon-800" />
          ))}
        </div>
        <div className="h-44 rounded-xl bg-carbon-900 border border-carbon-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in pb-12">
      {/* Top Banner / Next Routine Recommendation */}
      <section className="relative overflow-hidden rounded-xl border border-carbon-750 bg-gradient-to-b from-carbon-850 to-carbon-900 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-carbon-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-volt-400" />
            <span className="font-mono uppercase tracking-wider text-slate-300 font-bold">
              {lastSessionDateStr ? `Latihan Terakhir: ${lastSessionDateStr} (${lastSession?.day})` : "Sesi Pertama Belum Dicatat"}
            </span>
          </div>
          <span className="font-mono text-carbon-500 text-[11px] tracking-tight">
            TARGET // OVERLOAD
          </span>
        </div>

        <div className="pt-4 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded bg-volt-500/10 text-volt-400 border border-volt-500/20">
                REKOMENDASI ROTASI
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {suggestedMeta.tag}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {suggestedMeta.label}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Fokus: <span className="text-slate-100 font-semibold">{suggestedMeta.focus}</span>.
              {suggestedTemplate.exercises.length > 0 && (
                <span className="text-slate-400 block sm:inline sm:ml-1 mt-1 sm:mt-0 font-normal">
                  ({suggestedTemplate.exercises.length} gerakan terprogram)
                </span>
              )}
            </p>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/add?day=${suggestedSplit}`}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-volt-500 hover:bg-volt-400 active:scale-[0.99] text-carbon-950 font-extrabold text-sm tracking-wider uppercase transition-all shadow-lg shadow-volt-500/10"
            >
              <span>Mulai Sesi {suggestedSplit}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <Link
              href="/add"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-carbon-700 bg-carbon-800/80 hover:bg-carbon-750 text-slate-200 text-xs font-bold tracking-wider uppercase transition-all"
            >
              Pilih Split Lain
            </Link>
          </div>
        </div>
      </section>

      {/* Telemetry Grid */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-volt-400" />
            Statistik Angkatan
          </h2>
          <span className="text-[11px] font-mono text-carbon-500">
            ALL-TIME LOGS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Volume */}
          <div className="rounded-lg border border-carbon-800 bg-carbon-900/90 p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Total Tonase
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
                {formattedTonnage.value}
              </span>
              <span className="text-xs font-mono text-volt-400 font-bold">
                {formattedTonnage.unit}
              </span>
            </div>
            <span className="text-[10px] text-carbon-500 mt-1 font-mono">
              Beban kumulatif
            </span>
          </div>

          {/* Sesi */}
          <div className="rounded-lg border border-carbon-800 bg-carbon-900/90 p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Total Sesi
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
                {totalWorkouts}
              </span>
              <span className="text-xs font-mono text-slate-400 font-medium">
                SESI
              </span>
            </div>
            <span className="text-[10px] text-carbon-500 mt-1 font-mono">
              Konsistensi latihan
            </span>
          </div>

          {/* Total Set */}
          <div className="rounded-lg border border-carbon-800 bg-carbon-900/90 p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Total Set
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
                {totalSets}
              </span>
              <span className="text-xs font-mono text-slate-400 font-medium">
                SETS
              </span>
            </div>
            <span className="text-[10px] text-carbon-500 mt-1 font-mono">
              Repetisi tuntas
            </span>
          </div>

          {/* PR Tracked */}
          <div className="rounded-lg border border-carbon-800 bg-carbon-900/90 p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              Rekor PR
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-mono font-bold text-amber-400 tracking-tight tabular-nums">
                {prSetsCount}
              </span>
              <span className="text-xs font-mono text-amber-500/80 font-medium">
                SETS
              </span>
            </div>
            <span className="text-[10px] text-carbon-500 mt-1 font-mono">
              Working sets berat
            </span>
          </div>
        </div>
      </section>

      {/* Quick Launch Split Buttons */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-volt-400" />
            Pilih Menu Hari Ini
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            LANGSUNG CATAT
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(["Push", "Pull", "Arms", "Legs", "Upper", "Lower"] as SplitDay[]).map((day) => {
            const meta = SPLIT_METADATA[day];
            const Icon = meta.icon;
            const isSuggested = day === suggestedSplit;

            return (
              <Link
                key={day}
                href={`/add?day=${day}`}
                className={`group p-3.5 rounded-lg border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSuggested
                    ? "bg-carbon-850 border-volt-500/40 hover:border-volt-400"
                    : "bg-carbon-900/80 border-carbon-800 hover:border-carbon-700 hover:bg-carbon-850"
                }`}
              >
                {isSuggested && (
                  <div className="absolute top-0 right-0 bg-volt-500 text-carbon-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl">
                    REKOMENDASI
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded bg-carbon-800 border border-carbon-750 flex items-center justify-center text-volt-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-mono tracking-wider font-bold text-white uppercase">
                    {day}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {meta.focus}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Navigation Quick Access Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Link
          href="/history"
          className="group p-4 rounded-lg border border-carbon-800 bg-carbon-900/60 hover:bg-carbon-850 hover:border-carbon-700 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-carbon-800 border border-carbon-700/60 flex items-center justify-center text-slate-300 group-hover:text-volt-400 transition-colors">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                Buku Riwayat Latihan
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {sessions.length > 0
                  ? `${sessions.length} sesi terdokumentasi lengkap`
                  : "Belum ada rekaman sesi"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-carbon-500 group-hover:text-volt-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/progress"
          className="group p-4 rounded-lg border border-carbon-800 bg-carbon-900/60 hover:bg-carbon-850 hover:border-carbon-700 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-carbon-800 border border-carbon-700/60 flex items-center justify-center text-volt-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                Grafik Overload & PR
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Analisis kurva kekuatan beban tiap gerakan
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-carbon-500 group-hover:text-volt-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </section>
    </div>
  );
}

