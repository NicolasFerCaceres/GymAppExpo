import { val_text_only } from "@/helpers/validators";
import { Routine } from "@/types/routine";
import { SQLiteDatabase } from "expo-sqlite";

export async function createRoutine(
  db: SQLiteDatabase,
  routine_desc: string,
): Promise<Routine> {
  if (!routine_desc || routine_desc.trim() === "") {
    throw new Error("El nombre de la rutina no puede estar vacia.");
  }
  if (routine_desc.length > 100) {
    throw new Error("La descripcion no puede superar los 100 caracteres");
  }

  const sanitized = routine_desc.trim();

  val_text_only(sanitized, "La descripcion de la rutina");

  try {
    const existing = await db.getFirstAsync<Routine>(
      `SELECT * FROM routine WHERE LOWER(routine_desc) = LOWER(?)`,
      [sanitized],
    );
    if (existing) {
      throw new Error(`El ejercicio "${sanitized}" ya existe`);
    }
    const result = await db.runAsync(
      `INSERT INTO routine (routine_desc) VALUES(?)`,
      [sanitized],
    );
    const created = await db.getFirstAsync<Routine>(
      `SELECT * FROM routine WHERE routine_id = ?`,
      [result.lastInsertRowId],
    );
    if (!created) throw new Error("Error al recuperar el ejercicio creado");

    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear rutina. Error: ${error}`);
  }
}

export async function getRoutineById(
  db: SQLiteDatabase,
  routine_id: number,
): Promise<Routine> {
  if (!routine_id || isNaN(Number(routine_id)) || routine_id <= 0) {
    throw new Error(
      "El id de la rutina debe ser un numero valido mayor que 0.",
    );
  }

  if (Number(routine_id) > 999999) {
    throw new Error("El id de la rutina supera el rango maximo.");
  }

  if (!Number.isInteger(routine_id)) {
    throw new Error("El id debe ser un numero entero.");
  }

  try {
    const routine = await db.getFirstAsync<Routine>(
      `SELECT * FROM routine WHERE routine_id = ?`,
      [routine_id],
    );
    if (!routine)
      throw new Error(`No se encontró la rutina con el id ${routine_id}`);
    return routine;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener la Rutina. Error: ${error}`);
  }
}

export async function getAllRoutines(db: SQLiteDatabase): Promise<Routine[]> {
  try {
    return await db.getAllAsync<Routine>(`SELECT * FROM routine`);
  } catch (error) {
    throw new Error(`No se pdieron obtener los ejercicios. Error: ${error}`);
  }
}

export async function updateRoutine(
  db: SQLiteDatabase,
  routine_id: number,
  routine_desc: string,
): Promise<boolean> {
  if (!routine_id || isNaN(Number(routine_id)) || routine_id <= 0) {
    throw new Error(
      "El id de la rutina debe ser un numero valido mayor que 0.",
    );
  }
  if (Number(routine_id) > 999999) {
    throw new Error("El id de la rutina supera el rango maximo.");
  }
  if (!Number.isInteger(routine_id)) {
    throw new Error("El id debe ser un numero entero");
  }
  if (!routine_desc) {
    throw new Error("La descripcion de la rutina no puede ser nulo.");
  }
  const sanitized_desc = routine_desc.trim();
  if (sanitized_desc === "") {
    throw new Error("La descripcion de la rutina no puede estar vacia.");
  }
  if (sanitized_desc.length > 100) {
    throw new Error("La descripcion no puede superar los 100 caracteres.");
  }
  try {
    const pre_update = await db.getFirstAsync<Routine>(
      `SELECT * FROM routine WHERE LOWER(routine_desc) = LOWER(?)`,
      [sanitized_desc],
    );

    if (pre_update) {
      throw new Error(`La rutina con desc "${sanitized_desc}" ya existe`);
    }

    const result = await db.runAsync(
      `UPDATE routine SET routine_desc = ? WHERE routine_id = ?`,
      [sanitized_desc, routine_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo actualizar la rutina. Error: ${error}`);
  }
}

export async function deleteRoutine(
  db: SQLiteDatabase,
  routine_id: number,
): Promise<boolean> {
  if (!routine_id || isNaN(Number(routine_id)) || routine_id <= 0) {
    throw new Error(
      "El id de la rutina debe ser un numero valido mayor que 0.",
    );
  }
  if (Number(routine_id) > 999999) {
    throw new Error("El id supera el rango maximo");
  }

  if (!Number.isInteger(routine_id)) {
    throw new Error("El id debe ser un numero entero.");
  }

  try {
    const routine = await db.getFirstAsync<Routine>(
      `SELECT * FROM routine WHERE routine_id = ?`,
      [routine_id],
    );

    if (!routine) {
      throw new Error(`No existe un ejercicio con el id ${routine_id}`);
    }
    const result = await db.runAsync(
      `DELETE FROM routine WHERE routine_id = ?`,
      [routine_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo eliminar el ejercicio. Error: ${error}`);
  }
}

export async function getActiveRoutine(
  db: SQLiteDatabase,
): Promise<Routine | null> {
  try {
    const result = await db.getFirstAsync<Routine>(
      `SELECT * FROM routine WHERE is_active = 1 LIMIT 1`,
    );
    return result ?? null;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener la rutina activa. Error: ${error}`);
  }
}

export async function setActiveRoutine(
  db: SQLiteDatabase,
  routine_id: number,
): Promise<boolean> {
  if (!routine_id || isNaN(Number(routine_id)) || routine_id <= 0) {
    throw new Error(
      "El id de la rutina debe ser un numero valido mayor que 0.",
    );
  }
  if (Number(routine_id) > 999999) {
    throw new Error("El id de la rutina supera el rango maximo.");
  }
  if (!Number.isInteger(routine_id)) {
    throw new Error("El id debe ser un numero entero.");
  }

  try {
    const exists = await db.getFirstAsync<Routine>(
      `SELECT * FROM routine WHERE routine_id = ?`,
      [routine_id],
    );
    if (!exists) {
      throw new Error(`No existe una rutina con el id ${routine_id}`);
    }

    // Desactivar todas y activar la elegida, en una transacción
    await db.withTransactionAsync(async () => {
      await db.runAsync(`UPDATE routine SET is_active = 0`);
      await db.runAsync(
        `UPDATE routine SET is_active = 1 WHERE routine_id = ?`,
        [routine_id],
      );
    });

    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo establecer la rutina activa. Error: ${error}`);
  }
}

export async function clearActiveRoutine(db: SQLiteDatabase): Promise<boolean> {
  try {
    const result = await db.runAsync(`UPDATE routine SET is_active = 0`);
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo limpiar la rutina activa. Error: ${error}`);
  }
}
