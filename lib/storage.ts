/**
 * lib/storage.ts
 * Type-safe localStorage helpers for the Gym Progress Tracker.
 */

import type { Exercise, WorkoutEntry, WorkoutSet, WorkoutSession, SplitDay } from "@/types/workout";

// ─── Storage keys ────────────────────────────────────────────────────────────

const KEYS = {
  EXERCISES: "gym-tracker-exercises",
  SEEDED: "gym-tracker-seeded-v3", // version bump for force seed
  SESSIONS: "gym-tracker-sessions",
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

const DEFAULT_ENTRIES: WorkoutEntry[] = [];

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

// ─── Workout session helpers ──────────────────────────────────────────────────

export function getWorkoutSessions(): WorkoutSession[] {
  const stored = readJSON<WorkoutSession[]>(KEYS.SESSIONS);
  if (!stored) return [];
  return [...stored].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addWorkoutSession(session: WorkoutSession): void {
  const existing = getWorkoutSessions();
  writeJSON(KEYS.SESSIONS, [session, ...existing]);
}

export function getLastSessionForDay(day: SplitDay): WorkoutSession | null {
  const all = getWorkoutSessions();
  return all.find((s) => s.day === day) ?? null;
}
