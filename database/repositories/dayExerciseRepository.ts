import { DayExercise, DayExerciseDetail } from "@/types/dayExercise";
import { SQLiteDatabase } from "expo-sqlite";

export async function createDayExercise(
  db: SQLiteDatabase,
  day_id: number,
  exercise_id: number,
  sets: number,
  reps_min: number,
  reps_max: number,
  weight: number,
  rest_seconds: number | null = null,
): Promise<DayExercise> {
  if (
    !day_id ||
    isNaN(Number(day_id)) ||
    day_id <= 0 ||
    !Number.isInteger(day_id)
  ) {
    throw new Error(`El id del dia debe ser un numero valido mayor que cero`);
  }
  if (
    !exercise_id ||
    isNaN(Number(exercise_id)) ||
    exercise_id <= 0 ||
    !Number.isInteger(exercise_id)
  ) {
    throw new Error(`El id de ejercicio debe ser un numero valido mayor que 0`);
  }
  if (!sets || sets < 0 || isNaN(Number(sets))) {
    throw new Error(`Las series debe ser un numero entero mayor o igual que 0`);
  }
  if (!Number.isInteger(reps_min) || reps_min <= 0) {
    throw new Error(`Las reps minimas deben ser un entero mayor que 0.`);
  }
  if (!Number.isInteger(reps_max) || reps_max <= 0) {
    throw new Error(`Las reps maximas deben ser un entero mayor que 0.`);
  }
  if (reps_max < reps_min) {
    throw new Error(`Las reps maximas no pueden ser menores que las minimas.`);
  }
  if (weight < 0 || isNaN(Number(weight))) {
    throw new Error(`El peso debe ser un numero entero mayor o igual que 0`);
  }
  if (rest_seconds !== null) {
    if (
      isNaN(Number(rest_seconds)) ||
      !Number.isInteger(rest_seconds) ||
      rest_seconds < 0
    ) {
      throw new Error(
        `El descanso debe ser un numero entero mayor o igual que 0`,
      );
    }
  }

  try {
    const existing = await db.getFirstAsync<DayExercise>(
      `SELECT * FROM day_exercise WHERE day_id = ? AND exercise_id = ?`,
      [day_id, exercise_id],
    );

    if (existing) {
      throw new Error("El ejercicio ya fue agregado para este dia.");
    }

    const result = await db.runAsync(
      `INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight, rest_seconds) VALUES(?, ?, ?, ?, ?, ?, ?)`,
      [day_id, exercise_id, sets, reps_min, reps_max, weight, rest_seconds],
    );

    const created = await db.getFirstAsync<DayExercise>(
      `SELECT * FROM day_exercise WHERE day_ex_id = ?`,
      [result.lastInsertRowId],
    );

    if (!created) throw new Error(`Error al recuperar el ejercicio creado`);
    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear dia/ejercicio. Error: ${error}`);
  }
}

export async function getDayExercise(
  db: SQLiteDatabase,
  day_ex_id: number,
): Promise<DayExercise> {
  if (
    !day_ex_id ||
    isNaN(Number(day_ex_id)) ||
    day_ex_id <= 0 ||
    !Number.isInteger(day_ex_id)
  ) {
    throw new Error(
      `El id de dia/ejercicio debe ser un numero valido mayor que cero`,
    );
  }
  try {
    const day_exercise = await db.getFirstAsync<DayExercise>(
      `SELECT * FROM day_exercise WHERE day_ex_id = ?`,
      [day_ex_id],
    );
    if (!day_exercise)
      throw new Error(`No se encontró el dia/ejercicio con el id ${day_ex_id}`);
    return day_exercise;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener el dia/ejercicio. Error: ${error}`);
  }
}

export async function getExerciseByDay(
  db: SQLiteDatabase,
  day_id: number,
): Promise<DayExercise[]> {
  if (
    !day_id ||
    isNaN(Number(day_id)) ||
    !Number.isInteger(day_id) ||
    day_id <= 0
  ) {
    throw new Error(`El id de dia debe ser un numero entero mayor que 0`);
  }

  try {
    return await db.getAllAsync<DayExercise>(
      `SELECT * FROM day_exercise WHERE day_id = ?`,
      [day_id],
    );
  } catch (error) {
    throw new Error(`No se pudieron obtener los ejercicios. Error: ${error}`);
  }
}

