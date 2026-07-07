import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Android Capacitor local-first app', () => {
  test('bundles the React app locally instead of opening a NAS URL shell', () => {
    const packageJson = readText('package.json');
    const capacitorConfig = readText('capacitor.config.json');
    const mainActivity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');
    const buildScript = readText('scripts/build-android-debug.js');
    const verifyScript = readText('scripts/verify-android-debug-apk.js');

    assert.ok(packageJson.includes('@capacitor/core'));
    assert.ok(packageJson.includes('@capacitor/android'));
    assert.ok(packageJson.includes('@capacitor-community/sqlite'));
    assert.ok(capacitorConfig.includes('"webDir": "dist"'));
    assert.equal(capacitorConfig.includes('"url"'), false);
    assert.ok(mainActivity.includes('extends BridgeActivity'));
    assert.equal(mainActivity.includes('loadUrl'), false);
    assert.equal(mainActivity.includes('WebView'), false);
    assert.ok(buildScript.includes('npx.cmd'));
    assert.ok(buildScript.includes("'cap', 'sync', 'android'"));
    assert.ok(buildScript.includes('assembleDebug'));
    assert.ok(verifyScript.includes('assets/public/index.html'));
    assert.ok(verifyScript.includes('APK is too small'));
  });

  test('initializes an Android SQLite schema for local-first notes', () => {
    const schema = readText('src/data/local/localSchema.js');
    const localDb = readText('src/data/local/localDb.js');
    const notesRepo = readText('src/data/local/localNotesRepository.js');
    const queueRepo = readText('src/data/local/syncQueueRepository.js');

    assert.ok(schema.includes('CREATE TABLE IF NOT EXISTS notes'));
    assert.ok(schema.includes('content_text TEXT'));
    assert.ok(schema.includes('content_html TEXT'));
    assert.ok(schema.includes('content_json TEXT'));
    assert.ok(schema.includes('sync_status TEXT'));
    assert.ok(schema.includes('CREATE TABLE IF NOT EXISTS attachments'));
    assert.ok(schema.includes('CREATE TABLE IF NOT EXISTS sync_queue'));
    assert.ok(localDb.includes('SQLiteConnection'));
    assert.ok(localDb.includes('initializeLocalDatabase'));
    assert.ok(notesRepo.includes('upsertLocalNoteToSqlite'));
    assert.ok(notesRepo.includes('readLocalNotesFromSqlite'));
    assert.ok(notesRepo.includes('deleteLocalNoteFromSqlite'));
    assert.ok(queueRepo.includes('queueMutationToSqlite'));
  });

  test('keeps existing React UI but routes note mutations through local storage first', () => {
    const main = readText('src/client/main.jsx');
    const offlineStore = readText('src/client/offlineStore.js');

    assert.ok(main.includes("import { Capacitor } from '@capacitor/core'"));
    assert.ok(main.includes('function isNativeAndroidApp()'));
    assert.ok(main.includes('if (isNativeAndroidApp()) return Boolean(getAndroidServerUrl())'));
    assert.ok(main.includes('await initializeLocalStore();'));
    assert.ok(main.includes('saveLocalFirstDraft'));
    assert.ok(main.includes("action: 'archive'"));
    assert.ok(main.includes("action: 'delete'"));
    assert.ok(main.includes('记录已归档，恢复连接后会同步'));
    assert.ok(main.includes('记录已删除，恢复连接后会同步'));
    assert.ok(offlineStore.includes('initializeLocalStore'));
    assert.ok(offlineStore.includes('shouldUseNativeSqlite()'));
    assert.ok(offlineStore.includes('upsertLocalNoteToSqlite(localNote)'));
    assert.ok(offlineStore.includes('readLocalNotesFromSqlite()'));
    assert.ok(offlineStore.includes('queueMutationToSqlite'));
  });

  test('ships launcher icon and bundled public assets for the installed APK', () => {
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/res/drawable/app_icon.png')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/assets/public/index.html')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/assets/capacitor.config.json')), true);
  });
});
