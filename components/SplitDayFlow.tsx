"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Dumbbell, 
  Flame, 
  Zap, 
  Footprints, 
  Activity, 
  Moon, 
  ArrowLeft,
  Check,
  TrendingUp,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { SplitDay, SessionExercise, SessionSet, WorkoutSession } from "@/types/workout";
import { getTemplateForDay } from "@/lib/templates";
import { addWorkoutSession, getLastSetsForExercise } from "@/lib/storage";
import Stopwatch from "@/components/Stopwatch";

interface SplitOption {
  day: SplitDay;
  label: string;
  focus: string;
  badge: string;
  icon: any;
}

const SPLIT_DAYS: SplitOption[] = [
  { day: "Push", label: "Push Day", focus: "Dada, Bahu Depan/Samping & Triceps", badge: "CHEST & TRICEPS", icon: Flame },
  { day: "Pull", label: "Pull Day", focus: "Punggung, Biceps & Rear Delts", badge: "BACK & BICEPS", icon: Zap },
  { day: "Arms", label: "Arms Day", focus: "Bahu, Triceps & Biceps Isolasi", badge: "SHOULDERS & ARMS", icon: Dumbbell },
  { day: "Legs", label: "Legs Day", focus: "Quads, Hamstrings & Betis", badge: "QUADS & HAMS", icon: Footprints },
  { day: "Upper", label: "Upper Body", focus: "Dada, Punggung, Bahu & Lengan", badge: "FULL UPPER", icon: Activity },
  { day: "Lower", label: "Lower Body", focus: "Kaki Bawah, Panggul & Abs", badge: "LOWER & CORE", icon: Footprints },
  { day: "Rest", label: "Rest Day", focus: "Pemulihan Otot, Sendi & Nutrisi", badge: "RECOVERY", icon: Moon },
];

type UISessionSet = SessionSet & {
  prMessage?: string;
  completed?: boolean;
};

