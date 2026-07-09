import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createId, getDataPaths, getDb, slugifyTag } from '../../db/database.js';
import { notestationSampleFailures, notestationSampleRecords } from './sample.js';
import { dryRunNsxFile, readNsxEntryBuffer } from './nsx.js';
import { prepareStoredRichText } from '../../rich-text.js';

const activeNsxPreviewJobs = new Set();

export function createNotestationDryRunPreview(payload = {}) {
  const fileName = String(payload.fileName || 'notestation_export_sample.zip');
  const fileType = String(payload.fileType || 'unknown');

  return {
    importId: null,
    dryRun: true,
    fileName,
    fileType,
    status: 'needs_real_sample',
    totalCount: 0,
    successCount: 0,
    failedCount: 1,
    attachmentCount: 0,
    originalCategoryCount: 0,
    records: [],
    failures: [
      {
        id: 'notestation-real-sample-required',
        originalTitle: fileName,
        originalPath: '',
        errorMessage: '网页端目前只完成 .nsx 文件选择与安全预检，尚未上传解析文件内容；不会写入正式数据库。'
      }
    ],
    requiredSampleInfo: [
      '接入网页端 .nsx 上传到 data/imports/notestation/',
      '复用现有 NSX dry-run 解析器生成预览',
      '正式导入前自动备份数据库',
      '把 Note Station HTML、图片和附件映射到富文本正文内引用',
      '保留失败项报告并禁止直接污染正式库'
    ]
  };
}

export function createNotestationNsxPreview(filePath, memberId = 'self', options = {}) {
  if (options.async) {
    return createNotestationNsxProcessingPreview(filePath, memberId);
  }

  const db = getDb();
  const preview = dryRunNsxFile(filePath);
  const importId = createId('import_nsx_web');
  const insertImport = db.prepare(`
    INSERT INTO imports
      (id, source_type, file_name, file_path, status, total_count, success_count, failed_count, created_by_member_id)
    VALUES
      (?, 'notestation', ?, ?, 'previewed', ?, ?, ?, ?)
  `);
  const insertFailure = db.prepare(`
    INSERT INTO import_failures
      (id, import_id, original_title, original_path, error_message, raw_data)
    VALUES
      (?, ?, ?, ?, ?, ?)
  `);

  insertImport.run(importId, preview.fileName, filePath, preview.totalCount, preview.successCount, preview.failedCount, memberId);

  for (const failure of preview.failures || []) {
    insertFailure.run(
      createId('import_failure'),
      importId,
      failure.originalTitle || failure.originalId,
      failure.originalPath || failure.originalId || '',
      failure.errorMessage,
      JSON.stringify(failure)
    );
  }

  return normalizeNsxPreview(preview, { importId, status: 'previewed' });
}

function createNotestationNsxProcessingPreview(filePath, memberId = 'self') {
  const db = getDb();
  const importId = createId('import_nsx_web');
  const fileName = path.basename(filePath);
  db.prepare(`
    INSERT INTO imports
      (id, source_type, file_name, file_path, status, total_count, success_count, failed_count, created_by_member_id)
    VALUES
      (?, 'notestation', ?, ?, 'processing', 0, 0, 0, ?)
  `).run(importId, fileName, filePath, memberId);

  queueNotestationNsxPreview(importId);

  return buildProcessingNsxPreview({ id: importId, file_name: fileName, status: 'processing' });
}

function queueNotestationNsxPreview(importId) {
  if (activeNsxPreviewJobs.has(importId)) return;
  activeNsxPreviewJobs.add(importId);
  setImmediate(() => {
    try {
      processNotestationNsxPreview(importId);
    } finally {
      activeNsxPreviewJobs.delete(importId);
    }
  });
}

