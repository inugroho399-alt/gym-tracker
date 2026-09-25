"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { WorkoutSession } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

const ProgressChart = dynamic(() => import("@/components/ProgressChart"), {
  ssr: false,
  loading: () => <div className="h-[240px] flex items-center justify-center text-xs text-neutral-500">Memuat grafik...</div>,
});

type Metric = "maxWeight" | "totalVolume";

export interface ChartPoint {
  date: string;
  value: number;
}

function buildChartData(sessions: WorkoutSession[], exerciseId: string, metric: Metric): ChartPoint[] {
  const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const points: ChartPoint[] = [];

  for (const session of sorted) {
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;

    const dateLabel = new Date(session.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    let value = 0;
    if (metric === "maxWeight") {
      const prSets = ex.sets.filter((s) => s.type === "PR");
      if (prSets.length > 0) {
        value = Math.max(...prSets.map((s) => s.weight));
      } else {
        value = ex.sets.length > 0 ? Math.max(...ex.sets.map((s) => s.weight)) : 0;
      }
    } else {
      value = ex.sets.reduce((sum, s) => sum + (s.reps * s.weight), 0);
    }

    points.push({ date: dateLabel, value });
  }

  return points;
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [metric, setMetric] = useState<Metric>("maxWeight");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = getWorkoutSessions();
    setSessions(loaded);
    setMounted(true);

    if (loaded.length > 0) {
      for (const sess of loaded) {
        if (sess.exercises.length > 0) {
          setSelectedId(sess.exercises[0].exerciseId);
          break;
        }
      }
    }
  }, []);

  const uniqueExercises = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        map.set(ex.exerciseId, ex.exerciseName);
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const chartData = useMemo(() => {
    if (!selectedId) return [];
    return buildChartData(sessions, selectedId, metric);
  }, [sessions, selectedId, metric]);

  if (!mounted) return <div className="py-12" />;

  const values = chartData.map((d) => d.value);
  const peak = values.length > 0 ? Math.max(...values) : 0;
  const current = values.length > 0 ? values[values.length - 1] : 0;
  const unit = "kg";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Progres
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Grafik beban dan volume latihan dari waktu ke waktu.
        </p>
      </div>

      {uniqueExercises.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-sm text-neutral-400">Belum ada data latihan untuk ditampilkan.</p>
          <Link
            href="/add"
            className="inline-block text-xs px-4 py-2 rounded-md bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
          >
            Mulai Latihan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls: Exercise Dropdown & Metric Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-600 transition-colors"
            >
              {uniqueExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setMetric("maxWeight")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  metric === "maxWeight"
                    ? "bg-neutral-800 text-white font-medium"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Beban Maks
              </button>
              <button
                type="button"
                onClick={() => setMetric("totalVolume")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  metric === "totalVolume"
                    ? "bg-neutral-800 text-white font-medium"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Total Volume
              </button>
            </div>
          </div>

          {/* Stats summary row */}
          {chartData.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1 border-t border-neutral-900">
              <span>Rekor: <strong className="text-white font-medium">{peak} {unit}</strong></span>
              <span>•</span>
              <span>Terkini: <strong className="text-white font-medium">{current} {unit}</strong></span>
              <span>•</span>
              <span>{chartData.length} sesi</span>
            </div>
          )}

          {/* Chart Board */}
          {chartData.length < 2 ? (
            <div className="border border-neutral-900 rounded-xl p-8 text-center text-xs text-neutral-400 bg-neutral-950/40">
              Butuh minimal 2 sesi untuk menampilkan grafik tren.
            </div>
          ) : (
            <div className="border border-neutral-900 rounded-xl p-4 bg-neutral-950/40">
              <ProgressChart data={chartData} unit={unit} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
