"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Dumbbell, 
  Flame, 
  Zap, 
  Footprints, 
  Activity, 
  Moon, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { SplitDay, SessionExercise, SessionSet, WorkoutSession } from "@/types/workout";
import { getTemplateForDay } from "@/lib/templates";
import { addWorkoutSession, getLastSetsForExercise } from "@/lib/storage";

const SPLIT_DAYS: { day: SplitDay; label: string; icon: any }[] = [
  { day: "Push", label: "Push", icon: Flame },
  { day: "Pull", label: "Pull", icon: Zap },
  { day: "Arms", label: "Arms", icon: Dumbbell },
  { day: "Legs", label: "Legs", icon: Footprints },
  { day: "Upper", label: "Upper Body", icon: Activity },
  { day: "Lower", label: "Lower Body", icon: Footprints },
  { day: "Rest", label: "Rest Day", icon: Moon },
];

type UISessionSet = SessionSet & { prMessage?: string };

export default function SplitDayFlow() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<SplitDay | null>(null);
  const [sessionData, setSessionData] = useState<Record<string, UISessionSet[]>>({});

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
                prMessage = `PR 12 reps tercapai! Beban naik +${increment}kg (sebelumnya ${lastSet.weight}kg)`;
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
          });
          weightIndex++;
        }
      });
      initialData[ex.id] = sets;
    });

    setSessionData(initialData);
    setSelectedDay(day);
  };

  const handleSetChange = (
    exId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setSessionData((prev) => {
      const updatedEx = [...prev[exId]];
      updatedEx[setIndex] = { ...updatedEx[setIndex], [field]: value };
      return { ...prev, [exId]: updatedEx };
    });
  };

  const handleSaveSession = () => {
    if (!selectedDay) return;

    const template = getTemplateForDay(selectedDay);
    const exercises: SessionExercise[] = [];

    for (const ex of template.exercises) {
      const sets = sessionData[ex.id];
      const cleanSets: SessionSet[] = [];

      for (let i = 0; i < sets.length; i++) {
        if (!sets[i].reps || sets[i].reps <= 0) {
          alert(`Harap isi reps untuk set ke-${i + 1} pada ${ex.name}`);
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

  if (!selectedDay) {
    // TAHAP 1: Pilih Split Day
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SPLIT_DAYS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.day}
              onClick={() => handleSelectDay(item.day)}
              className="flex flex-col items-center justify-center p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-emerald-500/40 transition-all active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-zinc-200 font-semibold text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // TAHAP 2: Isi Gerakan
  const template = getTemplateForDay(selectedDay);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Sesi {selectedDay}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Isi beban dan repetisi yang berhasil diselesaikan.
          </p>
        </div>
        <button
          onClick={() => setSelectedDay(null)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Ganti Split
        </button>
      </div>

      <div className="space-y-4">
        {template.exercises.map((ex, exIndex) => {
          const sets = sessionData[ex.id];
          return (
            <div key={ex.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="font-bold text-zinc-100 text-sm sm:text-base flex items-center gap-2">
                <span className="text-emerald-400 text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {exIndex + 1}
                </span>
                {ex.name}
              </h3>

              <div className="space-y-3">
                {sets.map((set, i) => (
                  <div key={i} className="space-y-2">
                    {set.prMessage && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{set.prMessage}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Badge Set Type */}
                      <div
                        className={`w-14 text-center py-2 text-xs font-bold rounded-lg border shrink-0 ${
                          set.type === "PR"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-zinc-800/80 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {set.type}
                      </div>

                      {/* Weight Input */}
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={set.weight === 0 && set.type === "Normal" && ex.defaultWeights[0] === 0 ? "" : set.weight}
                          onChange={(e) =>
                            handleSetChange(ex.id, i, "weight", Number(e.target.value))
                          }
                          placeholder="0"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-medium pointer-events-none">
                          kg
                        </span>
                      </div>

                      <span className="text-zinc-600 text-sm font-bold">×</span>

                      {/* Reps Input */}
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min="1"
                          value={set.reps || ""}
                          onChange={(e) =>
                            handleSetChange(ex.id, i, "reps", Number(e.target.value))
                          }
                          placeholder="Reps"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-medium pointer-events-none">
                          reps
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSaveSession}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 rounded-xl transition-all active:scale-[0.99] shadow-lg shadow-emerald-500/10"
      >
        Simpan Sesi Latihan
      </button>
    </div>
  );
}

