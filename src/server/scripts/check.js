import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { getDb, getDbPath } from '../db/database.js';

function readIntegrityCheck(database) {
  return database
    .prepare('PRAGMA integrity_check')
    .all()
    .map((row) => row.integrity_check ?? Object.values(row)[0]);
}

function assertIntegrity(messages) {
  if (!(messages.length === 1 && messages[0] === 'ok')) {
    throw new Error(`SQLite integrity_check failed: ${messages.join('; ')}`);
  }
}

try {
  const dbPath = getDbPath();

  if (existsSync(dbPath)) {
    const readonlyDb = new DatabaseSync(dbPath, { readOnly: true });
    try {
      assertIntegrity(readIntegrityCheck(readonlyDb));
    } finally {
      readonlyDb.close();
    }
  }

  const db = getDb();
  const integrityMessages = readIntegrityCheck(db);
  assertIntegrity(integrityMessages);

  const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
  const noteCount = db.prepare('SELECT COUNT(*) AS count FROM notes').get().count;

  console.log(JSON.stringify({ ok: true, dbPath, integrityCheck: 'ok', categoryCount, noteCount }, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        dbPath: getDbPath(),
        error: error.message
      },
      null,
      2
    )
  );
  process.exitCode = 1;
}
