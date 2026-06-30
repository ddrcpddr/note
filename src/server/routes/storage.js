import { copyFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { createId, getDataPaths, getDb } from '../db/database.js';
import { listNotes } from './notes.js';

export const storageRouter = Router();

storageRouter.get('/status', (_request, response) => {
  response.json(getStorageStatus());
});

storageRouter.post('/backup', (request, response) => {
  const nasOnline = request.body?.nasOnline !== false;

  if (!nasOnline) {
    recordFailedBackup('当前无法连接家庭 NAS');
    response.status(503).json({ error: '当前无法连接家庭 NAS', ...getStorageStatus() });
    return;
  }

  const backup = createDatabaseBackup();
  response.json({ backup, ...getStorageStatus() });
});

storageRouter.post('/export-json', (_request, response) => {
  const paths = getDataPaths();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = path.join(paths.exportsDir, `notes-${timestamp}.json`);
  const payload = {
    exportedAt: new Date().toISOString(),
    notes: listNotes({ limit: 'all' })
  };
  writeFileSync(exportPath, JSON.stringify(payload, null, 2), 'utf8');
  const fileSize = statSync(exportPath).size;

  response.json({ export: { filePath: exportPath, fileSize }, ...getStorageStatus() });
});

export function createDatabaseBackup() {
  const paths = getDataPaths();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(paths.backupsDir, `app-${timestamp}.db`);
  copyFileSync(paths.dbPath, backupPath);
  const fileSize = statSync(backupPath).size;
  const id = createId('backup');
  getDb().prepare('INSERT INTO backups (id, status, file_path, file_size) VALUES (?, ?, ?, ?)').run(
    id,
    'completed',
    backupPath,
    fileSize
  );

  return { id, filePath: backupPath, fileSize };
}

export function recordFailedBackup(errorMessage) {
  const id = createId('backup');
  getDb().prepare('INSERT INTO backups (id, status, error_message) VALUES (?, ?, ?)').run(
    id,
    'failed',
    errorMessage
  );
  return { id, errorMessage };
}

export function startAutomaticBackups() {
  const intervalMs = resolveAutoBackupIntervalMs();
  if (!intervalMs) return null;

  const timer = setInterval(() => {
    try {
      createDatabaseBackup();
    } catch (error) {
      recordFailedBackup(error.message || '自动备份失败');
    }
  }, intervalMs);
  timer.unref?.();
  return timer;
}

function resolveAutoBackupIntervalMs() {
  const explicitMs = Number(process.env.NOTE_AUTO_BACKUP_INTERVAL_MS || 0);
  if (Number.isFinite(explicitMs) && explicitMs > 0) return explicitMs;

  const hours = Number(process.env.NOTE_AUTO_BACKUP_INTERVAL_HOURS || 0);
  if (Number.isFinite(hours) && hours > 0) return Math.round(hours * 60 * 60 * 1000);
  return 0;
}

export function getStorageStatus() {
  const db = getDb();
  const latestBackup = db
    .prepare(
      `SELECT id, status, file_path AS filePath, file_size AS fileSize, error_message AS errorMessage, created_at AS createdAt
       FROM backups
       ORDER BY created_at DESC, id DESC
       LIMIT 1`
    )
    .get();

  return {
    nasOnline: true,
    dataPaths: getDataPaths(),
    latestBackup: latestBackup || null
  };
}

