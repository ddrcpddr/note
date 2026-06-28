import { Router } from 'express';
import { getDb } from '../db/database.js';

export const notesRouter = Router();

notesRouter.get('/', (request, response) => {
  const search = String(request.query.search || '').trim();
  const category = String(request.query.category || '').trim();
  const params = [];
  const where = ['n.is_deleted = 0'];

  if (search) {
    where.push('(n.title LIKE ? OR n.content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    where.push('n.category_id = ?');
    params.push(category);
  }

  const rows = getDb()
    .prepare(
      `SELECT
        n.id,
        n.title,
        n.summary,
        n.note_type AS noteType,
        n.occurred_at AS occurredAt,
        n.created_at AS createdAt,
        n.updated_at AS updatedAt,
        n.source_type AS sourceType,
        c.id AS categoryId,
        c.name AS categoryName,
        c.color AS categoryColor
       FROM notes n
       LEFT JOIN categories c ON c.id = n.category_id
       WHERE ${where.join(' AND ')}
       ORDER BY COALESCE(n.occurred_at, n.created_at) DESC
       LIMIT 100`
    )
    .all(...params);

  response.json({ notes: rows });
});
