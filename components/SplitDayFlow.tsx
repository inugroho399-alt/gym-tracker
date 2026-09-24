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
  ChevronLeft,
  ChevronRight,
  Check,
  TrendingUp,
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
  icon: any;
  color: string;
}

const SPLIT_DAYS: SplitOption[] = [
  { day: "Push", label: "Push Day", focus: "Dada, Bahu Depan/Samping & Triceps", icon: Flame, color: "text-orange-400 bg-orange-400/10" },
  { day: "Pull", label: "Pull Day", focus: "Punggung, Biceps & Rear Delts", icon: Zap, color: "text-ios-blue bg-ios-blue/10" },
  { day: "Arms", label: "Arms Day", focus: "Bahu, Triceps & Biceps Isolasi", icon: Dumbbell, color: "text-purple-400 bg-purple-400/10" },
  { day: "Legs", label: "Legs Day", focus: "Quads, Hamstrings & Betis", icon: Footprints, color: "text-ios-green bg-ios-green/10" },
  { day: "Upper", label: "Upper Body", focus: "Dada, Punggung, Bahu & Lengan", icon: Activity, color: "text-cyan-400 bg-cyan-400/10" },
  { day: "Lower", label: "Lower Body", focus: "Kaki Bawah, Panggul & Perut", icon: Footprints, color: "text-amber-400 bg-amber-400/10" },
  { day: "Rest", label: "Rest Day", focus: "Pemulihan Otot, Sendi & Nutrisi", icon: Moon, color: "text-ios-muted bg-ios-elevated" },
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
                prMessage = "Target 12 repetisi tercapai di sesi sebelumnya! Coba tambah repetisi.";
                defaultWeight = 0;
              } else {
                const increment = lastSet.weight < 20 ? 2.5 : 5;
                defaultWeight = lastSet.weight + increment;
                prMessage = `Target 12 reps tercapai! Beban naik +${increment} kg (sebelumnya ${lastSet.weight} kg).`;
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
      const targetVal = Math.max(0, isNaN(value) ? 0 : value);
      updatedEx[setIndex] = { ...updatedEx[setIndex], [field]: targetVal };
      return { ...prev, [exId]: updatedEx };
    });
  };

  const toggleSetComplete = (exId: string, setIndex: number) => {
    setSessionData((prev) => {
      const updatedEx = [...prev[exId]];
      const current = updatedEx[setIndex];
      const nextCompleted = !current.completed;
      
      updatedEx[setIndex] = {
        ...current,
        completed: nextCompleted,
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
          setSaveError(`Mohon isi repetisi untuk Set #${i + 1} di "${ex.name}"`);
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
        if (s.completed) {
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
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pilih Jadwal Latihan
          </h2>
          <p className="text-ios-muted text-sm mt-0.5">
            Pilih program latihan yang ingin kamu jalankan hari ini.
          </p>
        </div>

        <div className="bg-ios-card rounded-2xl border border-ios-border/60 divide-y divide-ios-border/60 overflow-hidden shadow-sm">
          {SPLIT_DAYS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.day}
                onClick={() => handleSelectDay(item.day)}
                className="w-full p-4 text-left transition-colors hover:bg-ios-cardHover active:bg-ios-elevated flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <span className="font-semibold text-white text-base block">
                      {item.label}
                    </span>
                    <p className="text-xs text-ios-muted truncate mt-0.5">
                      {item.focus}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-ios-muted shrink-0 group-hover:text-white transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // STAGE 2: Workout Logging Grid
  const template = getTemplateForDay(selectedDay);
  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  return (
    <>
      <div className="space-y-5 pb-32 animate-fade-in">
        {/* Top Session Status Card */}
        <div className="rounded-2xl border border-ios-border/60 bg-ios-card p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-semibold">
                {selectedDay} Day
              </span>
              <span className="text-sm text-ios-muted">
                {template.exercises.length} gerakan
              </span>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="inline-flex items-center gap-1 text-xs font-medium text-ios-blue hover:text-ios-blue/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Ganti Split</span>
            </button>
          </div>

          {/* Progress bar & Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-ios-muted">
              <span>Progres Sesi</span>
              <span className="font-medium text-white">
                {completedSetsCount} dari {totalSetsCount} set ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-ios-elevated overflow-hidden">
              <div 
                className="h-full bg-ios-green rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-ios-border/60 text-xs text-ios-muted">
            <span>Total Volume Terkumpul</span>
            <span className="font-semibold text-white">
              {currentVolume.toLocaleString("id-ID")} kg
            </span>
          </div>
        </div>

        {/* Validation error notification */}
        {saveError && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-4">
          {template.exercises.map((ex, exIndex) => {
            const sets = sessionData[ex.id] || [];
            const completedCount = sets.filter((s) => s.completed).length;

            return (
              <div 
                key={ex.id} 
                className="bg-ios-card border border-ios-border/60 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Exercise Header */}
                <div className="px-4 py-3.5 bg-ios-card border-b border-ios-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-ios-elevated text-ios-muted text-xs font-medium flex items-center justify-center shrink-0">
                      {exIndex + 1}
                    </span>
                    <h3 className="font-semibold text-white text-base truncate">
                      {ex.name}
                    </h3>
                  </div>
                  <span className="text-xs text-ios-muted shrink-0">
                    {completedCount}/{sets.length} Selesai
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {/* Table Column Labels */}
                  <div className="grid grid-cols-12 gap-2 px-1 text-[11px] font-medium text-ios-muted">
                    <span className="col-span-2">SET</span>
                    <span className="col-span-4 text-center">BEBAN (KG)</span>
                    <span className="col-span-4 text-center">REPETISI</span>
                    <span className="col-span-2 text-center">SELESAI</span>
                  </div>

                  {sets.map((set, i) => {
                    const isPR = set.type === "PR";
                    const isDone = set.completed;

                    return (
                      <div key={i} className="space-y-1.5">
                        {/* Progressive Overload Notice */}
                        {set.prMessage && (
                          <div className="flex items-start gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                            <TrendingUp className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                            <span>{set.prMessage}</span>
                          </div>
                        )}

                        {/* Set Row */}
                        <div
                          className={`p-2 rounded-xl border transition-all grid grid-cols-12 gap-2 items-center ${
                            isDone
                              ? "bg-ios-green/5 border-ios-green/20"
                              : "bg-ios-elevated/40 border-ios-border/40"
                          }`}
                        >
                          {/* Set label */}
                          <div className="col-span-2 flex items-center gap-1.5 pl-1">
                            <span className="text-xs font-semibold text-white">
                              #{i + 1}
                            </span>
                            {isPR && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-400">
                                PR
                              </span>
                            )}
                          </div>

                          {/* Weight Input */}
                          <div className="col-span-4">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weight === 0 && set.type === "Normal" && ex.defaultWeights[0] === 0 ? "" : set.weight}
                              onChange={(e) =>
                                handleSetChange(ex.id, i, "weight", parseFloat(e.target.value))
                              }
                              placeholder="0"
                              className="w-full text-center bg-ios-card border border-ios-border rounded-lg py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-ios-blue transition-colors"
                            />
                          </div>

                          {/* Reps Input */}
                          <div className="col-span-4">
                            <input
                              type="number"
                              min="0"
                              value={set.reps || ""}
                              onChange={(e) =>
                                handleSetChange(ex.id, i, "reps", parseInt(e.target.value, 10))
                              }
                              placeholder="0"
                              className="w-full text-center bg-ios-card border border-ios-border rounded-lg py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-ios-blue transition-colors"
                            />
                          </div>

                          {/* Completed Circle Toggle */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => toggleSetComplete(ex.id, i)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isDone
                                  ? "bg-ios-green text-black shadow-sm"
                                  : "border border-ios-separator text-transparent hover:border-ios-green hover:text-ios-green/50"
                              }`}
                              title="Tandai selesai"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
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
            className="w-full bg-ios-blue hover:bg-ios-blue/90 active:scale-[0.99] text-white font-semibold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-ios-blue/20 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Simpan Sesi Latihan</span>
          </button>
        </div>
      </div>

      <Stopwatch />
    </>
  );
}
