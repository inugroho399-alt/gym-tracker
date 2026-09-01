/**
 * types/workout.ts
 * Core domain types for the Gym Progress Tracker app.
 */

/** A type of exercise (e.g. "Bench Press", "Squat"). */
export interface Exercise {
  id: string;
  name: string;
}

/** A single set within a workout entry (reps × weight). */
export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number; // in kg
}

/** A full workout entry: one exercise performed on a given date with one or more sets. */
export interface WorkoutEntry {
  id: string;
  date: string;        // ISO 8601, e.g. "2026-09-01T10:00:00.000Z"
  exerciseId: string;  // references Exercise.id
  sets: WorkoutSet[];
  note?: string;
}
