import { getDb, getDbPath } from '../db/database.js';

const db = getDb();
const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
const noteCount = db.prepare('SELECT COUNT(*) AS count FROM notes').get().count;

console.log(JSON.stringify({ ok: true, dbPath: getDbPath(), categoryCount, noteCount }, null, 2));
