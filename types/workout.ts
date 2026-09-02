/**
 * types/workout.ts
 * Core domain types for the Gym Progress Tracker app.
 */

/** A type of exercise (e.g. "Bench Press", "Squat"). */
export interface Exercise {
  id: string;
  name: string;
}

// Removed WorkoutSet and WorkoutEntry

export type SplitDay = 'Push' | 'Pull' | 'Arms' | 'Legs' | 'Rest' | 'Upper' | 'Lower';

export interface SetPlan {
  type: 'PR' | 'Normal';
  count: number;
}

export interface TemplateExercise {
  id: string;
  name: string;
  setPlans: SetPlan[];
  defaultWeights: number[];
}

export interface WorkoutTemplate {
  day: SplitDay;
  exercises: TemplateExercise[];
}

export interface SessionSet {
  type: 'PR' | 'Normal';
  reps: number;
  weight: number;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string
  day: SplitDay;
  exercises: SessionExercise[];
}
