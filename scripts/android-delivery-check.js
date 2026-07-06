import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCommand = process.execPath;
const smokePort = process.env.ANDROID_DELIVERY_SMOKE_PORT || '3400';
const smokeBaseUrl = `http://127.0.0.1:${smokePort}`;
const apkPath = path.join(repoRoot, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

const steps = [];

function run(command, args, options = {}) {
  const label = options.label || `${command} ${args.join(' ')}`;
  console.log(`\n==> ${label}`);
  const invocation = getInvocation(command, args);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...(options.env || {})
    }
  });
  if (result.status !== 0) {
    throw new Error(`Delivery check failed at: ${label}`);
  }
  steps.push({ label, ok: true });
}

function getInvocation(command, args) {
  const lower = command.toLowerCase();
  if (lower.endsWith('.cmd') || lower.endsWith('.bat')) {
    return {
      command: 'cmd.exe',
      args: ['/c', command, ...args]
    };
  }
  return { command, args };
}

async function waitForHealth(baseUrl, timeoutMs = 15000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();
      if (response.ok && data.ok) return data;
      lastError = new Error(`health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server did not become healthy at ${baseUrl}: ${lastError?.message || 'timeout'}`);
}

async function runSmokeWithTempServer() {
  console.log(`\n==> start temporary server for smoke on ${smokeBaseUrl}`);
  const server = spawn(nodeCommand, ['src/server/index.js'], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    env: {
      ...process.env,
      PORT: smokePort
    }
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForHealth(smokeBaseUrl);
    run(npmCommand, ['run', 'smoke', '--', '--base-url', smokeBaseUrl], {
      label: `npm.cmd run smoke -- --base-url ${smokeBaseUrl}`
    });
    steps.push({ label: `temporary server ${smokeBaseUrl}`, ok: true });
  } finally {
    if (!server.killed) server.kill();
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 3000);
      server.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  if (server.exitCode && server.exitCode !== 0 && !output.includes('note server listening')) {
    throw new Error(`Temporary server exited unexpectedly:\n${output}`);
  }
}

function assertApkExists() {
  if (!fs.existsSync(apkPath)) {
    throw new Error(`APK was not created: ${apkPath}`);
  }
  const stat = fs.statSync(apkPath);
  if (stat.size <= 0) {
    throw new Error(`APK is empty: ${apkPath}`);
  }
  return stat.size;
}

try {
  console.log('Running Android family-use delivery check');
  run(npmCommand, ['run', 'check'], { label: 'npm.cmd run check' });
  run(npmCommand, ['run', 'test'], { label: 'npm.cmd run test' });
  run(npmCommand, ['run', 'build'], { label: 'npm.cmd run build' });
  run(npmCommand, ['run', 'android:build'], { label: 'npm.cmd run android:build' });
  run(npmCommand, ['run', 'android:verify'], { label: 'npm.cmd run android:verify' });
  await runSmokeWithTempServer();

  const apkSize = assertApkExists();
  console.log(JSON.stringify({
    ok: true,
    apkPath,
    apkSize,
    smokeBaseUrl,
    steps
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
    apkPath,
    smokeBaseUrl,
    steps
  }, null, 2));
  process.exitCode = 1;
}