export async function updateDayExercise(
  db: SQLiteDatabase,
  day_ex_id: number,
  sets?: number,
  reps_min?: number,
  reps_max?: number,
  weight?: number,
  rest_seconds?: number | null,
): Promise<boolean> {
  const fields: string[] = [];
  const values: (number | null)[] = [];

  if (sets !== undefined) {
    if (isNaN(Number(sets)) || !Number.isInteger(sets) || sets <= 0) {
      throw new Error(`Las series deben ser un numero entero mayor que 0.`);
    }
    fields.push("sets = ?");
    values.push(sets);
  }
  if (reps_min !== undefined) {
    if (!Number.isInteger(reps_min) || reps_min <= 0) {
      throw new Error(`Las reps minimas deben ser un entero mayor que 0.`);
    }
    fields.push("reps_min = ?");
    values.push(reps_min);
  }
  if (reps_max !== undefined) {
    if (!Number.isInteger(reps_max) || reps_max <= 0) {
      throw new Error(`Las reps maximas deben ser un entero mayor que 0.`);
    }
    fields.push("reps_max = ?");
    values.push(reps_max);
  }
  if (weight !== undefined) {
    if (isNaN(Number(weight)) || weight < 0) {
      throw new Error(`El peso debe ser un numero mayor o igual a 0.`);
    }
    fields.push("weight = ?");
    values.push(weight);
  }
  if (rest_seconds !== undefined) {
    if (rest_seconds !== null) {
      if (
        isNaN(Number(rest_seconds)) ||
        !Number.isInteger(rest_seconds) ||
        rest_seconds < 0
      ) {
        throw new Error(
          `El descanso debe ser un numero entero mayor o igual a 0.`,
        );
      }
    }
    fields.push("rest_seconds = ?");
    values.push(rest_seconds);
  }

  if (fields.length === 0)
    throw new Error(`No se proporcionaron campos para actualizar`);

  // Validación cruzada: si actualiza ambos, max no puede ser menor que min
  if (reps_min !== undefined && reps_max !== undefined && reps_max < reps_min) {
    throw new Error(`Las reps maximas no pueden ser menores que las minimas.`);
  }

  values.push(day_ex_id);

  try {
    const result = await db.runAsync(
      `UPDATE day_exercise SET ${fields.join(", ")} WHERE day_ex_id = ?`,
      values,
    );
    return result.changes > 0;
  } catch (error) {
    throw new Error(`No se pudo actualizar el dia/ejercicio. ${error}`);
  }
}

export async function deleteDayExercise(
  db: SQLiteDatabase,
  day_ex_id: number,
): Promise<boolean> {
  if (!day_ex_id || isNaN(Number(day_ex_id)) || day_ex_id <= 0) {
    throw new Error(
      "El id de dia/ejercicio debe ser un numero valido mayor que 0.",
    );
  }
  if (!Number.isInteger(day_ex_id)) {
    throw new Error("El id debe ser un numero entero");
  }

  try {
    const day_ex = await db.getFirstAsync<DayExercise>(
      `SELECT * FROM day_exercise WHERE day_ex_id = ?`,
      [day_ex_id],
    );

    if (!day_ex) {
      throw new Error(`No existe un dia/ejercicio con el id ${day_ex_id}`);
    }

    const result = await db.runAsync(
      `DELETE FROM day_exercise WHERE day_ex_id = ?`,
      [day_ex_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo eliminar el ejercicio. Error: ${error}`);
  }
}

export async function getDayExercisesWithDetails(
  db: SQLiteDatabase,
  day_id: number,
): Promise<DayExerciseDetail[]> {
  if (
    !day_id ||
    isNaN(Number(day_id)) ||
    !Number.isInteger(day_id) ||
    day_id <= 0
  ) {
    throw new Error(`El id de dia debe ser un numero entero mayor que 0`);
  }
  try {
    return await db.getAllAsync<DayExerciseDetail>(
      `SELECT 
         de.day_ex_id,
         de.day_id,
         de.exercise_id,
         e.exercise_name,
         de.sets,
         de.reps_min,
         de.reps_max,
         de.weight,
         COALESCE(de.rest_seconds, r.default_rest_seconds) AS rest_seconds
       FROM day_exercise de
       JOIN exercise e ON e.exercise_id = de.exercise_id
       JOIN day d ON d.day_id = de.day_id
       JOIN routine r ON r.routine_id = d.routine_id
       WHERE de.day_id = ?
       ORDER BY de.day_ex_id`,
      [day_id],
    );
  } catch (error) {
    throw new Error(
      `No se pudieron obtener los ejercicios del día. Error: ${error}`,
    );
  }
}
