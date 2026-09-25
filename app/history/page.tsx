"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { WorkoutSession, SplitDay } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

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
  return session.exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.reps || 0) * (s.weight || 0)), 0);
  }, 0);
}

const SessionItem = memo(function SessionItem({ 
  session, 
  defaultExpanded = false 
}: { 
  session: WorkoutSession; 
  defaultExpanded?: boolean 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (session.day === "Rest") {
    return (
      <div className="border border-neutral-200 rounded-xl bg-neutral-50/60 p-4 flex items-center justify-between text-xs">
        <div>
          <span className="font-medium text-neutral-900 block">Hari Istirahat</span>
          <span className="text-neutral-500 text-[11px]">Pemulihan & regenerasi</span>
        </div>
        <span className="text-neutral-500">{formatDate(session.date)}</span>
      </div>
    );
  }

  const volume = computeSessionVolume(session);

  return (
    <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              {session.day} Day
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-500">
              {session.exercises.length} gerakan
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {formatDate(session.date)} • {volume.toLocaleString("id-ID")} kg volume
          </p>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-100 px-4 py-3 bg-neutral-50/50 space-y-2.5 text-xs">
          {session.exercises.map((ex) => (
            <div key={ex.exerciseId} className="space-y-1">
              <span className="font-medium text-neutral-800 block">
                {ex.exerciseName}
              </span>
              <div className="flex flex-wrap gap-1.5 text-neutral-600">
                {ex.sets.map((set, j) => (
                  <span
                    key={j}
                    className="inline-block px-2 py-0.5 rounded bg-white border border-neutral-200 text-[11px] text-neutral-700 shadow-2xs"
                  >
                    {set.weight}kg × {set.reps}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

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

  const filteredSessions = useMemo(() => {
    if (filterDay === ALL_VALUE) return sessions;
    return sessions.filter((s) => s.day === filterDay);
  }, [sessions, filterDay]);

  if (!mounted) return <div className="py-12" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Riwayat
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {sessions.length} sesi latihan tersimpan
          </p>
        </div>

        <Link
          href="/add"
          className="text-xs px-3 py-1.5 rounded-md bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors shadow-sm"
        >
          + Catat Sesi
        </Link>
      </div>

      {/* Filter Tabs */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterDay(ALL_VALUE)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              filterDay === ALL_VALUE
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Semua
          </button>
          {SPLIT_DAYS.map((day) => {
            const count = sessions.filter((s) => s.day === day).length;
            if (count === 0) return null;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setFilterDay(day)}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                  filterDay === day
                    ? "bg-neutral-100 text-neutral-900 font-medium"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {day} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-sm text-neutral-500">Belum ada riwayat latihan.</p>
          <Link
            href="/add"
            className="inline-block text-xs px-4 py-2 rounded-md bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
          >
            Catat Latihan Pertama
          </Link>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400">
          Tidak ada sesi untuk filter ini.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSessions.map((session, index) => (
            <SessionItem 
              key={session.id} 
              session={session} 
              defaultExpanded={index === 0} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
