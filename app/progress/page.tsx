"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TrendingUp, BarChart2, Plus, Info, ChevronDown } from "lucide-react";
import type { WorkoutSession } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

// ─── Dynamic import recharts (client-only, no SSR) ───────────────────────────

const ProgressChart = dynamic(() => import("@/components/ProgressChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] flex flex-col items-center justify-center gap-2 bg-zinc-900/30 rounded-xl border border-zinc-800">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 text-xs font-medium">Memuat grafik interaktif…</p>
    </div>
  ),
});

// ─── Metric definitions ───────────────────────────────────────────────────────

type Metric = "maxWeight" | "totalVolume";

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: "maxWeight", label: "Beban PR Maksimum", unit: "kg" },
  { value: "totalVolume", label: "Total Volume", unit: "kg" },
];

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
      value = ex.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
    }

    points.push({ date: dateLabel, value });
  }

  return points;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyExerciseState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
        <BarChart2 className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-zinc-100 font-bold">Pilih gerakan untuk melihat grafik</p>
        <p className="text-zinc-500 text-xs max-w-xs mx-auto">
          Pilih salah satu gerakan dari menu di atas untuk menganalisis tren perkembangan kekuatanmu.
        </p>
      </div>
    </div>
  );
}

function NotEnoughDataState({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-4">
      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
        <Info className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-zinc-100 font-bold">Butuh minimal 2 sesi</p>
        <p className="text-zinc-500 text-xs max-w-xs mx-auto">
          Baru ada 1 catatan untuk <span className="text-zinc-200 font-semibold">{name}</span>. Grafik akan muncul setelah kamu menyelesaikan 1 sesi lagi!
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Tambah Latihan</span>
      </Link>
    </div>
  );
}

function StatsSummary({ data, metric }: { data: ChartPoint[]; metric: Metric }) {
  const values = data.map((d) => d.value);
  const current = values[values.length - 1];
  const first = values[0];
  const peak = Math.max(...values);
  const delta = current - first;
  const unit = "kg";

  const stats = [
    { label: "Total Sesi", value: `${data.length}×` },
    { label: "Terkini", value: `${current}${unit}` },
    { label: "Tertinggi", value: `${peak}${unit}` },
    {
      label: "Progress",
      value: `${delta > 0 ? "+" : ""}${delta}${unit}`,
      isDelta: true,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {stats.map(({ label, value, isDelta }) => (
        <div
          key={label}
          className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center"
        >
          <p className="text-[11px] text-zinc-400 font-medium mb-0.5">{label}</p>
          <p
            className={`text-sm sm:text-base font-bold tracking-tight ${
              isDelta
                ? delta > 0
                  ? "text-emerald-400"
                  : delta < 0
                  ? "text-red-400"
                  : "text-zinc-400"
                : "text-zinc-100"
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [metric, setMetric] = useState<Metric>("maxWeight");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadedSessions = getWorkoutSessions();
    setSessions(loadedSessions);
    setMounted(true);

    // Auto-select first available exercise if none selected
    if (loadedSessions.length > 0) {
      for (const sess of loadedSessions) {
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

  const selectedExercise = uniqueExercises.find((ex) => ex.id === selectedId);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!selectedId) return [];
    return buildChartData(sessions, selectedId, metric);
  }, [sessions, selectedId, metric]);

  const metricConfig = METRICS.find((m) => m.value === metric)!;

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Grafik Progress</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Pantau perkembangan dan tren kekuatan dari waktu ke waktu.
          </p>
        </div>

        {uniqueExercises.length > 0 && (
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2 pr-9 text-zinc-100 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" disabled>— Pilih Exercise —</option>
              {uniqueExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>
        )}
      </div>

      {/* Content area */}
      {!selectedId ? (
        <EmptyExerciseState />
      ) : chartData.length < 2 ? (
        <NotEnoughDataState name={selectedExercise?.name ?? ""} />
      ) : (
        <div className="space-y-4">
          {/* Metric toggle */}
          <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-1 gap-1 w-fit">
            {METRICS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetric(m.value)}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                  metric === m.value
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Stats summary */}
          <StatsSummary data={chartData} metric={metric} />

          {/* Chart card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-zinc-100 text-sm sm:text-base">
                {selectedExercise?.name} <span className="text-zinc-500 font-normal text-xs sm:text-sm ml-1">— {metricConfig.label}</span>
              </h3>
            </div>
            <div className="h-[260px]">
              <ProgressChart
                data={chartData}
                unit={metricConfig.unit}
                metric={metric}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

