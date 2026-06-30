import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

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

  test('reads seeded app data and note list', async () => {
    const appData = await requestJson('/api/app-data');

    assert.equal(appData.members.length, 2);
    assert.deepEqual(appData.members.map((member) => member.name), ['我', '爱人']);
    assert.ok(appData.categories.length >= 11);
    assert.ok(appData.tags.length >= 10);
    assert.ok(appData.notes.length >= 3);
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
});
