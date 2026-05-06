export interface Workout {
  workout_id: number;
  routine_id: number;
  date: string;
}

export interface WorkoutExercise {
  workout_ex_id: number;
  workout_id: number;
  exercise_id: number;
  order_num: number;
}

export interface WorkoutSet {
  set_id: number;
  workout_ex_id: number;
  set_number: number;
  reps: number;
  weight: number;
  rest_seconds: number;
}

// Tipos para crear un workout completo desde el componente
export interface NewWorkoutSet {
  set_number: number;
  reps: number;
  weight: number;
}

export interface NewWorkoutExercise {
  exercise_id: number;
  order_num: number;
  sets: NewWorkoutSet[];
}

export interface NewWorkout {
  routine_id: number;
  exercises: NewWorkoutExercise[];
}
