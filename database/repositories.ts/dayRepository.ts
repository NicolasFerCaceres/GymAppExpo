import { val_text_only } from "@/helpers/validators";
import { Day } from "@/types/day";
import { SQLiteDatabase } from "expo-sqlite";

// Helper local para validar IDs (idealmente lo movés a helpers/validators.ts)
function val_id(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0 || value > 999999) {
    throw new Error(
      `${fieldName} debe ser un entero positivo válido.: ${value}`,
    );
  }
}

export async function createDay(
  db: SQLiteDatabase,
  day_desc: string,
  routine_id: number,
): Promise<Day> {
  if (!day_desc || day_desc.trim() === "") {
    throw new Error("El nombre del día no puede estar vacío.");
  }
  if (day_desc.length > 100) {
    throw new Error("El nombre no puede superar los 100 caracteres.");
  }

  const sanitized = day_desc.trim();
  val_text_only(sanitized, "El nombre del día");
  val_id(routine_id, "El id de rutina");

  try {
    const existing = await db.getFirstAsync<Day>(
      `SELECT * 
       FROM day 
       WHERE routine_id = ?
       AND LOWER(day_desc) = LOWER(?)`,
      [routine_id, sanitized],
    );

    if (existing) {
      throw new Error(`El día "${sanitized}" ya existe en esta rutina.`);
    }

    const result = await db.runAsync(
      `INSERT INTO day (day_desc, routine_id) VALUES (?, ?)`,
      [sanitized, routine_id],
    );

    const created = await db.getFirstAsync<Day>(
      `SELECT * FROM day WHERE day_id = ?`,
      [result.lastInsertRowId],
    );

    if (!created) throw new Error("Error al recuperar el día creado.");
    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear día: ${error}`);
  }
}

export async function getDayById(
  db: SQLiteDatabase,
  day_id: number,
): Promise<Day> {
  val_id(day_id, "El id del día");

  try {
    const day = await db.getFirstAsync<Day>(
      `SELECT * FROM day WHERE day_id = ?`,
      [day_id],
    );
    if (!day) throw new Error(`No se encontró el día con id ${day_id}`);
    return day;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener el día: ${error}`);
  }
}

export async function getDaysByRoutineId(
  db: SQLiteDatabase,
  routine_id: number,
): Promise<Day[]> {
  val_id(routine_id, "El id de rutina");

  try {
    return await db.getAllAsync<Day>(`SELECT * FROM day WHERE routine_id = ?`, [
      routine_id,
    ]);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener los días. Error: ${error}`);
  }
}

export async function updateDay(
  db: SQLiteDatabase,
  day_id: number,
  day_desc: string,
  routine_id: number,
): Promise<boolean> {
  if (!day_desc) {
    throw new Error("La descripción del día no puede ser nula.");
  }

  const sanitized_desc = day_desc.trim();

  if (sanitized_desc === "") {
    throw new Error("La descripción del día no puede estar vacía.");
  }
  if (sanitized_desc.length > 100) {
    throw new Error("La descripción no puede superar los 100 caracteres.");
  }

  val_id(day_id, "El id del día");
  val_id(routine_id, "El id de rutina");

  try {
    const pre_update = await db.getFirstAsync<Day>(
      `SELECT * FROM day 
       WHERE routine_id = ? 
       AND LOWER(day_desc) = LOWER(?)
       AND day_id != ?`,
      [routine_id, sanitized_desc, day_id],
    );

    if (pre_update) {
      throw new Error(
        `La rutina ya tiene un día con descripción: "${sanitized_desc}".`,
      );
    }

    const result = await db.runAsync(
      `UPDATE day SET day_desc = ? WHERE day_id = ?`,
      [sanitized_desc, day_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo actualizar el día. Error: ${error}`);
  }
}

export async function deleteDay(
  db: SQLiteDatabase,
  day_id: number,
): Promise<boolean> {
  val_id(day_id, "El id del día");

  try {
    const day = await db.getFirstAsync<Day>(
      `SELECT * FROM day WHERE day_id = ?`,
      [day_id],
    );
    if (!day) {
      throw new Error(`No existe un día con el id ${day_id}`);
    }

    const result = await db.runAsync(`DELETE FROM day WHERE day_id = ?`, [
      day_id,
    ]);
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo eliminar el día. Error: ${error}`);
  }
}
