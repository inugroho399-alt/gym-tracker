"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TrendingUp, BarChart2, Plus, Info, ChevronDown, Trophy, Activity, Target } from "lucide-react";
import type { WorkoutSession } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

// ─── Dynamic import recharts (client-only, no SSR) ───────────────────────────

const ProgressChart = dynamic(() => import("@/components/ProgressChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] flex flex-col items-center justify-center gap-2 bg-carbon-900/40 rounded-xl border border-carbon-800">
      <div className="w-6 h-6 border-2 border-volt-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-xs font-mono">Memuat kurva telemetri beban…</p>
    </div>
  ),
});

// ─── Metric definitions ───────────────────────────────────────────────────────

type Metric = "maxWeight" | "totalVolume";

const METRICS: { value: Metric; label: string; unit: string; description: string }[] = [
  { value: "maxWeight", label: "Beban PR Maks", unit: "kg", description: "Beban angkatan tertinggi tiap sesi" },
  { value: "totalVolume", label: "Total Volume", unit: "kg", description: "Akumulasi Repetisi × Beban" },
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
    <div className="rounded-xl border border-dashed border-carbon-800 bg-carbon-900/40 p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center mx-auto text-volt-400">
        <BarChart2 className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-extrabold uppercase tracking-wide">
          Pilih Gerakan Untuk Dianalisis
        </p>
        <p className="text-slate-400 text-xs max-w-xs mx-auto">
          Pilih salah satu gerakan latihan di atas untuk memantau kurva kekuatan & progressive overload kamu.
        </p>
      </div>
    </div>
  );
}

function NotEnoughDataState({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-carbon-800 bg-carbon-900/40 p-8 text-center space-y-4">
      <div className="w-10 h-10 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center mx-auto text-volt-400">
        <Info className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-extrabold uppercase tracking-wide">
          Butuh Minimal 2 Sesi
        </p>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          Baru ada 1 catatan untuk <strong className="text-slate-200">{name}</strong>. Grafik tren perkembangan akan aktif otomatis setelah kamu menyelesaikan 1 sesi lagi.
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-volt-500 hover:bg-volt-400 text-carbon-950 font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Catat Sesi Baru</span>
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
    { label: "ALL-TIME PR", value: `${peak} ${unit}`, icon: Trophy, isPeak: true },
    { label: "TERKINI", value: `${current} ${unit}`, icon: Target },
    {
      label: "DELTA PROGRESS",
      value: `${delta > 0 ? "+" : ""}${delta} ${unit}`,
      isDelta: true,
      deltaVal: delta,
    },
    { label: "TOTAL SESI", value: `${data.length}×`, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {stats.map(({ label, value, isDelta, deltaVal, isPeak }) => (
        <div
          key={label}
          className="rounded-lg bg-carbon-900 border border-carbon-800 p-3.5 flex flex-col justify-between"
        >
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            {label}
          </p>
          <p
            className={`text-lg sm:text-xl font-mono font-black tracking-tight tabular-nums mt-1 ${
              isPeak
                ? "text-amber-400"
                : isDelta
                ? deltaVal && deltaVal > 0
                  ? "text-volt-400"
                  : deltaVal && deltaVal < 0
                  ? "text-red-400"
                  : "text-slate-400"
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

function NoDataState() {
  return (
    <div className="rounded-xl border border-dashed border-carbon-800 bg-carbon-900/40 p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center mx-auto text-slate-500">
        <BarChart2 className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-extrabold uppercase tracking-wide">
          Belum Ada Data Latihan
        </p>
        <p className="text-slate-400 text-xs max-w-xs mx-auto">
          Kamu belum mencatat sesi latihan apa pun. Rekam sesi pertamamu untuk mengamati pertumbuhan kurva beban.
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-volt-500 hover:bg-volt-400 text-carbon-950 font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Mulai Sesi Pertama</span>
      </Link>
    </div>
  );
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [metric, setMetric] = useState<Metric>("maxWeight");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadedSessions = getWorkoutSessions();
    setSessions(loadedSessions);
    setMounted(true);

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

  if (!mounted) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-carbon-900 rounded-lg" />
        <div className="h-24 bg-carbon-900 rounded-xl" />
        <div className="h-64 bg-carbon-900 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-carbon-800 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-volt-400">
            PERFORMANCE METRICS
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Grafik Overload & PR
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 font-mono">
            Analisis tren kekuatan dan progres kenaikan beban bertahap.
          </p>
        </div>

        {/* Exercise Dropdown */}
        {uniqueExercises.length > 0 && (
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full sm:w-auto appearance-none min-h-[42px] rounded-lg bg-carbon-900 border border-carbon-750 px-3.5 py-2 pr-9 text-white text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-volt-500 transition-colors shadow-sm"
            >
              <option value="" disabled>— Pilih Gerakan —</option>
              {uniqueExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        )}
      </div>

      {/* Content Area */}
      {uniqueExercises.length === 0 ? (
        <NoDataState />
      ) : !selectedId ? (
        <EmptyExerciseState />
      ) : chartData.length < 2 ? (
        <NotEnoughDataState name={selectedExercise?.name ?? ""} />
      ) : (
        <div className="space-y-4">
          {/* Metric Segmented Switchboard */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-carbon-900 border border-carbon-800 w-fit">
            {METRICS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetric(m.value)}
                className={`py-1.5 px-3 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  metric === m.value
                    ? "bg-volt-500 text-carbon-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Telemetry Scorecards */}
          <StatsSummary data={chartData} metric={metric} />

          {/* Chart Board */}
          <div className="rounded-xl border border-carbon-800 bg-carbon-900 p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-volt-400" />
                <h3 className="font-extrabold text-white text-sm sm:text-base uppercase tracking-wide">
                  {selectedExercise?.name}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {metricConfig.description}
              </span>
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

