import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { describe, test } from 'node:test';
import { analyzeNsxFile, dryRunNsxFile } from '../src/server/importers/notestation/nsx.js';

function dosDateTime(date = new Date('2026-01-01T00:00:00Z')) {
  const year = Math.max(1980, date.getUTCFullYear());
  const dosTime = (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate();
  return { dosTime, dosDate };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const checksum = crc32(data);
    const localHeader = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(checksum), u32(data.length), u32(data.length), u16(name.length), u16(0), name
    ]);
    localParts.push(localHeader, data);

    centralParts.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(checksum), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name
    ]));
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(centralDirectory.length), u32(offset), u16(0)
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

describe('Note Station NSX dry-run parser', () => {
  test('analyzes and previews a real-shaped NSX archive without writing a database', () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'note-nsx-test-'));
    try {
      const nsxPath = path.join(tempDir, 'sample.nsx');
      const notebookId = '1026_NOTEBOOK000000000000000000';
      const firstNoteId = '1026_NOTE000000000000000000001';
      const secondNoteId = '1026_NOTE000000000000000000002';
      const attachmentHash = '1234567890abcdef';
  const attachmentId = 'file_' + attachmentHash;

      const zip = createStoredZip([
        {
          name: 'config.json',
          data: JSON.stringify({ note: [firstNoteId, secondNoteId], notebook: [notebookId], shortcut: null, todo: [] })
        },
        {
          name: notebookId,
          data: JSON.stringify({ category: 'notebook', title: '家庭资料', ctime: '2026-01-01T08:00:00Z', mtime: '2026-01-01T08:30:00Z', stack: '' })
        },
        {
          name: firstNoteId,
          data: JSON.stringify({
            title: '宽带续费',
            brief: '宽带费用提醒',
            content: '<div>宽带费用提醒，包含附件。</div>',
            ctime: '2026-01-02T09:00:00Z',
            mtime: '2026-01-02T09:30:00Z',
            parent_id: notebookId,
            tag: ['账单'],
            attachment: {
          _attachmentKey: {
            ext: 'png',
            md5: attachmentHash,
            name: 'invoice.png',
            size: 14,
            type: 'image'
          }
        },
            thumb: null
          })
        },
        {
          name: secondNoteId,
          data: JSON.stringify({
            title: '空正文',
            brief: '',
            content: '',
            ctime: '2026-01-03T09:00:00Z',
            mtime: '2026-01-03T09:30:00Z',
            parent_id: notebookId
          })
        },
        { name: attachmentId, data: Buffer.from([0x89, 0x50, 0x4e, 0x47]) }
      ]);
      writeFileSync(nsxPath, zip);

      const analysis = analyzeNsxFile(nsxPath);
      assert.equal(analysis.isZip, true);
      assert.equal(analysis.canRead, true);
      assert.equal(analysis.config.noteCount, 2);
      assert.equal(analysis.config.notebookCount, 1);
      assert.equal(analysis.attachmentEntryCount, 1);

      const preview = dryRunNsxFile(nsxPath);
      assert.equal(preview.dryRun, true);
      assert.equal(preview.totalCount, 2);
      assert.equal(preview.successCount, 1);
      assert.equal(preview.failedCount, 1);
      assert.equal(preview.attachmentCount, 1);
      assert.equal(preview.originalCategoryCount, 1);
      assert.equal(preview.tagCount, 1);
      assert.equal(preview.records[0].title, '宽带续费');
      assert.equal(preview.records[0].originalCategory, '家庭资料');
      assert.equal(preview.records[0].attachmentCount, 1);
      assert.match(preview.records[0].summary, /宽带费用提醒/);
      assert.equal(preview.failures[0].originalTitle, '空正文');
      assert.match(preview.failures[0].errorMessage, /正文/);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
describe('Note Station formal import preparation', () => {
  test('requires explicit confirmation before writing the database', () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'note-formal-preflight-'));
    try {
      const nsxPath = path.join(tempDir, 'sample.nsx');
      const dbPath = path.join(tempDir, 'database', 'sandbox-formal.db');
      writeFileSync(nsxPath, createImportableNsx());

      const result = runFormalImport(nsxPath, tempDir, dbPath);

      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      assert.equal(report.confirmed, false);
      assert.equal(report.willWriteFormalDatabase, false);
      assert.equal(report.requiresConfirmation, true);
      assert.equal(report.totalCount, 1);
      assert.equal(report.successCount, 1);
      assert.equal(report.attachmentCount, 1);
      assert.equal(existsSync(dbPath), false);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('backs up the target database and copies attachments only after confirmation', () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'note-formal-confirm-'));
    try {
      const nsxPath = path.join(tempDir, 'sample.nsx');
      const dbPath = path.join(tempDir, 'database', 'sandbox-formal.db');
      writeFileSync(nsxPath, createImportableNsx());

      const result = runFormalImport(nsxPath, tempDir, dbPath, '--confirm');

      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      assert.equal(report.confirmed, true);
      assert.match(report.backupPath, /app-before-notestation-import-/);
      assert.equal(existsSync(report.backupPath), true);
      assert.equal(report.importedCount, 1);
      assert.equal(report.failedCount, 0);
      assert.equal(report.attachmentCopiedCount, 1);
      assert.equal(report.attachmentFailureCount, 0);

      const db = new DatabaseSync(dbPath, { readOnly: true });
      try {
        const importedNote = db.prepare("SELECT title, content, category_id, source_type, original_path, raw_metadata FROM notes WHERE source_id = ?").get(report.importId);
        assert.equal(importedNote.title, '宽带续费');
        assert.equal(importedNote.content, '宽带费用提醒，包含附件。');
        assert.equal(importedNote.category_id, 'uncategorized');
        assert.equal(importedNote.source_type, 'notestation_import');
        assert.equal(importedNote.original_path, '/家庭资料/宽带续费');

        const metadata = JSON.parse(importedNote.raw_metadata);
        assert.equal(metadata.originalContentFormat, 'html');
        assert.match(metadata.originalContent, /<div>/);
        assert.equal(metadata.originalNotebookPath, '/家庭资料/宽带续费');

        const attachment = db.prepare("SELECT original_name, storage_path, source_type FROM attachments WHERE note_id = (SELECT id FROM notes WHERE source_id = ?)").get(report.importId);
        assert.equal(attachment.original_name, 'invoice.png');
        assert.match(attachment.storage_path, /^attachments[\\/]notestation[\\/]/);
        assert.equal(existsSync(path.join(tempDir, attachment.storage_path)), true);

        const failures = db.prepare('SELECT COUNT(*) AS count FROM import_failures WHERE import_id = ?').get(report.importId);
        assert.equal(failures.count, 0);
      } finally {
        db.close();
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

function createImportableNsx() {
  const notebookId = '1026_NOTEBOOK000000000000000000';
  const noteId = '1026_NOTE000000000000000000001';
  const attachmentHash = '1234567890abcdef';
  const attachmentId = 'file_' + attachmentHash;

  return createStoredZip([
    {
      name: 'config.json',
      data: JSON.stringify({ note: [noteId], notebook: [notebookId], shortcut: null, todo: [] })
    },
    {
      name: notebookId,
      data: JSON.stringify({ category: 'notebook', title: '家庭资料', ctime: '2026-01-01T08:00:00Z', mtime: '2026-01-01T08:30:00Z', stack: '' })
    },
    {
      name: noteId,
      data: JSON.stringify({
        title: '宽带续费',
        brief: '宽带费用提醒',
        content: '<div>宽带费用提醒，包含附件。</div>',
        ctime: '2026-01-02T09:00:00Z',
        mtime: '2026-01-02T09:30:00Z',
        parent_id: notebookId,
        attachment: {
          _attachmentKey: {
            ext: 'png',
            md5: attachmentHash,
            name: 'invoice.png',
            size: 14,
            type: 'image'
          }
        }
      })
    },
    { name: attachmentId, data: Buffer.from('invoice-binary') }
  ]);
}

function runFormalImport(nsxPath, dataDir, dbPath, ...args) {
  return spawnSync(
    process.execPath,
    ['src/server/scripts/notestation-formal-import.js', nsxPath, ...args],
    {
      cwd: path.resolve('.'),
      env: {
        ...process.env,
        NOTE_DATA_DIR: dataDir,
        NOTE_DB_PATH: dbPath,
        NO_COLOR: '1'
      },
      encoding: 'utf8'
    }
  );
}
