import { SQLiteDatabase, openDatabaseSync } from "expo-sqlite";

export const db = openDatabaseSync("gym_app.db");

export async function CreateTables(db: SQLiteDatabase) {
  await db.execAsync(`
    DROP TABLE IF EXISTS day_exercise;
    DROP TABLE IF EXISTS day;
    DROP TABLE IF EXISTS workout;
    DROP TABLE IF EXISTS routine;
    DROP TABLE IF EXISTS exercise;

    CREATE TABLE IF NOT EXISTS exercise(
      exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_name TEXT NOT NULL
      );

    CREATE TABLE IF NOT EXISTS routine (
      routine_id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_desc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS day (
      day_id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_desc TEXT NOT NULL,
      routine_id INTEGER NOT NULL,
      FOREIGN KEY (routine_id) REFERENCES routine(routine_id)
    );

    CREATE TABLE IF NOT EXISTS day_exercise (
      day_ex_id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL DEFAULT 0.0,
      FOREIGN KEY (day_id) REFERENCES day(day_id),
      FOREIGN KEY (exercise_id) REFERENCES exercise(exercise_id)
    );

    CREATE TABLE IF NOT EXISTS workout (
      workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (routine_id) REFERENCES routine(routine_id)
    );
    `);
}
