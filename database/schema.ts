import { SQLiteDatabase, openDatabaseSync } from "expo-sqlite";

export const db = openDatabaseSync("gym_app.db");

export async function CreateTables(db: SQLiteDatabase) {
  await db.execAsync(`PRAGMA foreign_keys = ON;`);
  await db.execAsync(`
    DROP TABLE IF EXISTS workout_set;
    DROP TABLE IF EXISTS workout_exercise;
    DROP TABLE IF EXISTS workout;
    DROP TABLE IF EXISTS day_exercise;
    DROP TABLE IF EXISTS day;
    DROP TABLE IF EXISTS routine;
    DROP TABLE IF EXISTS exercise;
        
    

    CREATE TABLE IF NOT EXISTS exercise(
      exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_name TEXT NOT NULL
      );

    CREATE TABLE IF NOT EXISTS routine (
      routine_id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_desc TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0
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

    CREATE TABLE IF NOT EXISTS workout_exercise (
      workout_ex_id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      order_num INTEGER NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workout(workout_id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercise(exercise_id)
    );

    CREATE TABLE IF NOT EXISTS workout_set (
      set_id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_ex_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL NOT NULL,
      rest_seconds INTEGER,
      FOREIGN KEY (workout_ex_id) REFERENCES workout_exercise(workout_ex_id) ON DELETE CASCADE
  );

      -- SEED de prueba (borrar después)
    INSERT INTO routine (routine_desc, is_active) VALUES ('Push Pull Legs', 1);
    INSERT INTO routine (routine_desc, is_active) VALUES ('Full Body', 0);

    INSERT INTO day (day_desc, routine_id) VALUES ('Push', 1);
    INSERT INTO day (day_desc, routine_id) VALUES ('Pull', 1);
    INSERT INTO day (day_desc, routine_id) VALUES ('Legs', 1);

    INSERT INTO exercise (exercise_name) VALUES ('Press banca');
    INSERT INTO exercise (exercise_name) VALUES ('Press militar');
    INSERT INTO exercise (exercise_name) VALUES ('Fondos');
    INSERT INTO exercise (exercise_name) VALUES ('Dominadas');
    INSERT INTO exercise (exercise_name) VALUES ('Remo');
    INSERT INTO exercise (exercise_name) VALUES ('Sentadilla');
    INSERT INTO exercise (exercise_name) VALUES ('Peso muerto');

    -- Push (day_id=1)
    INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES (1, 1, 4, 8, 80);
    INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES (1, 2, 3, 10, 50);
    INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES (1, 3, 3, 12, 0);

    -- Pull (day_id=2)
    INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES (2, 4, 4, 8, 0);
    INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES (2, 5, 4, 10, 60);

    -- Legs (day_id=3)
    INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES (3, 6, 4, 8, 100);
    INSERT INTO day_exercise (day_id, exercise_id, sets, reps, weight) VALUES (3, 7, 3, 6, 120);

  `);
}
