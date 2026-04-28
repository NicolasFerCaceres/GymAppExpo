import { val_text_only } from "@/helpers/validators";
import { Day } from "@/types/day";
import { SQLiteDatabase } from "expo-sqlite";

export async function createDay(
  db: SQLiteDatabase,
  day_desc: string,
  routine_id: number,
): Promise<Day> {
  if (!day_desc || day_desc.trim() === "") {
    throw new Error("El nombre del dia no puede estar vacio.");
  }
  if (day_desc.length > 100) {
    throw new Error("El nombre no puede superar los 100 caracteres");
  }

  const sanitized = day_desc.trim();

  val_text_only(sanitized, "El nombre del dia");

  if (!routine_id || isNaN(Number(routine_id)) || routine_id <= 0) {
    throw new Error(`El id de rutina ebe ser un numero valido mayor que 0.`);
  }

  if (Number(routine_id) > 999999) {
    throw new Error(`El id de rutina supera el rango maximo.`);
  }
  if (Number.isInteger(routine_id)) {
    throw new Error(`El id debe ser un numero entero.`);
  }

  try {
    const existing = await db.getFirstAsync<Day>(
      `SELECT * 
            FROM day 
            WHERE routine_id = ?
            AND LOWER(day_desc) = LOWER(?)`,

      [routine_id, sanitized],
    );

    if (existing) {
      throw new Error(`El dia "${sanitized}" ya existe en esta rutina.`);
    }
    const result = await db.runAsync(
      `INSERT INTO day (day_desc, routine_id) VALUES(?,?)`,
      [sanitized, routine_id],
    );

    const created = await db.getFirstAsync<Day>(
      `SELECT * FROM day WHERE day_id = ?`,
      [result.lastInsertRowId],
    );

    if (!created) throw new Error(`Error al recuperar el dia creado.`);
    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear ejercicio: ${error}`);
  }
}

export async function getDayById(
  db: SQLiteDatabase,
  day_id: number,
): Promise<Day> {
  if (!day_id || isNaN(Number(day_id)) || day_id <= 0) {
    throw new Error("El id del dia debe ser un numero valido o mayor que 0.");
  }
  if (Number(day_id) > 999999) {
    throw new Error("El id del ejercicio supera el rango maximo.");
  }

  if (!Number.isInteger(day_id)) {
    throw new Error("El id debe ser un numero entero");
  }

  try {
    const day = await db.getFirstAsync<Day>(
      `SELECT * FROM day WHERE day_id = ?`,
      [day_id],
    );
    if (!day) throw new Error(`No se encontró el dia con id ${day_id}`);
    return day;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener los dias ${error}`);
  }
}

export async function getAllDays(
  db: SQLiteDatabase,
  routine_id: number,
): Promise<Day[]> {
  if (!routine_id || isNaN(Number(routine_id)) || routine_id <= 0) {
    throw new Error(`El id de rutina ebe ser un numero valido mayor que 0.`);
  }

  if (Number(routine_id) > 999999) {
    throw new Error(`El id debe ser un numero entero.`);
  }
  if (Number.isInteger(routine_id)) {
    throw new Error(`El id debe ser un numero entero.`);
  }

  try {
    return await db.getAllAsync<Day>(`SELECT * FROM day WHERE routine_id = ?`, [
      routine_id,
    ]);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo obtener los dias. Error: ${error}`);
  }
}

export async function updateDay(
  db: SQLiteDatabase,
  day_id: number,
  day_desc: string,
  routine_id: number,
): Promise<boolean> {
  if (!day_desc) {
    throw new Error(`La descripcion de el dia puede ser nula`);
  }
  const sanitized_desc = day_desc.trim();

  if (sanitized_desc === "") {
    throw new Error(`La descripcion de el dia puede estar vacia`);
  }

  if (sanitized_desc.length > 100) {
    throw new Error(`La descripcion no puede superar los 100 caracteres. `);
  }

  if (!day_id || isNaN(Number(day_id)) || day_id <= 0) {
    throw new Error(`El id de dia debe ser un numero valido mayor que 0`);
  }

  if (Number(day_id) > 999999) {
    throw new Error(`El id de dia supera el rango maximo`);
  }

  if (!Number.isInteger(day_id)) {
    throw new Error(`El id debe ser un numero entero`);
  }

  if (!routine_id || isNaN(Number(routine_id)) || routine_id <= 0) {
    throw new Error(`El id de rutina debe ser un numero valido mayor que 0.`);
  }

  if (Number(routine_id) > 999999) {
    throw new Error(`El id de rutina supera el rango maximo.`);
  }
  if (!Number.isInteger(routine_id)) {
    throw new Error(`El id debe ser un numero entero.`);
  }

  try {
    const pre_update = await db.getFirstAsync<Day>(
      `SELECT * FROM day WHERE routine_id = ? and LOWER(day_desc) = LOWER(?)`,
      [routine_id, sanitized_desc],
    );
    if (pre_update) {
      throw new Error(
        `La rutina ya tiene un dia con descripcion : "${sanitized_desc}".`,
      );
    }
    const result = await db.runAsync(
      `UPDATE day Set day_desc = ? WHERE day_id = ?`,
      [sanitized_desc, day_id],
    );
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo actualizar la rutina. Error: ${error}`);
  }
}

export async function deleteDay(
  db: SQLiteDatabase,
  day_id: number,
): Promise<boolean> {
  if (!day_id || isNaN(Number(day_id)) || day_id <= 0) {
    throw new Error("El id de la rutina debe ser numero valido mayor que 0.");
  }

  if (Number(day_id) > 99999) {
    throw new Error("El id supera el rango maximo.");
  }

  if (!Number.isInteger(day_id)) {
    throw new Error("El id debe ser un numero entero.");
  }

  try {
    const day = await db.getFirstAsync<Day>(
      `SELECT * FROM day WHERE day_id = ?`,
      [day_id],
    );
    if (!day) {
      throw new Error(`No existe un ejercicio con el id ${day_id}`);
    }
    const result = await db.runAsync(`DELETE FROM day WHERE day_id = ?`, [
      day_id,
    ]);
    return result.changes > 0;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`No se pudo eliminar el ejercicio. Error: ${error}`);
  }
}
