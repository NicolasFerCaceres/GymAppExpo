import { WorkoutExercise } from "@/types/workout";
import { SQLiteDatabase } from "expo-sqlite";

export async function createWorkoutExercise(
  db: SQLiteDatabase,
  workout_id: number,
  exercise_id: number,
  order_num: number,
): Promise<WorkoutExercise> {
  if (
    !workout_id ||
    isNaN(Number(workout_id)) ||
    workout_id <= 0 ||
    !Number.isInteger(workout_id)
  ) {
    throw new Error(`El id de workout debe ser un numero valido mayor que 0`);
  }
  if (
    !exercise_id ||
    isNaN(Number(exercise_id)) ||
    exercise_id <= 0 ||
    !Number.isInteger(exercise_id)
  ) {
    throw new Error(`El id de ejercicio debe ser un numero valido mayor que 0`);
  }
  if (
    !order_num ||
    isNaN(Number(order_num)) ||
    order_num <= 0 ||
    !Number.isInteger(order_num)
  ) {
    throw new Error(`El orden debe ser un numero entero mayor que 0`);
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO workout_exercise (workout_id, exercise_id, order_num) VALUES (?, ?, ?)`,
      [workout_id, exercise_id, order_num],
    );

    const created = await db.getFirstAsync<WorkoutExercise>(
      `SELECT * FROM workout_exercise WHERE workout_ex_id = ?`,
      [result.lastInsertRowId],
    );

    if (!created)
      throw new Error(`Error al recuperar el workout/ejercicio creado`);
    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear workout/ejercicio. Error: ${error}`);
  }
}

export async function getWorkoutExercise(
  db: SQLiteDatabase,
  workout_ex_id: number,
): Promise<WorkoutExercise> {
  if (
    !workout_ex_id ||
    isNaN(Number(workout_ex_id)) ||
    workout_ex_id <= 0 ||
    !Number.isInteger(workout_ex_id)
  ) {
    throw new Error(
      `El id de workout/ejercicio debe ser un numero valido mayor que 0`,
    );
  }
  try {
    const workoutEx = await db.getFirstAsync<WorkoutExercise>(
      `SELECT * FROM workout_exercise WHERE workout_ex_id = ?`,
      [workout_ex_id],
    );
    if (!workoutEx)
      throw new Error(
        `No se encontró el workout/ejercicio con el id ${workout_ex_id}`,
      );
    return workoutEx;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener el workout/ejercicio. Error: ${error}`);
  }
}

export async function getExercisesByWorkout(
  db: SQLiteDatabase,
  workout_id: number,
): Promise<WorkoutExercise[]> {
  if (
    !workout_id ||
    isNaN(Number(workout_id)) ||
    workout_id <= 0 ||
    !Number.isInteger(workout_id)
  ) {
    throw new Error(`El id de workout debe ser un numero valido mayor que 0`);
  }

  try {
    return await db.getAllAsync<WorkoutExercise>(
      `SELECT * FROM workout_exercise WHERE workout_id = ? ORDER BY order_num ASC`,
      [workout_id],
    );
  } catch (error) {
    throw new Error(
      `No se pudieron obtener los ejercicios del workout. Error: ${error}`,
    );
  }
}

export async function deleteWorkoutExercise(
  db: SQLiteDatabase,
  workout_ex_id: number,
): Promise<boolean> {
  if (
    !workout_ex_id ||
    isNaN(Number(workout_ex_id)) ||
    workout_ex_id <= 0 ||
    !Number.isInteger(workout_ex_id)
  ) {
    throw new Error(
      `El id de workout/ejercicio debe ser un numero valido mayor que 0`,
    );
  }

  try {
    const workoutEx = await db.getFirstAsync<WorkoutExercise>(
      `SELECT * FROM workout_exercise WHERE workout_ex_id = ?`,
      [workout_ex_id],
    );
    if (!workoutEx) {
      throw new Error(
        `No existe un workout/ejercicio con el id ${workout_ex_id}`,
      );
    }

    const result = await db.runAsync(
      `DELETE FROM workout_exercise WHERE workout_ex_id = ?`,
      [workout_ex_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(
      `No se pudo eliminar el workout/ejercicio. Error: ${error}`,
    );
  }
}
