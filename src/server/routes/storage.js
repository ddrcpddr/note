import { copyFileSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { createId, getDataPaths, getDb } from '../db/database.js';
import { htmlToMarkdownSubset } from '../rich-text.js';
import { listNotes } from './notes.js';

export const storageRouter = Router();

storageRouter.get('/status', (_request, response) => {
  response.json(getStorageStatus());
});

storageRouter.post('/probe', (_request, response) => {
  const result = probeStorageDirectories();
  response.status(result.ok ? 200 : 503).json(result);
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

storageRouter.post('/export-markdown', (_request, response) => {
  const paths = getDataPaths();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = path.join(paths.exportsDir, `notes-${timestamp}.md`);
  const markdown = renderNotesMarkdown(listNotes({ limit: 'all', includeRichText: 'true' }));
  writeFileSync(exportPath, markdown, 'utf8');
  const fileSize = statSync(exportPath).size;

  response.json({ export: { filePath: exportPath, fileSize }, ...getStorageStatus() });
});

storageRouter.post('/export-json', (_request, response) => {
  const paths = getDataPaths();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = path.join(paths.exportsDir, `notes-${timestamp}.json`);
  const payload = {
    exportedAt: new Date().toISOString(),
    notes: listNotes({ limit: 'all', includeRichText: 'true' })
  };
  writeFileSync(exportPath, JSON.stringify(payload, null, 2), 'utf8');
  const fileSize = statSync(exportPath).size;

  response.json({ export: { filePath: exportPath, fileSize }, ...getStorageStatus() });
});

function probeStorageDirectories() {
  const paths = getDataPaths();
  const directoryEntries = [
    ['databaseDir', paths.databaseDir],
    ['attachmentsDir', paths.attachmentsDir],
    ['backupsDir', paths.backupsDir],
    ['exportsDir', paths.exportsDir]
  ];
  const checks = {};

  for (const [key, directory] of directoryEntries) {
    const probePath = path.join(directory, `.note-probe-${process.pid}-${Date.now()}.txt`);
    try {
      writeFileSync(probePath, 'ok', 'utf8');
      const content = readFileSync(probePath, 'utf8');
      unlinkSync(probePath);
      checks[key] = { ok: content === 'ok', path: directory };
    } catch (error) {
      checks[key] = { ok: false, path: directory, error: error.message };
      try {
        unlinkSync(probePath);
      } catch {
        // Nothing to clean up.
      }
    }
  }

  return {
    ok: Object.values(checks).every((check) => check.ok),
    dataPaths: paths,
    checks
  };
}

function renderNotesMarkdown(notes) {
  const lines = ['# 家事记 Markdown 导出', '', `导出时间：${new Date().toISOString()}`, ''];

  for (const note of notes) {
    lines.push(`## ${escapeMarkdownHeading(note.title)}`);
    lines.push('');
    lines.push(`- ID：${note.id}`);
    lines.push(`- 分类：${note.categoryName || note.categoryId || '未分类 / 待整理'}`);
    lines.push(`- 成员：${note.memberName || note.memberId || '我'}`);
    lines.push(`- 来源：${note.sourceType === 'notestation_import' ? 'Note Station 导入' : '手动创建'}`);
    lines.push(`- 创建时间：${note.createdAt || ''}`);
    lines.push(`- 更新时间：${note.updatedAt || ''}`);
    if (note.tags?.length) lines.push(`- 标签：${note.tags.map((tag) => tag.label).join('、')}`);
    if (note.attachments?.length) lines.push(`- 附件：${note.attachments.map((attachment) => attachment.originalName || attachment.fileName).join('、')}`);
    if (note.originalPath) lines.push(`- 原始路径：${note.originalPath}`);
    lines.push('');
    lines.push(note.contentHtml ? htmlToMarkdownSubset(note.contentHtml, note.contentText || note.content || note.summary || '') : note.contentText || note.content || note.summary || '');
    lines.push('');
  }

  return lines.join('\n');
}

function escapeMarkdownHeading(value) {
  return String(value || '未命名记录').replace(/^#+\s*/, '').trim() || '未命名记录';
}

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
