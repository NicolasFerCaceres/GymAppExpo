import { NewWorkout, Workout } from "@/types/workout";
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

export async function createCompleteWorkout(
  db: SQLiteDatabase,
  data: NewWorkout,
): Promise<Workout> {
  if (
    !data.routine_id ||
    isNaN(Number(data.routine_id)) ||
    data.routine_id <= 0 ||
    !Number.isInteger(data.routine_id)
  ) {
    throw new Error(`El id de rutina debe ser un numero valido mayor que 0`);
  }

  if (!data.exercises || data.exercises.length === 0) {
    throw new Error("El workout debe tener al menos un ejercicio.");
  }

  for (const ex of data.exercises) {
    if (
      !ex.exercise_id ||
      !Number.isInteger(ex.exercise_id) ||
      ex.exercise_id <= 0
    ) {
      throw new Error(`El id de ejercicio debe ser un entero mayor que 0`);
    }
    if (!ex.sets || ex.sets.length === 0) {
      throw new Error(
        `El ejercicio ${ex.exercise_id} no tiene series completadas.`,
      );
    }
    for (const set of ex.sets) {
      if (!Number.isInteger(set.reps) || set.reps <= 0) {
        throw new Error(`Las repeticiones deben ser un entero mayor que 0.`);
      }
      if (isNaN(Number(set.weight)) || set.weight < 0) {
        throw new Error(`El peso debe ser un numero mayor o igual a 0.`);
      }
    }
  }

  const date = new Date().toISOString();
  let workoutId: number = 0;

  try {
    await db.withTransactionAsync(async () => {
      const workoutResult = await db.runAsync(
        `INSERT INTO workout (routine_id, date) VALUES (?, ?)`,
        [data.routine_id, date],
      );
      workoutId = workoutResult.lastInsertRowId;

      for (const ex of data.exercises) {
        const exerciseResult = await db.runAsync(
          `INSERT INTO workout_exercise (workout_id, exercise_id, order_num) VALUES (?, ?, ?)`,
          [workoutId, ex.exercise_id, ex.order_num],
        );
        const workoutExId = exerciseResult.lastInsertRowId;

        for (const set of ex.sets) {
          await db.runAsync(
            `INSERT INTO workout_set (workout_ex_id, set_number, reps, weight) VALUES (?, ?, ?, ?)`,
            [workoutExId, set.set_number, set.reps, set.weight],
          );
        }
      }
    });

    const created = await db.getFirstAsync<Workout>(
      `SELECT * FROM workout WHERE workout_id = ?`,
      [workoutId],
    );

    if (!created) throw new Error("Error al recuperar el workout creado.");
    console.log("✅ Workout guardado:", created);
    const sets = await db.getAllAsync(
      `SELECT * FROM workout_set ws 
   JOIN workout_exercise we ON we.workout_ex_id = ws.workout_ex_id 
   WHERE we.workout_id = ?`,
      [workoutId],
    );
    console.log("✅ Sets guardados:", sets);
    return created;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Error al crear workout completo: ${error}`);
  }
}
