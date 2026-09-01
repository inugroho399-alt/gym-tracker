/**
 * lib/storage.ts
 * Type-safe localStorage helpers for the Gym Progress Tracker.
 */

import type { Exercise, WorkoutEntry, WorkoutSet } from "@/types/workout";

// ─── Storage keys ────────────────────────────────────────────────────────────

const KEYS = {
  EXERCISES: "gym-tracker-exercises",
  ENTRIES: "gym-tracker-entries",
  SEEDED: "gym-tracker-seeded-v2", // version bump for force seed
} as const;

// ─── Default seed data (User's specific routine) ─────────────────────────────

const DEFAULT_EXERCISES: Exercise[] = [
  // Push
  { id: "ex-incline-bench", name: "Incline Bench Press" },
  { id: "ex-peck-fly", name: "Peck Fly" },
  { id: "ex-butterfly", name: "Butterfly" },
  { id: "ex-reverse-pec-fly", name: "Reverse Peck Fly" },
  { id: "ex-cable-lateral-raise", name: "Cable Lateral Raise (One Arm)" },
  { id: "ex-db-lateral-raise", name: "Dumbbell Lateral Raise" },
  { id: "ex-triceps-pushdown", name: "Triceps Pushdown" },
  { id: "ex-chest-push-depan", name: "Chest Push Depan" },
  { id: "ex-db-bench", name: "Dumbbell Bench Press" },
  // Pull
  { id: "ex-pull-up", name: "Pull Up / Lat Pulldown" },
  { id: "ex-wide-row", name: "Wide Grip Rowing" },
  { id: "ex-close-row", name: "Close Grip Rowing" },
  { id: "ex-face-pull", name: "Face Pull" },
  { id: "ex-cable-shrug", name: "Cable Shrug" },
  { id: "ex-plate-shrug", name: "Plate Shrug" },
  { id: "ex-biceps-cable-curl", name: "Biceps Cable Curl" },
  // Arms
  { id: "ex-shoulder-press", name: "Shoulder Press (DB)" },
  { id: "ex-triceps-overhead", name: "Triceps Overhead Extension" },
  { id: "ex-hammer-curl", name: "Hammer Cable Curl" },
  // Legs & Lower
  { id: "ex-squat", name: "Squat" },
  { id: "ex-rdl", name: "Romanian Deadlift" },
  { id: "ex-leg-ext", name: "Leg Extension" },
  { id: "ex-leg-curl", name: "Leg Curl" },
  { id: "ex-calf-raise", name: "Calf Raise" },
  { id: "ex-leg-press", name: "Leg Press" },
  { id: "ex-abductor", name: "Abductor" },
  // Upper & Misc
  { id: "ex-dips", name: "Dips" },
  { id: "ex-forearms", name: "Forearms (Bawah/Atas)" },
  { id: "ex-sit-up", name: "Sit Up" },
];

function createSet(reps: number, weight: number): WorkoutSet {
  return { id: `set-${Math.random().toString(36).substr(2, 9)}`, reps, weight };
}

const d = new Date();
d.setDate(d.getDate() - 1); // Mock baseline as yesterday
const dateStr = d.toISOString();

