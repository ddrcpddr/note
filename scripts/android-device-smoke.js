import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const apkPath = path.join(repoRoot, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const outputDir = path.join(repoRoot, 'output', 'android-device-smoke');
const packageName = 'com.homeoldnote.app';
const launcherActivity = `${packageName}/.MainActivity`;

const args = new Set(process.argv.slice(2));
const noInstall = args.has('--no-install');
const logMs = Number(readArgValue('--log-ms') || 8000);

const fatalPatterns = [
  /FATAL EXCEPTION/i,
  /AndroidRuntime/i,
  /页面脚本异常/i,
  /TypeError/i,
  /ReferenceError/i,
  /Uncaught/i,
  /RenderProcessGone/i
];

const interestingPatterns = [
  /HomeNoteAndroid/i,
  /chromium/i,
  /cr_/i,
  /Console/i,
  /WebView/i,
  /AndroidRuntime/i,
  /FATAL EXCEPTION/i,
  /页面脚本异常/i,
  /TypeError/i,
  /ReferenceError/i,
  /Uncaught/i,
  new RegExp(packageName.replaceAll('.', '\\.'), 'i')
];

function readArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return '';
  return process.argv[index + 1] || '';
}

function runAdb(adb, adbArgs, options = {}) {
  const result = spawnSync(adb, adbArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    maxBuffer: options.maxBuffer || 1024 * 1024 * 20
  });
  if (result.error) {
    throw new Error(`adb 执行失败：${result.error.message}`);
  }
  if (options.allowFailure !== true && result.status !== 0) {
    throw new Error(`adb ${adbArgs.join(' ')} 失败：${result.stderr || result.stdout}`);
  }
  return result;
}

function resolveAdb() {
  const candidates = [];
  for (const envName of ['ANDROID_HOME', 'ANDROID_SDK_ROOT']) {
    const base = process.env[envName];
    if (!base) continue;
    candidates.push(path.join(base, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb'));
  }
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    candidates.push(path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'platform-tools', 'adb.exe'));
  }
  candidates.push(process.platform === 'win32' ? 'adb.exe' : 'adb');

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['version'], { encoding: 'utf8', shell: false });
    if (result.status === 0) return candidate;
  }

  throw new Error('找不到 adb。请安装 Android platform-tools，并确认 adb 在 PATH 或 ANDROID_HOME/platform-tools 下。');
}

function getSingleDevice(adb) {
  const result = runAdb(adb, ['devices']);
  const rows = result.stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state] = line.split(/\s+/);
      return { serial, state };
    });

  const ready = rows.filter((row) => row.state === 'device');
  const unauthorized = rows.filter((row) => row.state === 'unauthorized');

  if (unauthorized.length > 0) {
    throw new Error(`检测到未授权手机：${unauthorized.map((row) => row.serial).join(', ')}。请在手机上允许 USB 调试。`);
  }
  if (ready.length === 0) {
    throw new Error('没有检测到可用手机。请用 USB 连接一台手机，打开开发者选项和 USB 调试。');
  }
  if (ready.length > 1) {
    throw new Error(`检测到多台手机：${ready.map((row) => row.serial).join(', ')}。请只保留一台再运行。`);
  }
  return ready[0].serial;
}

function assertApk() {
  if (!fs.existsSync(apkPath)) {
    throw new Error(`APK 不存在：${apkPath}。请先运行 npm.cmd run android:build。`);
  }
  const size = fs.statSync(apkPath).size;
  if (size <= 0) throw new Error(`APK 文件为空：${apkPath}`);
  return size;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeLogFiles(deviceSerial, fullLog) {
  fs.mkdirSync(outputDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = path.join(outputDir, `${timestamp}-${deviceSerial}`);
  const fullPath = `${base}.log`;
  const filteredPath = `${base}.filtered.log`;
  const filteredLines = fullLog
    .split(/\r?\n/)
    .filter((line) => interestingPatterns.some((pattern) => pattern.test(line)))
    .join('\n');

  fs.writeFileSync(fullPath, fullLog, 'utf8');
  fs.writeFileSync(filteredPath, filteredLines, 'utf8');
  return { fullPath, filteredPath, filteredLines };
}

try {
  const apkSize = assertApk();
  const adb = resolveAdb();
  const deviceSerial = getSingleDevice(adb);

  if (!noInstall) {
    runAdb(adb, ['-s', deviceSerial, 'install', '-r', apkPath]);
  }

  runAdb(adb, ['-s', deviceSerial, 'logcat', '-c']);
  runAdb(adb, ['-s', deviceSerial, 'shell', 'am', 'force-stop', packageName], { allowFailure: true });
  runAdb(adb, ['-s', deviceSerial, 'shell', 'am', 'start', '-n', launcherActivity]);
  await sleep(Number.isFinite(logMs) && logMs > 0 ? logMs : 8000);

  const logs = runAdb(adb, ['-s', deviceSerial, 'logcat', '-d', '-v', 'time'], { maxBuffer: 1024 * 1024 * 50 }).stdout;
  const { fullPath, filteredPath, filteredLines } = writeLogFiles(deviceSerial, logs);
  const failedPatterns = fatalPatterns
    .filter((pattern) => pattern.test(filteredLines))
    .map((pattern) => pattern.source);

  const result = {
    ok: failedPatterns.length === 0,
    deviceSerial,
    packageName,
    launcherActivity,
    apkPath,
    apkSize,
    logMs,
    installed: !noInstall,
    fullLogPath: fullPath,
    filteredLogPath: filteredPath,
    failedPatterns
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
    apkPath,
    packageName,
    launcherActivity
  }, null, 2));
  process.exitCode = 1;
}
