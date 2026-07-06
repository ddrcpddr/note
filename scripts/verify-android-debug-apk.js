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
const extractRoot = path.join(os.tmpdir(), 'note-android-native-apk-verify');

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
  if (result.status !== 0) fail(`Command failed: ${command} ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  return result.stdout || '';
}

function assertFile(file, label) {
  if (!fs.existsSync(file)) fail(`${label} not found: ${file}`);
}

assertFile(jar, 'jar');
assertFile(apkPath, 'Android debug APK');

const entries = run(jar, ['tf', apkPath]).split(/\r?\n/).filter(Boolean);
const requiredEntries = ['AndroidManifest.xml', 'classes.dex'];
for (const entry of requiredEntries) {
  if (!entries.includes(entry)) fail(`APK is missing ${entry}`);
}

const webEntries = entries.filter((entry) => entry.startsWith('assets/www'));
if (webEntries.length > 0) {
  fail(`Native offline APK must not contain WebView assets: ${webEntries.slice(0, 8).join(', ')}`);
}

const hasIcon = entries.some((entry) => entry.startsWith('res/drawable') && entry.includes('app_icon'));
if (!hasIcon) fail('APK is missing app_icon drawable resource');

fs.rmSync(extractRoot, { recursive: true, force: true });
fs.mkdirSync(extractRoot, { recursive: true });
run(jar, ['xf', apkPath, 'classes.dex'], { cwd: extractRoot });
assertFile(path.join(extractRoot, 'classes.dex'), 'classes.dex');
fs.rmSync(extractRoot, { recursive: true, force: true });

console.log(JSON.stringify({
  ok: true,
  apkPath,
  nativeOffline: true,
  hasClassesDex: true,
  hasLauncherIcon: hasIcon,
  webAssetCount: webEntries.length,
  checkedEntries: requiredEntries.length + 1
}, null, 2));