export default function SplitDayFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<SplitDay | null>(null);
  const [sessionData, setSessionData] = useState<Record<string, UISessionSet[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  // Check URL query param on mount (e.g. ?day=Push)
  useEffect(() => {
    const dayParam = searchParams.get("day") as SplitDay | null;
    if (dayParam && SPLIT_DAYS.some((d) => d.day === dayParam)) {
      handleSelectDay(dayParam);
    }
  }, [searchParams]);

  const handleSelectDay = (day: SplitDay) => {
    if (day === "Rest") {
      const session: WorkoutSession = {
        id: `sess-${Date.now()}`,
        date: new Date().toISOString(),
        day: "Rest",
        exercises: [],
      };
      addWorkoutSession(session);
      router.push("/history");
      return;
    }

    const template = getTemplateForDay(day);
    if (!template) return;

    const initialData: Record<string, UISessionSet[]> = {};

    template.exercises.forEach((ex) => {
      const sets: UISessionSet[] = [];
      const lastSets = getLastSetsForExercise(ex.id);
      let weightIndex = 0;

      ex.setPlans.forEach((plan) => {
        for (let i = 0; i < plan.count; i++) {
          let defaultWeight = ex.defaultWeights[weightIndex] ?? 0;
          let prMessage: string | undefined = undefined;

          if (lastSets && lastSets[weightIndex]) {
            const lastSet = lastSets[weightIndex];
            
            if (plan.type === "PR" && lastSet.reps >= 12) {
              if (lastSet.weight === 0) {
                prMessage = "Target 12 reps tercapai. Coba tambah repetisi!";
                defaultWeight = 0;
              } else {
                const increment = lastSet.weight < 20 ? 2.5 : 5;
                defaultWeight = lastSet.weight + increment;
                prMessage = `Overload tercapai: target 12 reps tembus. Beban dinaikkan +${increment}kg (sebelumnya ${lastSet.weight}kg).`;
              }
            } else {
              defaultWeight = lastSet.weight;
            }
          }

          sets.push({
            type: plan.type,
            reps: 0,
            weight: defaultWeight,
            prMessage,
            completed: false,
          });
          weightIndex++;
        }
      });
      initialData[ex.id] = sets;
    });

    setSessionData(initialData);
    setSelectedDay(day);
    setSaveError(null);
  };

  const handleSetChange = (
    exId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setSessionData((prev) => {
      const updatedEx = [...prev[exId]];
      const targetVal = Math.max(0, value);
      updatedEx[setIndex] = { ...updatedEx[setIndex], [field]: targetVal };
      return { ...prev, [exId]: updatedEx };
    });
  };

  const adjustWeight = (exId: string, setIndex: number, delta: number) => {
    setSessionData((prev) => {
      const current = prev[exId][setIndex].weight || 0;
      const nextWeight = Math.max(0, parseFloat((current + delta).toFixed(1)));
      const updatedEx = [...prev[exId]];
      updatedEx[setIndex] = { ...updatedEx[setIndex], weight: nextWeight };
      return { ...prev, [exId]: updatedEx };
    });
  };

  const adjustReps = (exId: string, setIndex: number, delta: number) => {
    setSessionData((prev) => {
      const current = prev[exId][setIndex].reps || 0;
      const nextReps = Math.max(0, current + delta);
      const updatedEx = [...prev[exId]];
      updatedEx[setIndex] = { ...updatedEx[setIndex], reps: nextReps };
      return { ...prev, [exId]: updatedEx };
    });
  };

  const toggleSetComplete = (exId: string, setIndex: number) => {
    setSessionData((prev) => {
      const updatedEx = [...prev[exId]];
      updatedEx[setIndex] = {
        ...updatedEx[setIndex],
        completed: !updatedEx[setIndex].completed,
      };
      return { ...prev, [exId]: updatedEx };
    });
  };

  const handleSaveSession = () => {
    if (!selectedDay) return;

    const template = getTemplateForDay(selectedDay);
    const exercises: SessionExercise[] = [];

    for (const ex of template.exercises) {
      const sets = sessionData[ex.id] || [];
      const cleanSets: SessionSet[] = [];

      for (let i = 0; i < sets.length; i++) {
        if (!sets[i].reps || sets[i].reps <= 0) {
          setSaveError(`Harap isi jumlah repetisi untuk Set #${i + 1} pada "${ex.name}"`);
          return;
        }
        cleanSets.push({
          type: sets[i].type,
          reps: sets[i].reps,
          weight: sets[i].weight,
        });
      }
      exercises.push({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: cleanSets,
      });
    }

    const session: WorkoutSession = {
      id: `sess-${Date.now()}`,
      date: new Date().toISOString(),
      day: selectedDay,
      exercises,
    };

    addWorkoutSession(session);
    router.push("/history");
  };

  // Compute live completed sets count & total volume
  const { totalSetsCount, completedSetsCount, currentVolume } = useMemo(() => {
    let total = 0;
    let completed = 0;
    let volume = 0;

    Object.values(sessionData).forEach((sets) => {
      sets.forEach((s) => {
        total++;
        if (s.completed || (s.reps > 0 && s.weight > 0)) {
          completed++;
        }
        volume += (s.reps || 0) * (s.weight || 0);
      });
    });

    return { totalSetsCount: total, completedSetsCount: completed, currentVolume: volume };
  }, [sessionData]);

  // STAGE 1: Choose Split Day
  if (!selectedDay) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            PILIH JADWAL LATIHAN
          </span>
          <span className="text-[11px] font-mono text-carbon-500">
            7 PILIHAN TERSEDIA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SPLIT_DAYS.map((item) => {
            const Icon = item.icon;
            const isRest = item.day === "Rest";

            return (
              <button
                key={item.day}
                onClick={() => handleSelectDay(item.day)}
                className={`p-4 rounded-xl border text-left transition-all active:scale-[0.99] flex items-start gap-3.5 group ${
                  isRest
                    ? "bg-carbon-900/60 border-carbon-800 hover:border-slate-600 hover:bg-carbon-850"
                    : "bg-carbon-900 border-carbon-800 hover:border-volt-500/50 hover:bg-carbon-850"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  isRest
                    ? "bg-carbon-800 border-carbon-700 text-slate-400 group-hover:text-slate-200"
                    : "bg-carbon-800 border-carbon-700 text-volt-400 group-hover:bg-volt-500 group-hover:text-carbon-950 group-hover:border-volt-400"
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-sm text-white tracking-wide uppercase">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-carbon-800 border border-carbon-700 text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    {item.focus}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // STAGE 2: Workout Logging Grid
  const template = getTemplateForDay(selectedDay);

  return (
    <>
      <div className="space-y-5 pb-32 animate-fade-in">
        {/* Sticky Split Header & Progress Bar */}
        <div className="rounded-xl border border-carbon-750 bg-carbon-900 p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-volt-500 text-carbon-950 text-xs font-mono font-black uppercase tracking-wider">
                {selectedDay}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                {template.exercises.length} Gerakan Terprogram
              </h2>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ganti Split</span>
            </button>
          </div>

          {/* Metric Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-carbon-800 text-xs font-mono">
            <span className="text-slate-400">
              Set Selesai:{" "}
              <strong className="text-volt-400">
                {completedSetsCount}/{totalSetsCount}
              </strong>
            </span>
            <span className="text-slate-400">
              Volume Sesi:{" "}
              <strong className="text-white">
                {currentVolume.toLocaleString("id-ID")} kg
              </strong>
            </span>
          </div>
        </div>

        {/* Validation error notification */}
        {saveError && (
          <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-4">
          {template.exercises.map((ex, exIndex) => {
            const sets = sessionData[ex.id] || [];
            const exIndexPadded = (exIndex + 1).toString().padStart(2, "0");

            return (
              <div 
                key={ex.id} 
                className="bg-carbon-900 border border-carbon-800 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Exercise Header */}
                <div className="px-4 py-3 bg-carbon-850 border-b border-carbon-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-volt-400 px-1.5 py-0.5 rounded bg-carbon-900 border border-carbon-750">
                      {exIndexPadded}
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">
                      {ex.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {sets.length} SET
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {sets.map((set, i) => {
                    const isPR = set.type === "PR";
                    const isDone = set.completed;

                    return (
                      <div key={i} className="space-y-1.5">
                        {/* Progressive overload insight alert */}
                        {set.prMessage && (
                          <div className="flex items-start gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-lg">
                            <TrendingUp className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                            <span>{set.prMessage}</span>
                          </div>
                        )}

                        {/* Set Row Item */}
                        <div
                          className={`p-2.5 rounded-lg border transition-all flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 ${
                            isDone
                              ? "bg-carbon-850/80 border-volt-500/40"
                              : "bg-carbon-950 border-carbon-800"
                          }`}
                        >
                          {/* Set badge */}
                          <div className="flex items-center gap-1.5 min-w-[72px]">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              #{i + 1}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                                isPR
                                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                  : "bg-carbon-800 border-carbon-700 text-slate-400"
                              }`}
                            >
                              {isPR ? "PR SET" : "VOL"}
                            </span>
                          </div>

                          {/* Weight control with quick steppers */}
                          <div className="flex-1 flex items-center bg-carbon-900 border border-carbon-750 rounded-md overflow-hidden min-w-[120px]">
                            <button
                              type="button"
                              onClick={() => adjustWeight(ex.id, i, -2.5)}
                              className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-carbon-800 active:bg-carbon-750 transition-colors"
                              title="Kurang 2.5 kg"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <div className="flex-1 flex items-center justify-center">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weight === 0 && set.type === "Normal" && ex.defaultWeights[0] === 0 ? "" : set.weight}
                                onChange={(e) =>
                                  handleSetChange(ex.id, i, "weight", Number(e.target.value))
                                }
                                placeholder="0"
                                className="w-full text-center bg-transparent py-1.5 text-sm font-mono font-bold text-white focus:outline-none tabular-nums"
                              />
                              <span className="text-[11px] font-mono text-slate-400 pr-2 pointer-events-none">
                                kg
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => adjustWeight(ex.id, i, 2.5)}
                              className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-carbon-800 active:bg-carbon-750 transition-colors"
                              title="Tambah 2.5 kg"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Separator */}
                          <span className="text-carbon-600 font-mono font-bold text-xs hidden sm:inline">
                            ×
                          </span>

                          {/* Reps control with quick steppers */}
                          <div className="flex-1 flex items-center bg-carbon-900 border border-carbon-750 rounded-md overflow-hidden min-w-[120px]">
                            <button
                              type="button"
                              onClick={() => adjustReps(ex.id, i, -1)}
                              className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-carbon-800 active:bg-carbon-750 transition-colors"
                              title="Kurang 1 rep"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <div className="flex-1 flex items-center justify-center">
                              <input
                                type="number"
                                min="0"
                                value={set.reps || ""}
                                onChange={(e) =>
                                  handleSetChange(ex.id, i, "reps", Number(e.target.value))
                                }
                                placeholder="Reps"
                                className="w-full text-center bg-transparent py-1.5 text-sm font-mono font-bold text-white focus:outline-none tabular-nums"
                              />
                              <span className="text-[11px] font-mono text-slate-400 pr-2 pointer-events-none">
                                reps
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => adjustReps(ex.id, i, 1)}
                              className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-carbon-800 active:bg-carbon-750 transition-colors"
                              title="Tambah 1 rep"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Completed set toggle */}
                          <button
                            type="button"
                            onClick={() => toggleSetComplete(ex.id, i)}
                            className={`h-9 px-3 rounded-md flex items-center justify-center gap-1.5 text-xs font-mono font-bold transition-all ${
                              isDone
                                ? "bg-volt-500 text-carbon-950 shadow-sm"
                                : "bg-carbon-800 text-slate-400 hover:text-white hover:bg-carbon-750"
                            }`}
                            title="Tandai set selesai"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span className="hidden sm:inline">
                              {isDone ? "DONE" : "CEK"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Save Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveSession}
            className="w-full bg-volt-500 hover:bg-volt-400 active:scale-[0.99] text-carbon-950 font-extrabold text-sm uppercase tracking-wider py-4 rounded-xl transition-all shadow-xl shadow-volt-500/15 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Simpan Sesi Latihan Ini</span>
          </button>
        </div>
      </div>

      <Stopwatch />
    </>
  );
}