const DEFAULT_ENTRIES: WorkoutEntry[] = [
  // Push Baseline
  { id: "e1", date: dateStr, exerciseId: "ex-incline-bench", sets: [createSet(12, 7.5), createSet(12, 5), createSet(12, 5)], note: "Push: 1 PR, 2 Normal" },
  { id: "e2", date: dateStr, exerciseId: "ex-peck-fly", sets: [createSet(12, 25), createSet(12, 20)], note: "Push" },
  { id: "e3", date: dateStr, exerciseId: "ex-butterfly", sets: [createSet(12, 20), createSet(12, 15), createSet(12, 15)], note: "Push: 1 PR, 2 Normal" },
  { id: "e4", date: dateStr, exerciseId: "ex-reverse-pec-fly", sets: [createSet(12, 35), createSet(12, 30), createSet(12, 30)], note: "Push: 1 PR, 2 Normal" },
  { id: "e5", date: dateStr, exerciseId: "ex-cable-lateral-raise", sets: [createSet(12, 7), createSet(12, 5), createSet(12, 5)], note: "Push: 1 PR, 2 Normal" },
  { id: "e6", date: dateStr, exerciseId: "ex-db-lateral-raise", sets: [createSet(12, 8), createSet(12, 6)] },
  { id: "e7", date: dateStr, exerciseId: "ex-triceps-pushdown", sets: [createSet(12, 35), createSet(12, 30)] },
  { id: "e8", date: dateStr, exerciseId: "ex-chest-push-depan", sets: [createSet(12, 15), createSet(12, 10)] },
  { id: "e9", date: dateStr, exerciseId: "ex-db-bench", sets: [createSet(12, 10), createSet(12, 8)] },

  // Pull Baseline
  { id: "e10", date: dateStr, exerciseId: "ex-pull-up", sets: [createSet(12, 40), createSet(12, 35), createSet(12, 35)], note: "Pull: 1 PR, 2 Normal" },
  { id: "e11", date: dateStr, exerciseId: "ex-wide-row", sets: [createSet(12, 35), createSet(12, 30), createSet(12, 30), createSet(12, 30)], note: "Pull: 1 PR, 3 Normal" },
  { id: "e12", date: dateStr, exerciseId: "ex-close-row", sets: [createSet(12, 35), createSet(12, 30), createSet(12, 30)], note: "Pull: 1 PR, 2 Normal" },
  { id: "e13", date: dateStr, exerciseId: "ex-face-pull", sets: [createSet(12, 35), createSet(12, 35), createSet(12, 30), createSet(12, 30)], note: "Pull: 2 PR, 2 Normal" },
  { id: "e14", date: dateStr, exerciseId: "ex-cable-shrug", sets: [createSet(12, 60), createSet(12, 55), createSet(12, 55)], note: "Pull: 1 PR, 2 Normal" },
  { id: "e15", date: dateStr, exerciseId: "ex-plate-shrug", sets: [createSet(12, 15), createSet(12, 10)] },
  { id: "e16", date: dateStr, exerciseId: "ex-biceps-cable-curl", sets: [createSet(12, 25), createSet(12, 25)], note: "Pull: 2 Normal" },

  // Arms Baseline (Shoulder Priority)
  { id: "e17", date: dateStr, exerciseId: "ex-shoulder-press", sets: [createSet(12, 20), createSet(12, 20), createSet(12, 15), createSet(12, 15)], note: "Arms: 2 PR, 2 Normal" },
  { id: "e18", date: dateStr, exerciseId: "ex-triceps-overhead", sets: [createSet(12, 35), createSet(12, 30), createSet(12, 30)], note: "Arms: 1 PR, 2 Normal" },
  { id: "e19", date: dateStr, exerciseId: "ex-hammer-curl", sets: [createSet(12, 30), createSet(12, 25), createSet(12, 25)], note: "Arms: 1 PR, 2 Normal" },

  // Legs & Lower Baseline
  { id: "e20", date: dateStr, exerciseId: "ex-squat", sets: [createSet(12, 7.5), createSet(12, 5), createSet(12, 5)], note: "Legs: 1 PR, 2 Normal" },
  { id: "e21", date: dateStr, exerciseId: "ex-rdl", sets: [createSet(12, 5), createSet(12, 2.5), createSet(12, 2.5), createSet(12, 2.5)], note: "Legs: 1 PR, 3 Normal" },
  { id: "e22", date: dateStr, exerciseId: "ex-leg-ext", sets: [createSet(12, 50), createSet(12, 50), createSet(12, 50)], note: "Legs: 3 Normal" },
  { id: "e23", date: dateStr, exerciseId: "ex-leg-curl", sets: [createSet(12, 35), createSet(12, 35), createSet(12, 35)], note: "Legs: 3 Normal" },
  { id: "e24", date: dateStr, exerciseId: "ex-calf-raise", sets: [createSet(12, 50), createSet(12, 50), createSet(12, 50), createSet(12, 50)], note: "Legs: 1 PR, 3 Normal" },
  { id: "e27", date: dateStr, exerciseId: "ex-leg-press", sets: [createSet(12, 90), createSet(12, 80), createSet(12, 80)], note: "Lower: 1 PR, 2 Normal" },
  { id: "e28", date: dateStr, exerciseId: "ex-abductor", sets: [createSet(12, 40), createSet(12, 40), createSet(12, 40)], note: "Lower: 3 Normal" },
  { id: "e29", date: dateStr, exerciseId: "ex-sit-up", sets: [createSet(12, 0), createSet(12, 0), createSet(12, 0)], note: "Sit up 3 sets 12 reps" },

  // Upper & Misc Baseline
  { id: "e25", date: dateStr, exerciseId: "ex-dips", sets: [createSet(10, 0), createSet(8, 0)], note: "Upper: Dips" },
  { id: "e26", date: dateStr, exerciseId: "ex-forearms", sets: [createSet(12, 40), createSet(12, 40), createSet(12, 40)], note: "Forearms 40kg (bawah 6kg, atas 6kg)" },
];

// ─── Low-level primitives ─────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Run seeding logic. Ensures that the user gets their specific custom data
 * injected upon the very first load or if we push an update.
 */
function ensureSeeded() {
  if (!isBrowser()) return;
  const isSeeded = localStorage.getItem(KEYS.SEEDED);
  if (!isSeeded) {
    writeJSON(KEYS.EXERCISES, DEFAULT_EXERCISES);
    writeJSON(KEYS.ENTRIES, DEFAULT_ENTRIES);
    localStorage.setItem(KEYS.SEEDED, "true");
  }
}

// ─── Exercise helpers ─────────────────────────────────────────────────────────

export function getExercises(): Exercise[] {
  ensureSeeded();
  return readJSON<Exercise[]>(KEYS.EXERCISES) || DEFAULT_EXERCISES;
}

export function addExercise(name: string): Exercise {
  ensureSeeded();
  const trimmed = name.trim();
  const existing = getExercises();
  const duplicate = existing.find(
    (e) => e.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) return duplicate;

  const newExercise: Exercise = {
    id: `ex-${Date.now()}`,
    name: trimmed,
  };
  writeJSON(KEYS.EXERCISES, [...existing, newExercise]);
  return newExercise;
}

// ─── Workout entry helpers ────────────────────────────────────────────────────

export function getWorkoutEntries(): WorkoutEntry[] {
  ensureSeeded();
  const stored = readJSON<WorkoutEntry[]>(KEYS.ENTRIES);
  if (!stored) return [];
  return [...stored].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addWorkoutEntry(entry: WorkoutEntry): void {
  ensureSeeded();
  const existing = readJSON<WorkoutEntry[]>(KEYS.ENTRIES) ?? [];
  writeJSON(KEYS.ENTRIES, [entry, ...existing]);
}

export function getLastEntryForExercise(exerciseId: string): WorkoutEntry | null {
  const all = getWorkoutEntries();
  return all.find((e) => e.exerciseId === exerciseId) ?? null;
}

export function getEntriesForExercise(exerciseId: string): WorkoutEntry[] {
  const all = readJSON<WorkoutEntry[]>(KEYS.ENTRIES) ?? [];
  return all
    .filter((e) => e.exerciseId === exerciseId)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

