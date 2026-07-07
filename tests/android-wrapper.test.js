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

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
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

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
    assert.ok(activity.includes('CREATE TABLE IF NOT EXISTS sync_queue'));
    assert.ok(activity.includes('createSyncQueueTable(db);'));
    assert.ok(activity.includes('queueSyncMutation'));
    assert.ok(activity.includes('pendingSyncCount()'));
    assert.ok(activity.includes('SharedPreferences'));
    assert.ok(activity.includes('PREFS_NAME'));
    assert.ok(activity.includes('server_url'));
    assert.ok(activity.includes('showSyncSettings()'));
    assert.ok(activity.includes('服务器地址'));
    assert.ok(activity.includes('待同步'));
    assert.ok(activity.includes('手动同步'));
    assert.ok(activity.includes('开始同步本机记录'));
  });
  test('syncs native offline created notes to Docker NAS when server is reachable', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');
    const manifest = readText('android/app/src/main/AndroidManifest.xml');

    assert.ok(manifest.includes('android.permission.INTERNET'));
    assert.ok(activity.includes('HttpURLConnection'));
    assert.ok(activity.includes('runManualSync()'));
    assert.ok(activity.includes('syncPendingCreates'));
    assert.ok(activity.includes('/api/notes'));
    assert.ok(activity.includes('setRequestMethod("POST")'));
    assert.ok(activity.includes('application/json; charset=utf-8'));
    assert.ok(activity.includes('listPendingSyncMutations()'));
    assert.ok(activity.includes('markSyncDone'));
    assert.ok(activity.includes('markSyncFailed'));
    assert.ok(activity.includes('同步完成'));
    assert.ok(activity.includes('同步失败'));
  });

  test('stores remote note ids and syncs native offline edits back to Docker NAS', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
    assert.ok(activity.includes('remote_id TEXT'));
    assert.ok(activity.includes('ensureRemoteIdColumn'));
    assert.ok(activity.includes('saveRemoteId'));
    assert.ok(activity.includes('mutation.remoteId'));
    assert.ok(activity.includes('parseCreatedRemoteId'));
    assert.ok(activity.includes('postUpdateMutation'));
    assert.ok(activity.includes('setRequestMethod("PATCH")'));
    assert.ok(activity.includes('normalizeServerUrl(serverUrl) + "/api/notes/" + mutation.remoteId'));
    assert.ok(activity.includes('没有远端记录 ID，先同步新建记录'));
  });

  test('shows native sync failure details for retry decisions', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
    assert.ok(activity.includes('error_message TEXT'));
    assert.ok(activity.includes('last_attempt_at TEXT'));
    assert.ok(activity.includes('ensureSyncQueueDetailColumns'));
    assert.ok(activity.includes('markSyncFailed(long queueId, String message)'));
    assert.ok(activity.includes('listFailedSyncItems()'));
    assert.ok(activity.includes('最近同步失败'));
    assert.ok(activity.includes('失败原因'));
    assert.ok(activity.includes('最后尝试'));
  });

  test('sends baseUpdatedAt to avoid silently overwriting server edits', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');
    const serverRoutes = readText('src/server/routes/notes.js');

    assert.ok(serverRoutes.includes('baseUpdatedAt'));
    assert.ok(serverRoutes.includes("code: 'note_conflict'"));

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
    assert.ok(activity.includes('remote_updated_at TEXT'));
    assert.ok(activity.includes('ensureRemoteUpdatedAtColumn'));
    assert.ok(activity.includes('saveRemoteSyncState'));
    assert.ok(activity.includes('parseRemoteSyncState'));
    assert.ok(activity.includes('mutation.remoteUpdatedAt'));
    assert.ok(activity.includes('payload.put("baseUpdatedAt", mutation.remoteUpdatedAt)'));
    assert.ok(activity.includes('记录已经在其他设备更新'));
  });

  test('supports native offline archive and delete lifecycle with sync', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');
    const serverRoutes = readText('src/server/routes/notes.js');

    assert.ok(serverRoutes.includes("notesRouter.post('/:id/archive'"));
    assert.ok(serverRoutes.includes("notesRouter.delete('/:id'"));

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
    assert.ok(activity.includes('is_archived INTEGER NOT NULL DEFAULT 0'));
    assert.ok(activity.includes('is_deleted INTEGER NOT NULL DEFAULT 0'));
    assert.ok(activity.includes('ensureNoteLifecycleColumns'));
    assert.ok(activity.includes('archiveNote(long id)'));
    assert.ok(activity.includes('deleteNote(long id)'));
    assert.ok(activity.includes('postArchiveMutation'));
    assert.ok(activity.includes('postDeleteMutation'));
    assert.ok(activity.includes('setRequestMethod("DELETE")'));
    assert.ok(activity.includes('归档记录'));
    assert.ok(activity.includes('删除记录'));
    assert.ok(activity.includes('is_deleted = 0 AND is_archived = 0'));
  });

  test('supports native offline tag chips and quick tag editing', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('currentTagFilter'));
    assert.ok(activity.includes('全部标签'));
    assert.ok(activity.includes('tagFilterButton'));
    assert.ok(activity.includes('quickTagButton'));
    assert.ok(activity.includes('清空标签'));
    assert.ok(activity.includes('normalizeTags'));
    assert.ok(activity.includes('listTags()'));
    assert.ok(activity.includes('listNotes(String searchQuery, String categoryFilter, String tagFilter)'));
    assert.ok(activity.includes('tags LIKE ?'));
    assert.ok(activity.includes('待办'));
    assert.ok(activity.includes('重要'));
    assert.ok(activity.includes('维修'));
    assert.ok(activity.includes('账单'));
  });

  test('supports native offline member ownership and filtering for family use', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
    assert.ok(activity.includes('member_id TEXT NOT NULL DEFAULT \'self\''));
    assert.ok(activity.includes('ensureMemberIdColumn'));
    assert.ok(activity.includes('currentMemberFilter'));
    assert.ok(activity.includes('memberFilterButton'));
    assert.ok(activity.includes('全部成员'));
    assert.ok(activity.includes('memberLabelFor'));
    assert.ok(activity.includes('memberIdFor'));
    assert.ok(activity.includes('selectMemberButton'));
    assert.ok(activity.includes('createNote(String title, String content, String category, String tags, String memberId)'));
    assert.ok(activity.includes('updateNote(long id, String title, String content, String category, String tags, String memberId)'));
    assert.ok(activity.includes('listNotes(String searchQuery, String categoryFilter, String tagFilter, String memberFilter)'));
    assert.ok(activity.includes('payload.put("memberId", memberIdFor(mutation.memberId))'));
    assert.ok(activity.includes('n.member_id'));
    assert.ok(activity.includes('成员：'));
    assert.equal(activity.includes('老婆'), false);
    assert.equal(activity.includes('妈妈'), false);
    assert.equal(activity.includes('爸爸'), false);
  });

  test('supports native offline basic rich text formatting for daily notes', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('richText(note.content.length() == 0 ? "没有正文" : note.content'));
    assert.ok(activity.includes('addRichTextToolbar(page, contentInput)'));
    assert.ok(activity.includes('formatButton("加粗", "**", "**", contentInput)'));
    assert.ok(activity.includes('formatButton("斜体", "*", "*", contentInput)'));
    assert.ok(activity.includes('formatButton("下划线", "__", "__", contentInput)'));
    assert.ok(activity.includes('formatButton("删除线", "~~", "~~", contentInput)'));
    assert.ok(activity.includes('insertLinePrefixButton("标题", "# ", contentInput)'));
    assert.ok(activity.includes('insertLinePrefixButton("列表", "- ", contentInput)'));
    assert.ok(activity.includes('insertLinePrefixButton("待办", "- [ ] ", contentInput)'));
    assert.ok(activity.includes('toRichSpannable'));
    assert.ok(activity.includes('SpannableStringBuilder'));
    assert.ok(activity.includes('StyleSpan(Typeface.BOLD)'));
    assert.ok(activity.includes('StyleSpan(Typeface.ITALIC)'));
    assert.ok(activity.includes('UnderlineSpan'));
    assert.ok(activity.includes('StrikethroughSpan'));
    assert.ok(activity.includes('☐ '));
    assert.ok(activity.includes('☑ '));
  });
  test('supports native offline local attachments saved on the phone', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('DATABASE_VERSION = 9'));
    assert.ok(activity.includes('REQUEST_PICK_ATTACHMENT'));
    assert.ok(activity.includes('Intent.ACTION_OPEN_DOCUMENT'));
    assert.ok(activity.includes('onActivityResult'));
    assert.ok(activity.includes('copyAttachmentToLocalStorage'));
    assert.ok(activity.includes('getAttachmentDisplayName'));
    assert.ok(activity.includes('FileOutputStream'));
    assert.ok(activity.includes('ContentResolver'));
    assert.ok(activity.includes('CREATE TABLE IF NOT EXISTS note_attachments'));
    assert.ok(activity.includes('ensureAttachmentsTable'));
    assert.ok(activity.includes('createAttachmentsTable(db);'));
    assert.ok(activity.includes('oldVersion < 9'));
    assert.ok(activity.includes('ensureAttachmentsTable(db);'));
    assert.ok(activity.includes('createAttachment(long noteId'));
    assert.ok(activity.includes('listAttachments(long noteId)'));
    assert.ok(activity.includes('NoteAttachment'));
    assert.ok(activity.includes('添加附件 / 图片'));
    assert.ok(activity.includes('本机附件'));
    assert.ok(activity.includes('保存在这台手机本地'));
  });
});


