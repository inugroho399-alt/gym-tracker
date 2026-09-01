"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, NotebookPen, SearchX, Clock, MessageSquare } from "lucide-react";
import type { Exercise, WorkoutEntry } from "@/types/workout";
import { getExercises, getWorkoutEntries } from "@/lib/storage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface EntryCardProps {
  entry: WorkoutEntry;
  exerciseName: string;
}

function EntryCard({ entry, exerciseName }: EntryCardProps) {
  return (
    <article className="group rounded-2xl border border-white/5 bg-gray-900/40 p-5 space-y-4 hover:bg-gray-900/60 hover:border-white/10 transition-all duration-300">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-white text-lg tracking-tight">
          {exerciseName}
        </h3>
        <time
          dateTime={entry.date}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-400 shrink-0"
        >
          <Clock className="w-3.5 h-3.5" />
          {formatDate(entry.date)}
        </time>
      </div>

      {/* Sets */}
      <div className="flex flex-wrap gap-2">
        {entry.sets.map((set, i) => (
          <div
            key={set.id}
            className="flex items-center bg-gray-950/50 rounded-xl overflow-hidden border border-white/5"
          >
            <span className="px-2.5 py-1.5 text-xs font-bold text-gray-500 bg-white/5">
              S{i + 1}
            </span>
            <div className="px-3 py-1.5 text-sm">
              <span className="font-semibold text-white">{set.reps}</span>
              <span className="text-gray-500 text-xs mx-1">reps</span>
              <span className="text-gray-600">·</span>
              <span className="font-semibold text-indigo-400 ml-1">{set.weight}kg</span>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      {entry.note && (
        <div className="flex items-start gap-2 pt-3 border-t border-white/5 text-sm text-gray-400">
          <MessageSquare className="w-4 h-4 mt-0.5 opacity-50 shrink-0" />
          <p className="leading-relaxed">{entry.note}</p>
        </div>
      )}
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
        Tidak ada catatan untuk exercise ini.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors"
      >
        Tampilkan semua exercise →
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ALL_VALUE = "__all__";

export default function HistoryPage() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterExerciseId, setFilterExerciseId] = useState<string>(ALL_VALUE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(getWorkoutEntries());
    setExercises(getExercises());
    setMounted(true);
  }, []);

  const exerciseMap = useMemo<Map<string, string>>(() => {
    return new Map(exercises.map((ex) => [ex.id, ex.name]));
  }, [exercises]);

  const exercisesWithEntries = useMemo<Exercise[]>(() => {
    const usedIds = new Set(entries.map((e) => e.exerciseId));
    return exercises.filter((ex) => usedIds.has(ex.id));
  }, [entries, exercises]);

  const filteredEntries = useMemo<WorkoutEntry[]>(() => {
    if (filterExerciseId === ALL_VALUE) return entries;
    return entries.filter((e) => e.exerciseId === filterExerciseId);
  }, [entries, filterExerciseId]);

  if (!mounted) return null;

  const hasAnyEntries = entries.length > 0;
  const hasFilteredResults = filteredEntries.length > 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Riwayat Sesi</h1>
          <p className="text-gray-400 text-sm">
            {hasAnyEntries
              ? `${entries.length} sesi latihan tercatat.`
              : "Pantau sejarah perjuanganmu."}
          </p>
        </div>

        {hasAnyEntries && (
          <div className="relative">
            <select
              value={filterExerciseId}
              onChange={(e) => setFilterExerciseId(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-xl bg-gray-900/80 border border-white/10 px-4 py-2.5 pr-10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
            >
              <option value={ALL_VALUE}>Semua Exercise</option>
              {exercisesWithEntries.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
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
      {!hasAnyEntries ? (
        <EmptyState />
      ) : !hasFilteredResults ? (
        <EmptyFilterState onReset={() => setFilterExerciseId(ALL_VALUE)} />
      ) : (
        <div className="grid gap-4" id="entry-list">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              exerciseName={
                exerciseMap.get(entry.exerciseId) ?? "Exercise tidak dikenal"
              }
            />
          ))}
        </div>
      )}

      {hasAnyEntries && (
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
