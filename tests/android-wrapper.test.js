import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Android native offline app', () => {
  test('uses native Android screens and SQLite instead of a WebView shell', () => {
    assert.equal(existsSync(path.join(repoRoot, 'android/settings.gradle')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/build.gradle')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/AndroidManifest.xml')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/java/com/homeoldnote/app/MainActivity.java')), true);
    assert.equal(existsSync(path.join(repoRoot, 'scripts/build-android-debug.js')), true);

    const manifest = readText('android/app/src/main/AndroidManifest.xml');
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');
    const strings = readText('android/app/src/main/res/values/strings.xml');
    const buildScript = readText('scripts/build-android-debug.js');

    assert.ok(strings.includes('家事记'));
    assert.ok(manifest.includes('android:icon="@drawable/app_icon"'));

    assert.ok(activity.includes('SQLiteOpenHelper'));
    assert.ok(activity.includes('DATABASE_NAME = "home_note_native.db"'));
    assert.ok(activity.includes('CREATE TABLE IF NOT EXISTS notes'));
    assert.ok(activity.includes('showHome()'));
    assert.ok(activity.includes('showEditor'));
    assert.ok(activity.includes('showDetail'));
    assert.ok(activity.includes('createNote'));
    assert.ok(activity.includes('updateNote'));
    assert.ok(activity.includes('已保存到手机本地'));
    assert.ok(activity.includes('不连接 Docker/NAS 也可以新建、编辑和保存'));

    assert.equal(activity.includes('WebView'), false);
    assert.equal(activity.includes('file:///android_asset/www/index.html'), false);
    assert.equal(activity.includes('HomeNoteAndroid'), false);
    assert.equal(activity.includes('loadServer'), false);

    assert.ok(buildScript.includes('Building native offline Android debug APK'));
    assert.ok(buildScript.includes('assertNativeApk'));
    assert.ok(buildScript.includes('Native offline APK must not contain WebView assets'));
    assert.equal(buildScript.includes('Building frontend for Android asset bundle'), false);
    assert.equal(buildScript.includes('copyDir(distRoot'), false);
    assert.equal(buildScript.includes('assets/www/index.html'), false);
  });

  test('verifies the built APK as a native offline APK', () => {
    const packageJson = readText('package.json');
    const verifyScript = readText('scripts/verify-android-debug-apk.js');

    assert.ok(packageJson.includes('"android:verify": "node scripts/verify-android-debug-apk.js"'));
    assert.ok(verifyScript.includes('nativeOffline'));
    assert.ok(verifyScript.includes('classes.dex'));
    assert.ok(verifyScript.includes('app_icon'));
    assert.ok(verifyScript.includes('Native offline APK must not contain WebView assets'));
    assert.equal(verifyScript.includes('assets/www/index.html'), false);
    assert.equal(verifyScript.includes('HomeNoteAndroid'), false);
    assert.equal(verifyScript.includes('file:///api'), false);
  });

  test('keeps the one-command delivery check before handing over APKs', () => {
    const packageJson = readText('package.json');
    const deliveryScript = readText('scripts/android-delivery-check.js');

    assert.ok(packageJson.includes('"android:delivery-check": "node scripts/android-delivery-check.js"'));
    assert.ok(deliveryScript.includes("run(npmCommand, ['run', 'check']"));
    assert.ok(deliveryScript.includes("run(npmCommand, ['run', 'test']"));
    assert.ok(deliveryScript.includes("run(npmCommand, ['run', 'build']"));
    assert.ok(deliveryScript.includes("run(npmCommand, ['run', 'android:build']"));
    assert.ok(deliveryScript.includes("run(npmCommand, ['run', 'android:verify']"));
    assert.ok(deliveryScript.includes('assertApkExists'));
  });

  test('provides an optional adb device smoke check for real phones', () => {
    const packageJson = readText('package.json');
    const deviceSmokeScript = readText('scripts/android-device-smoke.js');

    assert.ok(packageJson.includes('"android:device-smoke": "node scripts/android-device-smoke.js"'));
    assert.ok(deviceSmokeScript.includes('adb'));
    assert.ok(deviceSmokeScript.includes('install'));
    assert.ok(deviceSmokeScript.includes('logcat'));
    assert.ok(deviceSmokeScript.includes('am\', \'start'));
    assert.ok(deviceSmokeScript.includes("const packageName = 'com.homeoldnote.app'"));
    assert.ok(deviceSmokeScript.includes('`${packageName}/.MainActivity`'));
    assert.ok(deviceSmokeScript.includes('FATAL EXCEPTION'));
  });

  test('ships a launcher icon for the installed APK', () => {
    const manifest = readText('android/app/src/main/AndroidManifest.xml');

    assert.ok(manifest.includes('android:icon="@drawable/app_icon"'));
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/res/drawable/app_icon.png')), true);
  });

  test('supports native offline search and category filters without a server', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('currentSearchQuery'));
    assert.ok(activity.includes('currentCategoryFilter'));
    assert.ok(activity.includes('搜索记录、标签或内容'));
    assert.ok(activity.includes('全部分类'));
    assert.ok(activity.includes('清除筛选'));
    assert.ok(activity.includes('listNotes(String searchQuery, String categoryFilter)'));
    assert.ok(activity.includes('listCategories()'));
    assert.ok(activity.includes('LIKE ?'));
    assert.ok(activity.includes('title LIKE ? OR content LIKE ? OR tags LIKE ?'));
  });

  test('supports native custom categories stored on the phone', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('DATABASE_VERSION = 3'));
    assert.ok(activity.includes('CREATE TABLE IF NOT EXISTS categories'));
    assert.ok(activity.includes('seedDefaultCategories'));
    assert.ok(activity.includes('showCategories()'));
    assert.ok(activity.includes('添加分类'));
    assert.ok(activity.includes('新分类名称'));
    assert.ok(activity.includes('createCategory(String name)'));
    assert.ok(activity.includes('ensureCategory(category)'));
    assert.ok(activity.includes('selectCategoryButton'));
    assert.ok(activity.includes('家庭事务'));
    assert.ok(activity.includes('未分类 / 待整理'));
  });
  test('prepares native offline notes for later Docker NAS sync', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('DATABASE_VERSION = 3'));
    assert.ok(activity.includes('CREATE TABLE IF NOT EXISTS sync_queue'));
    assert.ok(activity.includes('queueSyncMutation'));
    assert.ok(activity.includes('pendingSyncCount()'));
    assert.ok(activity.includes('SharedPreferences'));
    assert.ok(activity.includes('PREFS_NAME'));
    assert.ok(activity.includes('server_url'));
    assert.ok(activity.includes('showSyncSettings()'));
    assert.ok(activity.includes('服务器地址'));
    assert.ok(activity.includes('待同步'));
    assert.ok(activity.includes('手动同步'));
    assert.ok(activity.includes('同步功能下一阶段接入 Docker/NAS'));
  });
});
