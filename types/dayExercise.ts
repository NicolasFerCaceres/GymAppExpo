export interface DayExercise {
  day_ex_id: number;
  day_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  weight: number;
}

export interface DayExerciseDetail extends DayExercise {
  exercise_name: string;
}
