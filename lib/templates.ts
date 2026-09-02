import { SplitDay, WorkoutTemplate } from '@/types/workout';

export const splitTemplates: Record<SplitDay, WorkoutTemplate> = {
  Push: {
    day: 'Push',
    exercises: [
      { id: 'push-1', name: 'Incline Bench Press', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [7.5, 5, 5] },
      { id: 'push-2', name: 'Peck Fly', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [25, 20, 20] },
      { id: 'push-3', name: 'Butterfly', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [20, 15, 15] },
      { id: 'push-4', name: 'Reverse Pec Fly', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [35, 30, 30] },
      { id: 'push-5', name: 'Cable Lateral Raise (One Arm)', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [7, 5, 5] },
      { id: 'push-6', name: 'Dumbbell Lateral Raise', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [8, 6, 6] },
      { id: 'push-7', name: 'Triceps Pushdown', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [35, 30, 30] },
      { id: 'push-8', name: 'Chest Push Depan', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [15, 10, 10] },
      { id: 'push-9', name: 'Dumbbell Bench', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [10, 8, 8] },
    ]
  },
  Pull: {
    day: 'Pull',
    exercises: [
      { id: 'pull-1', name: 'Pull Up / Lat Pulldown', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [40, 35, 35] },
      { id: 'pull-2', name: 'Wide Grip Rowing', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 3 }], defaultWeights: [35, 30, 30, 30] },
      { id: 'pull-3', name: 'Close Grip Rowing', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [35, 30, 30] },
      { id: 'pull-4', name: 'Face Pull', setPlans: [{ type: 'PR', count: 2 }, { type: 'Normal', count: 2 }], defaultWeights: [35, 35, 30, 30] },
      { id: 'pull-5', name: 'Cable Shrug', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [60, 55, 55] },
      { id: 'pull-6', name: 'Plate Shrug', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [15, 10, 10] },
      { id: 'pull-7', name: 'Biceps Cable Curl', setPlans: [{ type: 'Normal', count: 2 }], defaultWeights: [25, 25] },
    ]
  },
  Arms: {
    day: 'Arms',
    exercises: [
      { id: 'arms-1', name: 'Shoulder Press (DB)', setPlans: [{ type: 'PR', count: 2 }, { type: 'Normal', count: 2 }], defaultWeights: [20, 20, 15, 15] },
      { id: 'arms-2', name: 'Lateral Raise', setPlans: [{ type: 'PR', count: 2 }, { type: 'Normal', count: 2 }], defaultWeights: [8, 8, 6, 6] },
      { id: 'arms-3', name: 'Reverse Pec Fly', setPlans: [{ type: 'PR', count: 2 }, { type: 'Normal', count: 2 }], defaultWeights: [30, 30, 25, 25] },
      { id: 'arms-4', name: 'Triceps Overhead Extension', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [35, 30, 30] },
      { id: 'arms-5', name: 'Triceps Pushdown', setPlans: [{ type: 'Normal', count: 2 }], defaultWeights: [30, 30] },
      { id: 'arms-6', name: 'Hammer Cable Curl', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [30, 25, 25] },
    ]
  },
  Legs: {
    day: 'Legs',
    exercises: [
      { id: 'legs-1', name: 'Squat', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [7.5, 5, 5] },
      { id: 'legs-2', name: 'Romanian Deadlift', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 3 }], defaultWeights: [5, 2.5, 2.5, 2.5] },
      { id: 'legs-3', name: 'Leg Extension', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [50, 50, 50] },
      { id: 'legs-4', name: 'Leg Curl', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [35, 35, 35] },
      { id: 'legs-5', name: 'Calf Raise', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 3 }], defaultWeights: [50, 50, 50, 50] },
    ]
  },
  Rest: {
    day: 'Rest',
    exercises: []
  },
  Upper: {
    day: 'Upper',
    exercises: [
      { id: 'upper-1', name: 'Dips', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [0, 0, 0] },
      { id: 'upper-2', name: 'Peck Fly', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [20, 20, 20] },
      { id: 'upper-3', name: 'Butterfly', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [15, 15, 15] },
      { id: 'upper-4', name: 'Lat Pulldown', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [30, 30, 30] },
      { id: 'upper-5', name: 'Lateral Raise', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [6, 6, 6] },
      { id: 'upper-6', name: 'Wide Rowing', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [30, 30, 30] },
      { id: 'upper-7', name: 'Forearms', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [40, 40, 40] },
    ]
  },
  Lower: {
    day: 'Lower',
    exercises: [
      { id: 'lower-1', name: 'Leg Press', setPlans: [{ type: 'PR', count: 1 }, { type: 'Normal', count: 2 }], defaultWeights: [90, 80, 80] },
      { id: 'lower-2', name: 'Abductor', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [40, 40, 40] },
      { id: 'lower-3', name: 'Leg Extension', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [25, 25, 25] },
      { id: 'lower-4', name: 'Leg Curl', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [25, 25, 25] },
      { id: 'lower-5', name: 'Calf Raise', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [50, 50, 50] },
      { id: 'lower-6', name: 'Sit Up', setPlans: [{ type: 'Normal', count: 3 }], defaultWeights: [0, 0, 0] },
    ]
  }
};

export function getTemplateForDay(day: SplitDay): WorkoutTemplate {
  return splitTemplates[day];
}