function processNotestationNsxPreview(importId) {
  const db = getDb();
  const batch = db.prepare('SELECT * FROM imports WHERE id = ?').get(importId);
  if (!batch || !isNsxImportBatch(batch) || batch.status !== 'processing') return;

  try {
    const preview = dryRunNsxFile(batch.file_path, { includeContent: true, includeRawContent: true });
    writeNsxPreviewCache(importId, preview);

    const insertFailure = db.prepare(`
      INSERT INTO import_failures
        (id, import_id, original_title, original_path, error_message, raw_data)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN');
    db.prepare('DELETE FROM import_failures WHERE import_id = ?').run(importId);
    for (const failure of preview.failures || []) {
      insertFailure.run(
        createId('import_failure'),
        importId,
        failure.originalTitle || failure.originalId,
        failure.originalPath || failure.originalId || '',
        failure.errorMessage,
        JSON.stringify(failure)
      );
    }
    db.prepare(
      "UPDATE imports SET status = 'previewed', total_count = ?, success_count = ?, failed_count = ? WHERE id = ?"
    ).run(preview.totalCount, preview.successCount, preview.failedCount, importId);
    db.exec('COMMIT');
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {}
    try {
      markNsxPreviewFailed(importId, batch, error);
    } catch (markError) {
      console.error(`Failed to mark NSX preview ${importId} as failed:`, markError);
      db.prepare("UPDATE imports SET status = 'failed', failed_count = 1 WHERE id = ?").run(importId);
    }
  }
}

function markNsxPreviewFailed(importId, batch, error) {
  const db = getDb();
  const message = error?.message || 'NSX parse failed';
  db.prepare("UPDATE imports SET status = 'failed', failed_count = 1 WHERE id = ?").run(importId);
  db.prepare(`
    INSERT INTO import_failures
      (id, import_id, original_title, original_path, error_message, raw_data)
    VALUES
      (?, ?, ?, ?, ?, ?)
  `).run(
    createId('import_failure'),
    importId,
    batch?.file_name || 'notestation-import.nsx',
    batch?.file_path || '',
    message,
    JSON.stringify({ errorMessage: message })
  );
}
export function createNotestationSamplePreview(memberId = 'self') {
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

export function commitNotestationImport(importId, memberId = 'self') {
  const db = getDb();
  const batch = db.prepare('SELECT * FROM imports WHERE id = ?').get(importId);
  if (!batch) {
    throw new Error('导入批次不存在');
  }

  if (isNsxImportBatch(batch)) {
    return commitUploadedNsxImport(batch, memberId);
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
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal', 'notestation_import', ?, 'saved', 'family', ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
  const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');

  db.exec('BEGIN');
  try {
    for (const record of notestationSampleRecords) {
      const noteId = createId('note');
      const originalHtml = record.rawMetadata?.originalContentFormat === 'html' ? String(record.rawMetadata.originalContent || '') : '';
      const richText = prepareStoredRichText({
        content: record.content,
        contentHtml: originalHtml,
        sourceHtml: originalHtml
      });
      const plainContent = String(record.content || record.title || '').trim();
      insertNote.run(
        noteId,
        record.title,
        plainContent || richText.legacyContent || record.content,
        plainContent || richText.contentText || record.content,
        richText.contentHtml,
        richText.contentJson,
        richText.sourceHtml,
        richText.contentFormat,
        richText.contentVersion,
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
  if (!batch) {
    throw new Error('导入批次不存在');
  }

  if (isNsxImportBatch(batch)) {
    if (batch.status === 'processing') {
      queueNotestationNsxPreview(importId);
      return buildProcessingNsxPreview(batch);
    }
    if (batch.status === 'failed') return buildFailedNsxPreview(batch);
    const cachedPreview = readNsxPreviewCache(importId);
    if (cachedPreview) return normalizeNsxPreview(cachedPreview, { importId, status: batch.status });
    const preview = dryRunNsxFile(batch.file_path);
    return normalizeNsxPreview(preview, { importId, status: batch.status });
  }

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

function buildProcessingNsxPreview(batch) {
  return {
    importId: batch.id,
    dryRun: true,
    fileName: batch.file_name,
    fileType: 'nsx',
    status: 'processing',
    totalCount: Number(batch.total_count || 0),
    successCount: Number(batch.success_count || 0),
    failedCount: Number(batch.failed_count || 0),
    attachmentCount: 0,
    originalCategoryCount: 0,
    tagCount: 0,
    records: [],
    failures: getStoredImportFailures(batch.id),
    message: 'NSX file uploaded. Parsing is running in the background.'
  };
}

function buildFailedNsxPreview(batch) {
  return {
    ...buildProcessingNsxPreview(batch),
    status: 'failed',
    failedCount: Math.max(1, Number(batch.failed_count || 1)),
    message: 'NSX parsing failed. Existing notes were not changed.'
  };
}

function getStoredImportFailures(importId) {
  return getDb()
    .prepare(
      `SELECT id, original_title AS originalTitle, original_path AS originalPath, error_message AS errorMessage
       FROM import_failures
       WHERE import_id = ?
       ORDER BY created_at ASC`
    )
    .all(importId);
}

function nsxPreviewCachePath(importId) {
  return path.join(getDataPaths().importsDir, `${safeFileName(importId)}-preview.json`);
}

function writeNsxPreviewCache(importId, preview) {
  mkdirSync(getDataPaths().importsDir, { recursive: true });
  writeFileSync(nsxPreviewCachePath(importId), JSON.stringify(preview));
}

function readNsxPreviewCache(importId) {
  const cachePath = nsxPreviewCachePath(importId);
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  } catch {
    return null;
  }
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

function isNsxImportBatch(batch) {
  return Boolean(batch?.file_path && String(batch.file_path).toLowerCase().endsWith('.nsx') && existsSync(batch.file_path));
}

function normalizeNsxPreview(preview, overrides = {}) {
  return {
    ...preview,
    ...overrides,
    records: (preview.records || []).map((record) => ({
      ...record,
      content: record.content || record.summary || ''
    }))
  };
}

function commitUploadedNsxImport(batch, memberId = 'self') {
  if (batch.status === 'processing') {
    throw new Error('NSX 文件仍在后台解析，请稍后再确认导入。');
  }
  if (batch.status === 'failed') {
    throw new Error('NSX 解析失败，不能确认导入。');
  }

  const db = getDb();
  const existingImportedNotes = db
    .prepare("SELECT id FROM notes WHERE source_type = 'notestation_import' AND source_id = ? ORDER BY created_at DESC")
    .all(batch.id);
  if (existingImportedNotes.length > 0) {
    return {
      ...getImportPreview(batch.id),
      status: 'completed',
      importedNoteIds: existingImportedNotes.map((note) => note.id)
    };
  }

  const preview = dryRunNsxFile(batch.file_path, { includeContent: true, includeRawContent: true });
  const paths = getDataPaths();
  const backupPath = backupDatabase(paths);
  const attachmentStats = { copied: 0, failed: 0 };
  const attachmentFailures = [];

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
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uncategorized', ?, 'normal', 'notestation_import', ?, 'saved', 'family', ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
  const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
  const insertAttachment = db.prepare(`
    INSERT INTO attachments
      (id, note_id, file_name, original_name, mime_type, file_size, storage_path, source_type, kind, source_attachment_id, source_path, sort_order, is_inline)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, 'notestation_import', ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM import_failures WHERE import_id = ?').run(batch.id);

    for (const failure of preview.failures || []) {
      insertFailure.run(
        createId('import_failure'),
        batch.id,
        failure.originalTitle || failure.originalId,
        failure.originalPath || failure.originalId || '',
        failure.errorMessage,
        JSON.stringify(failure)
      );
    }

    const importedNoteIds = [];
    for (const record of preview.records || []) {
      const noteId = createId('note');
      importedNoteIds.push(noteId);
      const rawMetadata = {
        ...(record.rawMetadata || {}),
        originalNotebookPath: record.originalPath || record.rawMetadata?.originalNotebookPath || null,
        importSource: 'notestation_import'
      };
      const originalHtml = rawMetadata.originalContentFormat === 'html' ? String(rawMetadata.originalContent || '') : '';
      const preparedAttachments = [];

      for (const [index, attachment] of (record.attachments || []).entries()) {
        const attachmentResult = copyNsxAttachment(batch.file_path, paths, batch.id, noteId, attachment, index);
        const preparedAttachment = {
          id: createId('attachment'),
          sourceAttachmentId: attachment.id || attachment.fileName || null,
          sourcePath: attachment.id || attachment.fileName || null,
          index,
          isInline: false,
          result: attachmentResult
        };
        preparedAttachments.push(preparedAttachment);

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
            batch.id,
            record.title,
            record.originalPath,
            `附件导入失败：${attachmentResult.error}`,
            JSON.stringify(failure)
          );
        } else {
          attachmentStats.copied += 1;
        }
      }

      const contentHtml = inlineNsxImageRefs(originalHtml, preparedAttachments);
      const plainContent = String(record.content || record.summary || record.title || '').trim();
      const summaryText = String(record.summary || plainContent || record.title || '').trim();
      const richText = prepareStoredRichText({
        content: plainContent,
        contentHtml,
        sourceHtml: originalHtml
      });

      insertNote.run(
        noteId,
        record.title,
        plainContent || richText.legacyContent || record.content || record.summary || record.title,
        plainContent || richText.contentText || record.content || record.summary || record.title,
        richText.contentHtml,
        richText.contentJson,
        richText.sourceHtml,
        richText.contentFormat,
        richText.contentVersion,
        summaryText || richText.contentText || record.title,
        memberId,
        batch.id,
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

      for (const attachment of preparedAttachments) {
        insertAttachment.run(
          attachment.id,
          noteId,
          attachment.result.fileName,
          attachment.result.originalName,
          attachment.result.mimeType,
          attachment.result.fileSize,
          attachment.result.storagePath,
          attachment.result.mimeType?.startsWith('image/') ? 'image' : 'file',
          attachment.sourceAttachmentId,
          attachment.sourcePath,
          attachment.index,
          attachment.isInline ? 1 : 0
        );
      }
    }

    db.prepare(
      "UPDATE imports SET status = 'completed', total_count = ?, success_count = ?, failed_count = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(preview.totalCount, preview.successCount, (preview.failedCount || 0) + attachmentStats.failed, batch.id);
    db.exec('COMMIT');

    return {
      ...normalizeNsxPreview(preview, { importId: batch.id, status: 'completed' }),
      importedNoteIds,
      backupPath,
      attachmentCopiedCount: attachmentStats.copied,
      attachmentFailureCount: attachmentStats.failed,
      attachmentFailures
    };
  } catch (error) {
    db.exec('ROLLBACK');
    db.prepare("UPDATE imports SET status = 'failed' WHERE id = ?").run(batch.id);
    error.message = `${error.message}。本次导入已回滚，可用备份恢复：${backupPath}`;
    throw error;
  }
}

function inlineNsxImageRefs(html, attachments) {
  if (!html || !attachments.length) return html;
  const candidates = [];
  for (const attachment of attachments) {
    const originalName = attachment.result.originalName || '';
    const mimeType = attachment.result.mimeType || '';
    const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(originalName);
    if (attachment.result.error || !isImage) continue;
    candidates.push(attachment);
  }

  const usedIds = new Set();
  const withRefs = String(html).replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    const attachment = findNsxImageAttachment(attrs, candidates);
    if (!attachment) {
      const src = extractAttribute(attrs, 'src');
      if (looksLikeLocalNsxImage(src)) {
        return `<span data-missing-notestation-image="true">${escapeHtml(path.basename(src))}</span>`;
      }
      return match;
    }

    attachment.isInline = true;
    usedIds.add(attachment.id);
    const width = extractAttribute(attrs, 'width');
    const height = extractAttribute(attrs, 'height');
    const sizeAttrs = [
      /^\d{1,5}$/.test(width) ? ` width="${width}"` : '',
      /^\d{1,5}$/.test(height) ? ` height="${height}"` : ''
    ].join('');
    return `<img src="/api/attachments/${attachment.id}/file" alt="${escapeAttribute(attachment.result.originalName)}" data-attachment-id="${attachment.id}"${sizeAttrs}>`;
  });

  const appendedImages = candidates
    .filter((attachment) => !usedIds.has(attachment.id))
    .map((attachment) => {
      attachment.isInline = true;
      return `<figure data-attachment-id="${escapeAttribute(attachment.id)}"><img src="/api/attachments/${escapeAttribute(attachment.id)}/file" alt="${escapeAttribute(attachment.result.originalName)}" data-attachment-id="${escapeAttribute(attachment.id)}"><figcaption>${escapeHtml(attachment.result.originalName)}</figcaption></figure>`;
    });

  if (!appendedImages.length) return withRefs;
  return `${withRefs}<div data-notestation-inline-images="true">${appendedImages.join('')}</div>`;
}

