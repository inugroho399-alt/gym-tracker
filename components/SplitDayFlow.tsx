"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SplitDay, SessionExercise, SessionSet, WorkoutSession } from "@/types/workout";
import { getTemplateForDay } from "@/lib/templates";
import { addWorkoutSession, getLastSetsForExercise } from "@/lib/storage";

const SPLIT_DAYS: { day: SplitDay; label: string; icon: string }[] = [
  { day: "Push", label: "Push", icon: "💪" },
  { day: "Pull", label: "Pull", icon: "🔙" },
  { day: "Arms", label: "Arms", icon: "🦾" },
  { day: "Legs", label: "Legs", icon: "🦵" },
  { day: "Upper", label: "Upper Body", icon: "🦍" },
  { day: "Lower", label: "Lower Body", icon: "🏃" },
  { day: "Rest", label: "Rest Day", icon: "😴" },
];

// Extended SessionSet for UI to track PR messages
type UISessionSet = SessionSet & { prMessage?: string };

export default function SplitDayFlow() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<SplitDay | null>(null);

  // Form state for Stage 2
  const [sessionData, setSessionData] = useState<Record<string, UISessionSet[]>>({});

  const handleSelectDay = (day: SplitDay) => {
    if (day === "Rest") {
      // Auto-save rest day
      const session: WorkoutSession = {
        id: `sess-${Date.now()}`,
        date: new Date().toISOString(),
        day: "Rest",
        exercises: [],
      };
      addWorkoutSession(session);
      alert("Hari istirahat tercatat!");
      router.push("/");
      return;
    }

    // For other days, prefill sessionData from template
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

          // Progressive overload logic based on last sets
          if (lastSets && lastSets[weightIndex]) {
            const lastSet = lastSets[weightIndex];
            
            if (plan.type === "PR" && lastSet.reps >= 12) {
              if (lastSet.weight === 0) {
                prMessage = "Coba tambah reps";
                defaultWeight = 0;
              } else {
                const increment = lastSet.weight < 20 ? 2.5 : 5;
                defaultWeight = lastSet.weight + increment;
                prMessage = `PR 12 reps tercapai — beban naik dari ${lastSet.weight}kg jadi ${defaultWeight}kg`;
              }
            } else {
              // Not PR or reps < 12, prefill same as last time
              defaultWeight = lastSet.weight;
            }
          }

          sets.push({
            type: plan.type,
            reps: 0, // start empty
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

    // Validation & Data aggregation
    for (const ex of template.exercises) {
      const sets = sessionData[ex.id];
      const cleanSets: SessionSet[] = [];

      for (let i = 0; i < sets.length; i++) {
        if (!sets[i].reps || sets[i].reps <= 0) {
          alert(`Harap isi reps untuk set ke-${i + 1} pada ${ex.name}`);
          return; // Abort save
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
    router.push("/");
  };

  if (!selectedDay) {
    // TAHAP 1: Pilih Split Day
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SPLIT_DAYS.map((item) => (
          <button
            key={item.day}
            onClick={() => handleSelectDay(item.day)}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-800 bg-gray-900 hover:bg-gray-800 hover:border-gray-600 transition-all active:scale-95"
          >
            <span className="text-3xl mb-3">{item.icon}</span>
            <span className="text-gray-200 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // TAHAP 2: Isi Gerakan
  const template = getTemplateForDay(selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Sesi {selectedDay}</h2>
          <p className="text-sm text-gray-400 mt-1">
            Isi repetisi yang berhasil dilakukan.
          </p>
        </div>
        <button
          onClick={() => setSelectedDay(null)}
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Ubah Split
        </button>
      </div>

      <div className="space-y-6">
        {template.exercises.map((ex, exIndex) => {
          const sets = sessionData[ex.id];
          return (
            <div key={ex.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-100 mb-4 flex items-center">
                <span className="text-indigo-500 mr-2">{exIndex + 1}.</span>
                {ex.name}
              </h3>

              <div className="space-y-4">
                {sets.map((set, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    {/* PR Overload Message */}
                    {set.prMessage && (
                      <div className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
                        {set.prMessage}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {/* Badge */}
                      <div
                        className={`w-14 text-center py-1.5 text-xs font-bold rounded-lg border ${
                          set.type === "PR"
                            ? "bg-amber-900/30 border-amber-500/50 text-amber-400"
                            : "bg-gray-800/50 border-gray-700 text-gray-400"
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
                          className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-3 pr-8 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-500">
                          kg
                        </span>
                      </div>

                      <span className="text-gray-600 font-medium">×</span>

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
                          className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-500">
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
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
      >
        Simpan Sesi
      </button>
    </div>
  );
}
