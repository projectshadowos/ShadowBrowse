import Database from 'better-sqlite3';

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

export const getValue = (key: string) => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? JSON.parse((row as any).value) : null;
};

export const setValue = (key: string, value: any) => {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    key,
    JSON.stringify(value),
  );
};

export const deleteValue = (key: string) => {
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
};