function findNsxImageAttachment(attrs, attachments) {
  const ref = extractAttribute(attrs, 'ref');
  const src = extractAttribute(attrs, 'src');
  const alt = extractAttribute(attrs, 'alt');
  const title = extractAttribute(attrs, 'title');
  const decodedRef = decodeBase64Text(ref);
  const probes = [decodedRef, src, alt, title].filter(Boolean);

  return attachments.find((attachment) => {
    const names = [
      attachment.result.originalName,
      attachment.result.fileName,
      attachment.sourceAttachmentId,
      attachment.sourcePath
    ].filter(Boolean);
    return probes.some((probe) => names.some((name) => isNsxImageReferenceMatch(probe, name)));
  });
}

function isNsxImageReferenceMatch(probe, name) {
  const normalizedProbe = normalizeReference(probe);
  const normalizedName = normalizeReference(name);
  if (!normalizedProbe || !normalizedName) return false;
  return normalizedProbe === normalizedName || normalizedProbe.endsWith(`/${normalizedName}`) || normalizedProbe.endsWith(normalizedName);
}

function normalizeReference(value) {
  const text = String(value || '').replace(/\\/g, '/').trim();
  if (!text) return '';
  try {
    return decodeURIComponent(path.posix.basename(text)).toLowerCase();
  } catch {
    return path.posix.basename(text).toLowerCase();
  }
}

