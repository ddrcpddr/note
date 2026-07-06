import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

console.log('Building native offline Android debug APK with local SDK tools');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(repoRoot, 'android');
const appRoot = path.join(androidRoot, 'app');
const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
const platformDir = path.join(sdkRoot, 'platforms', 'android-36.1');
const buildToolsDir = path.join(sdkRoot, 'build-tools', '37.0.0');
const javaHome = process.env.JAVA_HOME || 'C:\\Program Files\\Java\\jdk-25';

const androidJar = path.join(platformDir, 'android.jar');
const aapt2 = path.join(buildToolsDir, 'aapt2.exe');
const d8 = path.join(buildToolsDir, 'd8.bat');
const zipalign = path.join(buildToolsDir, 'zipalign.exe');
const apksigner = path.join(buildToolsDir, 'apksigner.bat');
const javac = path.join(javaHome, 'bin', 'javac.exe');
const jar = path.join(javaHome, 'bin', 'jar.exe');
const keytool = path.join(javaHome, 'bin', 'keytool.exe');

const outRoot = path.join(os.tmpdir(), 'note-android-native-debug');
const stagedAppRoot = path.join(outRoot, 'app');
const resZip = path.join(outRoot, 'compiled-res.zip');
const generatedRoot = path.join(outRoot, 'generated');
const classesRoot = path.join(outRoot, 'classes');
const dexRoot = path.join(outRoot, 'dex');
const classesJar = path.join(outRoot, 'classes.jar');
const unsignedApk = path.join(outRoot, 'app-debug-unsigned.apk');
const alignedApk = path.join(outRoot, 'app-debug-aligned.apk');
const finalDir = path.join(appRoot, 'build', 'outputs', 'apk', 'debug');
const finalApk = path.join(finalDir, 'app-debug.apk');
const debugKeystore = path.join(outRoot, 'debug.keystore');

function assertFile(file, label) {
  if (!fs.existsSync(file)) throw new Error(`${label} not found: ${file}`);
}

function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(' ')}`);
  const isBatch = command.toLowerCase().endsWith('.bat') || command.toLowerCase().endsWith('.cmd');
  const executable = isBatch ? 'cmd.exe' : command;
  const executableArgs = isBatch ? ['/c', command, ...args] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
    ...options
  });
  if (result.status !== 0) throw new Error(`Command failed: ${command}`);
}

function capture(command, args, options = {}) {
  const isBatch = command.toLowerCase().endsWith('.bat') || command.toLowerCase().endsWith('.cmd');
  const executable = isBatch ? 'cmd.exe' : command;
  const executableArgs = isBatch ? ['/c', command, ...args] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    ...options
  });
  if (result.status !== 0) throw new Error(`Command failed: ${command}\n${result.stderr || result.stdout || ''}`);
  return result.stdout || '';
}

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) copyDir(sourcePath, targetPath);
    else if (entry.isFile()) fs.writeFileSync(targetPath, fs.readFileSync(sourcePath));
  }
}

function collectJavaFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectJavaFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.java')) result.push(full);
  }
  return result;
}

function assertNativeApk(apkFile) {
  const entries = capture(jar, ['tf', apkFile]).split(/\r?\n/).filter(Boolean);
  if (!entries.includes('classes.dex')) throw new Error('APK is missing classes.dex');
  if (!entries.some((entry) => entry.startsWith('res/drawable') && entry.includes('app_icon'))) {
    throw new Error('APK is missing launcher icon resource');
  }
  const webEntries = entries.filter((entry) => entry.startsWith('assets/www'));
  if (webEntries.length > 0) {
    throw new Error(`Native offline APK must not contain WebView assets: ${webEntries.slice(0, 5).join(', ')}`);
  }
}

for (const [file, label] of [
  [androidJar, 'android.jar'],
  [aapt2, 'aapt2'],
  [d8, 'd8'],
  [zipalign, 'zipalign'],
  [apksigner, 'apksigner'],
  [javac, 'javac'],
  [jar, 'jar'],
  [keytool, 'keytool']
]) assertFile(file, label);

console.log('Android SDK tools found');
console.log('Preparing temp dir', outRoot);
fs.rmSync(outRoot, { recursive: true, force: true });
fs.mkdirSync(outRoot, { recursive: true });
copyDir(path.join(appRoot, 'src'), path.join(stagedAppRoot, 'src'));
fs.mkdirSync(generatedRoot, { recursive: true });
fs.mkdirSync(classesRoot, { recursive: true });
fs.mkdirSync(dexRoot, { recursive: true });
fs.mkdirSync(finalDir, { recursive: true });

run(aapt2, ['compile', '--dir', path.join(stagedAppRoot, 'src', 'main', 'res'), '-o', resZip]);
run(aapt2, [
  'link',
  '-o', unsignedApk,
  '-I', androidJar,
  '--manifest', path.join(stagedAppRoot, 'src', 'main', 'AndroidManifest.xml'),
  '--java', generatedRoot,
  '--auto-add-overlay',
  '-R', resZip
]);

const javaFiles = [
  ...collectJavaFiles(generatedRoot),
  ...collectJavaFiles(path.join(stagedAppRoot, 'src', 'main', 'java'))
];
run(javac, [
  '-encoding', 'UTF-8',
  '-source', '8',
  '-target', '8',
  '-bootclasspath', androidJar,
  '-classpath', androidJar,
  '-d', classesRoot,
  ...javaFiles
]);

run(jar, ['cf', classesJar, '-C', classesRoot, '.']);
run(d8, ['--lib', androidJar, '--output', dexRoot, classesJar]);
run(jar, ['uf', unsignedApk, '-C', dexRoot, 'classes.dex']);
run(zipalign, ['-p', '-f', '4', unsignedApk, alignedApk]);

run(keytool, [
  '-genkeypair',
  '-keystore', debugKeystore,
  '-storepass', 'android',
  '-keypass', 'android',
  '-alias', 'androiddebugkey',
  '-keyalg', 'RSA',
  '-keysize', '2048',
  '-validity', '10000',
  '-dname', 'CN=Android Debug,O=Android,C=US'
]);

run(apksigner, [
  'sign',
  '--ks', debugKeystore,
  '--ks-pass', 'pass:android',
  '--key-pass', 'pass:android',
  '--out', finalApk,
  alignedApk
]);
run(apksigner, ['verify', '--verbose', finalApk]);
assertNativeApk(finalApk);

console.log(`\nNative offline APK created: ${finalApk}`);
