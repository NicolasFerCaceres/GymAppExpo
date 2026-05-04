import { DayExercise, DayExerciseDetail } from "@/types/dayExercise";
import { SQLiteDatabase } from "expo-sqlite";


export async function createDayExercise(
  db: SQLiteDatabase,
  day_id: number,
  exercise_id: number,
  sets: number,
  reps: number,
  weight: number,
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

  if (!reps || reps < 0 || isNaN(Number(reps))) {
    throw new Error(
      `Las repeticiones debe ser un numero entero mayor o igual que 0`,
    );
  }

  if (weight < 0 || isNaN(Number(weight))) {
    throw new Error(`El peso debe ser un numero entero mayor o igual que 0`);
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
      `INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES(?, ?, ?, ?, ?)`,
      [day_id, exercise_id, sets, reps, weight],
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
  reps?: number,
  weight?: number,
): Promise<boolean> {
  const fields = [];
  const values = [];

  if (sets !== undefined) {
    if (isNaN(Number(sets)) || !Number.isInteger(sets) || sets <= 0) {
      throw new Error(`Las series deben ser un numero entero mayor que 0.`);
    } else {
      fields.push("sets = ?");
      values.push(sets);
    }
  }
  if (weight !== undefined) {
    if (isNaN(Number(weight)) || weight <= 0) {
      throw new Error(`El peso debe ser un numero mayor a 0.`);
    } else {
      fields.push("weight = ?");
      values.push(weight);
    }
  }
  if (reps !== undefined) {
    if (isNaN(Number(reps)) || !Number.isInteger(reps) || reps <= 0) {
      throw new Error(`Las repeticiones deben ser un numero entero mayor a 0.`);
    } else {
      fields.push("reps = ?");
      values.push(reps);
    }
  }
  if (fields.length === 0)
    throw new Error(`No se proporcionaron campos para actualizar`);

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
    throw new Error(`No se pudo el ejercicio. Error: ${error}`);
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
         de.reps,
         de.weight
       FROM day_exercise de
       JOIN exercise e ON e.exercise_id = de.exercise_id
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
