import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

const repoRoot = process.cwd();
const tempDataDir = mkdtempSync(path.join(tmpdir(), 'note-pin-test-'));
const port = 5510 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;

let serverProcess;
let serverStdout = '';
let serverStderr = '';

async function requestRaw(route, options = {}) {
  const response = await fetch(baseUrl + route, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { response, data };
}

async function waitForHealth() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 10_000) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Server exited before health. stdout: ${serverStdout} stderr: ${serverStderr}`);
    }

    try {
      const { data } = await requestRaw('/api/health');
      if (data.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  throw new Error(`Server did not become healthy. stdout: ${serverStdout} stderr: ${serverStderr}`);
}

before(async () => {
  serverProcess = spawn(process.execPath, ['src/server/index.js'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NOTE_DATA_DIR: tempDataDir,
      NOTE_ACCESS_PIN: '2468'
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
    const closed = new Promise((resolve) => serverProcess.once('close', resolve));
    serverProcess.kill();
    await closed;
  }

  rmSync(tempDataDir, { recursive: true, force: true });
});

describe('Access PIN', () => {
  test('protects app APIs until the correct PIN unlocks the session', async () => {
    const status = await requestRaw('/api/access/status');
    assert.equal(status.response.status, 200);
    assert.equal(status.data.accessRequired, true);
    assert.equal(status.data.unlocked, false);

    const blocked = await requestRaw('/api/app-data');
    assert.equal(blocked.response.status, 401);
    assert.equal(blocked.data.error, '需要访问口令');

    const wrong = await requestRaw('/api/access/unlock', {
      method: 'POST',
      body: JSON.stringify({ pin: '0000' })
    });
    assert.equal(wrong.response.status, 401);

    const unlocked = await requestRaw('/api/access/unlock', {
      method: 'POST',
      body: JSON.stringify({ pin: '2468' })
    });
    assert.equal(unlocked.response.status, 200);
    assert.equal(unlocked.data.unlocked, true);

    const cookie = unlocked.response.headers.get('set-cookie').split(';')[0];
    const appData = await requestRaw('/api/app-data', { headers: { Cookie: cookie } });
    assert.equal(appData.response.status, 200);
    assert.ok(Array.isArray(appData.data.notes));
  });
});
