import { readFileSync } from 'node:fs';
import { getDb, createId, slugifyTag } from '../db/database.js';
import { dryRunNsxFile } from '../importers/notestation/nsx.js';
import { prepareStoredRichText } from '../rich-text.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: NOTE_DATA_DIR=<sandbox-dir> or NOTE_DB_PATH=<sandbox-db> node src/server/scripts/notestation-sandbox-import.js <path-to-dry-run.json-or-export.nsx>');
  process.exit(1);
}

const sandboxTarget = process.env.NOTE_DB_PATH || process.env.NOTE_DATA_DIR || '';
if (!sandboxTarget || !/sandbox|temp|test/i.test(sandboxTarget)) {
  console.error('Refusing to import: NOTE_DB_PATH or NOTE_DATA_DIR must point to a sandbox/test/temp target.');
  process.exit(2);
}

const preview = filePath.toLowerCase().endsWith('.json')
  ? JSON.parse(readFileSync(filePath, 'utf8')).preview
  : dryRunNsxFile(filePath, { includeContent: true, includeRawContent: true });
const db = getDb();
const importId = createId('import_nsx_sandbox');

const insertImport = db.prepare(`
  INSERT INTO imports
    (id, source_type, file_name, file_path, status, total_count, success_count, failed_count, created_by_member_id, completed_at)
  VALUES
    (?, 'notestation', ?, ?, 'completed', ?, ?, ?, 'self', CURRENT_TIMESTAMP)
`);
const insertFailure = db.prepare(`
  INSERT INTO import_failures
    (id, import_id, original_title, original_path, error_message, raw_data)
  VALUES
    (?, ?, ?, ?, ?, ?)
`);
const insertNote = db.prepare(`
  INSERT INTO notes
    (
      id,
      title,
      content,
      content_text,
      content_html,
      content_json,
      source_html,
      content_format,
      content_version,
      summary,
      category_id,
      member_id,
      note_type,
      source_type,
      source_id,
      save_status,
      visibility,
      original_title,
      original_path,
      original_category,
      original_created_at,
      original_updated_at,
      raw_metadata,
      occurred_at
    )
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uncategorized', 'self', 'normal', 'notestation_import', ?, 'saved', 'family', ?, ?, ?, ?, ?, ?, ?)
`);
const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
const insertAttachment = db.prepare(`
  INSERT INTO attachments
    (id, note_id, file_name, original_name, storage_path, source_type, kind, source_attachment_id, source_path, sort_order, is_inline)
  VALUES
    (?, ?, ?, ?, ?, 'notestation_import', ?, ?, ?, ?, 0)
`);

db.exec('BEGIN');
try {
  insertImport.run(importId, preview.fileName, filePath, preview.totalCount, preview.successCount, preview.failedCount);

  for (const failure of preview.failures) {
    insertFailure.run(
      createId('import_failure'),
      importId,
      failure.originalTitle || failure.originalId,
      failure.originalPath || failure.originalId,
      failure.errorMessage,
      JSON.stringify(failure)
    );
  }

  for (const record of preview.records) {
    const noteId = createId('note');
    const rawMetadata = record.rawMetadata || {};
    const originalHtml = rawMetadata.originalContentFormat === 'html' ? String(rawMetadata.originalContent || '') : '';
    const richText = prepareStoredRichText({
      content: record.content || record.summary || record.title,
      contentHtml: originalHtml,
      sourceHtml: originalHtml
    });
    insertNote.run(
      noteId,
      record.title,
      richText.legacyContent || record.content || record.summary || record.title,
      richText.contentText || record.content || record.summary || record.title,
      richText.contentHtml,
      richText.contentJson,
      richText.sourceHtml,
      richText.contentFormat,
      richText.contentVersion,
      record.summary || richText.contentText || record.title,
      importId,
      record.originalTitle,
      record.originalPath,
      record.originalCategory,
      record.originalCreatedAt,
      record.originalUpdatedAt,
      JSON.stringify(rawMetadata),
      record.originalCreatedAt
    );

    for (const tagName of record.tags || []) {
      const tagId = slugifyTag(tagName);
      insertTag.run(tagId, tagName, tagId);
      insertNoteTag.run(noteId, tagId);
    }

    for (const [index, attachment] of (record.attachments || []).entries()) {
      const attachmentId = createId('attachment');
      const fileName = attachment.fileName || attachment.id || `attachment-${index + 1}`;
      const originalName = attachment.originalName || fileName;
      insertAttachment.run(
        attachmentId,
        noteId,
        fileName,
        originalName,
        `imports/notestation/${fileName}`,
        guessAttachmentKind(fileName),
        attachment.id || attachment.fileName || null,
        attachment.id || attachment.fileName || null,
        index
      );
    }
  }

  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}

console.log(JSON.stringify({
  sandbox: true,
  importId,
  totalCount: preview.totalCount,
  successCount: preview.successCount,
  failedCount: preview.failedCount,
  attachmentCount: preview.attachmentCount,
  originalCategoryCount: preview.originalCategoryCount,
  tagCount: preview.tagCount,
  dataDir: process.env.NOTE_DATA_DIR || null,
  dbPath: process.env.NOTE_DB_PATH || null
}, null, 2));

function guessAttachmentKind(fileName) {
  return /\.(png|jpe?g|gif|webp)$/i.test(String(fileName || '')) ? 'image' : 'file';
}
