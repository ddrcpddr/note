import { queryLocalSql, runLocalSql, shouldUseNativeSqlite } from './localDb.js';

function nowIso() {
  return new Date().toISOString();
}

function safeJson(value, fallback = null) {
  try {
    return JSON.stringify(value ?? fallback);
  } catch {
    return JSON.stringify(fallback);
  }
}

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function upsertLocalNoteToSqlite(note) {
  if (!shouldUseNativeSqlite() || !note?.id) return false;
  const updatedAt = note.updatedAtRaw || note.localUpdatedAt || nowIso();
  const createdAt = note.createdAtRaw || note.createdAt || updatedAt;
  const contentText = note.contentText || note.content || note.summary || '';
  const shouldKeepRichDraft = note.isOffline || ['local-only', 'dirty', 'pending', 'failed'].includes(note.syncStatus);
  const contentHtml = shouldKeepRichDraft ? note.contentHtml || note.richContent?.html || null : note.contentHtml || null;
  const contentJson = note.contentJson ? safeJson(note.contentJson, null) : null;
  const tagsJson = safeJson(note.tags || [], []);
  const status = note.isDeleted ? 'deleted' : note.isArchived ? 'archived' : 'active';
  await runLocalSql(
    `INSERT OR REPLACE INTO notes (
      id, server_id, title, content_text, content_html, content_json, category_id, member_id,
      tags_json, status, created_at, updated_at, deleted_at, device_id, local_revision,
      server_revision, sync_status, last_sync_at, sync_error, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT local_revision + 1 FROM notes WHERE id = ?), 1), ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.serverId || (String(note.id).startsWith('local-') ? null : note.id),
      note.title || '',
      contentText,
      contentHtml,
      contentJson,
      note.categoryId || 'uncategorized',
      note.memberId || 'self',
      tagsJson,
      status,
      createdAt,
      updatedAt,
      note.deletedAt || null,
      note.deviceId || null,
      note.id,
      note.serverRevision || null,
      note.syncStatus || (note.isOffline ? 'pending' : 'synced'),
      note.lastSyncAt || null,
      note.syncError || null,
      safeJson(note, {})
    ]
  );
  return true;
}

export async function readLocalNotesFromSqlite() {
  if (!shouldUseNativeSqlite()) return [];
  const rows = await queryLocalSql("SELECT payload_json, id, title, content_text, content_html, category_id, member_id, tags_json, status, created_at, updated_at, sync_status FROM notes WHERE status != 'deleted' ORDER BY updated_at DESC", []);
  return rows.map((row) => {
    const payload = parseJson(row.payload_json, {}) || {};
    return {
      ...payload,
      id: row.id,
      title: payload.title || row.title || '',
      content: payload.content || row.content_text || '',
      contentHtml: payload.contentHtml || row.content_html || null,
      categoryId: payload.categoryId || row.category_id || 'uncategorized',
      memberId: payload.memberId || row.member_id || 'self',
      tags: payload.tags || parseJson(row.tags_json, []),
      isArchived: row.status === 'archived',
      syncStatus: row.sync_status || payload.syncStatus || 'local-only',
      isOffline: row.sync_status !== 'synced'
    };
  });
}

export async function markLocalNoteArchivedInSqlite(note) {
  if (!shouldUseNativeSqlite() || !note?.id) return false;
  await upsertLocalNoteToSqlite({ ...note, isArchived: true, syncStatus: 'pending', isOffline: true, updatedAt: '刚刚', localUpdatedAt: nowIso() });
  return true;
}

export async function deleteLocalNoteFromSqlite(noteId) {
  if (!shouldUseNativeSqlite() || !noteId) return false;
  await runLocalSql("UPDATE notes SET status='deleted', deleted_at=?, updated_at=?, sync_status='pending' WHERE id=?", [nowIso(), nowIso(), noteId]);
  return true;
}
