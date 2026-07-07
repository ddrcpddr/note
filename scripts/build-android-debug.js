import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

console.log('Building Capacitor Android debug APK with bundled React assets');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(repoRoot, 'android');
const apkPath = path.join(androidRoot, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const gradleCommand = process.env.GRADLE_CMD || 'C:\\Users\\Administrator\\.gradle\\wrapper\\dists\\gradle-8.14.3-bin\\2bnto2u1qr1vpyr7771hnnz7v\\gradle-8.14.3\\bin\\gradle.bat';
const javaHome = process.env.JAVA21_HOME || 'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.11.10-hotspot';
const androidSdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');

function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(' ')}`);
  const isBatch = command.toLowerCase().endsWith('.bat') || command.toLowerCase().endsWith('.cmd');
  const executable = isBatch ? 'cmd.exe' : command;
  const executableArgs = isBatch ? ['/c', command, ...args] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: options.cwd || repoRoot,
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, JAVA_HOME: javaHome, ANDROID_HOME: androidSdkRoot, ANDROID_SDK_ROOT: androidSdkRoot, PATH: path.join(javaHome, 'bin') + path.delimiter + process.env.PATH, ...(options.env || {}) }
  });
  if (result.status !== 0) throw new Error(`Command failed: ${command}`);
}

if (!fs.existsSync(gradleCommand)) {
  throw new Error(`Gradle not found. Set GRADLE_CMD or install Gradle: ${gradleCommand}`);
}

run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build']);
run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['cap', 'sync', 'android']);
run(gradleCommand, ['--no-daemon', 'assembleDebug'], { cwd: androidRoot });

if (!fs.existsSync(apkPath)) throw new Error(`APK was not created: ${apkPath}`);
const size = fs.statSync(apkPath).size;
if (size < 1024 * 1024) {
  throw new Error(`APK is suspiciously small (${size} bytes). It should include bundled React assets and Capacitor runtime.`);
}

console.log(`\nCapacitor offline APK created: ${apkPath}`);
console.log(`APK size: ${size} bytes`);



