import { Router } from 'express';
import { getDb } from '../db/database.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', (_request, response) => {
  const rows = getDb()
    .prepare(
      `SELECT id, name, slug, color, icon, sort_order AS sortOrder, is_system AS isSystem
       FROM categories
       ORDER BY sort_order ASC, name ASC`
    )
    .all();

  response.json({ categories: rows });
});
