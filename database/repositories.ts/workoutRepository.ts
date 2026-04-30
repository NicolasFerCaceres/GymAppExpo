import { Workout } from "@/types/workout";
import { SQLiteDatabase } from "expo-sqlite";

export async function createWorkout(
  db: SQLiteDatabase,
  routine_id: number,
  date: string,
): Promise<Workout> {
  if (
    !routine_id ||
    isNaN(Number(routine_id)) ||
    routine_id <= 0 ||
    !Number.isInteger(routine_id)
  ) {
    throw new Error(`El id de rutina debe ser un numero valido mayor que 0`);
  }
  if (!date || typeof date !== "string" || date.trim().length === 0) {
    throw new Error(`La fecha es requerida`);
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO workout (routine_id, date) VALUES (?, ?)`,
      [routine_id, date],
    );

    const created = await db.getFirstAsync<Workout>(
      `SELECT * FROM workout WHERE workout_id = ?`,
      [result.lastInsertRowId],
    );

    if (!created) throw new Error(`Error al recuperar el workout creado`);
    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear workout. Error: ${error}`);
  }
}

export async function getWorkout(
  db: SQLiteDatabase,
  workout_id: number,
): Promise<Workout> {
  if (
    !workout_id ||
    isNaN(Number(workout_id)) ||
    workout_id <= 0 ||
    !Number.isInteger(workout_id)
  ) {
    throw new Error(`El id de workout debe ser un numero valido mayor que 0`);
  }
  try {
    const workout = await db.getFirstAsync<Workout>(
      `SELECT * FROM workout WHERE workout_id = ?`,
      [workout_id],
    );
    if (!workout)
      throw new Error(`No se encontró el workout con el id ${workout_id}`);
    return workout;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener el workout. Error: ${error}`);
  }
}

export async function getWorkoutsByRoutine(
  db: SQLiteDatabase,
  routine_id: number,
): Promise<Workout[]> {
  if (
    !routine_id ||
    isNaN(Number(routine_id)) ||
    routine_id <= 0 ||
    !Number.isInteger(routine_id)
  ) {
    throw new Error(`El id de rutina debe ser un numero valido mayor que 0`);
  }

  try {
    return await db.getAllAsync<Workout>(
      `SELECT * FROM workout WHERE routine_id = ? ORDER BY date DESC`,
      [routine_id],
    );
  } catch (error) {
    throw new Error(`No se pudieron obtener los workouts. Error: ${error}`);
  }
}

export async function getAllWorkouts(db: SQLiteDatabase): Promise<Workout[]> {
  try {
    return await db.getAllAsync<Workout>(
      `SELECT * FROM workout ORDER BY date DESC`,
    );
  } catch (error) {
    throw new Error(`No se pudieron obtener los workouts. Error: ${error}`);
  }
}

export async function updateWorkout(
  db: SQLiteDatabase,
  workout_id: number,
  date?: string,
): Promise<boolean> {
  const fields = [];
  const values = [];

  if (date !== undefined) {
    if (typeof date !== "string" || date.trim().length === 0) {
      throw new Error(`La fecha no puede estar vacia`);
    }
    fields.push("date = ?");
    values.push(date);
  }

  if (fields.length === 0)
    throw new Error(`No se proporcionaron campos para actualizar`);

  values.push(workout_id);

  try {
    const result = await db.runAsync(
      `UPDATE workout SET ${fields.join(", ")} WHERE workout_id = ?`,
      values,
    );
    return result.changes > 0;
  } catch (error) {
    throw new Error(`No se pudo actualizar el workout. ${error}`);
  }
}

export async function deleteWorkout(
  db: SQLiteDatabase,
  workout_id: number,
): Promise<boolean> {
  if (!workout_id || isNaN(Number(workout_id)) || workout_id <= 0) {
    throw new Error(`El id de workout debe ser un numero valido mayor que 0`);
  }
  if (!Number.isInteger(workout_id)) {
    throw new Error(`El id debe ser un numero entero`);
  }

  try {
    const workout = await db.getFirstAsync<Workout>(
      `SELECT * FROM workout WHERE workout_id = ?`,
      [workout_id],
    );
    if (!workout) {
      throw new Error(`No existe un workout con el id ${workout_id}`);
    }

    const result = await db.runAsync(
      `DELETE FROM workout WHERE workout_id = ?`,
      [workout_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo eliminar el workout. Error: ${error}`);
  }
}
