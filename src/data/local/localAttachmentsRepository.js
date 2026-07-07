import { runLocalSql, shouldUseNativeSqlite } from './localDb.js';

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
