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

export async function upsertMembersToSqlite(members = []) {
  if (!shouldUseNativeSqlite() || !Array.isArray(members)) return false;
  const now = nowIso();
  for (const member of members) {
    if (!member?.id) continue;
    await runLocalSql(
      `INSERT OR REPLACE INTO members (
        id, name, avatar, avatar_image, color, is_current, sort_order, updated_at, payload_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        member.id,
        member.name || member.label || '',
        member.avatar || null,
        member.avatarImage || null,
        member.color || null,
        member.isCurrent ? 1 : 0,
        Number(member.sortOrder ?? member.order ?? 0),
        member.updatedAt || now,
        safeJson(member, {})
      ]
    );
  }
  return true;
}

export async function readMembersFromSqlite() {
  if (!shouldUseNativeSqlite()) return [];
  const rows = await queryLocalSql('SELECT * FROM members ORDER BY sort_order ASC, name ASC', []);
  return rows.map((row) => ({
    ...parseJson(row.payload_json, {}),
    id: row.id,
    name: row.name,
    avatar: row.avatar || undefined,
    avatarImage: row.avatar_image || undefined,
    color: row.color || undefined,
    isCurrent: Boolean(row.is_current)
  }));
}