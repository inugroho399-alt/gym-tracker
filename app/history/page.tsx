"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import { 
  Plus, 
  SearchX, 
  Clock, 
  ChevronDown, 
  Moon, 
  Trophy,
  Dumbbell
} from "lucide-react";
import type { WorkoutSession, SplitDay } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

const SPLIT_COLORS: Record<SplitDay, { badge: string; text: string; bg: string }> = {
  Push: { badge: "Push", text: "text-orange-400", bg: "bg-orange-400/10" },
  Pull: { badge: "Pull", text: "text-ios-blue", bg: "bg-ios-blue/10" },
  Arms: { badge: "Arms", text: "text-purple-400", bg: "bg-purple-400/10" },
  Legs: { badge: "Legs", text: "text-ios-green", bg: "bg-ios-green/10" },
  Upper: { badge: "Upper", text: "text-cyan-400", bg: "bg-cyan-400/10" },
  Lower: { badge: "Lower", text: "text-amber-400", bg: "bg-amber-400/10" },
  Rest: { badge: "Rest", text: "text-ios-muted", bg: "bg-ios-elevated" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
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
  defaultExpanded = false 
}: { 
  session: WorkoutSession; 
  defaultExpanded?: boolean 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const colorTheme = SPLIT_COLORS[session.day] || SPLIT_COLORS.Push;

  if (session.day === "Rest") {
    return (
      <article className="rounded-2xl border border-ios-border/60 bg-ios-card p-4 sm:p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ios-elevated flex items-center justify-center text-ios-muted">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-white text-base">
              Hari Istirahat
            </span>
            <p className="text-xs text-ios-muted mt-0.5">
              Pemulihan otot & sistem saraf
            </p>
          </div>
        </div>
        <time
          dateTime={session.date}
          className="text-xs text-ios-muted bg-ios-elevated px-3 py-1.5 rounded-full"
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
    <article className="rounded-2xl border border-ios-border/60 bg-ios-card overflow-hidden shadow-sm transition-colors hover:border-ios-separator">
      {/* Header / Accordion trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-ios-cardHover/50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorTheme.bg} ${colorTheme.text}`}>
            {session.day} Day
          </span>
          <div>
            <span className="text-base font-semibold text-white block">
              {totalExercises} Gerakan
            </span>
            <span className="text-xs text-ios-muted">
              Volume: {sessionVolume.toLocaleString("id-ID")} kg
              {prCount > 0 && (
                <span className="text-amber-400 ml-2 font-medium inline-flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 inline" /> {prCount} PR
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-ios-border/60">
          <time
            dateTime={session.date}
            className="flex items-center gap-1.5 text-xs text-ios-muted"
          >
            <Clock className="w-3.5 h-3.5" />
            {formatDate(session.date)}
          </time>
          
          <ChevronDown
            className={`w-4 h-4 text-ios-muted transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="border-t border-ios-border/60 bg-ios-card p-4 sm:p-5 space-y-4">
          {session.exercises.map((ex, exIndex) => (
            <div key={ex.exerciseId} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ios-elevated text-ios-muted text-[11px] flex items-center justify-center">
                    {exIndex + 1}
                  </span>
                  <span>{ex.exerciseName}</span>
                </div>
                <span className="text-xs text-ios-muted font-normal">
                  {ex.sets.length} set
                </span>
              </div>

              {/* Sets chips */}
              <div className="flex flex-wrap gap-2 pl-7">
                {ex.sets.map((set, j) => {
                  const isPR = set.type === "PR";
                  return (
                    <div
                      key={`${ex.exerciseId}-set-${j}`}
                      className={`flex items-center rounded-lg border text-xs px-2.5 py-1 ${
                        isPR
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-medium"
                          : "bg-ios-elevated/50 border-ios-border text-white"
                      }`}
                    >
                      <span className="text-[11px] text-ios-muted mr-1.5">
                        {isPR ? "PR" : `#${j + 1}`}
                      </span>
                      <span className="font-semibold">
                        {set.weight} kg × {set.reps} reps
                      </span>
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
    <div className="rounded-2xl border border-ios-border/60 bg-ios-card p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 text-ios-blue flex items-center justify-center mx-auto">
        <Dumbbell className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-semibold">
          Belum Ada Catatan Latihan
        </p>
        <p className="text-ios-muted text-xs max-w-sm mx-auto">
          Mulai rekam sesi latihan pertamamu. Setiap beban dan repetisi yang kamu selesaikan akan otomatis tersimpan di sini.
        </p>
      </div>
      <Link
        href="/add"
        id="empty-state-add-link"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-ios-blue hover:bg-ios-blue/90 text-white font-semibold text-xs transition-all shadow-md shadow-ios-blue/20"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Catat Latihan Pertama</span>
      </Link>
    </div>
  );
}

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-ios-border/60 bg-ios-card p-8 text-center space-y-3">
      <SearchX className="w-6 h-6 text-ios-muted mx-auto" />
      <p className="text-ios-muted text-xs">
        Tidak ada catatan latihan untuk kategori split ini.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-ios-blue text-xs font-semibold hover:underline transition-colors"
      >
        Tampilkan Semua Sesi
      </button>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-ios-card rounded-2xl" />
      <div className="h-28 bg-ios-card rounded-2xl" />
      <div className="h-28 bg-ios-card rounded-2xl" />
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
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Riwayat Latihan
          </h1>
          <p className="text-ios-muted text-sm mt-0.5">
            Semua catatan sesi latihan yang telah kamu simpan.
          </p>
        </div>

        {hasAnySessions && (
          <Link
            href="/add"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-ios-blue hover:bg-ios-blue/90 text-white font-semibold text-xs transition-all shadow-md shadow-ios-blue/20 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Latihan Baru</span>
          </Link>
        )}
      </div>

      {hasAnySessions && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterDay(ALL_VALUE)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterDay === ALL_VALUE
                ? "bg-white text-black shadow-sm"
                : "bg-ios-card text-ios-muted hover:text-white border border-ios-border"
            }`}
          >
            Semua ({sessions.length})
          </button>
          {SPLIT_DAYS.map((day) => {
            const count = sessions.filter((s) => s.day === day).length;
            if (count === 0) return null;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setFilterDay(day)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterDay === day
                    ? "bg-white text-black shadow-sm"
                    : "bg-ios-card text-ios-muted hover:text-white border border-ios-border"
                }`}
              >
                {day} ({count})
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
              defaultExpanded={index === 0} 
            />
          ))}

          {filteredSessions.length > displayLimit && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 20)}
                className="px-5 py-2.5 rounded-full bg-ios-card hover:bg-ios-cardHover text-white text-xs font-semibold border border-ios-border transition-colors"
              >
                Tampilkan Sesi Lainnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
