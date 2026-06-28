import { Router } from 'express';
import { getDb } from '../db/database.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', (_request, response) => {
  const rows = getDb()
    .prepare(
      `SELECT
        c.id,
        c.name,
        c.slug,
        c.color,
        c.icon,
        c.sort_order AS sortOrder,
        c.is_system AS isSystem,
        COUNT(n.id) AS noteCount
       FROM categories c
       LEFT JOIN notes n ON n.category_id = c.id AND n.is_deleted = 0
       GROUP BY c.id
       ORDER BY sort_order ASC, name ASC`
    )
    .all();

  response.json({ categories: rows });
});
