import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { defaultCategories } from '../../shared/defaults.js';

const dataDir = path.resolve(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'app.db');

let db;

export function getDb() {
  if (!db) {
    mkdirSync(dataDir, { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    initializeSchema(db);
    seedDefaults(db);
  }

  return db;
}

export function getDbPath() {
  return dbPath;
}

function initializeSchema(database) {
  database.exec(`
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
      summary TEXT,
      category_id TEXT,
      note_type TEXT NOT NULL DEFAULT 'normal',
      occurred_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source_type TEXT NOT NULL DEFAULT 'manual',
      source_id TEXT,
      original_title TEXT,
      original_path TEXT,
      original_category TEXT,
      original_created_at TEXT,
      original_updated_at TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id)
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

    CREATE TABLE IF NOT EXISTS import_batches (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      file_name TEXT,
      file_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      total_count INTEGER NOT NULL DEFAULT 0,
      success_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS import_items (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      note_id TEXT,
      original_id TEXT,
      original_title TEXT,
      original_path TEXT,
      raw_data_path TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES import_batches(id) ON DELETE CASCADE,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL
    );
  `);
}

function seedDefaults(database) {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO categories
      (id, name, slug, color, icon, sort_order, is_system)
    VALUES
      (?, ?, ?, ?, ?, ?, 1)
  `);

  for (const category of defaultCategories) {
    insert.run(
      category.id,
      category.name,
      category.id,
      category.color,
      category.icon,
      category.sortOrder
    );
  }
}
