import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { getDataPaths } from '../db/database.js';

function readIntegrityCheck(dbPath) {
  const database = new DatabaseSync(dbPath, { readOnly: true });
  try {
    return database
      .prepare('PRAGMA integrity_check')
      .all()
      .map((row) => row.integrity_check ?? Object.values(row)[0]);
  } finally {
    database.close();
  }
}

function assertHealthyBackup(backupPath) {
  if (!existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  const messages = readIntegrityCheck(backupPath);
  if (!(messages.length === 1 && messages[0] === 'ok')) {
    throw new Error(`Backup integrity_check failed: ${messages.join('; ')}`);
  }
}

function parseArgs(argv) {
  const options = { confirm: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--confirm') {
      options.confirm = true;
    } else if (arg === '--backup') {
      options.backup = argv[index + 1];
      index += 1;
    } else if (!options.backup && !arg.startsWith('--')) {
      options.backup = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.backup) {
    throw new Error('Usage: node src/server/scripts/restore-database-backup.js --backup <backup.db> [--confirm]');
  }

  return options;
}

function timestampForFile() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function restoreDatabaseBackup({ backupPath, confirm = false }) {
  const dataPaths = getDataPaths();
  const resolvedBackupPath = path.resolve(backupPath);
  const resolvedDbPath = path.resolve(dataPaths.dbPath);
  const resolvedBackupsDir = path.resolve(dataPaths.backupsDir);

  assertHealthyBackup(resolvedBackupPath);

  const backupStats = statSync(resolvedBackupPath);
  const result = {
    ok: true,
    dryRun: !confirm,
    dbPath: resolvedDbPath,
    backupPath: resolvedBackupPath,
    backupSize: backupStats.size,
    restored: false,
    currentDatabaseBackupPath: null,
    message: confirm
      ? 'Database restored from the selected healthy backup.'
      : 'Dry run only. Re-run with --confirm to restore the database.'
  };

  if (!confirm) {
    return result;
  }

  mkdirSync(path.dirname(resolvedDbPath), { recursive: true });
  mkdirSync(resolvedBackupsDir, { recursive: true });

  if (existsSync(resolvedDbPath)) {
    const currentBackupPath = path.join(resolvedBackupsDir, `app-before-restore-${timestampForFile()}.db`);
    copyFileSync(resolvedDbPath, currentBackupPath);
    result.currentDatabaseBackupPath = currentBackupPath;
  }

  copyFileSync(resolvedBackupPath, resolvedDbPath);
  assertHealthyBackup(resolvedDbPath);
  result.restored = true;

  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = restoreDatabaseBackup({ backupPath: options.backup, confirm: options.confirm });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
