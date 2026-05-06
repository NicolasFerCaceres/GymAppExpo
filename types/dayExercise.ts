export interface DayExercise {
  day_ex_id: number;
  day_id: number;
  exercise_id: number;
  sets: number;
  reps_min: number;
  reps_max: number;
  weight: number;
  rest_seconds: number;
}

export interface DayExerciseDetail extends DayExercise {
  exercise_name: string;
  rest_seconds: number;
}
