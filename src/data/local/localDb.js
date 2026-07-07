import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { LOCAL_DATABASE_NAME, LOCAL_DATABASE_VERSION, LOCAL_SCHEMA_SQL } from './localSchema.js';

let sqliteConnection = null;
let dbConnection = null;
let dbPromise = null;
let lastInitError = null;

export function shouldUseNativeSqlite() {
  return Boolean(Capacitor?.isNativePlatform?.());
}

export function getLastLocalDbError() {
  return lastInitError;
}

export async function getLocalDb() {
  if (!shouldUseNativeSqlite()) return null;
  if (!dbPromise) dbPromise = initializeLocalDatabase();
  return dbPromise;
}

export async function initializeLocalDatabase() {
  if (!shouldUseNativeSqlite()) return null;
  try {
    if (!sqliteConnection) sqliteConnection = new SQLiteConnection(CapacitorSQLite);

    const existing = await sqliteConnection.isConnection(LOCAL_DATABASE_NAME, false).catch(() => ({ result: false }));
    dbConnection = existing?.result
      ? await sqliteConnection.retrieveConnection(LOCAL_DATABASE_NAME, false)
      : await sqliteConnection.createConnection(LOCAL_DATABASE_NAME, false, 'no-encryption', LOCAL_DATABASE_VERSION, false);

    await dbConnection.open();
    await dbConnection.execute(LOCAL_SCHEMA_SQL);
    lastInitError = null;
    return dbConnection;
  } catch (error) {
    lastInitError = error?.message || String(error);
    dbPromise = null;
    return null;
  }
}

export async function runLocalSql(statement, values = []) {
  const db = await getLocalDb();
  if (!db) return null;
  return db.run(statement, values);
}

export async function queryLocalSql(statement, values = []) {
  const db = await getLocalDb();
  if (!db) return [];
  const result = await db.query(statement, values);
  return Array.isArray(result?.values) ? result.values : [];
}
