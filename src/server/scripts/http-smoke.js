function parseArgs(argv) {
  const options = {
    baseUrl: 'http://127.0.0.1:3300',
    readOnly: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1];
      index += 1;
    } else if (arg === '--read-only') {
      options.readOnly = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.baseUrl = options.baseUrl.replace(/\/+$/, '');
  return options;
}

async function requestJson(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${route} returned ${response.status}: ${text}`);
  }
  return data;
}

async function requestText(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`);
  const text = await response.text();
  return { response, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runCheck(checks, name, fn) {
  try {
    const result = await fn();
    checks.push({ name, ok: true, ...(result || {}) });
  } catch (error) {
    checks.push({ name, ok: false, error: error.message });
  }
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function createStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(String(entry.data), 'utf8');
    const localHeader = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name
    ]);
    localParts.push(localHeader, data);

    const centralHeader = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDirectory.length),
    u32(offset),
    u16(0)
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function createWebImportNsxFixture() {
  const notebookId = 'WEB_NOTEBOOK_1';
  const noteId = 'WEB_NOTE_1';
  const attachmentHash = 'abcdef1234567890';
  const extraAttachmentHash = 'fedcba0987654321';
  const attachmentName = 'ns_attach_image_1.png';
  const extraAttachmentName = 'ns_attach_unmatched_2.jpg';
  const imageRef = Buffer.from(`1700000000000${attachmentName}`).toString('base64');

  return createStoredZip([
    { name: 'config.json', data: JSON.stringify({ note: [noteId], notebook: [notebookId], todo: [] }) },
    { name: notebookId, data: JSON.stringify({ title: '网页导入测试', stack: '' }) },
    {
      name: noteId,
      data: JSON.stringify({
        title: '网页 NSX 富文本记录',
        brief: '网页端上传解析摘要',
        content: `<div><strong>网页端上传解析正文</strong><ul><li>能进入富文本</li></ul><p><img src="webman/3rdparty/NoteStation/images/transparent.gif" ref="${imageRef}" width="320"></p></div>`,
        ctime: '2026-07-03T08:00:00Z',
        mtime: '2026-07-03T08:30:00Z',
        parent_id: notebookId,
        tag: ['网页导入'],
        attachment: {
          first: { md5: attachmentHash, name: attachmentName, size: 7, type: 'image', ext: 'png' },
          second: { md5: extraAttachmentHash, name: extraAttachmentName, size: 8, type: 'image', ext: 'jpg' }
        }
      })
    },
    { name: 'file_' + attachmentHash, data: Buffer.from('pngdata') },
    { name: 'file_' + extraAttachmentHash, data: Buffer.from('jpgdata2') }
  ]);
}

