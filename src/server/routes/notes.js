import { Router } from 'express';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createId, getDataPaths, getDb, slugifyTag } from '../db/database.js';
import { buildRichContentFromNote, prepareStoredRichText } from '../rich-text.js';

export const notesRouter = Router();

notesRouter.get('/', (request, response) => {
  response.json({ notes: listNotes({ ...request.query, includeRichText: 'true' }) });
});

notesRouter.post('/', (request, response) => {
  const db = getDb();
  const payload = request.body || {};
  const noteId = createId('note');
  const categoryId = String(payload.categoryId || 'uncategorized');
  const memberId = String(payload.memberId || getCurrentMemberId());
  const noteType = String(payload.noteType || 'normal');
  const sourceType = String(payload.sourceType || 'manual');
  const tags = Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
  const attachmentPayloads = Array.isArray(payload.attachments) ? payload.attachments : [];
  const preparedAttachments = attachmentPayloads.map((attachment, index) => {
    const attachmentId = createId('attachment');
    return { id: attachmentId, ...prepareAttachment(noteId, attachmentId, attachment, index) };
  });
  const richText = prepareRichTextPayload(payload, '', null, buildAttachmentMap(preparedAttachments));
  const content = richText.contentText;
  const generatedTitle = content.slice(0, 28) || '未命名记录';
  const title = String(payload.title || '').trim() || generatedTitle;
  const summary = String(payload.summary || content.slice(0, 56)).trim() || title;

  const insertNote = db.prepare(`
    INSERT INTO notes
      (id, title, content, content_text, content_html, content_json, source_html, content_format, content_version, summary, category_id, member_id, note_type, source_type, save_status, visibility, occurred_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'saved', 'family', CURRENT_TIMESTAMP)
  `);
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
  const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
  const insertAttachment = createAttachmentInsertStatement(db);

  db.exec('BEGIN');
  try {
    insertNote.run(
      noteId,
      title,
      content || title,
      content || title,
      richText.contentHtml,
      richText.contentJson,
      richText.sourceHtml,
      richText.contentFormat,
      richText.contentVersion,
      summary,
      categoryId,
      memberId,
      noteType,
      sourceType
    );

    for (const tagName of tags) {
      const tagId = slugifyTag(tagName);
      insertTag.run(tagId, tagName, tagId);
      insertNoteTag.run(noteId, tagId);
    }

    for (const attachment of preparedAttachments) {
      insertPreparedAttachment(insertAttachment, noteId, attachment, sourceType);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    response.status(400).json({ error: error.message });
    return;
  }

  const note = listNotes({ id: noteId, includeRichText: 'true' })[0];
  response.status(201).json({ note });
});

notesRouter.post('/bulk-categorize', (request, response) => {
  const db = getDb();
  const payload = request.body || {};
  const categoryId = String(payload.categoryId || '').trim();
  const noteIds = Array.isArray(payload.noteIds)
    ? [...new Set(noteIdsFromPayload(payload.noteIds))]
    : [];

  if (!categoryId || noteIds.length === 0) {
    response.status(400).json({ error: '请选择要整理的记录和目标分类' });
    return;
  }

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
  if (!category) {
    response.status(404).json({ error: '分类不存在' });
    return;
  }

  const placeholders = noteIds.map(() => '?').join(', ');
  const candidates = db
    .prepare(`SELECT id
       FROM notes
       WHERE id IN (${placeholders})
         AND source_type = 'notestation_import'
         AND category_id = 'uncategorized'
         AND is_deleted = 0`)
    .all(...noteIds);
  const updatedNoteIds = candidates.map((note) => note.id);

  if (updatedNoteIds.length > 0) {
    const updatePlaceholders = updatedNoteIds.map(() => '?').join(', ');
    db.prepare(`UPDATE notes
       SET category_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id IN (${updatePlaceholders})`).run(categoryId, ...updatedNoteIds);
  }

  response.json({
    updatedCount: updatedNoteIds.length,
    updatedNoteIds,
    notes: updatedNoteIds.length ? listNotes({ includeArchived: 'true', includeRichText: 'true' }).filter((note) => updatedNoteIds.includes(note.id)) : []
  });
});

notesRouter.post('/:id/archive', (request, response) => {
  const db = getDb();
  const noteId = String(request.params.id || '').trim();
  const existing = listNotes({ id: noteId, includeArchived: 'true' })[0];

  if (!existing) {
    response.status(404).json({ error: '记录不存在' });
    return;
  }

  db.prepare('UPDATE notes SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0').run(noteId);
  const note = listNotes({ id: noteId, includeArchived: 'true', includeRichText: 'true' })[0];
  response.json({ note });
});

notesRouter.delete('/:id', (request, response) => {
  const db = getDb();
  const noteId = String(request.params.id || '').trim();
  const existing = listNotes({ id: noteId, includeArchived: 'true' })[0];

  if (!existing) {
    response.status(404).json({ error: '记录不存在' });
    return;
  }

  db.prepare('UPDATE notes SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0').run(noteId);
  response.json({ deleted: true, id: noteId });
});

notesRouter.patch('/:id', (request, response) => {
  const db = getDb();
  const noteId = String(request.params.id || '').trim();
  const existing = listNotes({ id: noteId, includeRichText: 'true' })[0];

  if (!existing) {
    response.status(404).json({ error: '记录不存在' });
    return;
  }

  const payload = request.body || {};
  const attachmentPayloads = Array.isArray(payload.attachments) ? payload.attachments : [];
  const preparedAttachments = attachmentPayloads.map((attachment, index) => {
    const attachmentId = createId('attachment');
    return { id: attachmentId, ...prepareAttachment(noteId, attachmentId, attachment, index) };
  });
  const richText = prepareRichTextPayload(payload, existing.contentText || existing.content, existing.contentHtml, buildAttachmentMap(preparedAttachments));
  const nextContent = richText.contentText;
  const generatedTitle = nextContent.slice(0, 28) || existing.title || '未命名记录';
  const nextTitle = String(payload.title ?? existing.title ?? '').trim() || generatedTitle;
  const nextCategoryId = String(payload.categoryId ?? existing.categoryId ?? 'uncategorized');
  const nextMemberId = String(payload.memberId ?? existing.memberId ?? getCurrentMemberId());
  const nextNoteType = String(payload.noteType ?? existing.noteType ?? 'normal');
  const nextSummary = String(payload.summary ?? nextContent.slice(0, 56) ?? nextTitle).trim() || nextTitle;
  const nextTags = Array.isArray(payload.tags)
    ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : existing.tags.map((tag) => tag.label).filter(Boolean);

  const updateNote = db.prepare(`
    UPDATE notes
    SET title = ?,
        content = ?,
        content_text = ?,
        content_html = ?,
        content_json = ?,
        source_html = COALESCE(?, source_html),
        content_format = ?,
        content_version = ?,
        summary = ?,
        category_id = ?,
        member_id = ?,
        note_type = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND is_deleted = 0
  `);
  const deleteNoteTags = db.prepare('DELETE FROM note_tags WHERE note_id = ?');
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
  const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
  const insertAttachment = createAttachmentInsertStatement(db);

  db.exec('BEGIN');
  try {
    updateNote.run(
      nextTitle,
      nextContent || nextTitle,
      nextContent || nextTitle,
      richText.contentHtml,
      richText.contentJson,
      richText.sourceHtml,
      richText.contentFormat,
      richText.contentVersion,
      nextSummary,
      nextCategoryId,
      nextMemberId,
      nextNoteType,
      noteId
    );
    deleteNoteTags.run(noteId);

    for (const tagName of nextTags) {
      const tagId = slugifyTag(tagName);
      insertTag.run(tagId, tagName, tagId);
      insertNoteTag.run(noteId, tagId);
    }

    for (const attachment of preparedAttachments) {
      insertPreparedAttachment(insertAttachment, noteId, attachment, 'manual');
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    response.status(400).json({ error: error.message });
    return;
  }

  const note = listNotes({ id: noteId, includeRichText: 'true' })[0];
  response.json({ note });
});

export function listNotes(query = {}) {
  const search = String(query.search || '').trim();
  const id = String(query.id || '').trim();
  const category = String(query.category || '').trim();
  const member = String(query.member || '').trim();
  const tag = String(query.tag || '').trim();
  const source = String(query.source || '').trim();
  const includeArchived = ['1', 'true', 'yes'].includes(String(query.includeArchived || '').toLowerCase());
  const includeRichText = ['1', 'true', 'yes'].includes(String(query.includeRichText || '').toLowerCase());
  const params = [];
  const where = ['n.is_deleted = 0'];

  if (!includeArchived) where.push('n.is_archived = 0');
  if (id) {
    where.push('n.id = ?');
    params.push(id);
  }
  if (search) {
    where.push(`(
      n.title LIKE ?
      OR n.content_text LIKE ?
      OR n.content LIKE ?
      OR c.name LIKE ?
      OR m.name LIKE ?
      OR EXISTS (
        SELECT 1 FROM note_tags nts
        JOIN tags ts ON ts.id = nts.tag_id
        WHERE nts.note_id = n.id AND ts.name LIKE ?
      )
    )`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (category) {
    where.push('n.category_id = ?');
    params.push(category);
  }
  if (member) {
    where.push('n.member_id = ?');
    params.push(member);
  }
  if (source) {
    where.push('n.source_type = ?');
    params.push(source);
  }
  if (tag) {
    where.push(`EXISTS (
      SELECT 1 FROM note_tags ntf
      JOIN tags tf ON tf.id = ntf.tag_id
      WHERE ntf.note_id = n.id AND tf.name = ?
    )`);
    params.push(tag);
  }

  const limitClause = query.limit === 'all' ? '' : 'LIMIT 200';

  return getDb()
    .prepare(
      `SELECT
        n.id,
        n.title,
        n.content,
        COALESCE(NULLIF(n.content_text, ''), n.content) AS contentText,
        n.content_html AS contentHtml,
        ${includeRichText ? 'n.content_json AS contentJson' : 'NULL AS contentJson'},
        ${includeRichText ? 'n.source_html AS sourceHtml' : 'NULL AS sourceHtml'},
        n.content_format AS contentFormat,
        n.content_version AS contentVersion,
        n.summary,
        n.category_id AS categoryId,
        c.name AS categoryName,
        c.color AS categoryColor,
        c.icon AS categoryIcon,
        n.member_id AS memberId,
        m.name AS memberName,
        m.avatar AS memberAvatar,
        n.note_type AS noteType,
        n.occurred_at AS occurredAt,
        n.created_at AS createdAt,
        n.updated_at AS updatedAt,
        n.source_type AS sourceType,
        n.save_status AS saveStatus,
        n.visibility,
        n.is_archived AS isArchived,
        n.original_title AS originalTitle,
        n.original_path AS originalPath,
        n.original_category AS originalCategory,
        n.original_created_at AS originalCreatedAt,
        n.original_updated_at AS originalUpdatedAt,
        ${includeRichText ? 'n.raw_metadata AS rawMetadata' : 'NULL AS rawMetadata'},
        COALESCE((
          SELECT json_group_array(json_object('id', t.id, 'label', t.name))
          FROM note_tags nt
          JOIN tags t ON t.id = nt.tag_id
          WHERE nt.note_id = n.id
        ), '[]') AS tags,
        COALESCE((
          SELECT json_group_array(json_object(
            'id', a.id,
            'fileName', a.file_name,
            'originalName', a.original_name,
            'mimeType', a.mime_type,
            'fileSize', a.file_size,
            'storagePath', a.storage_path,
            'kind', a.kind,
            'isInline', a.is_inline,
            'contentRefId', a.content_ref_id,
            'sourceAttachmentId', a.source_attachment_id,
            'sourcePath', a.source_path,
            'downloadUrl', '/api/attachments/' || a.id || '/file'
          ))
          FROM attachments a
          WHERE a.note_id = n.id
        ), '[]') AS attachments
       FROM notes n
       LEFT JOIN categories c ON c.id = n.category_id
       LEFT JOIN members m ON m.id = n.member_id
       WHERE ${where.join(' AND ')}
       ORDER BY COALESCE(n.occurred_at, n.created_at) DESC, n.created_at DESC
       ${limitClause}`
    )
    .all(...params)
    .map((row) => {
      const tags = JSON.parse(row.tags || '[]');
      const attachments = JSON.parse(row.attachments || '[]').map((attachment) => ({
        ...attachment,
        isInline: Boolean(attachment.isInline)
      }));
      const note = {
        ...row,
        content: row.contentText || row.content || '',
        isArchived: Boolean(row.isArchived),
        tags,
        attachments
      };
      delete note.rawMetadata;

      if (includeRichText) {
        const richContent = buildRichContentFromNote(row);
        if (richContent) note.richContent = richContent;
      } else {
        delete note.contentJson;
        delete note.sourceHtml;
      }

      return note;
    });
}

function prepareRichTextPayload(payload, fallbackContent = '', fallbackContentHtml = null, attachmentMap = {}) {
  const hasAnyRichField = ['content', 'contentHtml', 'contentJson', 'sourceHtml'].some((key) => Object.prototype.hasOwnProperty.call(payload, key));
  if (!hasAnyRichField && fallbackContentHtml) {
    return prepareStoredRichText({ content: fallbackContent, contentHtml: fallbackContentHtml, attachmentMap });
  }

  return prepareStoredRichText({
    content: payload.content ?? fallbackContent,
    contentHtml: typeof payload.contentHtml === 'string' ? payload.contentHtml : '',
    contentJson: payload.contentJson || null,
    sourceHtml: typeof payload.sourceHtml === 'string' ? payload.sourceHtml : '',
    attachmentMap
  });
}

function createAttachmentInsertStatement(db) {
  return db.prepare(`
    INSERT INTO attachments
      (id, note_id, file_name, original_name, mime_type, file_size, storage_path, hash, source_type, kind, content_ref_id, source_attachment_id, source_path, width, height, sort_order, is_inline)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
}

function insertPreparedAttachment(statement, noteId, attachment, sourceType) {
  statement.run(
    attachment.id,
    noteId,
    attachment.fileName,
    attachment.originalName,
    attachment.mimeType,
    attachment.fileSize,
    attachment.storagePath,
    attachment.hash,
    attachment.sourceType || sourceType,
    attachment.kind,
    attachment.contentRefId,
    attachment.sourceAttachmentId,
    attachment.sourcePath,
    attachment.width,
    attachment.height,
    attachment.sortOrder,
    attachment.isInline ? 1 : 0
  );
}

function buildAttachmentMap(attachments) {
  return attachments.reduce((map, attachment) => {
    if (attachment.draftRef) map[attachment.draftRef] = attachment;
    return map;
  }, {});
}

function prepareAttachment(noteId, attachmentId, attachment, index) {
  const originalName = sanitizeAttachmentName(attachment.originalName || attachment.fileName, `附件-${index + 1}`);
  const mimeType = attachment.mimeType || null;
  const contentBase64 = typeof attachment.contentBase64 === 'string' ? attachment.contentBase64 : '';
  const kind = String(attachment.kind || (mimeType?.startsWith('image/') ? 'image' : 'file'));
  const isInline = Boolean(attachment.isInline || attachment.draftRef || kind === 'image-inline');
  const normalizedKind = kind === 'image-inline' ? 'image' : kind;

  if (!contentBase64) {
    return {
      draftRef: attachment.draftRef || null,
      fileName: sanitizeAttachmentName(attachment.fileName || originalName, originalName),
      originalName,
      mimeType,
      fileSize: Number(attachment.fileSize || 0),
      storagePath: String(attachment.storagePath || `attachments/${originalName}`),
      hash: attachment.hash || null,
      kind: normalizedKind,
      contentRefId: attachment.contentRefId || attachment.draftRef || null,
      sourceAttachmentId: attachment.sourceAttachmentId || null,
      sourcePath: attachment.sourcePath || null,
      width: Number.isFinite(Number(attachment.width)) ? Number(attachment.width) : null,
      height: Number.isFinite(Number(attachment.height)) ? Number(attachment.height) : null,
      sortOrder: Number(attachment.sortOrder ?? index),
      isInline
    };
  }

  const buffer = Buffer.from(contentBase64.replace(/^data:.*;base64,/, ''), 'base64');
  const fileName = `${attachmentId}-${originalName}`;
  const storagePath = `attachments/${noteId}/${fileName}`;
  const targetDir = path.join(getDataPaths().attachmentsDir, noteId);
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(path.join(targetDir, fileName), buffer);

  return {
    draftRef: attachment.draftRef || null,
    fileName,
    originalName,
    mimeType,
    fileSize: buffer.length,
    storagePath,
    hash: attachment.hash || null,
    kind: normalizedKind,
    contentRefId: attachment.contentRefId || attachment.draftRef || null,
    sourceAttachmentId: attachment.sourceAttachmentId || null,
    sourcePath: attachment.sourcePath || null,
    width: Number.isFinite(Number(attachment.width)) ? Number(attachment.width) : null,
    height: Number.isFinite(Number(attachment.height)) ? Number(attachment.height) : null,
    sortOrder: Number(attachment.sortOrder ?? index),
    isInline
  };
}

function noteIdsFromPayload(noteIds) {
  return noteIds.map((id) => String(id).trim()).filter(Boolean);
}

function sanitizeAttachmentName(value, fallback) {
  const name = String(value || fallback).split(/[\\/]/).pop().replace(/[<>:"|?*\u0000-\u001f]/g, '_').trim();
  return name || fallback;
}

function getCurrentMemberId() {
  const member = getDb().prepare('SELECT id FROM members WHERE is_current = 1 ORDER BY sort_order LIMIT 1').get();
  return member?.id || 'self';
}