export type Workout = {
  workout_id: number;
  routine_id: number;
  date: string;
};

// types/workoutExercise.ts
export type WorkoutExercise = {
  workout_ex_id: number;
  workout_id: number;
  exercise_id: number;
  order_num: number;
};

// types/workoutSet.ts
export type WorkoutSet = {
  set_id: number;
  workout_ex_id: number;
  set_number: number;
  reps: number;
  weight: number;
  rest_seconds: number | null;
};
