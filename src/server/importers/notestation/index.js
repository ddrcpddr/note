import { createId, getDb, slugifyTag } from '../../db/database.js';
import { notestationSampleFailures, notestationSampleRecords } from './sample.js';

export function createNotestationSamplePreview(memberId = 'history') {
  const db = getDb();
  const importId = createId('import');
  const insertImport = db.prepare(`
    INSERT INTO imports
      (id, source_type, file_name, file_path, status, total_count, success_count, failed_count, created_by_member_id)
    VALUES
      (?, 'notestation', 'notestation_sample.json', 'data/imports/notestation/notestation_sample.json', 'previewed', ?, ?, ?, ?)
  `);
  const insertFailure = db.prepare(`
    INSERT INTO import_failures
      (id, import_id, original_title, original_path, error_message, raw_data)
    VALUES
      (?, ?, ?, ?, ?, ?)
  `);

  insertImport.run(
    importId,
    notestationSampleRecords.length + notestationSampleFailures.length,
    notestationSampleRecords.length,
    notestationSampleFailures.length,
    memberId
  );

  for (const failure of notestationSampleFailures) {
    insertFailure.run(
      createId('import_failure'),
      importId,
      failure.originalTitle,
      failure.originalPath,
      failure.errorMessage,
      JSON.stringify(failure)
    );
  }

  return getImportPreview(importId);
}

export function commitNotestationImport(importId, memberId = 'history') {
  const db = getDb();
  const batch = db.prepare('SELECT * FROM imports WHERE id = ?').get(importId);
  if (!batch) {
    throw new Error('导入批次不存在');
  }

  const existingImportedCount = db
    .prepare('SELECT COUNT(*) AS count FROM notes WHERE source_type = ? AND source_id = ?')
    .get('notestation_import', importId).count;
  if (existingImportedCount > 0) {
    return getImportResult(importId);
  }

  const insertNote = db.prepare(`
    INSERT INTO notes
      (
        id,
        title,
        content,
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
      (?, ?, ?, ?, ?, ?, 'normal', 'notestation_import', ?, 'saved', 'family', ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
  const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');

  db.exec('BEGIN');
  try {
    for (const record of notestationSampleRecords) {
      const noteId = createId('note');
      insertNote.run(
        noteId,
        record.title,
        record.content,
        record.content.slice(0, 56),
        record.categoryId,
        memberId,
        importId,
        record.originalTitle,
        record.originalPath,
        record.originalCategory,
        record.originalCreatedAt,
        record.originalUpdatedAt,
        JSON.stringify(record),
        record.originalCreatedAt
      );

      for (const tagName of record.tags) {
        const tagId = slugifyTag(tagName);
        insertTag.run(tagId, tagName, tagId);
        insertNoteTag.run(noteId, tagId);
      }
    }

    db.prepare("UPDATE imports SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").run(importId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    db.prepare("UPDATE imports SET status = 'failed' WHERE id = ?").run(importId);
    throw error;
  }

  return getImportResult(importId);
}

export function getImportPreview(importId) {
  const db = getDb();
  const batch = db.prepare('SELECT * FROM imports WHERE id = ?').get(importId);
  const failures = db
    .prepare(
      `SELECT id, original_title AS originalTitle, original_path AS originalPath, error_message AS errorMessage
       FROM import_failures
       WHERE import_id = ?
       ORDER BY created_at ASC`
    )
    .all(importId);

  return {
    importId,
    fileName: batch.file_name,
    status: batch.status,
    totalCount: batch.total_count,
    successCount: batch.success_count,
    failedCount: batch.failed_count,
    attachmentCount: 0,
    originalCategoryCount: new Set(notestationSampleRecords.map((record) => record.originalCategory)).size,
    records: notestationSampleRecords,
    failures
  };
}

function getImportResult(importId) {
  const preview = getImportPreview(importId);
  const notes = getDb()
    .prepare(
      `SELECT id
       FROM notes
       WHERE source_type = 'notestation_import' AND source_id = ?
       ORDER BY created_at DESC`
    )
    .all(importId);

  return {
    ...preview,
    status: 'completed',
    importedNoteIds: notes.map((note) => note.id)
  };
}
