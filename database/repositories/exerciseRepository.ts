import { val_text_only } from "@/helpers/validators";
import { Exercise } from "@/types/exercise";
import { SQLiteDatabase } from "expo-sqlite";

export async function createExercise(
  db: SQLiteDatabase,
  exercise_name: string,
): Promise<Exercise> {
  if (!exercise_name || exercise_name.trim() === "") {
    throw new Error("El nombre del ejercicio no puede estar vacio.");
  }
  if (exercise_name.length > 100) {
    throw new Error("El nombre no puede superar los 100 caracteres");
  }

  const sanitized = exercise_name.trim();

  val_text_only(sanitized, "El nombre del ejercicio");

  try {
    const existing = await db.getFirstAsync<Exercise>(
      `SELECT * FROM exercise WHERE LOWER(exercise_name) = LOWER(?)`,
      [sanitized],
    );

    if (existing) {
      throw new Error(`El ejercicio "${sanitized}" ya existe`);
    }
    const result = await db.runAsync(
      `INSERT INTO exercise (exercise_name) VALUES (?)`,
      [sanitized],
    );

    const created = await db.getFirstAsync<Exercise>(
      `SELECT * FROM exercise WHERE exercise_id = ?`,
      [result.lastInsertRowId],
    );

    if (!created) throw new Error("Error al recuperar el ejercicio creado");

    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear ejercicio: ${error}`);
  }
}

export async function getExerciseById(
  db: SQLiteDatabase,
  exercise_id: number,
): Promise<Exercise> {
  if (!exercise_id || isNaN(Number(exercise_id)) || exercise_id <= 0) {
    throw new Error(
      "El id del ejercicio debe ser un numero valido mayor que 0.",
    );
  }

  if (Number(exercise_id) > 999999) {
    throw new Error("El id del ejercicio supera el rango maximo.");
  }

  if (!Number.isInteger(exercise_id)) {
    throw new Error("El id debe ser un numero entero.");
  }

  try {
    const exercise = await db.getFirstAsync<Exercise>(
      `SELECT * FROM exercise WHERE exercise_id = ?`,
      [exercise_id],
    );
    if (!exercise)
      throw new Error(`No se encontó el ejercicio con el id ${exercise_id}`);
    return exercise;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener el ejercicio. Error: ${error}`);
  }
}

export async function getAllExercises(db: SQLiteDatabase): Promise<Exercise[]> {
  try {
    return await db.getAllAsync<Exercise>(`SELECT * FROM exercise`);
  } catch (error) {
    throw new Error(`No se pudieron obtener los ejercicios: ${error}`);
  }
}

export async function updateExercise(
  db: SQLiteDatabase,
  exercise_id: number,
  exercise_name: string,
): Promise<boolean> {
  if (!exercise_id || isNaN(Number(exercise_id)) || exercise_id <= 0) {
    throw new Error(
      "El id del ejercicio debe ser un numero valido mayor que 0.",
    );
  }
  if (Number(exercise_id) > 999999) {
    throw new Error("El id del ejercicio supera el rango maximo.");
  }
  if (!Number.isInteger(exercise_id)) {
    throw new Error("El id debe ser un numero entero.");
  }

  if (!exercise_name) {
    throw new Error("El nombre del ejercicio no puede ser nulo.");
  }

  const sanitized_name = exercise_name.trim();

  if (sanitized_name === "") {
    throw new Error("El nombre no puede estar vacio.");
  }

  if (sanitized_name.length > 100) {
    throw new Error("El nombre no puede superar los 100 caracteres");
  }
  try {
    const pre_update = await db.getFirstAsync<Exercise>(
      `SELECT * FROM exercise WHERE LOWER(exercise_name) = LOWER (?)`,
      [sanitized_name],
    );

    if (pre_update) {
      throw new Error(`El ejercicio con nombre "${sanitized_name}" ya existe`);
    }

    const result = await db.runAsync(
      `UPDATE exercise SET exercise_name = ? WHERE exercise_id = ?`,
      [sanitized_name, exercise_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo actualizar el ejercicio. Error: ${error}`);
  }
}

export async function deleteExercise(
  db: SQLiteDatabase,
  exercise_id: number,
): Promise<boolean> {
  if (!exercise_id || isNaN(Number(exercise_id)) || exercise_id <= 0) {
    throw new Error(
      "El id del ejercicio debe ser un numero valido mayor que 0.",
    );
  }
  if (Number(exercise_id) > 999999) {
    throw new Error("El id supera el rango maximo.");
  }

  if (!Number.isInteger(exercise_id)) {
    throw new Error("El id debe ser un numero entero.");
  }

  try {
    const exercice = await db.getFirstAsync<Exercise>(
      `SELECT * FROM exercise WHERE exercise_id = ?`,
      [exercise_id],
    );

    if (!exercice) {
      throw new Error(`No existe un ejercicio con el id ${exercise_id}`);
    }
    const result = await db.runAsync(
      `DELETE FROM exercise WHERE exercise_id = ?`,
      [exercise_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo eliminar el ejercicio. Error: ${error}`);
  }
}
