import { queryLocalSql, runLocalSql, shouldUseNativeSqlite } from './localDb.js';

export async function upsertAttachmentToSqlite(attachment) {
  if (!shouldUseNativeSqlite() || !attachment?.id || !attachment?.noteId) return false;
  const now = new Date().toISOString();
  await runLocalSql(
    `INSERT OR REPLACE INTO attachments (
      id, note_id, server_id, filename, mime_type, size, local_path, server_path, hash,
      created_at, updated_at, sync_status, sync_error, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      attachment.id,
      attachment.noteId,
      attachment.serverId || null,
      attachment.filename || attachment.name || '附件',
      attachment.mimeType || '',
      Number(attachment.size || attachment.fileSize || 0),
      attachment.localPath || '',
      attachment.serverPath || '',
      attachment.hash || '',
      attachment.createdAt || now,
      attachment.updatedAt || now,
      attachment.syncStatus || 'local_only',
      attachment.syncError || null,
      JSON.stringify(attachment)
    ]
  );
  return true;
}

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function attachmentFromRow(row) {
  const payload = parseJson(row.payload_json, {});
  return {
    ...payload,
    id: row.id,
    noteId: row.note_id,
    serverId: row.server_id || payload.serverId || null,
    filename: row.filename || payload.filename || payload.name || '附件',
    name: row.filename || payload.name || payload.filename || '附件',
    mimeType: row.mime_type || payload.mimeType || '',
    size: Number(row.size || payload.size || payload.fileSize || 0),
    localPath: row.local_path || payload.localPath || '',
    serverPath: row.server_path || payload.serverPath || '',
    hash: row.hash || payload.hash || '',
    createdAt: row.created_at || payload.createdAt,
    updatedAt: row.updated_at || payload.updatedAt,
    syncStatus: row.sync_status || payload.syncStatus || 'local_only',
    syncError: row.sync_error || payload.syncError || null
  };
}

export async function upsertAttachmentsToSqlite(attachments = []) {
  if (!shouldUseNativeSqlite() || !Array.isArray(attachments)) return false;
  for (const attachment of attachments) await upsertAttachmentToSqlite(attachment);
  return true;
}

export async function readAttachmentsFromSqlite(noteId = null) {
  if (!shouldUseNativeSqlite()) return [];
  const rows = noteId
    ? await queryLocalSql('SELECT * FROM attachments WHERE note_id=? ORDER BY created_at ASC', [noteId])
    : await queryLocalSql('SELECT * FROM attachments ORDER BY created_at ASC', []);
  return rows.map(attachmentFromRow);
}