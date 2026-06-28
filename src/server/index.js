import express from 'express';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { getDb, getDbPath } from './db/database.js';
import { categoriesRouter } from './routes/categories.js';
import { notesRouter } from './routes/notes.js';

const app = express();
const port = Number(process.env.PORT || 3300);

for (const dir of ['data', 'data/attachments', 'data/imports', 'data/backups']) {
  mkdirSync(path.resolve(process.cwd(), dir), { recursive: true });
}

getDb();

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    name: 'note',
    dbPath: getDbPath()
  });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/notes', notesRouter);

app.listen(port, () => {
  console.log(`note server listening on http://localhost:${port}`);
});
