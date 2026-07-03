import { Router } from 'express';
import { createId, getDb } from '../db/database.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', (_request, response) => {
  response.json({ categories: listCategories() });
});

categoriesRouter.post('/', (request, response) => {
  const db = getDb();
  const payload = request.body || {};
  const name = normalizeCategoryName(payload.name);

  if (!name) {
    response.status(400).json({ error: '请输入分类名称' });
    return;
  }

  const duplicate = db.prepare('SELECT id FROM categories WHERE name = ? COLLATE NOCASE').get(name);
  if (duplicate) {
    response.status(409).json({ error: '分类名称已存在' });
    return;
  }

  const id = createId('category');
  const color = normalizeColor(payload.color);
  const icon = normalizeIcon(payload.icon);
  const maxSortOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS maxSortOrder FROM categories').get().maxSortOrder;

  db.prepare(`
    INSERT INTO categories
      (id, name, slug, color, icon, sort_order, is_system)
    VALUES
      (?, ?, ?, ?, ?, ?, 0)
  `).run(id, name, id, color, icon, Number(maxSortOrder || 0) + 10);

  response.status(201).json({ category: getCategoryById(id), categories: listCategories() });
});

categoriesRouter.patch('/:id', (request, response) => {
  const db = getDb();
  const categoryId = String(request.params.id || '').trim();
  const existing = getCategoryById(categoryId);

  if (!existing) {
    response.status(404).json({ error: '分类不存在' });
    return;
  }

  const payload = request.body || {};
  const name = Object.prototype.hasOwnProperty.call(payload, 'name') ? normalizeCategoryName(payload.name) : existing.name;
  const color = Object.prototype.hasOwnProperty.call(payload, 'color') ? normalizeColor(payload.color) : existing.color;
  const icon = Object.prototype.hasOwnProperty.call(payload, 'icon') ? normalizeIcon(payload.icon) : existing.icon;

  if (!name) {
    response.status(400).json({ error: '请输入分类名称' });
    return;
  }

  const duplicate = db.prepare('SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND id <> ?').get(name, categoryId);
  if (duplicate) {
    response.status(409).json({ error: '分类名称已存在' });
    return;
  }

  db.prepare('UPDATE categories SET name = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, color, icon, categoryId);
  response.json({ category: getCategoryById(categoryId), categories: listCategories() });
});

function listCategories() {
  return getDb()
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
       LEFT JOIN notes n ON n.category_id = c.id AND n.is_deleted = 0 AND n.is_archived = 0
       GROUP BY c.id
       ORDER BY sort_order ASC, name ASC`
    )
    .all();
}

function getCategoryById(categoryId) {
  return getDb()
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
       LEFT JOIN notes n ON n.category_id = c.id AND n.is_deleted = 0 AND n.is_archived = 0
       WHERE c.id = ?
       GROUP BY c.id`
    )
    .get(categoryId);
}

function normalizeCategoryName(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 24);
}

function normalizeColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#3DAA6C';
}

function normalizeIcon(value) {
  return String(value || 'folder').replace(/[^a-z0-9_-]/gi, '').trim().slice(0, 32) || 'folder';
}
