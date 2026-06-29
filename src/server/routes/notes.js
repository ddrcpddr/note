import { Router } from 'express';
import { createId, getDb, slugifyTag } from '../db/database.js';

export const notesRouter = Router();

notesRouter.get('/', (request, response) => {
  response.json({ notes: listNotes(request.query) });
});

notesRouter.post('/', (request, response) => {
  const db = getDb();
  const payload = request.body || {};
  const content = String(payload.content || '').trim();
  const generatedTitle = content.slice(0, 28) || '未命名记录';
  const title = String(payload.title || '').trim() || generatedTitle;
  const noteId = createId('note');
  const categoryId = String(payload.categoryId || 'uncategorized');
  const memberId = String(payload.memberId || getCurrentMemberId());
  const noteType = String(payload.noteType || 'normal');
  const sourceType = String(payload.sourceType || 'manual');
  const summary = String(payload.summary || content.slice(0, 56)).trim();
  const tags = Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

  const insertNote = db.prepare(`
    INSERT INTO notes
      (id, title, content, summary, category_id, member_id, note_type, source_type, save_status, visibility, occurred_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, 'saved', 'family', CURRENT_TIMESTAMP)
  `);
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
  const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
  const insertAttachment = db.prepare(`
    INSERT INTO attachments
      (id, note_id, file_name, original_name, mime_type, file_size, storage_path, source_type)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    insertNote.run(noteId, title, content || title, summary || title, categoryId, memberId, noteType, sourceType);

    for (const tagName of tags) {
      const tagId = slugifyTag(tagName);
      insertTag.run(tagId, tagName, tagId);
      insertNoteTag.run(noteId, tagId);
    }

    for (const [index, attachment] of attachments.entries()) {
      const originalName = String(attachment.originalName || attachment.fileName || `附件-${index + 1}`);
      const fileName = String(attachment.fileName || originalName);
      insertAttachment.run(
        createId('attachment'),
        noteId,
        fileName,
        originalName,
        attachment.mimeType || null,
        Number(attachment.fileSize || 0),
        String(attachment.storagePath || `attachments/${fileName}`),
        sourceType
      );
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    response.status(400).json({ error: error.message });
    return;
  }

  const note = listNotes({ id: noteId })[0];
  response.status(201).json({ note });
});

export function listNotes(query = {}) {
  const search = String(query.search || '').trim();
  const id = String(query.id || '').trim();
  const category = String(query.category || '').trim();
  const member = String(query.member || '').trim();
  const tag = String(query.tag || '').trim();
  const params = [];
  const where = ['n.is_deleted = 0'];

  if (id) {
    where.push('n.id = ?');
    params.push(id);
  }

  if (search) {
    where.push(`(
      n.title LIKE ?
      OR n.content LIKE ?
      OR c.name LIKE ?
      OR m.name LIKE ?
      OR EXISTS (
        SELECT 1 FROM note_tags nts
        JOIN tags ts ON ts.id = nts.tag_id
        WHERE nts.note_id = n.id AND ts.name LIKE ?
      )
    )`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    where.push('n.category_id = ?');
    params.push(category);
  }

  if (member) {
    where.push('n.member_id = ?');
    params.push(member);
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
        n.original_title AS originalTitle,
        n.original_path AS originalPath,
        n.original_category AS originalCategory,
        n.original_created_at AS originalCreatedAt,
        n.original_updated_at AS originalUpdatedAt,
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
            'storagePath', a.storage_path
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
    .map((row) => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      attachments: JSON.parse(row.attachments || '[]')
    }));
}

function getCurrentMemberId() {
  const member = getDb().prepare('SELECT id FROM members WHERE is_current = 1 ORDER BY sort_order LIMIT 1').get();
  return member?.id || 'self';
}

