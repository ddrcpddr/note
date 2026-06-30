import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

const repoRoot = process.cwd();
const tempDataDir = mkdtempSync(path.join(tmpdir(), 'note-http-smoke-test-'));
const port = 5610 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;

let serverProcess;
let serverStdout = '';
let serverStderr = '';

async function waitForHealth() {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 10_000) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Server exited early. stdout: ${serverStdout} stderr: ${serverStderr}`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`);
      const health = await response.json();
      if (response.ok && health.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error(`Server did not become healthy: ${lastError?.message || 'unknown'}`);
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
    const closed = new Promise((resolve) => serverProcess.once('close', resolve));
    serverProcess.kill();
    await closed;
  }

  rmSync(tempDataDir, { recursive: true, force: true });
});

describe('HTTP smoke script', () => {
  test('checks API, filters, backup and JSON export against a running server', () => {
    const result = spawnSync(process.execPath, ['src/server/scripts/http-smoke.js', '--base-url', baseUrl], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);

    assert.equal(payload.ok, true);
    assert.equal(payload.baseUrl, baseUrl);
    assert.ok(payload.checks.some((check) => check.name === 'health' && check.ok));
    assert.ok(payload.checks.some((check) => check.name === 'manual-backup' && check.ok));
    assert.ok(payload.checks.some((check) => check.name === 'json-export' && check.ok));
  });

  test('supports read-only mode without backup or export checks', () => {
    const result = spawnSync(process.execPath, ['src/server/scripts/http-smoke.js', '--base-url', baseUrl, '--read-only'], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);

    assert.equal(payload.ok, true);
    assert.equal(payload.readOnly, true);
    assert.ok(payload.checks.some((check) => check.name === 'notes-list' && check.ok));
    assert.ok(!payload.checks.some((check) => check.name === 'manual-backup'));
    assert.ok(!payload.checks.some((check) => check.name === 'json-export'));
  });
});
