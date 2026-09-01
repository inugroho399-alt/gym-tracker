"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TrendingUp, BarChart2, Plus, Info } from "lucide-react";
import type { Exercise, WorkoutEntry } from "@/types/workout";
import { getExercises, getEntriesForExercise } from "@/lib/storage";

// ─── Dynamic import recharts (client-only, no SSR) ───────────────────────────

const ProgressChart = dynamic(() => import("@/components/ProgressChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex flex-col items-center justify-center gap-3 bg-gray-900/30 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-medium">Memuat grafik interaktif…</p>
    </div>
  ),
});

// ─── Metric definitions ───────────────────────────────────────────────────────

type Metric = "maxWeight" | "totalVolume";

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: "maxWeight", label: "Beban Maksimum", unit: "kg" },
  { value: "totalVolume", label: "Total Volume", unit: "kg" },
];

// ─── Data transform ───────────────────────────────────────────────────────────

export interface ChartPoint {
  date: string;
  value: number;
}

function buildChartData(entries: WorkoutEntry[], metric: Metric): ChartPoint[] {
  return entries.map((entry) => {
    const dateLabel = new Date(entry.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    let value: number;
    if (metric === "maxWeight") {
      value = Math.max(...entry.sets.map((s) => s.weight));
    } else {
      value = entry.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
    }

    return { date: dateLabel, value };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyExerciseState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-gray-900/20 p-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
        <BarChart2 className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="space-y-2">
        <p className="text-xl text-white font-bold tracking-tight">Pilih exercise untuk melihat grafik</p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Pilih salah satu exercise dari dropdown di atas untuk menampilkan tren kekuatan dan volumenmu.
        </p>
      </div>
    </div>
  );
}

function NotEnoughDataState({ name }: { name: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-gray-900/20 p-10 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
        <Info className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="space-y-2">
        <p className="text-xl text-white font-bold tracking-tight">
          Butuh 1 sesi lagi
        </p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Baru ada 1 catatan untuk <span className="text-gray-300 font-medium">{name}</span>.
          Grafik akan muncul setelah kamu menyelesaikan 2 sesi!
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
      >
        <Plus className="w-4 h-4" />
        Tambah Latihan
      </Link>
    </div>
  );
}

function NoDataState({ name }: { name: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-gray-900/20 p-10 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto">
        <TrendingUp className="w-8 h-8 text-gray-500" />
      </div>
      <div className="space-y-2">
        <p className="text-xl text-white font-bold tracking-tight">Belum ada catatan untuk {name}</p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Catat sesi latihan pertamamu untuk exercise ini agar grafiknya mulai terbentuk!
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
      >
        <Plus className="w-4 h-4" />
        Catat Sekarang
      </Link>
    </div>
  );
}

// ─── Stats summary bar ────────────────────────────────────────────────────────

interface StatsBadge {
  label: string;
  value: string;
}

function StatsSummary({ data, metric }: { data: ChartPoint[]; metric: Metric }) {
  const values = data.map((d) => d.value);
  const current = values[values.length - 1];
  const first = values[0];
  const peak = Math.max(...values);
  const delta = current - first;
  const unit = metric === "maxWeight" ? "kg" : "kg";

  const stats: StatsBadge[] = [
    { label: "Sesi", value: `${data.length}×` },
    { label: "Terkini", value: `${current}${unit}` },
    { label: "Tertinggi", value: `${peak}${unit}` },
    {
      label: "Perkembangan",
      value: `${delta > 0 ? "+" : ""}${delta}${unit}`,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-2xl bg-gray-900/50 border border-white/5 p-3 text-center backdrop-blur-sm"
        >
          <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
          <p
            className={`text-sm sm:text-base font-bold tracking-tight ${
              label === "Perkembangan"
                ? delta > 0
                  ? "text-emerald-400"
                  : delta < 0
                  ? "text-red-400"
                  : "text-gray-400"
                : "text-white"
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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [metric, setMetric] = useState<Metric>("maxWeight");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setExercises(getExercises());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setEntries([]);
      return;
    }
    setEntries(getEntriesForExercise(selectedId));
  }, [selectedId]);

  const selectedExercise = exercises.find((ex) => ex.id === selectedId);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (entries.length === 0) return [];
    return buildChartData(entries, metric);
  }, [entries, metric]);

  const metricConfig = METRICS.find((m) => m.value === metric)!;

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Grafik Progress</h1>
          <p className="text-gray-400 text-sm">
            Pantau perkembangan dan tren kekuatan dari waktu ke waktu.
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full sm:w-auto appearance-none rounded-xl bg-gray-900/80 border border-white/10 px-4 py-2.5 pr-10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
          >
            <option value="" disabled>— Pilih Exercise —</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Content area */}
      {!selectedId ? (
        <EmptyExerciseState />
      ) : entries.length === 0 ? (
        <NoDataState name={selectedExercise?.name ?? ""} />
      ) : entries.length < 2 ? (
        <NotEnoughDataState name={selectedExercise?.name ?? ""} />
      ) : (
        <div className="space-y-6">
          {/* Metric toggle */}
          <div className="flex rounded-xl bg-gray-900/60 border border-white/5 p-1.5 gap-1.5 backdrop-blur-sm w-fit mx-auto sm:mx-0">
            {METRICS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetric(m.value)}
                className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  metric === m.value
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Stats summary */}
          <StatsSummary data={chartData} metric={metric} />

          {/* Chart card */}
          <div className="rounded-3xl border border-white/5 bg-gray-900/40 p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white tracking-tight">
                {selectedExercise?.name} <span className="text-gray-500 font-normal ml-1">— {metricConfig.label}</span>
              </h3>
            </div>
            <div className="h-[280px]">
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
