import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { dryRunNsxFile, readNsxEntryBuffer } from '../importers/notestation/nsx.js';
import { prepareStoredRichText } from '../rich-text.js';

const args = process.argv.slice(2);
const filePath = args.find((arg) => !arg.startsWith('--'));
const confirmed = args.includes('--confirm');

if (!filePath) {
  console.error('Usage: node src/server/scripts/notestation-formal-import.js <path-to-dry-run.json-or-export.nsx> [--confirm]');
  process.exit(1);
}

const preview = loadPreview(filePath);
const preflight = buildPreflight(preview, confirmed);

if (!confirmed) {
  console.log(JSON.stringify(preflight, null, 2));
  process.exit(0);
}

const dbTools = await import('../db/database.js');
const report = runConfirmedImport(filePath, preview, preflight, dbTools);
console.log(JSON.stringify(report, null, 2));

function loadPreview(inputPath) {
  if (inputPath.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(readFileSync(inputPath, 'utf8'));
    return parsed.preview || parsed;
  }

  return dryRunNsxFile(inputPath, { includeContent: true, includeRawContent: true });
}

function buildPreflight(preview, isConfirmed) {
  return {
    confirmed: isConfirmed,
    requiresConfirmation: !isConfirmed,
    willWriteFormalDatabase: isConfirmed,
    warning: isConfirmed
      ? 'Confirmed: this run will write to the configured database after creating a backup.'
      : 'Preflight only: rerun with --confirm to back up and write the configured database.',
    fileName: preview.fileName,
    totalCount: preview.totalCount,
    successCount: preview.successCount,
    failedCount: preview.failedCount,
    attachmentCount: preview.attachmentCount,
    originalCategoryCount: preview.originalCategoryCount,
    tagCount: preview.tagCount
  };
}

function runConfirmedImport(inputPath, preview, preflight, dbTools) {
  const { createId, getDataPaths, getDb, slugifyTag } = dbTools;
  const db = getDb();
  const paths = getDataPaths();
  const backupPath = backupDatabase(paths);
  const importId = createId('import_nsx_formal');
  const attachmentStats = { copied: 0, failed: 0 };
  const attachmentFailures = [];

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
      (id, note_id, file_name, original_name, mime_type, file_size, storage_path, source_type, kind, source_attachment_id, source_path, sort_order, is_inline)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, 'notestation_import', ?, ?, ?, ?, 0)
  `);

  db.exec('BEGIN');
  try {
    insertImport.run(importId, preview.fileName, inputPath, preview.totalCount, preview.successCount, preview.failedCount);

    for (const failure of preview.failures || []) {
      insertFailure.run(
        createId('import_failure'),
        importId,
        failure.originalTitle || failure.originalId,
        failure.originalPath || failure.originalId,
        failure.errorMessage,
        JSON.stringify(failure)
      );
    }

    for (const record of preview.records || []) {
      const noteId = createId('note');
      const rawMetadata = {
        ...(record.rawMetadata || {}),
        originalNotebookPath: record.originalPath || record.rawMetadata?.originalNotebookPath || null,
        importSource: 'notestation_import'
      };
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
        record.originalCategory || '未分类',
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
        const attachmentResult = copyAttachment(inputPath, paths, importId, noteId, attachment, index);
        if (attachmentResult.error) {
          attachmentStats.failed += 1;
          const failure = {
            originalTitle: record.title,
            originalPath: record.originalPath,
            attachment: attachment.fileName || attachment.id,
            errorMessage: attachmentResult.error
          };
          attachmentFailures.push(failure);
          insertFailure.run(
            createId('import_failure'),
            importId,
            record.title,
            record.originalPath,
            `附件导入失败：${attachmentResult.error}`,
            JSON.stringify(failure)
          );
        } else {
          attachmentStats.copied += 1;
        }

        insertAttachment.run(
          createId('attachment'),
          noteId,
          attachmentResult.fileName,
          attachmentResult.originalName,
          attachmentResult.mimeType,
          attachmentResult.fileSize,
          attachmentResult.storagePath,
          attachmentResult.mimeType?.startsWith('image/') ? 'image' : 'file',
          attachment.id || attachment.fileName || null,
          attachment.id || attachment.fileName || null,
          index
        );
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    error.message = `${error.message}\nImport was rolled back. Restore from backup if needed: ${backupPath}`;
    throw error;
  }

  return {
    ...preflight,
    requiresConfirmation: false,
    backupPath,
    importId,
    importedCount: preview.successCount,
    failedCount: (preview.failedCount || 0) + attachmentStats.failed,
    attachmentCopiedCount: attachmentStats.copied,
    attachmentFailureCount: attachmentStats.failed,
    attachmentFailures,
    rollback: `Stop the app, replace the configured database with ${backupPath}, then restart the app.`
  };
}

function backupDatabase(paths) {
  mkdirSync(paths.backupsDir, { recursive: true });
  mkdirSync(path.dirname(paths.dbPath), { recursive: true });
  if (!existsSync(paths.dbPath)) {
    writeFileSync(paths.dbPath, '');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(paths.backupsDir, `app-before-notestation-import-${timestamp}.db`);
  copyFileSync(paths.dbPath, backupPath);
  return backupPath;
}

function copyAttachment(inputPath, paths, importId, noteId, attachment, index) {
  const fileName = safeFileName(attachment.fileName || attachment.id || `attachment-${index + 1}`);
  const originalName = attachment.originalName || fileName;
  const targetRelativePath = path.join('attachments', 'notestation', importId, noteId, fileName);
  const targetPath = path.join(paths.dataDir, targetRelativePath);
  const sourceEntry = attachment.id || attachment.fileName;

  if (!inputPath.toLowerCase().endsWith('.nsx')) {
    return {
      fileName,
      originalName,
      mimeType: null,
      fileSize: null,
      storagePath: targetRelativePath,
      error: 'dry-run JSON 不包含附件二进制，需使用原始 .nsx 执行正式导入。'
    };
  }

  try {
    mkdirSync(path.dirname(targetPath), { recursive: true });
    const buffer = readNsxEntryBuffer(inputPath, sourceEntry);
    writeFileSync(targetPath, buffer);
    return {
      fileName,
      originalName,
      mimeType: guessMimeType(fileName),
      fileSize: buffer.length,
      storagePath: targetRelativePath,
      error: null
    };
  } catch (error) {
    return {
      fileName,
      originalName,
      mimeType: null,
      fileSize: null,
      storagePath: targetRelativePath,
      error: error.message
    };
  }
}

function safeFileName(value) {
  const normalized = String(value || 'attachment').replace(/[\\/:*?"<>|]+/g, '_').trim();
  return normalized || 'attachment';
}

function guessMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.txt') return 'text/plain';
  return null;
}