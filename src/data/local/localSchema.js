export const LOCAL_DATABASE_NAME = 'home_notes_local';
export const LOCAL_DATABASE_VERSION = 1;

export const LOCAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY NOT NULL,
  server_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  content_text TEXT NOT NULL DEFAULT '',
  content_html TEXT,
  content_json TEXT,
  category_id TEXT,
  member_id TEXT,
  tags_json TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  device_id TEXT,
  local_revision INTEGER NOT NULL DEFAULT 1,
  server_revision INTEGER,
  sync_status TEXT NOT NULL DEFAULT 'local_only',
  last_sync_at TEXT,
  sync_error TEXT,
  payload_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_notes_status_updated ON notes(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_notes_sync_status ON notes(sync_status);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY NOT NULL,
  note_id TEXT NOT NULL,
  server_id TEXT,
  filename TEXT NOT NULL DEFAULT '',
  mime_type TEXT,
  size INTEGER NOT NULL DEFAULT 0,
  local_path TEXT,
  server_path TEXT,
  hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'local_only',
  sync_error TEXT,
  payload_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_attachments_note ON attachments(note_id);
CREATE INDEX IF NOT EXISTS idx_attachments_sync_status ON attachments(sync_status);

CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT
);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status_created ON sync_queue(status, created_at);

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT,
  updated_at TEXT NOT NULL
);
`;
