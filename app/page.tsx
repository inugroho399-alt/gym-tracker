"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getWorkoutSessions } from "@/lib/storage";
import type { WorkoutSession, SplitDay } from "@/types/workout";

const SPLITS: { day: SplitDay; label: string; focus: string }[] = [
  { day: "Push", label: "Push", focus: "Dada, Bahu Depan, Triceps" },
  { day: "Pull", label: "Pull", focus: "Punggung, Biceps, Rear Delts" },
  { day: "Legs", label: "Legs", focus: "Quads, Hamstrings, Betis" },
  { day: "Arms", label: "Arms", focus: "Biceps, Triceps, Bahu Samping" },
  { day: "Upper", label: "Upper", focus: "Dada, Punggung, Bahu, Lengan" },
  { day: "Lower", label: "Lower", focus: "Kaki & Perut" },
  { day: "Rest", label: "Rest", focus: "Pemulihan & Nutrisi" },
];

export default function HomePage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSessions(getWorkoutSessions());
    setMounted(true);
  }, []);

  const lastSession = sessions.length > 0 ? sessions[0] : null;

  const totalVolume = sessions.reduce((acc, sess) => {
    return acc + sess.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((setAcc, s) => setAcc + (s.reps * s.weight), 0);
    }, 0);
  }, 0);

  if (!mounted) {
    return <div className="py-12" />;
  }

  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div>
        <p className="text-xs text-neutral-400 font-medium capitalize">
          {todayStr}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Latihan
        </h1>

        {lastSession && (
          <p className="text-xs text-neutral-400 mt-2">
            Sesi terakhir: <span className="text-neutral-200 font-medium">{lastSession.day} Day</span> • {new Date(lastSession.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </p>
        )}
      </div>

      {/* Routine Selection */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Pilih Rutinitas
        </p>

        <div className="divide-y divide-neutral-900 border border-neutral-900 rounded-xl bg-neutral-950/60 overflow-hidden">
          {SPLITS.map((item) => (
            <Link
              key={item.day}
              href={`/add?day=${item.day}`}
              className="flex items-center justify-between p-3.5 hover:bg-neutral-900/60 transition-colors group"
            >
              <div>
                <span className="text-sm font-medium text-white group-hover:text-neutral-100">
                  {item.label} Day
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {item.focus}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Subtle Stats Summary */}
      {sessions.length > 0 && (
        <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-400">
          <span>{sessions.length} sesi tercatat ({totalVolume.toLocaleString("id-ID")} kg)</span>
          <Link href="/history" className="text-neutral-300 hover:text-white transition-colors">
            Lihat riwayat →
          </Link>
        </div>
      )}
    </div>
  );
}