function looksLikeLocalNsxImage(src) {
  const normalized = normalizeReference(src);
  return /^ns_attach_/i.test(normalized) || /^file_/i.test(normalized) || /transparent\.gif$/i.test(normalized);
}
function extractAttribute(attrs, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'<>]+))`, 'i');
  const match = String(attrs || '').match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

function decodeBase64Text(value) {
  if (!value) return '';
  try {
    return Buffer.from(String(value), 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function escapeAttribute(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function backupDatabase(paths) {
  mkdirSync(paths.backupsDir, { recursive: true });
  mkdirSync(path.dirname(paths.dbPath), { recursive: true });
  if (!existsSync(paths.dbPath)) writeFileSync(paths.dbPath, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(paths.backupsDir, `app-before-notestation-import-${timestamp}.db`);
  copyFileSync(paths.dbPath, backupPath);
  return backupPath;
}

function copyNsxAttachment(inputPath, paths, importId, noteId, attachment, index) {
  const fileName = safeFileName(attachment.fileName || attachment.id || `attachment-${index + 1}`);
  const originalName = attachment.originalName || fileName;
  const targetRelativePath = path.join('attachments', 'notestation', importId, noteId, fileName);
  const targetPath = path.join(paths.dataDir, targetRelativePath);
  const sourceEntry = attachment.id || attachment.fileName;

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
