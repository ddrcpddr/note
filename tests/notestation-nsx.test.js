import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
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
      const attachmentId = 'file_1234567890abcdef';

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
            attachment: [{ id: attachmentId, name: 'invoice.png' }],
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
