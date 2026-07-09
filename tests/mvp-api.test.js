import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';

const repoRoot = process.cwd();
const tempDataDir = mkdtempSync(path.join(tmpdir(), 'note-mvp-test-'));
const port = 4310 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;

let serverProcess;
let serverStdout = '';
let serverStderr = '';

async function requestJson(route, options = {}) {
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

async function requestRaw(route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return { response, data };
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
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(0), u32(data.length), u32(data.length), u16(name.length), u16(0), name
    ]);
    localParts.push(localHeader, data);

    const centralHeader = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(0), u32(data.length), u32(data.length),
      u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(centralDirectory.length), u32(offset), u16(0)
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
        content: `<div><strong>网页端上传解析正文</strong><ul><li>能进入富文本</li></ul><p><img src="webman/3rdparty/NoteStation/images/transparent.gif" ref="${imageRef}" width="320"></p><p><img src="ns_attach_unmatched_2.jpg" alt="ns_attach_unmatched_2.jpg"></p></div>`,
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

async function waitForHealth() {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 10_000) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Server exited before becoming healthy. stdout: ${serverStdout} stderr: ${serverStderr}`);
    }

    try {
      const health = await requestJson('/api/health');
      if (health.ok) return health;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  throw new Error(
    `Server did not become healthy. Last error: ${lastError?.message || 'unknown'}. stdout: ${serverStdout} stderr: ${serverStderr}`
  );
}

before(async () => {
  serverProcess = spawn(process.execPath, ['src/server/index.js'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NOTE_DATA_DIR: tempDataDir
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (chunk) => {
    serverStdout += chunk.toString();
  });
  serverProcess.stderr.on('data', (chunk) => {
    serverStderr += chunk.toString();
  });

  await waitForHealth();
});

after(async () => {
  if (serverProcess && !serverProcess.killed) {
    const closed = new Promise((resolve) => {
      serverProcess.once('close', resolve);
    });
    serverProcess.kill();
    await closed;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(tempDataDir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
});

describe('MVP API', () => {
  test('reports storage paths under NOTE_DATA_DIR', async () => {
    const health = await requestJson('/api/health');
    const paths = health.dataPaths;

    assert.equal(path.resolve(paths.dataDir), path.resolve(tempDataDir));
    assert.equal(path.resolve(paths.databaseDir), path.join(path.resolve(tempDataDir), 'database'));
    assert.equal(path.resolve(paths.attachmentsDir), path.join(path.resolve(tempDataDir), 'attachments'));
    assert.equal(path.resolve(paths.backupsDir), path.join(path.resolve(tempDataDir), 'backups'));
    assert.equal(path.resolve(paths.importsDir), path.join(path.resolve(tempDataDir), 'imports', 'notestation'));
    assert.equal(path.resolve(paths.exportsDir), path.join(path.resolve(tempDataDir), 'exports'));
  });

  test('allows Android APK origins to call Docker API', async () => {
    const origin = 'capacitor://localhost';
    const healthResponse = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: origin }
    });
    assert.equal(healthResponse.headers.get('access-control-allow-origin'), origin);
    assert.equal(healthResponse.headers.get('access-control-allow-credentials'), 'true');
    assert.match(healthResponse.headers.get('vary') || '', /Origin/);

    const preflight = await fetch(`${baseUrl}/api/notes`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-file-name,x-member-id'
      }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    assert.match(preflight.headers.get('access-control-allow-methods') || '', /POST/);
    assert.match(preflight.headers.get('access-control-allow-headers') || '', /X-File-Name/);
    const nsxPreflight = await fetch(`${baseUrl}/api/imports/notestation/dry-run`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-file-name,x-member-id,x-async-import'
      }
    });
    assert.equal(nsxPreflight.status, 204);
    assert.equal(nsxPreflight.headers.get('access-control-allow-origin'), origin);
    assert.match(nsxPreflight.headers.get('access-control-allow-methods') || '', /POST/);
    assert.match(nsxPreflight.headers.get('access-control-allow-headers') || '', /X-Async-Import/);
  });
  test('reads clean app data and note list', async () => {
    const appData = await requestJson('/api/app-data');

    assert.equal(appData.members.length, 2);
    assert.deepEqual(appData.members.map((member) => member.name), ['我', '爱人']);
    assert.ok(appData.categories.length >= 11);
    assert.ok(appData.tags.length >= 10);
    assert.ok(Array.isArray(appData.notes));

    const noteList = await requestJson('/api/notes');
    assert.ok(Array.isArray(noteList.notes));
  });

  test('creates a note and reads its detail', async () => {
    const title = `自动化测试记录 ${Date.now()}`;
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content: '这是一条自动化测试记录，用来验证新建、详情、搜索和筛选。',
        categoryId: 'repair',
        memberId: 'self',
        tags: ['维修', 'NAS'],
        attachments: [{ fileName: 'test.txt', originalName: 'test.txt' }]
      })
    });

    assert.equal(created.note.title, title);
    assert.match(created.note.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.match(created.note.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.match(created.note.occurredAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(created.note.categoryId, 'repair');
    assert.equal(created.note.memberId, 'self');
    assert.equal(created.note.attachments.length, 1);

    const detail = await requestJson(`/api/notes?id=${encodeURIComponent(created.note.id)}`);
    assert.equal(detail.notes.length, 1);
    assert.equal(detail.notes[0].title, title);
  });

  test('stores uploaded attachment file under NOTE_DATA_DIR', async () => {
    const content = '这是一份测试附件内容，只写入临时测试目录。';
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '附件上传测试记录',
        content: '这条记录用于验证真实附件写入。',
        categoryId: 'account',
        memberId: 'self',
        attachments: [
          {
            fileName: 'receipt.txt',
            originalName: '水费凭证.txt',
            mimeType: 'text/plain',
            contentBase64: Buffer.from(content, 'utf8').toString('base64')
          }
        ]
      })
    });

    assert.equal(created.note.attachments.length, 1);
    const attachment = created.note.attachments[0];
    assert.equal(attachment.originalName, '水费凭证.txt');
    assert.ok(attachment.storagePath.startsWith('attachments/'));
    assert.equal(readFileSync(path.join(tempDataDir, attachment.storagePath), 'utf8'), content);
  });

  test('accepts a mobile photo-sized attachment payload', async () => {
    const content = 'x'.repeat(2_200_000);
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '较大附件上传测试记录',
        content: '这条记录用于验证手机照片大小的附件上传。',
        categoryId: 'account',
        memberId: 'self',
        attachments: [
          {
            fileName: 'mobile-photo.txt',
            originalName: '手机照片.txt',
            mimeType: 'text/plain',
            contentBase64: Buffer.from(content, 'utf8').toString('base64')
          }
        ]
      })
    });

    assert.equal(created.note.attachments.length, 1);
    assert.equal(created.note.attachments[0].fileSize, Buffer.byteLength(content));
  });

  test('updates an existing note and refreshes its tags', async () => {
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '待编辑记录',
        content: '原始正文',
        categoryId: 'family',
        memberId: 'self',
        tags: ['待办']
      })
    });

    const updated = await requestJson(`/api/notes/${created.note.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: '已经编辑的记录',
        content: '更新后的正文，用来验证编辑功能。',
        categoryId: 'repair',
        memberId: 'partner',
        tags: ['维修', '重要']
      })
    });

    assert.equal(updated.note.id, created.note.id);
    assert.equal(updated.note.title, '已经编辑的记录');
    assert.equal(updated.note.content, '更新后的正文，用来验证编辑功能。');
    assert.equal(updated.note.categoryId, 'repair');
    assert.equal(updated.note.memberId, 'partner');
    assert.deepEqual(updated.note.tags.map((tag) => tag.label).sort(), ['维修', '重要']);

    const detail = await requestJson(`/api/notes?id=${encodeURIComponent(created.note.id)}`);
    assert.equal(detail.notes.length, 1);
    assert.equal(detail.notes[0].title, '已经编辑的记录');
    assert.equal(detail.notes[0].categoryId, 'repair');

    const oldTag = await requestJson(`/api/notes?tag=${encodeURIComponent('待办')}`);
    assert.ok(!oldTag.notes.some((note) => note.id === created.note.id));

    const newTag = await requestJson(`/api/notes?tag=${encodeURIComponent('维修')}`);
    assert.ok(newTag.notes.some((note) => note.id === created.note.id));

    const cleared = await requestJson(`/api/notes/${created.note.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ tags: [] })
    });
    assert.deepEqual(cleared.note.tags, []);

    const detailAfterClear = await requestJson(`/api/notes?id=${encodeURIComponent(created.note.id)}`);
    assert.deepEqual(detailAfterClear.notes[0].tags, []);

    const clearedTag = await requestJson(`/api/notes?tag=${encodeURIComponent('维修')}`);
    assert.ok(!clearedTag.notes.some((note) => note.id === created.note.id));
  });
  test('rejects stale offline updates when the server note changed first', async () => {
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '冲突保护记录',
        content: '离线编辑前的内容',
        categoryId: 'family',
        memberId: 'self'
      })
    });

    const baseUpdatedAt = created.note.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));

    const firstUpdate = await requestJson('/api/notes/' + created.note.id, {
      method: 'PATCH',
      body: JSON.stringify({
        title: '服务端先更新',
        content: '服务端已经有新内容',
        baseUpdatedAt
      })
    });
    assert.notEqual(firstUpdate.note.updatedAt, baseUpdatedAt);

    const staleUpdate = await requestRaw('/api/notes/' + created.note.id, {
      method: 'PATCH',
      body: JSON.stringify({
        title: '离线旧版本覆盖',
        content: '这次不应该覆盖服务端',
        baseUpdatedAt
      })
    });

    assert.equal(staleUpdate.response.status, 409);
    assert.equal(staleUpdate.data.code, 'note_conflict');
    assert.match(staleUpdate.data.error, /已经在其他设备更新/);

    const detail = await requestJson('/api/notes?id=' + encodeURIComponent(created.note.id));
    assert.equal(detail.notes[0].title, '服务端先更新');
  });
  test('creates, edits and exports rich text notes safely', async () => {
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '富文本创建测试',
        content: '富文本创建测试纯文本',
        contentHtml: '<h2 onclick="bad()">家庭事项</h2><p>今天需要 <strong>重点记录</strong>。</p><script>alert(1)</script>',
        categoryId: 'family',
        memberId: 'self',
        tags: ['富文本']
      })
    });

    assert.equal(created.note.content, '家庭事项\n今天需要 重点记录。');
    assert.match(created.note.contentHtml, /<h2>家庭事项<\/h2>/);
    assert.match(created.note.contentHtml, /<strong>重点记录<\/strong>/);
    assert.doesNotMatch(created.note.contentHtml, /script|onclick/i);
    assert.equal(created.note.richContent.source, 'content_html');

    const updated = await requestJson(`/api/notes/${created.note.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        content: '备用纯文本',
        contentHtml: '<blockquote>编辑后的 <em>富文本</em></blockquote><a href="javascript:alert(1)">危险</a>',
        tags: []
      })
    });

    assert.equal(updated.note.content, '编辑后的 富文本\n危险');
    assert.match(updated.note.contentHtml, /<blockquote>编辑后的 <em>富文本<\/em><\/blockquote>/);
    assert.doesNotMatch(updated.note.contentHtml, /javascript:/i);
    assert.deepEqual(updated.note.tags, []);

    const metadataOnly = await requestJson(`/api/notes/${created.note.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ tags: ['重要'] })
    });
    assert.match(metadataOnly.note.contentHtml, /<blockquote>编辑后的 <em>富文本<\/em><\/blockquote>/);
    assert.equal(metadataOnly.note.content, '编辑后的 富文本\n危险');

    const search = await requestJson(`/api/notes?search=${encodeURIComponent('编辑后的')}`);
    assert.ok(search.notes.some((note) => note.id === created.note.id));

    const exportedJson = await requestJson('/api/storage/export-json', { method: 'POST' });
    const jsonPayload = JSON.parse(readFileSync(exportedJson.export.filePath, 'utf8'));
    const exportedNote = jsonPayload.notes.find((note) => note.id === created.note.id);
    assert.ok(exportedNote);
    assert.match(exportedNote.contentHtml, /<blockquote>/);
    assert.doesNotMatch(exportedNote.contentHtml, /javascript:/i);

    const exportedMarkdown = await requestJson('/api/storage/export-markdown', { method: 'POST' });
    const markdown = readFileSync(exportedMarkdown.export.filePath, 'utf8');
    assert.match(markdown, /> 编辑后的 \*富文本\*/);
  });
  test('archives and soft deletes a note from normal lists', async () => {
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '准备归档删除的记录',
        content: '这条记录用于验证归档和软删除。',
        categoryId: 'family',
        memberId: 'self',
        tags: ['待办']
      })
    });

    const appDataWithCreated = await requestJson('/api/app-data');
    const familyCountWithCreated = appDataWithCreated.categories.find((category) => category.id === 'family').noteCount;

    const archived = await requestJson('/api/notes/' + created.note.id + '/archive', { method: 'POST' });
    assert.equal(archived.note.id, created.note.id);
    assert.equal(archived.note.isArchived, true);

    const defaultList = await requestJson('/api/notes?search=' + encodeURIComponent('准备归档删除'));
    assert.ok(!defaultList.notes.some((note) => note.id === created.note.id));

    const archivedList = await requestJson('/api/notes?includeArchived=true&search=' + encodeURIComponent('准备归档删除'));
    assert.ok(archivedList.notes.some((note) => note.id === created.note.id));

    const appDataAfterArchive = await requestJson('/api/app-data');
    const familyCountAfterArchive = appDataAfterArchive.categories.find((category) => category.id === 'family').noteCount;
    assert.equal(familyCountAfterArchive, familyCountWithCreated - 1);

    const deleted = await requestJson('/api/notes/' + created.note.id, { method: 'DELETE' });
    assert.equal(deleted.deleted, true);

    const afterDelete = await requestJson('/api/notes?includeArchived=true&search=' + encodeURIComponent('准备归档删除'));
    assert.ok(!afterDelete.notes.some((note) => note.id === created.note.id));
  });

  test('creates and updates custom categories for notes and filters', async () => {
    const createdCategory = await requestJson('/api/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: '车辆 / 保养',
        color: '#3DAA6C',
        icon: 'car'
      })
    });

    assert.ok(createdCategory.category.id.startsWith('category_'));
    assert.equal(createdCategory.category.name, '车辆 / 保养');
    assert.equal(createdCategory.category.color, '#3DAA6C');
    assert.equal(createdCategory.category.icon, 'car');
    assert.equal(createdCategory.category.isSystem, 0);

    const updatedCategory = await requestJson('/api/categories/' + createdCategory.category.id, {
      method: 'PATCH',
      body: JSON.stringify({
        name: '车辆资料',
        color: '#557c93',
        icon: 'car'
      })
    });

    assert.equal(updatedCategory.category.name, '车辆资料');
    assert.equal(updatedCategory.category.color, '#557c93');

    const createdNote = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '自定义分类记录',
        content: '这条记录用于验证自定义分类。',
        categoryId: createdCategory.category.id,
        memberId: 'self'
      })
    });

    assert.equal(createdNote.note.categoryId, createdCategory.category.id);
    assert.equal(createdNote.note.categoryName, '车辆资料');

    const filtered = await requestJson('/api/notes?category=' + encodeURIComponent(createdCategory.category.id));
    assert.ok(filtered.notes.some((note) => note.id === createdNote.note.id));

    const categoriesResult = await requestJson('/api/categories');
    const categoryFromList = categoriesResult.categories.find((category) => category.id === createdCategory.category.id);
    assert.ok(categoryFromList);
    assert.equal(categoryFromList.noteCount, 1);
  });
  test('supports search, category, member, tag and source filters', async () => {
    const title = `筛选测试记录 ${Date.now()}`;
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content: '搜索关键词：宽带 物业 NAS。',
        categoryId: 'house',
        memberId: 'partner',
        tags: ['NAS', '物业']
      })
    });

    const imported = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: `来源筛选导入记录 ${Date.now()}`,
        content: '这是一条用于验证 Note Station 来源筛选的测试记录。',
        categoryId: 'uncategorized',
        memberId: 'self',
        sourceType: 'notestation_import'
      })
    });

    const search = await requestJson(`/api/notes?search=${encodeURIComponent('宽带')}`);
    assert.ok(search.notes.some((note) => note.id === created.note.id));

    const category = await requestJson('/api/notes?category=house');
    assert.ok(category.notes.some((note) => note.id === created.note.id));

    const member = await requestJson('/api/notes?member=partner');
    assert.ok(member.notes.some((note) => note.id === created.note.id));

    const tag = await requestJson(`/api/notes?tag=${encodeURIComponent('NAS')}`);
    assert.ok(tag.notes.some((note) => note.id === created.note.id));

    const source = await requestJson('/api/notes?source=notestation_import');
    assert.ok(source.notes.some((note) => note.id === imported.note.id));
    assert.ok(source.notes.every((note) => note.sourceType === 'notestation_import'));
  });

  test('bulk categorizes imported uncategorized notes only', async () => {
    const importedOne = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '导入未分类整理 1',
        content: '这条导入记录需要整理分类。',
        categoryId: 'uncategorized',
        memberId: 'self',
        sourceType: 'notestation_import'
      })
    });
    const importedTwo = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '导入未分类整理 2',
        content: '这条导入记录也需要整理分类。',
        categoryId: 'uncategorized',
        memberId: 'self',
        sourceType: 'notestation_import'
      })
    });
    const manual = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '手动未分类不应被批量整理',
        content: '手动记录不属于导入整理范围。',
        categoryId: 'uncategorized',
        memberId: 'self',
        sourceType: 'manual'
      })
    });

    const result = await requestJson('/api/notes/bulk-categorize', {
      method: 'POST',
      body: JSON.stringify({
        categoryId: 'repair',
        noteIds: [importedOne.note.id, importedTwo.note.id, manual.note.id]
      })
    });

    assert.equal(result.updatedCount, 2);
    assert.deepEqual(result.updatedNoteIds.sort(), [importedOne.note.id, importedTwo.note.id].sort());

    const repair = await requestJson('/api/notes?category=repair&source=notestation_import');
    assert.ok(repair.notes.some((note) => note.id === importedOne.note.id));
    assert.ok(repair.notes.some((note) => note.id === importedTwo.note.id));

    const manualDetail = await requestJson('/api/notes?id=' + encodeURIComponent(manual.note.id));
    assert.equal(manualDetail.notes[0].categoryId, 'uncategorized');
  });

  test('updates default member display profile', async () => {
    const updated = await requestJson('/api/members/partner', {
      method: 'PATCH',
      body: JSON.stringify({
        name: '家里那位',
        avatar: '家',
        color: 'amber'
      })
    });

    const member = updated.members.find((item) => item.id === 'partner');
    assert.equal(member.name, '家里那位');
    assert.equal(member.avatar, '家');
    assert.equal(member.color, 'amber');

    const appData = await requestJson('/api/app-data');
    const appMember = appData.members.find((item) => item.id === 'partner');
    assert.equal(appMember.name, '家里那位');
    assert.equal(appMember.avatar, '家');
    assert.equal(appMember.color, 'amber');

    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '成员资料更新后的记录',
        content: '这条记录用于验证记录列表会使用更新后的成员名。',
        categoryId: 'family',
        memberId: 'partner'
      })
    });

    assert.equal(created.note.memberId, 'partner');
    assert.equal(created.note.memberName, '家里那位');
  });

  test('switches current member and uses it for new notes by default', async () => {
    const switched = await requestJson('/api/members/current', {
      method: 'POST',
      body: JSON.stringify({ memberId: 'partner' })
    });

    assert.equal(switched.currentMemberId, 'partner');
    assert.ok(switched.members.some((member) => member.id === 'partner' && member.isCurrent));

    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: '当前成员测试记录',
        content: '这条记录没有显式 memberId，应归属当前成员。',
        categoryId: 'family'
      })
    });

    assert.equal(created.note.memberId, 'partner');

    const invalid = await requestRaw('/api/members/current', {
      method: 'POST',
      body: JSON.stringify({ memberId: 'missing-member' })
    });

    assert.equal(invalid.response.status, 404);
    assert.equal(invalid.data.error, '成员不存在');
  });
  test('probes writable storage directories', async () => {
    const probe = await requestJson('/api/storage/probe', { method: 'POST' });

    assert.equal(probe.ok, true);
    assert.equal(probe.checks.databaseDir.ok, true);
    assert.equal(probe.checks.attachmentsDir.ok, true);
    assert.equal(probe.checks.backupsDir.ok, true);
    assert.equal(probe.checks.exportsDir.ok, true);
    assert.equal(path.resolve(probe.dataPaths.dataDir), path.resolve(tempDataDir));
  });

  test('backs up the database and exports JSON', async () => {
    const backup = await requestJson('/api/storage/backup', {
      method: 'POST',
      body: JSON.stringify({ nasOnline: true })
    });

    assert.ok(backup.backup.filePath.includes('backups'));
    assert.ok(backup.backup.fileSize > 0);

    const exported = await requestJson('/api/storage/export-json', { method: 'POST' });

    assert.ok(exported.export.filePath.includes('exports'));
    assert.ok(exported.export.fileSize > 0);
  });

  test('exports notes as Markdown', async () => {
    const created = await requestJson('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Markdown 导出测试记录',
        content: '这条记录用于验证 Markdown 导出正文。',
        categoryId: 'family',
        memberId: 'self',
        tags: ['导出测试']
      })
    });

    const exported = await requestJson('/api/storage/export-markdown', { method: 'POST' });
    assert.ok(exported.export.filePath.includes('exports'));
    assert.ok(exported.export.filePath.endsWith('.md'));
    assert.ok(exported.export.fileSize > 0);

    const markdown = readFileSync(exported.export.filePath, 'utf8');
    assert.match(markdown, /# 家事记 Markdown 导出/);
    assert.match(markdown, /## Markdown 导出测试记录/);
    assert.match(markdown, /这条记录用于验证 Markdown 导出正文。/);
    assert.match(markdown, new RegExp(created.note.id));
  });

  test('reports failed backup when NAS is offline', async () => {
    const offline = await requestRaw('/api/storage/backup', {
      method: 'POST',
      body: JSON.stringify({ nasOnline: false })
    });

    assert.equal(offline.response.status, 503);
    assert.equal(offline.data.error, '当前无法连接家庭 NAS');
    assert.equal(offline.data.latestBackup.status, 'failed');
    assert.equal(offline.data.latestBackup.errorMessage, '当前无法连接家庭 NAS');
  });
  test('exports all notes instead of only the list page limit', async () => {
    const createdIds = [];

    for (let index = 0; index < 205; index += 1) {
      const created = await requestJson('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: `全量导出测试 ${index}`,
          content: `这是一条用于验证 JSON 全量导出的记录 ${index}`,
          categoryId: 'family',
          memberId: 'self',
          tags: ['导出测试']
        })
      });
      createdIds.push(created.note.id);
    }

    const exported = await requestJson('/api/storage/export-json', { method: 'POST' });
    const payload = JSON.parse(readFileSync(exported.export.filePath, 'utf8'));
    const exportedIds = new Set(payload.notes.map((note) => note.id));

    for (const id of createdIds) {
      assert.ok(exportedIds.has(id), `Expected export to include ${id}`);
    }
  });
  test('previews and commits the sample Note Station import flow', async () => {
    const preview = await requestJson('/api/imports/notestation/sample-preview', {
      method: 'POST',
      body: JSON.stringify({ memberId: 'self' })
    });

    assert.equal(preview.status, 'previewed');
    assert.ok(preview.importId);
    assert.ok(preview.records.length >= 1);
    assert.ok(preview.failures.length >= 1);

    const fetchedPreview = await requestJson(`/api/imports/notestation/${preview.importId}`);
    assert.equal(fetchedPreview.importId, preview.importId);
    assert.equal(fetchedPreview.records.length, preview.records.length);

    const committed = await requestJson(`/api/imports/notestation/${preview.importId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ memberId: 'self' })
    });

    assert.equal(committed.status, 'completed');
    assert.ok(committed.importedNoteIds.length >= 1);
    assert.equal(committed.notes.length, committed.importedNoteIds.length);

    const search = await requestJson(`/api/notes?search=${encodeURIComponent('宽带')}`);
    assert.ok(search.notes.some((note) => committed.importedNoteIds.includes(note.id)));

    const secondCommit = await requestJson(`/api/imports/notestation/${preview.importId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ memberId: 'self' })
    });

    assert.equal(secondCommit.status, 'completed');
    assert.equal(secondCommit.importedNoteIds.length, committed.importedNoteIds.length);
  });
  test('reports missing Note Station import preview with a stable error', async () => {
    const missing = await requestRaw('/api/imports/notestation/missing-import-id');

    assert.equal(missing.response.status, 404);
    assert.equal(missing.data.error, '导入批次不存在');
  });

  test('prepares a real Note Station dry-run without writing notes', async () => {
    const before = await requestJson('/api/notes');
    const dryRun = await requestJson('/api/imports/notestation/dry-run', {
      method: 'POST',
      body: JSON.stringify({ fileName: 'real-export.zip', fileType: 'zip' })
    });
    const afterNotes = await requestJson('/api/notes');

    assert.equal(dryRun.dryRun, true);
    assert.equal(dryRun.status, 'needs_real_sample');
    assert.equal(dryRun.records.length, 0);
    assert.equal(dryRun.importId, null);
    assert.ok(dryRun.requiredSampleInfo.length >= 3);
    assert.equal(afterNotes.notes.length, before.notes.length);
  });

  test('uploads previews and commits a real NSX file through the web import API', async () => {
    const before = await requestJson('/api/notes?limit=all');
    const nsx = createWebImportNsxFixture();
    const preview = await requestJson('/api/imports/notestation/dry-run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent('web-import.nsx'),
        'X-Member-Id': 'self'
      },
      body: nsx
    });

    assert.equal(preview.dryRun, true);
    assert.equal(preview.status, 'previewed');
    assert.ok(preview.importId);
    assert.equal(preview.successCount, 1);
    assert.equal(preview.failedCount, 0);
    assert.equal(preview.attachmentCount, 2);
    assert.equal(preview.records[0].title, '网页 NSX 富文本记录');
    assert.match(preview.records[0].content, /网页端上传解析/);

    const committed = await requestJson(`/api/imports/notestation/${preview.importId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ memberId: 'self' })
    });

    assert.equal(committed.status, 'completed');
    assert.equal(committed.importedNoteIds.length, 1);
    assert.equal(committed.notes.length, 1);
    assert.equal(committed.notes[0].sourceType, 'notestation_import');
    assert.equal(committed.notes[0].attachments.length, 2);

    const detail = await requestJson(`/api/notes?id=${encodeURIComponent(committed.importedNoteIds[0])}`);
    assert.equal(detail.notes[0].attachments.length, 2);
    assert.ok(detail.notes[0].attachments.every((attachment) => attachment.isInline));
    const richImageRefs = detail.notes[0].richContent.html.match(/\/api\/attachments\//g) || [];
    assert.equal(richImageRefs.length, 2);
    assert.doesNotMatch(detail.notes[0].richContent.html, /src="ns_attach_unmatched_2\.jpg"/);
    assert.doesNotMatch(detail.notes[0].richContent.html, /data-missing-notestation-image/);

    const search = await requestJson(`/api/notes?search=${encodeURIComponent('网页端上传解析正文')}`);
    assert.ok(search.notes.some((note) => committed.importedNoteIds.includes(note.id)));

    const after = await requestJson('/api/notes?limit=all');
    assert.equal(after.notes.length, before.notes.length + 1);
  });
  test('recovers a persisted processing NSX preview after the background job was lost', async () => {
    const nsx = createWebImportNsxFixture();
    const importsDir = path.join(tempDataDir, 'imports', 'notestation');
    mkdirSync(importsDir, { recursive: true });
    const filePath = path.join(importsDir, 'lost-worker-web-import.nsx');
    writeFileSync(filePath, nsx);

    const importId = `import_lost_worker_${Date.now()}`;
    const db = new DatabaseSync(path.join(tempDataDir, 'database', 'app.db'));
    try {
      db.prepare(`
        INSERT INTO imports
          (id, source_type, file_name, file_path, status, total_count, success_count, failed_count, created_by_member_id)
        VALUES
          (?, 'notestation', ?, ?, 'processing', 0, 0, 0, 'self')
      `).run(importId, 'lost-worker-web-import.nsx', filePath);
    } finally {
      db.close();
    }

    let preview = await requestJson(`/api/imports/notestation/${importId}`);
    assert.equal(preview.status, 'processing');

    for (let index = 0; index < 30 && preview.status === 'processing'; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      preview = await requestJson(`/api/imports/notestation/${importId}`);
    }

    assert.equal(preview.status, 'previewed');
    assert.equal(preview.successCount, 1);
    assert.equal(preview.records.length, 1);
    assert.equal(preview.attachmentCount, 2);
  });

  test('uploads a Note Station NSX file through the async web preview path', async () => {
    const before = await requestJson('/api/notes?limit=all');
    const nsx = createWebImportNsxFixture();
    const response = await requestRaw('/api/imports/notestation/dry-run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent('web-import-async.nsx'),
        'X-Member-Id': 'self',
        'X-Async-Import': '1'
      },
      body: nsx
    });

    assert.equal(response.response.status, 202);
    assert.equal(response.data.status, 'processing');
    assert.ok(response.data.importId);

    let preview = response.data;
    for (let index = 0; index < 30 && preview.status === 'processing'; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      preview = await requestJson(`/api/imports/notestation/${response.data.importId}`);
    }

    assert.equal(preview.status, 'previewed');
    assert.equal(preview.successCount, 1);
    assert.equal(preview.failedCount, 0);
    assert.equal(preview.attachmentCount, 2);
    assert.equal(preview.records.length, 1);
    assert.equal(preview.records[0].attachments.length, 2);
    assert.match(preview.records[0].content, /上传解析/);

    const committed = await requestJson(`/api/imports/notestation/${response.data.importId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ memberId: 'self' })
    });

    assert.equal(committed.status, 'completed');
    assert.equal(committed.importedNoteIds.length, 1);

    const detail = await requestJson(`/api/notes?id=${encodeURIComponent(committed.importedNoteIds[0])}`);
    assert.equal(detail.notes.length, 1);
    assert.equal(detail.notes[0].sourceType, 'notestation_import');
    assert.equal(detail.notes[0].richContent.source, 'content_html');
    assert.match(detail.notes[0].richContent.html, /<strong>网页端上传解析正文<\/strong>/);
    assert.doesNotMatch(detail.notes[0].richContent.html, /src="ns_attach_unmatched_2\.jpg"/);
    assert.doesNotMatch(detail.notes[0].richContent.html, /data-missing-notestation-image/);
    assert.equal((detail.notes[0].richContent.html.match(/\/api\/attachments\//g) || []).length, 2);
    assert.equal(detail.notes[0].attachments.length, 2);
    assert.ok(detail.notes[0].attachments.every((attachment) => attachment.isInline));

    const after = await requestJson('/api/notes?limit=all');
    assert.equal(after.notes.length, before.notes.length + 1);
  });
});