export async function runHttpSmoke(options) {
  const checks = [];
  let appData;
  let noteList;
  let firstNote;
  let createdSmokeNoteId;

  await runCheck(checks, 'health', async () => {
    const health = await requestJson(options.baseUrl, '/api/health');
    assert(health.ok === true, 'health.ok should be true');
    assert(health.dbPath, 'health should include dbPath');
    return { dbPath: health.dbPath, build: health.build || null };
  });

  await runCheck(checks, 'app-data', async () => {
    appData = await requestJson(options.baseUrl, '/api/app-data');
    assert(Array.isArray(appData.members) && appData.members.length >= 2, 'app-data should include members');
    assert(Array.isArray(appData.categories) && appData.categories.length >= 1, 'app-data should include categories');
    assert(Array.isArray(appData.notes), 'app-data should include notes');
    return { members: appData.members.length, categories: appData.categories.length, notes: appData.notes.length };
  });

  await runCheck(checks, 'notes-list', async () => {
    noteList = await requestJson(options.baseUrl, '/api/notes?limit=3');
    assert(Array.isArray(noteList.notes), 'notes list should include notes array');
    firstNote = noteList.notes[0] || null;
    return { notes: noteList.notes.length, firstNoteId: firstNote?.id || null };
  });

  await runCheck(checks, 'note-detail', async () => {
    if (!firstNote?.id) {
      return { skipped: true, reason: 'no notes in clean database' };
    }
    const detail = await requestJson(options.baseUrl, `/api/notes?id=${encodeURIComponent(firstNote.id)}`);
    assert(detail.notes?.length === 1, 'detail query should return exactly one note');
    assert(detail.notes[0].id === firstNote.id, 'detail note id should match');
    return { noteId: firstNote.id };
  });

  await runCheck(checks, 'search', async () => {
    const keyword = String(firstNote?.title || '').slice(0, 2) || '__empty_smoke__';
    const result = await requestJson(options.baseUrl, `/api/notes?search=${encodeURIComponent(keyword)}`);
    assert(Array.isArray(result.notes), 'search should return notes array');
    return { keyword, notes: result.notes.length };
  });

  await runCheck(checks, 'category-filter', async () => {
    const categoryId = firstNote?.categoryId || appData?.categories?.[0]?.id;
    assert(categoryId, 'category id should exist');
    const result = await requestJson(options.baseUrl, `/api/notes?category=${encodeURIComponent(categoryId)}`);
    assert(Array.isArray(result.notes), 'category filter should return notes array');
    return { categoryId, notes: result.notes.length };
  });

  await runCheck(checks, 'member-filter', async () => {
    const memberId = firstNote?.memberId || appData?.members?.[0]?.id;
    assert(memberId, 'member id should exist');
    const result = await requestJson(options.baseUrl, `/api/notes?member=${encodeURIComponent(memberId)}`);
    assert(Array.isArray(result.notes), 'member filter should return notes array');
    return { memberId, notes: result.notes.length };
  });

  await runCheck(checks, 'categories-api', async () => {
    const result = await requestJson(options.baseUrl, '/api/categories');
    assert(Array.isArray(result.categories) && result.categories.length >= 1, 'categories api should include categories');
    return { categories: result.categories.length };
  });

  if (!options.readOnly) {
    await runCheck(checks, 'create-note', async () => {
      const title = `HTTP smoke 保存测试 ${Date.now()}`;
      const created = await requestJson(options.baseUrl, '/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title,
          content: 'HTTP smoke 保存测试正文',
          contentHtml: '<p><strong>HTTP smoke 保存测试正文</strong></p>',
          categoryId: 'family',
          memberId: 'self',
          tags: ['smoke']
        })
      });
      assert(created.note?.id, 'created note should include id');
      assert(created.note.title === title, 'created note title should match');
      createdSmokeNoteId = created.note.id;
      return { noteId: createdSmokeNoteId };
    });

    await runCheck(checks, 'created-note-detail', async () => {
      assert(createdSmokeNoteId, 'created smoke note id should exist');
      const detail = await requestJson(options.baseUrl, `/api/notes?id=${encodeURIComponent(createdSmokeNoteId)}`);
      assert(detail.notes?.length === 1, 'created note detail should return one note');
      assert(detail.notes[0].richContent?.html?.includes('<strong>') || detail.notes[0].contentHtml?.includes('<strong>'), 'created rich text should be persisted');
      return { noteId: createdSmokeNoteId };
    });

    await runCheck(checks, 'notestation-web-import', async () => {
      const nsx = createWebImportNsxFixture();
      const preview = await requestJson(options.baseUrl, '/api/imports/notestation/dry-run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent('web-import.nsx'),
          'X-Member-Id': 'self'
        },
        body: nsx
      });
      assert(preview.status === 'previewed', 'nsx preview should be previewed');
      assert(preview.successCount === 1, 'nsx preview should parse one note');
      assert(preview.attachmentCount === 2, 'nsx preview should include attachments');

      const committed = await requestJson(options.baseUrl, `/api/imports/notestation/${preview.importId}/commit`, {
        method: 'POST',
        body: JSON.stringify({ memberId: 'self' })
      });
      assert(committed.status === 'completed', 'nsx commit should complete');
      assert(committed.importedNoteIds?.length === 1, 'nsx commit should import one note');

      const detail = await requestJson(options.baseUrl, `/api/notes?id=${encodeURIComponent(committed.importedNoteIds[0])}`);
      const note = detail.notes?.[0];
      assert(note, 'imported note detail should exist');
      assert(note.attachments.every((attachment) => attachment.isInline), 'imported attachments should be inline');
      const richImageRefs = note.richContent?.html?.match(/\/api\/attachments\//g) || [];
      assert(richImageRefs.length === 2, 'imported rich text should include inline image attachment refs');
      return { importedNoteId: committed.importedNoteIds[0], inlineAttachmentRefs: richImageRefs.length };
    });

    await runCheck(checks, 'storage-probe', async () => {
      const result = await requestJson(options.baseUrl, '/api/storage/probe', { method: 'POST' });
      assert(result.ok === true, 'storage probe should be ok');
      return { checked: Object.keys(result.checks || {}).length };
    });

    await runCheck(checks, 'manual-backup', async () => {
      const result = await requestJson(options.baseUrl, '/api/storage/backup', {
        method: 'POST',
        body: JSON.stringify({ nasOnline: true })
      });
      assert(result.backup?.fileSize > 0, 'backup should have fileSize');
      return { fileSize: result.backup.fileSize };
    });

    await runCheck(checks, 'json-export', async () => {
      const result = await requestJson(options.baseUrl, '/api/storage/export-json', { method: 'POST' });
      assert(result.export?.fileSize > 0, 'export should have fileSize');
      return { fileSize: result.export.fileSize };
    });
  }

  await runCheck(checks, 'frontend-shell', async () => {
    const { response, text } = await requestText(options.baseUrl, '/');
    if (response.status === 404) {
      return { skipped: true, reason: 'dist/ frontend is not being served in this mode' };
    }
    assert(response.ok, `frontend shell returned ${response.status}`);
    assert(/<html|<!doctype|id="root"/i.test(text), 'frontend shell should look like HTML');
    return { status: response.status };
  });

  return {
    ok: checks.every((check) => check.ok),
    baseUrl: options.baseUrl,
    readOnly: options.readOnly,
    checks
  };
}

if (process.argv[1] && process.argv[1].endsWith('http-smoke.js')) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await runHttpSmoke(options);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
