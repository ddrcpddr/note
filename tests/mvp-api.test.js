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
