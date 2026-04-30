import { WorkoutSet } from "@/types/workout";
import { SQLiteDatabase } from "expo-sqlite";

export async function createWorkoutSet(
  db: SQLiteDatabase,
  workout_ex_id: number,
  set_number: number,
  reps: number,
  weight: number,
  rest_seconds: number | null,
): Promise<WorkoutSet> {
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
  if (
    !set_number ||
    isNaN(Number(set_number)) ||
    set_number <= 0 ||
    !Number.isInteger(set_number)
  ) {
    throw new Error(`El numero de serie debe ser un entero mayor que 0`);
  }
  if (!reps || isNaN(Number(reps)) || reps <= 0 || !Number.isInteger(reps)) {
    throw new Error(`Las repeticiones deben ser un numero entero mayor que 0`);
  }
  if (weight < 0 || isNaN(Number(weight))) {
    throw new Error(`El peso debe ser un numero mayor o igual que 0`);
  }
  if (rest_seconds !== null) {
    if (
      isNaN(Number(rest_seconds)) ||
      rest_seconds < 0 ||
      !Number.isInteger(rest_seconds)
    ) {
      throw new Error(
        `El descanso debe ser un numero entero mayor o igual que 0`,
      );
    }
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO workout_set (workout_ex_id, set_number, reps, weight, rest_seconds) VALUES (?, ?, ?, ?, ?)`,
      [workout_ex_id, set_number, reps, weight, rest_seconds],
    );

    const created = await db.getFirstAsync<WorkoutSet>(
      `SELECT * FROM workout_set WHERE set_id = ?`,
      [result.lastInsertRowId],
    );

    if (!created) throw new Error(`Error al recuperar la serie creada`);
    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear la serie. Error: ${error}`);
  }
}

export async function getSetsByWorkoutExercise(
  db: SQLiteDatabase,
  workout_ex_id: number,
): Promise<WorkoutSet[]> {
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
    return await db.getAllAsync<WorkoutSet>(
      `SELECT * FROM workout_set WHERE workout_ex_id = ? ORDER BY set_number ASC`,
      [workout_ex_id],
    );
  } catch (error) {
    throw new Error(`No se pudieron obtener las series. Error: ${error}`);
  }
}

export async function updateWorkoutSet(
  db: SQLiteDatabase,
  set_id: number,
  reps?: number,
  weight?: number,
  rest_seconds?: number | null,
): Promise<boolean> {
  const fields = [];
  const values = [];

  if (reps !== undefined) {
    if (isNaN(Number(reps)) || !Number.isInteger(reps) || reps <= 0) {
      throw new Error(
        `Las repeticiones deben ser un numero entero mayor que 0`,
      );
    }
    fields.push("reps = ?");
    values.push(reps);
  }
  if (weight !== undefined) {
    if (isNaN(Number(weight)) || weight < 0) {
      throw new Error(`El peso debe ser un numero mayor o igual que 0`);
    }
    fields.push("weight = ?");
    values.push(weight);
  }
  if (rest_seconds !== undefined) {
    if (rest_seconds !== null) {
      if (
        isNaN(Number(rest_seconds)) ||
        rest_seconds < 0 ||
        !Number.isInteger(rest_seconds)
      ) {
        throw new Error(
          `El descanso debe ser un numero entero mayor o igual que 0`,
        );
      }
    }
    fields.push("rest_seconds = ?");
    values.push(rest_seconds);
  }

  if (fields.length === 0)
    throw new Error(`No se proporcionaron campos para actualizar`);

  values.push(set_id);

  try {
    const result = await db.runAsync(
      `UPDATE workout_set SET ${fields.join(", ")} WHERE set_id = ?`,
      values,
    );
    return result.changes > 0;
  } catch (error) {
    throw new Error(`No se pudo actualizar la serie. ${error}`);
  }
}

export async function deleteWorkoutSet(
  db: SQLiteDatabase,
  set_id: number,
): Promise<boolean> {
  if (
    !set_id ||
    isNaN(Number(set_id)) ||
    set_id <= 0 ||
    !Number.isInteger(set_id)
  ) {
    throw new Error(`El id de serie debe ser un numero valido mayor que 0`);
  }

  try {
    const set = await db.getFirstAsync<WorkoutSet>(
      `SELECT * FROM workout_set WHERE set_id = ?`,
      [set_id],
    );
    if (!set) {
      throw new Error(`No existe una serie con el id ${set_id}`);
    }

    const result = await db.runAsync(
      `DELETE FROM workout_set WHERE set_id = ?`,
      [set_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo eliminar la serie. Error: ${error}`);
  }
}
