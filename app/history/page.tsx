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
  Trophy
} from "lucide-react";
import type { WorkoutSession, SplitDay } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

const SPLIT_THEMES: Record<SplitDay, { badge: string; text: string; bg: string; border: string }> = {
  Push: { badge: "PUSH", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  Pull: { badge: "PULL", text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  Arms: { badge: "ARMS", text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  Legs: { badge: "LEGS", text: "text-volt-400", bg: "bg-volt-500/10", border: "border-volt-500/30" },
  Upper: { badge: "UPPER", text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  Lower: { badge: "LOWER", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  Rest: { badge: "REST", text: "text-slate-400", bg: "bg-slate-800", border: "border-slate-700" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function computeSessionVolume(session: WorkoutSession): number {
  let volume = 0;
  session.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      volume += (s.reps || 0) * (s.weight || 0);
    });
  });
  return volume;
}

function countPRSets(session: WorkoutSession): number {
  let count = 0;
  session.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.type === "PR") count++;
    });
  });
  return count;
}

// ─── Individual Session Card ──────────────────────────────────────────────────

const SessionCard = memo(function SessionCard({ 
  session, 
  defaultExpanded = true 
}: { 
  session: WorkoutSession; 
  defaultExpanded?: boolean 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const theme = SPLIT_THEMES[session.day] || SPLIT_THEMES.Push;

  if (session.day === "Rest") {
    return (
      <article className="rounded-xl border border-carbon-800 bg-carbon-900/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-slate-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm uppercase tracking-wide">
              Rest & Recovery Day
            </span>
            <p className="text-[11px] text-slate-400 font-mono">
              Pemulihan otot & sistem saraf
            </p>
          </div>
        </div>
        <time
          dateTime={session.date}
          className="font-mono text-xs text-slate-400 bg-carbon-850 px-2.5 py-1 rounded border border-carbon-750"
        >
          {formatDate(session.date)}
        </time>
      </article>
    );
  }

  const totalExercises = session.exercises.length;
  const sessionVolume = computeSessionVolume(session);
  const prCount = countPRSets(session);

  return (
    <article className="rounded-xl border border-carbon-800 bg-carbon-900 overflow-hidden shadow-sm transition-colors">
      {/* Header / Accordion trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-carbon-850/60 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-black border uppercase tracking-wider ${theme.bg} ${theme.text} ${theme.border}`}>
            {session.day}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white uppercase tracking-tight">
              {totalExercises} Gerakan
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              Volume: {sessionVolume.toLocaleString("id-ID")} kg
              {prCount > 0 && (
                <span className="text-amber-400 ml-2 font-bold inline-flex items-center gap-1">
                  <Trophy className="w-3 h-3 inline" /> {prCount} PR
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-carbon-800">
          <time
            dateTime={session.date}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400"
          >
            <Clock className="w-3 h-3 text-slate-500" />
            {formatDate(session.date)}
          </time>
          
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="border-t border-carbon-800 bg-carbon-950/60 p-4 space-y-4">
          {session.exercises.map((ex, exIndex) => (
            <div key={ex.exerciseId} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-volt-400">
                    {(exIndex + 1).toString().padStart(2, "0")}
                  </span>
                  <span>{ex.exerciseName}</span>
                </div>
                <span className="text-[11px] font-mono text-carbon-500 font-normal">
                  {ex.sets.length} sets
                </span>
              </div>

              {/* Sets chips */}
              <div className="flex flex-wrap gap-2 pl-4">
                {ex.sets.map((set, j) => {
                  const isPR = set.type === "PR";
                  return (
                    <div
                      key={`${ex.exerciseId}-set-${j}`}
                      className={`flex items-center rounded border overflow-hidden font-mono text-xs ${
                        isPR
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-carbon-900 border-carbon-750"
                      }`}
                    >
                      <span
                        className={`px-1.5 py-1 text-[10px] font-black uppercase border-r ${
                          isPR
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-carbon-800 text-slate-400 border-carbon-750"
                        }`}
                      >
                        {isPR ? "PR" : `#${j + 1}`}
                      </span>
                      <div className="px-2 py-1 font-bold text-slate-100 tabular-nums">
                        <span>{set.reps}</span>
                        <span className="text-slate-500 text-[10px] mx-1">×</span>
                        <span className={isPR ? "text-amber-400" : "text-white"}>
                          {set.weight}kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-carbon-800 bg-carbon-900/40 p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center mx-auto text-volt-400">
        <NotebookPen className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-extrabold uppercase tracking-wide">
          Buku Latihan Masih Bersih
        </p>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          Mulai rekam sesi latihan pertamamu. Setiap beban dan repetisi yang kamu selesaikan akan otomatis tercatat di sini.
        </p>
      </div>
      <Link
        href="/add"
        id="empty-state-add-link"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-volt-500 hover:bg-volt-400 text-carbon-950 font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Catat Latihan Pertama</span>
      </Link>
    </div>
  );
}

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-carbon-800 bg-carbon-900/40 p-8 text-center space-y-3">
      <SearchX className="w-6 h-6 text-slate-500 mx-auto" />
      <p className="text-slate-400 text-xs font-mono">
        Tidak ada catatan latihan untuk kategori split ini.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-volt-400 text-xs font-mono font-bold hover:underline transition-colors uppercase tracking-wider"
      >
        ← Tampilkan Semua Sesi
      </button>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-carbon-900 rounded-lg" />
      <div className="h-28 bg-carbon-900 rounded-xl" />
      <div className="h-28 bg-carbon-900 rounded-xl" />
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

  if (!mounted) return <HistorySkeleton />;

  const hasAnySessions = sessions.length > 0;
  const hasFilteredResults = filteredSessions.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-carbon-800 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-volt-400">
            TRAINING LEDGER
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Riwayat Sesi
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 font-mono">
            {hasAnySessions
              ? `${sessions.length} total sesi angkatan tercatat.`
              : "Dokumentasi perkembangan latihan angkat beban."}
          </p>
        </div>

        {/* Quick Add Button */}
        <Link
          href="/add"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-volt-500 hover:bg-volt-400 text-carbon-950 font-extrabold text-xs uppercase tracking-wider transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Sesi Baru</span>
        </Link>
      </div>

      {/* Horizontal Tactical Filter Bar */}
      {hasAnySessions && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setFilterDay(ALL_VALUE)}
            className={`px-3 py-1.5 rounded-md uppercase whitespace-nowrap transition-all ${
              filterDay === ALL_VALUE
                ? "bg-volt-500 text-carbon-950 shadow-sm"
                : "bg-carbon-900 text-slate-400 hover:text-white border border-carbon-800"
            }`}
          >
            Semua ({sessions.length})
          </button>
          {SPLIT_DAYS.map((day) => {
            const count = sessions.filter((s) => s.day === day).length;
            const isActive = filterDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setFilterDay(day)}
                className={`px-3 py-1.5 rounded-md uppercase whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-volt-500 text-carbon-950 shadow-sm"
                    : "bg-carbon-900 text-slate-400 hover:text-white border border-carbon-800"
                }`}
              >
                {day} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
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
              defaultExpanded={index < 2}
            />
          ))}

          {filteredSessions.length > displayLimit && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 20)}
                className="px-5 py-2.5 rounded-lg border border-carbon-750 bg-carbon-900 hover:bg-carbon-850 text-slate-200 text-xs font-mono font-bold uppercase tracking-wider transition-all"
              >
                Muat Lebih Banyak ({filteredSessions.length - displayLimit} Sesi Tersisa)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

