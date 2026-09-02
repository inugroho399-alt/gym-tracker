"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import { 
  Plus, 
  NotebookPen, 
  SearchX, 
  Clock, 
  Dumbbell, 
  ChevronDown, 
  Moon, 
  Filter 
} from "lucide-react";
import type { WorkoutSession, SplitDay } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Individual Session Card with Accordion ───────────────────────────────────

const SessionCard = memo(function SessionCard({ 
  session, 
  defaultExpanded = true 
}: { 
  session: WorkoutSession; 
  defaultExpanded?: boolean 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (session.day === "Rest") {
    return (
      <article className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
            <Moon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-zinc-300 text-sm">Rest Day</span>
        </div>
        <time
          dateTime={session.date}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/60 text-xs font-medium text-zinc-400"
        >
          <Clock className="w-3.5 h-3.5" />
          {formatDate(session.date)}
        </time>
      </article>
    );
  }

  const totalExercises = session.exercises.length;

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-colors">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-zinc-800/40 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
            {session.day} Day
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {totalExercises} Gerakan
          </span>
        </div>

        <div className="flex items-center gap-3">
          <time
            dateTime={session.date}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/60 text-xs font-medium text-zinc-400"
          >
            <Clock className="w-3.5 h-3.5" />
            {formatDate(session.date)}
          </time>
          
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* GPU-Accelerated Accordion Content */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-zinc-800/60" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-4 bg-zinc-950/40">
            {session.exercises.map((ex) => (
              <div key={ex.exerciseId} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{ex.exerciseName}</span>
                </div>

                <div className="flex flex-wrap gap-2 pl-5">
                  {ex.sets.map((set, j) => (
                    <div
                      key={`${ex.exerciseId}-set-${j}`}
                      className="flex items-center bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
                    >
                      <span
                        className={`px-2 py-1 text-[11px] font-bold ${
                          set.type === "PR"
                            ? "text-amber-400 bg-amber-500/10 border-r border-amber-500/20"
                            : "text-zinc-400 bg-zinc-800/60 border-r border-zinc-800"
                        }`}
                      >
                        {set.type}
                      </span>
                      <div className="px-2.5 py-1 text-xs font-medium">
                        <span className="text-zinc-100 font-semibold">{set.reps}</span>
                        <span className="text-zinc-500 text-[10px] mx-1">×</span>
                        <span className="text-emerald-400 font-semibold">{set.weight}kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
        <NotebookPen className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-zinc-100 font-bold">Belum ada catatan latihan</p>
        <p className="text-zinc-500 text-xs max-w-xs mx-auto">
          Mulai lacak progresmu. Setiap sesi yang kamu selesaikan akan tersimpan di sini.
        </p>
      </div>
      <Link
        href="/add"
        id="empty-state-add-link"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Mulai Latihan Pertama</span>
      </Link>
    </div>
  );
}

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-3">
      <SearchX className="w-6 h-6 text-zinc-500 mx-auto" />
      <p className="text-zinc-400 text-xs">
        Tidak ada catatan untuk split day ini.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-emerald-400 text-xs font-semibold hover:text-emerald-300 transition-colors"
      >
        Tampilkan Semua Sesi →
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const ALL_VALUE = "__all__";
const SPLIT_DAYS: SplitDay[] = ["Push", "Pull", "Arms", "Legs", "Upper", "Lower", "Rest"];
const INITIAL_LIMIT = 20;

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [filterDay, setFilterDay] = useState<string>(ALL_VALUE);
  const [displayLimit, setDisplayLimit] = useState<number>(INITIAL_LIMIT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSessions(getWorkoutSessions());
    setMounted(true);
  }, []);

  const filteredSessions = useMemo<WorkoutSession[]>(() => {
    if (filterDay === ALL_VALUE) return sessions;
    return sessions.filter((s) => s.day === filterDay);
  }, [sessions, filterDay]);

  const visibleSessions = useMemo<WorkoutSession[]>(() => {
    return filteredSessions.slice(0, displayLimit);
  }, [filteredSessions, displayLimit]);

  if (!mounted) return null;

  const hasAnySessions = sessions.length > 0;
  const hasFilteredResults = filteredSessions.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Riwayat Sesi</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            {hasAnySessions
              ? `${sessions.length} total sesi latihan tercatat.`
              : "Pantau histori latihanmu dari waktu ke waktu."}
          </p>
        </div>

        {hasAnySessions && (
          <div className="relative">
            <select
              value={filterDay}
              onChange={(e) => {
                setFilterDay(e.target.value);
                setDisplayLimit(INITIAL_LIMIT);
              }}
              className="w-full sm:w-auto appearance-none rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2 pr-9 text-zinc-100 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value={ALL_VALUE}>Semua Split Day</option>
              {SPLIT_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day} Day
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>
        )}
      </div>

      {/* Content area */}
      {!hasAnySessions ? (
        <EmptyState />
      ) : !hasFilteredResults ? (
        <EmptyFilterState onReset={() => setFilterDay(ALL_VALUE)} />
      ) : (
        <div className="space-y-3">
          {visibleSessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              defaultExpanded={index < 3}
            />
          ))}

          {filteredSessions.length > displayLimit && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 20)}
                className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all"
              >
                Muat Lebih Banyak ({filteredSessions.length - displayLimit} sesi tersisa)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

