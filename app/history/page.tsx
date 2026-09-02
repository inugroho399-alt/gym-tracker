"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, NotebookPen, SearchX, Clock, Dumbbell } from "lucide-react";
import type { WorkoutSession, SplitDay } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SessionCard({ session }: { session: WorkoutSession }) {
  if (session.day === "Rest") {
    return (
      <article className="group rounded-2xl border border-white/5 bg-gray-900/40 p-5 flex items-center justify-between hover:bg-gray-900/60 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="text-2xl">😴</div>
          <h3 className="font-bold text-gray-300 text-lg tracking-tight">Rest Day</h3>
        </div>
        <time
          dateTime={session.date}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-400"
        >
          <Clock className="w-3.5 h-3.5" />
          {formatDate(session.date)}
        </time>
      </article>
    );
  }

  return (
    <article className="group rounded-2xl border border-white/5 bg-gray-900/40 p-5 space-y-4 hover:bg-gray-900/60 hover:border-white/10 transition-all duration-300">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm border border-indigo-500/30">
            {session.day} Day
          </span>
        </div>
        <time
          dateTime={session.date}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-400 shrink-0"
        >
          <Clock className="w-3.5 h-3.5" />
          {formatDate(session.date)}
        </time>
      </div>

      {/* Exercises */}
      <div className="space-y-4 pt-2">
        {session.exercises.map((ex, i) => (
          <div key={i} className="border-t border-white/5 pt-3 first:border-0 first:pt-0">
            <h4 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-gray-500" />
              {ex.exerciseName}
            </h4>
            <div className="flex flex-wrap gap-2">
              {ex.sets.map((set, j) => (
                <div
                  key={j}
                  className="flex items-center bg-gray-950/50 rounded-xl overflow-hidden border border-white/5"
                >
                  <span
                    className={`px-2.5 py-1.5 text-xs font-bold ${
                      set.type === "PR"
                        ? "text-amber-400 bg-amber-500/10"
                        : "text-gray-400 bg-white/5"
                    }`}
                  >
                    {set.type}
                  </span>
                  <div className="px-3 py-1.5 text-sm">
                    <span className="font-semibold text-white">{set.reps}</span>
                    <span className="text-gray-500 text-xs mx-1">x</span>
                    <span className="font-semibold text-indigo-400 ml-1">{set.weight}kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-gray-900/20 p-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
        <NotebookPen className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="space-y-2">
        <p className="text-xl text-white font-bold tracking-tight">Belum ada catatan latihan</p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Mulai lacak progresmu sekarang. Setiap repetisi dan beban yang kamu angkat akan tercatat di sini.
        </p>
      </div>
      <Link
        href="/add"
        id="empty-state-add-link"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
      >
        <Plus className="w-4 h-4" />
        Tambah Latihan Pertama
      </Link>
    </div>
  );
}

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-gray-900/20 p-10 text-center space-y-4">
      <SearchX className="w-8 h-8 text-gray-600 mx-auto" />
      <p className="text-gray-400 text-sm">
        Tidak ada catatan untuk split day ini.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors"
      >
        Tampilkan semua sesi →
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ALL_VALUE = "__all__";
const SPLIT_DAYS: SplitDay[] = ["Push", "Pull", "Arms", "Legs", "Upper", "Lower", "Rest"];

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [filterDay, setFilterDay] = useState<string>(ALL_VALUE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSessions(getWorkoutSessions());
    setMounted(true);
  }, []);

  const filteredSessions = useMemo<WorkoutSession[]>(() => {
    if (filterDay === ALL_VALUE) return sessions;
    return sessions.filter((s) => s.day === filterDay);
  }, [sessions, filterDay]);

  if (!mounted) return null;

  const hasAnySessions = sessions.length > 0;
  const hasFilteredResults = filteredSessions.length > 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Riwayat Sesi</h1>
          <p className="text-gray-400 text-sm">
            {hasAnySessions
              ? `${sessions.length} sesi latihan tercatat.`
              : "Pantau sejarah perjuanganmu."}
          </p>
        </div>

        {hasAnySessions && (
          <div className="relative">
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-xl bg-gray-900/80 border border-white/10 px-4 py-2.5 pr-10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
            >
              <option value={ALL_VALUE}>Semua Split Day</option>
              {SPLIT_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day} Day
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      {!hasAnySessions ? (
        <EmptyState />
      ) : !hasFilteredResults ? (
        <EmptyFilterState onReset={() => setFilterDay(ALL_VALUE)} />
      ) : (
        <div className="grid gap-4" id="session-list">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {hasAnySessions && (
        <div className="pt-4 pb-10">
          <Link
            href="/add"
            className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Catat Latihan Baru
          </Link>
        </div>
      )}
    </div>
  );
}
