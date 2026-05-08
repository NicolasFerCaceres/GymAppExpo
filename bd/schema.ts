import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("gymapp.db");

export function initDatabase() {
  db.execSync(`
        CREATE TABLE IF NOT EXIST workouts (
            workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
            started_at TEXT NOT NULL,
            finished_at TEXT
        )
            
        CREATE TABLE IF NOT EXISTS workout_exercise (
            workout_exercise_id INTEGER PRIMARY 
        )
        
        `);
}
