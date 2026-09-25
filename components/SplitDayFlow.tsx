"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";
import { SplitDay, SessionExercise, SessionSet, WorkoutSession } from "@/types/workout";
import { getTemplateForDay } from "@/lib/templates";
import { addWorkoutSession, getLastSetsForExercise } from "@/lib/storage";
import Stopwatch from "@/components/Stopwatch";

const SPLIT_OPTIONS: { day: SplitDay; label: string; focus: string }[] = [
  { day: "Push", label: "Push Day", focus: "Dada, Bahu Depan, Triceps" },
  { day: "Pull", label: "Pull Day", focus: "Punggung, Biceps, Rear Delts" },
  { day: "Legs", label: "Legs Day", focus: "Quads, Hamstrings, Betis" },
  { day: "Arms", label: "Arms Day", focus: "Bahu, Triceps, Biceps" },
  { day: "Upper", label: "Upper Body", focus: "Dada, Punggung, Bahu, Lengan" },
  { day: "Lower", label: "Lower Body", focus: "Kaki Bawah & Perut" },
  { day: "Rest", label: "Rest Day", focus: "Pemulihan & Nutrisi" },
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const dayParam = searchParams.get("day") as SplitDay | null;
    if (dayParam && SPLIT_OPTIONS.some((d) => d.day === dayParam)) {
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
              const inc = lastSet.weight < 20 ? 2.5 : 5;
              defaultWeight = lastSet.weight + inc;
              prMessage = `Beban naik +${inc}kg dari sesi lalu`;
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
    setErrorMessage(null);
  };

  const handleSetChange = (
    exId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setSessionData((prev) => {
      const updated = [...prev[exId]];
      updated[setIndex] = {
        ...updated[setIndex],
        [field]: Math.max(0, isNaN(value) ? 0 : value),
      };
      return { ...prev, [exId]: updated };
    });
  };

  const toggleComplete = (exId: string, setIndex: number) => {
    setSessionData((prev) => {
      const updated = [...prev[exId]];
      updated[setIndex] = {
        ...updated[setIndex],
        completed: !updated[setIndex].completed,
      };
      return { ...prev, [exId]: updated };
    });
  };

  const handleSave = () => {
    if (!selectedDay) return;

    const template = getTemplateForDay(selectedDay);
    const exercises: SessionExercise[] = [];

    for (const ex of template.exercises) {
      const sets = sessionData[ex.id] || [];
      const cleanSets: SessionSet[] = [];

      for (let i = 0; i < sets.length; i++) {
        if (!sets[i].reps || sets[i].reps <= 0) {
          setErrorMessage(`Isi repetisi untuk ${ex.name} (Set ${i + 1})`);
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

  // Stage 1: Routine picker
  if (!selectedDay) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Pilih Rutinitas Hari Ini
        </p>

        <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-sm">
          {SPLIT_OPTIONS.map((item) => (
            <button
              key={item.day}
              type="button"
              onClick={() => handleSelectDay(item.day)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors text-left group"
            >
              <div>
                <span className="text-sm font-medium text-neutral-900 group-hover:text-black">
                  {item.label}
                </span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {item.focus}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Stage 2: Workout logging
  const template = getTemplateForDay(selectedDay);

  return (
    <>
      <div className="space-y-6 pb-28">
        {/* Top Split Info */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {selectedDay} Day
            </h2>
            <p className="text-xs text-neutral-500">
              {template.exercises.length} gerakan
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Ganti Rutinitas
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-6">
          {template.exercises.map((ex, exIndex) => {
            const sets = sessionData[ex.id] || [];

            return (
              <div 
                key={ex.id} 
                className="border border-neutral-200 rounded-xl bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    <span className="text-neutral-400 mr-2">{exIndex + 1}.</span>
                    {ex.name}
                  </h3>
                  <span className="text-xs text-neutral-500 font-normal">
                    {sets.length} set
                  </span>
                </div>

                {/* Sets List */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] text-neutral-400 px-1 font-medium">
                    <span className="col-span-2">SET</span>
                    <span className="col-span-4 text-center">BEBAN (KG)</span>
                    <span className="col-span-4 text-center">REPS</span>
                    <span className="col-span-2 text-right pr-2">STATUS</span>
                  </div>

                  {sets.map((set, i) => {
                    const isDone = set.completed;

                    return (
                      <div key={i} className="space-y-1">
                        {set.prMessage && (
                          <p className="text-[11px] text-neutral-500 pl-1 italic">
                            * {set.prMessage}
                          </p>
                        )}

                        <div className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-lg border transition-colors ${
                          isDone 
                            ? "bg-neutral-50 border-neutral-300" 
                            : "border-neutral-200 bg-white"
                        }`}>
                          <div className="col-span-2 pl-1.5 text-xs text-neutral-500 font-medium">
                            #{i + 1}
                            {set.type === "PR" && (
                              <span className="text-[10px] text-neutral-400 ml-1">PR</span>
                            )}
                          </div>

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
                              className="w-full text-center bg-neutral-50 border border-neutral-200 rounded py-1 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-400 focus:bg-white transition-colors"
                            />
                          </div>

                          <div className="col-span-4">
                            <input
                              type="number"
                              min="0"
                              value={set.reps || ""}
                              onChange={(e) =>
                                handleSetChange(ex.id, i, "reps", parseInt(e.target.value, 10))
                              }
                              placeholder="0"
                              className="w-full text-center bg-neutral-50 border border-neutral-200 rounded py-1 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-400 focus:bg-white transition-colors"
                            />
                          </div>

                          <div className="col-span-2 flex justify-end pr-1">
                            <button
                              type="button"
                              onClick={() => toggleComplete(ex.id, i)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isDone
                                  ? "bg-neutral-900 text-white"
                                  : "border border-neutral-300 text-transparent hover:border-neutral-500"
                              }`}
                              title={isDone ? "Selesai" : "Tandai selesai"}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
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
            onClick={handleSave}
            className="w-full bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-medium text-xs py-3 rounded-lg transition-colors shadow-sm"
          >
            Simpan Sesi Latihan
          </button>
        </div>
      </div>

      <Stopwatch />
    </>
  );
}
