import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';

const tempDataDir = mkdtempSync(path.join(os.tmpdir(), 'note-rich-text-'));
process.env.NOTE_DATA_DIR = tempDataDir;

const { getDb } = await import('../src/server/db/database.js');
const { listNotes } = await import('../src/server/routes/notes.js');
const { buildRichContentFromMetadata, sanitizeRichTextHtml } = await import('../src/server/rich-text.js');
const db = getDb();

after(() => {
  db.close();
  rmSync(tempDataDir, { recursive: true, force: true });
});

describe('Safe rich text read-only rendering', () => {
  test('sanitizes Note Station original HTML before rendering', () => {
    const html = `
      <div onclick="alert('bad')"><strong>宽带续费</strong><script>alert('xss')</script></div>
      <iframe src="https://example.com"></iframe>
      <a href="javascript:alert(1)" onmouseover="bad()">危险链接</a>
      <a href="https://example.com/path?x=1&y=2" onclick="bad()">安全链接</a>
      <img src="https://example.com/private.png" onerror="bad()">
    `;

    const richContent = buildRichContentFromMetadata(JSON.stringify({
      originalContentFormat: 'html',
      originalContent: html
    }));

    assert.equal(richContent.format, 'html');
    assert.match(richContent.html, /<strong>宽带续费<\/strong>/);
    assert.match(richContent.html, /href="https:\/\/example\.com\/path\?x=1&amp;y=2"/);
    assert.match(richContent.html, /图片附件已保留在附件列表/);
    assert.doesNotMatch(richContent.html, /script|iframe|onclick|onerror|onmouseover|javascript:|<img/i);
  });

  test('keeps plain text as fallback and search source', () => {
    const noteId = 'note_rich_readonly';
    const originalHtml = '<p><strong>HTML-only-secret</strong></p><script>alert(1)</script>';
    db.prepare(`
      INSERT INTO notes
        (id, title, content, summary, category_id, member_id, source_type, original_path, original_category, raw_metadata)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      noteId,
      '富文本导入测试',
      '纯文本关键词 搜索正文',
      '纯文本摘要',
      'uncategorized',
      'self',
      'notestation_import',
      '/Synology/测试笔记',
      '原始记事本',
      JSON.stringify({ originalContentFormat: 'html', originalContent: originalHtml })
    );

    const [noteWithRichText] = listNotes({ id: noteId, includeRichText: 'true' });
    assert.equal(noteWithRichText.content, '纯文本关键词 搜索正文');
    assert.equal(noteWithRichText.richContent.format, 'html');
    assert.match(noteWithRichText.richContent.html, /HTML-only-secret/);
    assert.doesNotMatch(noteWithRichText.richContent.html, /script|alert/i);

    const defaultShape = listNotes({ id: noteId })[0];
    assert.equal(defaultShape.richContent, undefined);

    const textSearch = listNotes({ search: '纯文本关键词', includeRichText: 'true' });
    assert.ok(textSearch.some((note) => note.id === noteId));

    const htmlOnlySearch = listNotes({ search: 'HTML-only-secret', includeRichText: 'true' });
    assert.ok(!htmlOnlySearch.some((note) => note.id === noteId));
  });

  test('does not produce rich content for plain text metadata', () => {
    const richContent = buildRichContentFromMetadata(JSON.stringify({
      originalContentFormat: 'text',
      originalContent: '只有纯文本'
    }));

    assert.equal(richContent, null);
    assert.equal(sanitizeRichTextHtml('普通纯文本'), '普通纯文本');
  });
});
