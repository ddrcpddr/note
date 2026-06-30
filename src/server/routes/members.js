import { Router } from 'express';
import { getDb } from '../db/database.js';

export const membersRouter = Router();

membersRouter.get('/', (_request, response) => {
  response.json({ members: listMembers() });
});

membersRouter.patch('/:id', (request, response) => {
  const memberId = String(request.params.id || '').trim();
  const db = getDb();
  const existing = db.prepare('SELECT id, name, avatar, color FROM members WHERE id = ?').get(memberId);

  if (!existing) {
    response.status(404).json({ error: '成员不存在' });
    return;
  }

  const payload = request.body || {};
  const name = String(payload.name ?? existing.name).trim();
  const avatar = String(payload.avatar ?? existing.avatar ?? '').trim().slice(0, 8);
  const allowedColors = new Set(['teal', 'rose', 'amber', 'blue', 'green', 'purple', 'neutral']);
  const color = String(payload.color ?? existing.color ?? '').trim();

  if (!name) {
    response.status(400).json({ error: '成员名称不能为空' });
    return;
  }

  if (color && !allowedColors.has(color)) {
    response.status(400).json({ error: '成员颜色不可用' });
    return;
  }

  db.prepare('UPDATE members SET name = ?, avatar = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, avatar || name.slice(0, 1), color || null, memberId);
  response.json({ members: listMembers(), member: listMembers().find((item) => item.id === memberId) });
});

membersRouter.post('/current', (request, response) => {
  const memberId = String(request.body?.memberId || '').trim();
  const db = getDb();
  const member = db.prepare('SELECT id FROM members WHERE id = ?').get(memberId);
  if (!member) {
    response.status(404).json({ error: '成员不存在' });
    return;
  }

  db.exec('BEGIN');
  try {
    db.prepare('UPDATE members SET is_current = 0').run();
    db.prepare('UPDATE members SET is_current = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(memberId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    response.status(400).json({ error: error.message });
    return;
  }

  response.json({ members: listMembers(), currentMemberId: memberId });
});

function listMembers() {
  return getDb()
    .prepare(
      `SELECT id, name, avatar, color, sort_order AS sortOrder, is_current AS isCurrent, is_system AS isSystem
       FROM members
       ORDER BY sort_order ASC, name ASC`
    )
    .all();
}
