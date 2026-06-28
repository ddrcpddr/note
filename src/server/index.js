import express from 'express';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { getDataPaths, getDb, getDbPath } from './db/database.js';
import { categoriesRouter } from './routes/categories.js';
import { importsRouter } from './routes/imports.js';
import { listNotes, notesRouter } from './routes/notes.js';

const app = express();
const port = Number(process.env.PORT || 3300);

for (const dir of ['data', 'data/database', 'data/attachments', 'data/imports/notestation', 'data/backups', 'data/exports']) {
  mkdirSync(path.resolve(process.cwd(), dir), { recursive: true });
}

getDb();

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    name: 'note',
    dbPath: getDbPath(),
    dataPaths: getDataPaths()
  });
});

app.get('/api/app-data', (_request, response) => {
  const db = getDb();
  const categories = db
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
       ORDER BY c.sort_order ASC, c.name ASC`
    )
    .all();
  const members = db
    .prepare(
      `SELECT id, name, avatar, sort_order AS sortOrder, is_current AS isCurrent, is_system AS isSystem
       FROM members
       ORDER BY sort_order ASC, name ASC`
    )
    .all();
  const tags = db.prepare('SELECT id, name, usage_count AS usageCount FROM tags ORDER BY name ASC').all();

  response.json({
    members,
    categories,
    tags,
    notes: listNotes(),
    dataPaths: getDataPaths()
  });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/imports', importsRouter);

app.listen(port, () => {
  console.log(`note server listening on http://localhost:${port}`);
});
