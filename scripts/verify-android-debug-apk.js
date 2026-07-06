import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const javaHome = process.env.JAVA_HOME || 'C:\\Program Files\\Java\\jdk-25';
const jar = path.join(javaHome, 'bin', process.platform === 'win32' ? 'jar.exe' : 'jar');
const apkPath = path.join(repoRoot, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const extractRoot = path.join(os.tmpdir(), 'note-android-apk-verify');

function fail(message) {
  throw new Error(message);
}

function run(command, args, options = {}) {
  const isBatch = command.toLowerCase().endsWith('.bat') || command.toLowerCase().endsWith('.cmd');
  const executable = isBatch ? 'cmd.exe' : command;
  const executableArgs = isBatch ? ['/c', command, ...args] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: options.cwd || repoRoot,
    encoding: 'utf8',
    shell: false,
    ...options
  });
  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout || '';
}

function assertFile(file, label) {
  if (!fs.existsSync(file)) fail(`${label} not found: ${file}`);
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

assertFile(jar, 'jar');
assertFile(apkPath, 'Android debug APK');

const entries = run(jar, ['tf', apkPath]).split(/\r?\n/).filter(Boolean);
const requiredEntries = [
  'assets/www/index.html',
  'assets/www/manifest.webmanifest',
  'assets/www/icons/app-icon-192.png',
  'assets/www/icons/app-icon-512.png',
  'classes.dex'
];

for (const entry of requiredEntries) {
  if (!entries.includes(entry)) fail(`APK is missing ${entry}`);
}

const badAssetEntries = entries.filter((entry) => entry.startsWith('assets/') && entry.includes('\\'));
if (badAssetEntries.length > 0) {
  fail(`APK assets contain Windows path separators: ${badAssetEntries.slice(0, 8).join(', ')}`);
}

const jsEntries = entries.filter((entry) => /^assets\/www\/assets\/index-.*\.js$/.test(entry));
const cssEntries = entries.filter((entry) => /^assets\/www\/assets\/index-.*\.css$/.test(entry));
if (jsEntries.length !== 1) fail(`Expected exactly one built JS asset, found ${jsEntries.length}`);
if (cssEntries.length !== 1) fail(`Expected exactly one built CSS asset, found ${cssEntries.length}`);

fs.rmSync(extractRoot, { recursive: true, force: true });
fs.mkdirSync(extractRoot, { recursive: true });
run(jar, ['xf', apkPath, 'assets/www/index.html', jsEntries[0], cssEntries[0], 'assets/www/manifest.webmanifest'], { cwd: extractRoot });

const indexHtml = readText(path.join(extractRoot, 'assets', 'www', 'index.html'));
const jsBundle = readText(path.join(extractRoot, ...jsEntries[0].split('/')));
const manifest = readText(path.join(extractRoot, 'assets', 'www', 'manifest.webmanifest'));

if (!indexHtml.includes('src="./assets/')) fail('index.html does not use relative JS asset path');
if (!indexHtml.includes('href="./assets/')) fail('index.html does not use relative CSS asset path');
if (indexHtml.includes('src="/assets/') || indexHtml.includes('href="/assets/')) {
  fail('index.html contains absolute asset paths that break file:// Android loading');
}

const forbiddenRuntimeSnippets = [
  'file:///api',
  "fetch(apiUrl('/api/access/status'))",
  'fetch("/api/',
  "fetch('/api/"
];
for (const snippet of forbiddenRuntimeSnippets) {
  if (jsBundle.includes(snippet)) fail(`Built JS contains forbidden offline runtime snippet: ${snippet}`);
}

const requiredRuntimeSnippets = [
  'remote api unavailable in offline Android mode',
  'home-notes-offline-first-v1',
  'HomeNoteAndroid',
  'local-only',
  'dirty',
  'baseUpdatedAt',
  '待同步到 NAS',
  '本机记录待同步',
  '同步失败，可重试'
];
for (const snippet of requiredRuntimeSnippets) {
  if (!jsBundle.includes(snippet)) fail(`Built JS is missing expected offline runtime marker: ${snippet}`);
}

const manifestData = JSON.parse(manifest);
if (manifestData.name !== '家事记') fail('manifest name is not 家事记');
if (!Array.isArray(manifestData.icons) || manifestData.icons.length < 2) fail('manifest icons are missing');

fs.rmSync(extractRoot, { recursive: true, force: true });

console.log(JSON.stringify({
  ok: true,
  apkPath,
  indexEntry: 'assets/www/index.html',
  jsEntry: jsEntries[0],
  cssEntry: cssEntries[0],
  checkedEntries: requiredEntries.length + jsEntries.length + cssEntries.length
}, null, 2));
