"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Plus, Info, ChevronDown, Trophy, Activity, Target } from "lucide-react";
import type { WorkoutSession } from "@/types/workout";
import { getWorkoutSessions } from "@/lib/storage";

// ─── Dynamic import recharts (client-only, no SSR) ───────────────────────────

const ProgressChart = dynamic(() => import("@/components/ProgressChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] flex flex-col items-center justify-center gap-2 bg-ios-card rounded-2xl border border-ios-border/60">
      <div className="w-6 h-6 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
      <p className="text-ios-muted text-xs">Memuat grafik progres…</p>
    </div>
  ),
});

// ─── Metric definitions ───────────────────────────────────────────────────────

type Metric = "maxWeight" | "totalVolume";

const METRICS: { value: Metric; label: string; unit: string; description: string }[] = [
  { value: "maxWeight", label: "Beban Maks (PR)", unit: "kg", description: "Beban angkatan tertinggi tiap sesi" },
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
    <div className="rounded-2xl border border-ios-border/60 bg-ios-card p-10 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-ios-elevated flex items-center justify-center mx-auto text-ios-muted">
        <Target className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-semibold">
          Pilih Gerakan Untuk Melihat Grafik
        </p>
        <p className="text-ios-muted text-xs max-w-xs mx-auto">
          Pilih salah satu gerakan latihan di atas untuk memantau kurva kekuatan & perkembangan bebanmu.
        </p>
      </div>
    </div>
  );
}

function NotEnoughDataState({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-ios-border/60 bg-ios-card p-8 text-center space-y-4">
      <div className="w-10 h-10 rounded-xl bg-ios-blue/10 text-ios-blue flex items-center justify-center mx-auto">
        <Info className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-semibold">
          Butuh Minimal 2 Sesi
        </p>
        <p className="text-ios-muted text-xs max-w-sm mx-auto">
          Baru ada 1 catatan latihan untuk <strong className="text-white">{name}</strong>. Grafik tren perkembangan akan aktif otomatis setelah kamu menyelesaikan 1 sesi lagi.
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-ios-blue hover:bg-ios-blue/90 text-white font-semibold text-xs transition-all shadow-md shadow-ios-blue/20"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Catat Sesi Baru</span>
      </Link>
    </div>
  );
}

function StatsSummary({ data }: { data: ChartPoint[]; metric: Metric }) {
  const values = data.map((d) => d.value);
  const current = values[values.length - 1];
  const first = values[0];
  const peak = Math.max(...values);
  const delta = current - first;
  const unit = "kg";

  const stats = [
    { label: "Rekor Tertinggi", value: `${peak} ${unit}`, icon: Trophy, isPeak: true },
    { label: "Sesi Terakhir", value: `${current} ${unit}`, icon: Target },
    {
      label: "Perkembangan",
      value: `${delta > 0 ? "+" : ""}${delta} ${unit}`,
      isDelta: true,
      deltaVal: delta,
    },
    { label: "Total Sesi", value: `${data.length} sesi`, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, isDelta, deltaVal, isPeak }) => (
        <div
          key={label}
          className="rounded-2xl bg-ios-card border border-ios-border/60 p-4 flex flex-col justify-between"
        >
          <p className="text-xs text-ios-muted font-medium">
            {label}
          </p>
          <p
            className={`text-xl font-bold tracking-tight tabular-nums mt-1.5 ${
              isPeak
                ? "text-amber-400"
                : isDelta
                ? deltaVal && deltaVal > 0
                  ? "text-ios-green"
                  : deltaVal && deltaVal < 0
                  ? "text-red-400"
                  : "text-ios-muted"
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
    <div className="rounded-2xl border border-ios-border/60 bg-ios-card p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-ios-elevated text-ios-muted flex items-center justify-center mx-auto">
        <Activity className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base text-white font-semibold">
          Belum Ada Data Latihan
        </p>
        <p className="text-ios-muted text-xs max-w-xs mx-auto">
          Kamu belum mencatat sesi latihan apa pun. Rekam sesi pertamamu untuk memantau grafik perkembangan beban.
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-ios-blue hover:bg-ios-blue/90 text-white font-semibold text-xs transition-all shadow-md shadow-ios-blue/20"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
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
        <div className="h-10 bg-ios-card rounded-2xl" />
        <div className="h-24 bg-ios-card rounded-2xl" />
        <div className="h-64 bg-ios-card rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Progres Latihan
          </h1>
          <p className="text-ios-muted text-sm mt-0.5">
            Pantau perkembangan beban dan total volume dari waktu ke waktu.
          </p>
        </div>

        {/* Exercise Dropdown */}
        {uniqueExercises.length > 0 && (
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full sm:w-auto appearance-none min-h-[42px] rounded-full bg-ios-card border border-ios-border px-4 py-2 pr-9 text-white text-xs font-semibold focus:outline-none focus:border-ios-blue transition-colors shadow-sm"
            >
              <option value="" disabled>— Pilih Gerakan —</option>
              {uniqueExercises.map((ex) => (
                <option key={ex.id} value={ex.id} className="bg-ios-card text-white">
                  {ex.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ios-muted" />
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
          {/* Metric Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-ios-card border border-ios-border w-fit">
            {METRICS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetric(m.value)}
                className={`py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${
                  metric === m.value
                    ? "bg-white text-black shadow-sm"
                    : "text-ios-muted hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <StatsSummary data={chartData} metric={metric} />

          {/* Chart Card */}
          <div className="rounded-2xl border border-ios-border/60 bg-ios-card p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-base">
                {selectedExercise?.name}
              </h3>
              <span className="text-xs text-ios-muted">
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
