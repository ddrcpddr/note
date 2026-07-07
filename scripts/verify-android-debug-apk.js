import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const apkPath = path.join(repoRoot, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const jar = process.env.JAR_CMD || path.join(process.env.JAVA_HOME || 'C:\\Program Files\\Java\\jdk-25', 'bin', 'jar.exe');

function capture(command, args) {
  const isBatch = command.toLowerCase().endsWith('.bat') || command.toLowerCase().endsWith('.cmd');
  const executable = isBatch ? 'cmd.exe' : command;
  const executableArgs = isBatch ? ['/c', command, ...args] : args;
  const result = spawnSync(executable, executableArgs, { cwd: repoRoot, encoding: 'utf8', shell: false });
  if (result.status !== 0) throw new Error(`Command failed: ${command}\n${result.stderr || result.stdout || ''}`);
  return result.stdout || '';
}

if (!fs.existsSync(apkPath)) throw new Error(`APK not found: ${apkPath}`);
const stat = fs.statSync(apkPath);
if (stat.size < 1024 * 1024) throw new Error(`APK is too small and likely a shell: ${stat.size} bytes`);

const entries = capture(jar, ['tf', apkPath]).split(/\r?\n/).filter(Boolean);
const requiredEntries = [
  'assets/public/index.html',
  'assets/capacitor.config.json',
  'classes.dex'
];
for (const entry of requiredEntries) {
  if (!entries.includes(entry)) throw new Error(`APK missing required bundled asset: ${entry}`);
}
if (!entries.some((entry) => entry.startsWith('assets/public/assets/index-') && entry.endsWith('.js'))) {
  throw new Error('APK missing bundled React JavaScript asset');
}
if (!entries.some((entry) => entry.startsWith('res/') && entry.includes('app_icon'))) {
  throw new Error('APK missing launcher icon resource');
}

console.log(JSON.stringify({
  ok: true,
  kind: 'capacitor-local-first',
  apkPath,
  apkSize: stat.size,
  bundledReact: true,
  nativeShellOnly: false
}, null, 2));
