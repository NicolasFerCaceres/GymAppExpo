import { SQLiteDatabase, openDatabaseSync } from "expo-sqlite";

export const db = openDatabaseSync("gym_app.db");

export async function CreateTables(db: SQLiteDatabase) {
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise (
      exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routine (
      routine_id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_desc TEXT NOT NULL,
      default_rest_seconds INTEGER NOT NULL DEFAULT 90,
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
      reps_min INTEGER NOT NULL,
      reps_max INTEGER NOT NULL,
      weight REAL DEFAULT 0.0,
      rest_seconds INTEGER,
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
  `);

  // Seed: solo si la DB está vacía (primera apertura)
  const existing = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM routine`,
  );

  if (existing && existing.count === 0) {
    await db.execAsync(`
      INSERT INTO routine (routine_desc, default_rest_seconds, is_active) VALUES ('Push Pull Legs', 150, 1);
      INSERT INTO routine (routine_desc, default_rest_seconds, is_active) VALUES ('Full Body', 90, 0);

      INSERT INTO day (day_desc, routine_id) VALUES ('Empujar', 1);
      INSERT INTO day (day_desc, routine_id) VALUES ('Tirar', 1);
      INSERT INTO day (day_desc, routine_id) VALUES ('Piernas', 1);
      INSERT INTO day (day_desc, routine_id) VALUES ('Superior', 1);
      INSERT INTO day (day_desc, routine_id) VALUES ('Bajar', 1);

      INSERT INTO exercise (exercise_name) VALUES ('Press de banca con barra');
      INSERT INTO exercise (exercise_name) VALUES ('Press de hombros con mancuernas');
      INSERT INTO exercise (exercise_name) VALUES ('Cruces de polea baja');
      INSERT INTO exercise (exercise_name) VALUES ('Extension de triceps con mancuerna');
      INSERT INTO exercise (exercise_name) VALUES ('Flexion de triceps con cuerda');
      INSERT INTO exercise (exercise_name) VALUES ('Remo inclinado con barra');
      INSERT INTO exercise (exercise_name) VALUES ('Lat Pulldown');
      INSERT INTO exercise (exercise_name) VALUES ('Curl de biceps con mancuernas');
      INSERT INTO exercise (exercise_name) VALUES ('Curl de martillo');
      INSERT INTO exercise (exercise_name) VALUES ('Face Pull');
      INSERT INTO exercise (exercise_name) VALUES ('Sentadilla con barra');
      INSERT INTO exercise (exercise_name) VALUES ('Elevacion de gluteos e isquiotibiales');
      INSERT INTO exercise (exercise_name) VALUES ('Estocada con mancuernas');
      INSERT INTO exercise (exercise_name) VALUES ('Curl de piernas acostado');
      INSERT INTO exercise (exercise_name) VALUES ('Elevacion de pantorrillas de pie');
      INSERT INTO exercise (exercise_name) VALUES ('Dominadas');
      INSERT INTO exercise (exercise_name) VALUES ('Press de banca inclinado con mancuernas');
      INSERT INTO exercise (exercise_name) VALUES ('Pulldown lateral con brazo recto');
      INSERT INTO exercise (exercise_name) VALUES ('Press de hombros sentado en maquina');
      INSERT INTO exercise (exercise_name) VALUES ('Flexiones');
      INSERT INTO exercise (exercise_name) VALUES ('Prensa de piernas');
      INSERT INTO exercise (exercise_name) VALUES ('Peso muerto rumano');
      INSERT INTO exercise (exercise_name) VALUES ('Extension de piernas');
      INSERT INTO exercise (exercise_name) VALUES ('Elevacion de pantorrillas sentado');
      INSERT INTO exercise (exercise_name) VALUES ('Crunch con cable');

      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (1, 1, 3, 6, 10, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (1, 2, 3, 10, 12, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (1, 3, 3, 12, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (1, 4, 3, 12, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (1, 5, 3, 12, 15, 0);

      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (2, 6, 3, 6, 10, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (2, 7, 3, 8, 12, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (2, 8, 3, 12, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (2, 9, 3, 12, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (2, 10, 3, 15, 25, 0);

      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (3, 11, 3, 6, 10, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (3, 12, 3, 8, 12, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (3, 13, 3, 10, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (3, 14, 3, 12, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (3, 15, 3, 8, 12, 0);

      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (4, 16, 3, 5, 10, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (4, 17, 3, 8, 10, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (4, 18, 3, 10, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (4, 19, 3, 10, 12, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (4, 20, 2, 12, 20, 0);

      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (5, 21, 3, 8, 12, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (5, 22, 3, 8, 10, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (5, 23, 3, 12, 15, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (5, 24, 4, 12, 20, 0);
      INSERT INTO day_exercise (day_id, exercise_id, sets, reps_min, reps_max, weight) VALUES (5, 25, 4, 12, 15, 0);
    `);
  }
}
