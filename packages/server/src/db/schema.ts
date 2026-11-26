import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.REDSHIFT_DB_PATH || path.resolve(__dirname, '../../../../redshift.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS player_resources (
      player_id TEXT NOT NULL REFERENCES players(id),
      resource_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (player_id, resource_id)
    );

    CREATE TABLE IF NOT EXISTS player_buildings (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      building_def_id TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      construction_started_at TEXT,
      construction_completes_at TEXT,
      is_constructing INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS player_ships (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      ship_def_id TEXT NOT NULL,
      upgrade_level INTEGER NOT NULL DEFAULT 1,
      current_hull REAL NOT NULL,
      current_shield REAL NOT NULL,
      is_destroyed INTEGER NOT NULL DEFAULT 0,
      fleet_id TEXT
    );

    CREATE TABLE IF NOT EXISTS battles (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      mission_id TEXT,
      outcome TEXT NOT NULL,
      ticks INTEGER NOT NULL,
      rewards TEXT NOT NULL DEFAULT '{}',
      log_summary TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS completed_missions (
      player_id TEXT NOT NULL REFERENCES players(id),
      mission_id TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (player_id, mission_id)
    );
  `);
}
