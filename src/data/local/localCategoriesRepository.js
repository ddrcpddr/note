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

export async function upsertCategoriesToSqlite(categories = []) {
  if (!shouldUseNativeSqlite() || !Array.isArray(categories)) return false;
  const now = nowIso();
  for (const category of categories) {
    if (!category?.id) continue;
    await runLocalSql(
      `INSERT OR REPLACE INTO categories (
        id, name, slug, color, icon_key, sort_order, is_system, note_count, updated_at, payload_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category.id,
        category.name || category.label || '',
        category.slug || category.id,
        category.color || null,
        category.iconKey || category.icon || category.id,
        Number(category.sortOrder ?? category.order ?? 0),
        category.isSystem ? 1 : 0,
        Number(category.noteCount ?? category.count ?? 0),
        category.updatedAt || category.update || now,
        safeJson(category, {})
      ]
    );
  }
  return true;
}

export async function readCategoriesFromSqlite() {
  if (!shouldUseNativeSqlite()) return [];
  const rows = await queryLocalSql('SELECT * FROM categories ORDER BY sort_order ASC, name ASC', []);
  return rows.map((row) => ({
    ...parseJson(row.payload_json, {}),
    id: row.id,
    name: row.name,
    slug: row.slug || row.id,
    color: row.color || undefined,
    iconKey: row.icon_key || undefined,
    noteCount: Number(row.note_count || 0),
    count: Number(row.note_count || 0),
    isSystem: Boolean(row.is_system)
  }));
}