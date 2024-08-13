import Database from 'better-sqlite3';
import { IStoreSettingsObject } from './interfaces';

const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS tabs (
    id TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS currentTab (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

export const getSettingsValue = (key: string): IStoreSettingsObject | null => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? JSON.parse((row as any).value) : null;
};

export const setSettingsValue = (key: string, value: IStoreSettingsObject) => {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    key,
    JSON.stringify(value),
  );
};

export const deleteSettingsValue = (key: string) => {
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
};
