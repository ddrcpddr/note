import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { defaultCategories, defaultMembers, defaultTags, seedNotes } from '../../shared/defaults.js';

const explicitDbPath = process.env.NOTE_DB_PATH ? path.resolve(process.env.NOTE_DB_PATH) : null;
const defaultDataDir = path.join(process.cwd(), 'data');
const databaseDir = explicitDbPath ? path.dirname(explicitDbPath) : path.join(path.resolve(process.env.NOTE_DATA_DIR || defaultDataDir), 'database');
const dataDir = path.resolve(process.env.NOTE_DATA_DIR || (explicitDbPath ? path.dirname(databaseDir) : defaultDataDir));
const attachmentsDir = path.join(dataDir, 'attachments');
const backupsDir = path.join(dataDir, 'backups');
const importsDir = path.join(dataDir, 'imports', 'notestation');
const exportsDir = path.join(dataDir, 'exports');
const dbPath = explicitDbPath || path.join(databaseDir, 'app.db');

let db;

export function getDb() {
  if (!db) {
    for (const dir of [dataDir, databaseDir, attachmentsDir, backupsDir, importsDir, exportsDir]) {
      mkdirSync(dir, { recursive: true });
    }

    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    initializeSchema(db);
    migrateSchema(db);
    seedDefaults(db);
  }

  return db;
}

export function getDbPath() {
  return dbPath;
}

export function getDataPaths() {
  return {
    dataDir,
    databaseDir,
    dbPath,
    attachmentsDir,
    backupsDir,
    importsDir,
    exportsDir
  };
}

export function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function initializeSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      color TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_current INTEGER NOT NULL DEFAULT 0,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      color TEXT,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      content_html TEXT,
      summary TEXT,
      category_id TEXT,
      member_id TEXT,
      note_type TEXT NOT NULL DEFAULT 'normal',
      occurred_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source_type TEXT NOT NULL DEFAULT 'manual',
      source_id TEXT,
      save_status TEXT NOT NULL DEFAULT 'saved',
      visibility TEXT NOT NULL DEFAULT 'family',
      original_title TEXT,
      original_path TEXT,
      original_category TEXT,
      original_created_at TEXT,
      original_updated_at TEXT,
      raw_metadata TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS note_tags (
      note_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT,
      file_size INTEGER,
      storage_path TEXT NOT NULL,
      hash TEXT,
      source_type TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS imports (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      file_name TEXT,
      file_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      total_count INTEGER NOT NULL DEFAULT 0,
      success_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      created_by_member_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      FOREIGN KEY (created_by_member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS import_failures (
      id TEXT PRIMARY KEY,
      import_id TEXT NOT NULL,
      original_title TEXT,
      original_path TEXT,
      error_message TEXT NOT NULL,
      raw_data TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (import_id) REFERENCES imports(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      file_path TEXT,
      file_size INTEGER,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function migrateSchema(database) {
  addColumnIfMissing(database, 'members', 'color', 'TEXT');
  addColumnIfMissing(database, 'notes', 'member_id', 'TEXT');
  addColumnIfMissing(database, 'notes', 'save_status', "TEXT NOT NULL DEFAULT 'saved'");
  addColumnIfMissing(database, 'notes', 'visibility', "TEXT NOT NULL DEFAULT 'family'");
  addColumnIfMissing(database, 'notes', 'raw_metadata', 'TEXT');
  addColumnIfMissing(database, 'notes', 'content_html', 'TEXT');
}

function addColumnIfMissing(database, tableName, columnName, definition) {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!columns.some((column) => column.name === columnName)) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

function seedDefaults(database) {
  const insertMember = database.prepare(`
    INSERT OR IGNORE INTO members
      (id, name, avatar, color, sort_order, is_current, is_system)
    VALUES
      (?, ?, ?, ?, ?, ?, 1)
  `);

  for (const member of defaultMembers) {
    insertMember.run(member.id, member.name, member.avatar, member.color || null, member.sortOrder, member.isCurrent ? 1 : 0);
  }

  const insertCategory = database.prepare(`
    INSERT OR IGNORE INTO categories
      (id, name, slug, color, icon, sort_order, is_system)
    VALUES
      (?, ?, ?, ?, ?, ?, 1)
  `);

  for (const category of defaultCategories) {
    insertCategory.run(category.id, category.name, category.id, category.color, category.icon, category.sortOrder);
  }

  const insertTag = database.prepare(`
    INSERT OR IGNORE INTO tags
      (id, name, slug)
    VALUES
      (?, ?, ?)
  `);

  for (const tag of defaultTags) {
    insertTag.run(slugifyTag(tag), tag, slugifyTag(tag));
  }

  const noteCount = database.prepare('SELECT COUNT(*) AS count FROM notes').get().count;
  if (noteCount === 0) {
    seedExampleNotes(database);
  }
}

function seedExampleNotes(database) {
  const insertNote = database.prepare(`
    INSERT INTO notes
      (id, title, content, summary, category_id, member_id, note_type, source_type, occurred_at, save_status, visibility)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'saved', 'family')
  `);
  const insertNoteTag = database.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
  const insertAttachment = database.prepare(`
    INSERT INTO attachments
      (id, note_id, file_name, original_name, storage_path, source_type)
    VALUES
      (?, ?, ?, ?, ?, ?)
  `);

  for (const note of seedNotes) {
    insertNote.run(
      note.id,
      note.title,
      note.content,
      note.summary,
      note.categoryId,
      note.memberId,
      note.noteType,
      note.sourceType || 'manual'
    );

    for (const tag of note.tags) {
      insertNoteTag.run(note.id, slugifyTag(tag));
    }

    for (const [index, attachmentName] of note.attachments.entries()) {
      insertAttachment.run(
        `${note.id}-attachment-${index + 1}`,
        note.id,
        attachmentName,
        attachmentName,
        path.join('attachments', attachmentName),
        note.sourceType || 'manual'
      );
    }
  }
}

export function slugifyTag(tagName) {
  return `tag-${Buffer.from(tagName).toString('hex')}`;
}
