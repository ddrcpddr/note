import express from 'express';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getDataPaths, getDb, getDbPath } from './db/database.js';
import { categoriesRouter } from './routes/categories.js';
import { importsRouter } from './routes/imports.js';
import { membersRouter } from './routes/members.js';
import { listNotes, notesRouter } from './routes/notes.js';
import { startAutomaticBackups, storageRouter } from './routes/storage.js';

const app = express();
const port = Number(process.env.PORT || 3300);
const accessPin = String(process.env.NOTE_ACCESS_PIN || '').trim();
const accessToken = accessPin ? createHash('sha256').update(accessPin).digest('hex') : '';

getDb();
startAutomaticBackups();

const builtInCorsOrigins = new Set(['capacitor://localhost', 'ionic://localhost']);
const allowedCorsHeaders = 'Content-Type, X-File-Name, X-Member-Id, Authorization';

function getConfiguredCorsOrigins() {
  return String(process.env.NOTE_CORS_ORIGINS || process.env.NOTE_CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedCorsOrigin(origin) {
  if (!origin) return false;
  if (builtInCorsOrigins.has(origin)) return true;

  try {
    const parsed = new URL(origin);
    if (['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) return true;
  } catch {
    // Non-URL origins such as capacitor://localhost are handled above.
  }

  return getConfiguredCorsOrigins().includes(origin);
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (!isAllowedCorsOrigin(origin)) return false;

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', allowedCorsHeaders);
  response.setHeader('Access-Control-Max-Age', '86400');
  return true;
}

app.use((request, response, next) => {
  const corsAllowed = setCorsHeaders(request, response);
  if (request.method === 'OPTIONS' && corsAllowed) {
    response.status(204).end();
    return;
  }
  next();
});
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    name: 'note',
    build: {
      commit: process.env.NOTE_BUILD_COMMIT || 'local',
      buildTime: process.env.NOTE_BUILD_TIME || 'local'
    },
    dbPath: getDbPath(),
    dataPaths: getDataPaths()
  });
});

app.get('/api/access/status', (request, response) => {
  response.json({
    accessRequired: Boolean(accessPin),
    unlocked: !accessPin || isAccessUnlocked(request)
  });
});

app.post('/api/access/unlock', (request, response) => {
  if (!accessPin) {
    response.json({ accessRequired: false, unlocked: true });
    return;
  }

  const pin = String(request.body?.pin || '').trim();
  if (pin !== accessPin) {
    response.status(401).json({ error: '访问口令不正确' });
    return;
  }

  response.setHeader('Set-Cookie', `${accessCookieName}=${accessToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000`);
  response.json({ accessRequired: true, unlocked: true });
});

app.use((request, response, next) => {
  if (!accessPin || !request.path.startsWith('/api/') || request.path.startsWith('/api/access/') || request.path === '/api/health') {
    next();
    return;
  }

  if (isAccessUnlocked(request)) {
    next();
    return;
  }

  response.status(401).json({ error: '需要访问口令' });
});

app.get('/api/attachments/:id/file', (request, response) => {
  const attachmentId = String(request.params.id || '').trim();
  const attachment = getDb()
    .prepare('SELECT original_name AS originalName, mime_type AS mimeType, storage_path AS storagePath FROM attachments WHERE id = ?')
    .get(attachmentId);

  if (!attachment) {
    response.status(404).json({ error: '附件不存在' });
    return;
  }

  const paths = getDataPaths();
  const normalizedRelativePath = String(attachment.storagePath || '').replace(/\\/g, '/');
  const absolutePath = path.resolve(paths.dataDir, normalizedRelativePath);
  const dataRoot = path.resolve(paths.dataDir);
  if ((!absolutePath.startsWith(`${dataRoot}${path.sep}`) && absolutePath !== dataRoot) || !existsSync(absolutePath)) {
    response.status(404).json({ error: '附件文件不存在' });
    return;
  }

  if (attachment.mimeType) response.type(attachment.mimeType);
  response.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(attachment.originalName || 'attachment')}`);
  response.sendFile(absolutePath);
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
       LEFT JOIN notes n ON n.category_id = c.id AND n.is_deleted = 0 AND n.is_archived = 0
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    )
    .all();
  const members = db
    .prepare(
      `SELECT id, name, avatar, color, sort_order AS sortOrder, is_current AS isCurrent, is_system AS isSystem
       FROM members
       ORDER BY sort_order ASC, name ASC`
    )
    .all();
  const tags = db.prepare('SELECT id, name, usage_count AS usageCount FROM tags ORDER BY name ASC').all();

  response.json({
    members,
    categories,
    tags,
    notes: listNotes({ includeRichText: 'true' }),
    dataPaths: getDataPaths()
  });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/members', membersRouter);
app.use('/api/notes', notesRouter);
app.use('/api/imports', importsRouter);
app.use('/api/storage', storageRouter);

const accessCookieName = 'note_access';

function isAccessUnlocked(request) {
  return parseCookies(request.headers.cookie || '')[accessCookieName] === accessToken;
}

function parseCookies(cookieHeader) {
  return String(cookieHeader)
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const separatorIndex = item.indexOf('=');
      if (separatorIndex < 0) return cookies;
      const key = item.slice(0, separatorIndex);
      const value = item.slice(separatorIndex + 1);
      cookies[key] = value;
      return cookies;
    }, {});
}

const distDir = path.resolve(process.cwd(), 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next();
      return;
    }

    response.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`note server listening on http://localhost:${port}`);
});
