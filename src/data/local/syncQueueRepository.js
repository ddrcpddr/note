import { queryLocalSql, runLocalSql, shouldUseNativeSqlite } from './localDb.js';

function nowIso() {
  return new Date().toISOString();
}

function fromRow(row) {
  let payload = {};
  try { payload = JSON.parse(row.payload_json || '{}'); } catch { payload = {}; }
  return {
    ...payload,
    id: row.id,
    action: row.operation_type,
    noteId: row.entity_id,
    localId: payload.localId || row.entity_id,
    status: row.status,
    lastError: row.error || payload.lastError || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function queueMutationToSqlite(mutation) {
  if (!shouldUseNativeSqlite() || !mutation?.id) return false;
  const now = nowIso();
  await runLocalSql(
    `INSERT OR REPLACE INTO sync_queue (id, entity_type, entity_id, operation_type, payload_json, created_at, updated_at, status, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mutation.id,
      mutation.entityType || 'note',
      mutation.noteId || mutation.localId || mutation.entityId || '',
      mutation.action || mutation.operationType || 'update',
      JSON.stringify(mutation),
      mutation.createdAt || now,
      now,
      mutation.status || 'pending',
      mutation.lastError || mutation.error || null
    ]
  );
  return true;
}

export async function readPendingMutationsFromSqlite() {
  if (!shouldUseNativeSqlite()) return [];
  const rows = await queryLocalSql("SELECT * FROM sync_queue WHERE status != 'synced' AND status != 'done' ORDER BY created_at ASC", []);
  return rows.map(fromRow);
}

export async function removeMutationFromSqlite(mutationId) {
  if (!shouldUseNativeSqlite() || !mutationId) return false;
  await runLocalSql('DELETE FROM sync_queue WHERE id=?', [mutationId]);
  return true;
}

export async function markMutationFailedInSqlite(mutation, errorMessage) {
  if (!shouldUseNativeSqlite() || !mutation?.id) return false;
  await queueMutationToSqlite({ ...mutation, status: 'failed', lastError: errorMessage || 'sync failed', updatedAt: nowIso() });
  return true;
}
