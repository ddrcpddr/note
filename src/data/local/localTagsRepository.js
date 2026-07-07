import { queryLocalSql, runLocalSql, shouldUseNativeSqlite } from './localDb.js';

function nowIso() {
  return new Date().toISOString();
}

function safeJson(value, fallback = {}) {
  try {
    return JSON.stringify(value ?? fallback);
  } catch {
    return JSON.stringify(fallback);
  }
}

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function upsertTagsToSqlite(tags = []) {
  if (!shouldUseNativeSqlite() || !Array.isArray(tags)) return false;
  const now = nowIso();
  for (const tag of tags) {
    const id = tag?.id || tag?.name || tag?.label;
    if (!id) continue;
    await runLocalSql(
      `INSERT OR REPLACE INTO tags (id, name, label, color, sort_order, updated_at, payload_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tag.name || tag.label || id,
        tag.label || tag.name || id,
        tag.color || null,
        Number(tag.sortOrder ?? tag.order ?? 0),
        tag.updatedAt || now,
        safeJson({ id, ...tag }, {})
      ]
    );
  }
  return true;
}

export async function readTagsFromSqlite() {
  if (!shouldUseNativeSqlite()) return [];
  const rows = await queryLocalSql('SELECT * FROM tags ORDER BY sort_order ASC, name ASC', []);
  return rows.map((row) => ({
    ...parseJson(row.payload_json, {}),
    id: row.id,
    name: row.name,
    label: row.label || row.name,
    color: row.color || undefined
  }));
}