import { Router } from 'express';
import { getDb } from '../db/database.js';

export const membersRouter = Router();

membersRouter.get('/', (_request, response) => {
  response.json({ members: listMembers() });
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
      `SELECT id, name, avatar, sort_order AS sortOrder, is_current AS isCurrent, is_system AS isSystem
       FROM members
       ORDER BY sort_order ASC, name ASC`
    )
    .all();
}
