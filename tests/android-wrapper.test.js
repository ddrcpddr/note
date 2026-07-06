import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Android WebView wrapper', () => {
  test('provides configurable server address before loading the NAS web app', () => {
    assert.equal(existsSync(path.join(repoRoot, 'android/settings.gradle')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/build.gradle')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/AndroidManifest.xml')), true);
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/java/com/homeoldnote/app/MainActivity.java')), true);
    assert.equal(existsSync(path.join(repoRoot, 'scripts/build-android-debug.js')), true);

    const manifest = readText('android/app/src/main/AndroidManifest.xml');
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');
    const strings = readText('android/app/src/main/res/values/strings.xml');
    const buildScript = readText('scripts/build-android-debug.js');

    assert.ok(manifest.includes('android.permission.INTERNET'));
    assert.ok(manifest.includes('android:usesCleartextTraffic="true"'));
    assert.ok(manifest.includes('android:networkSecurityConfig="@xml/network_security_config"'));
    assert.ok(strings.includes('家事记'));

    assert.ok(activity.includes('WebView'));
    assert.ok(activity.includes('SharedPreferences'));
    assert.ok(activity.includes('server_url'));
    assert.ok(activity.includes('showSettings'));
    assert.ok(activity.includes('loadServer'));
    assert.ok(activity.includes('onReceivedError'));
    assert.ok(activity.includes('LOCAL_APP_URL'));
    assert.ok(activity.includes('file:///android_asset/www/index.html'));
    assert.ok(activity.includes('loadLocalApp'));
    assert.ok(activity.includes('离线使用'));
    assert.ok(activity.includes('getServerUrl'));
    assert.ok(activity.includes('settings.setAllowFileAccessFromFileURLs(true)'));
    assert.ok(activity.includes('settings.setAllowUniversalAccessFromFileURLs(true)'));
    assert.ok(activity.includes('保存并打开'));
    assert.ok(activity.includes('修改服务器地址'));
    assert.ok(activity.includes('http://192.168.1.100:3300'));

    assert.ok(activity.includes('WebChromeClient'));
    assert.ok(activity.includes('onShowFileChooser'));
    assert.ok(activity.includes('ValueCallback<Uri[]>'));
    assert.ok(activity.includes('ACTION_OPEN_DOCUMENT'));
    assert.ok(activity.includes('FILE_CHOOSER_REQUEST_CODE'));
    assert.ok(activity.includes('onActivityResult'));
    assert.ok(buildScript.includes('aapt2'));
    assert.ok(buildScript.includes('d8'));
    assert.ok(buildScript.includes('zipalign'));
    assert.ok(buildScript.includes('apksigner'));
    assert.ok(buildScript.includes('app-debug.apk'));
    assert.ok(buildScript.includes("path.join(stagedAppRoot, 'src', 'main', 'assets', 'www')"));
    assert.ok(buildScript.includes('copyDir(distRoot, stagedWebRoot)'));
    assert.ok(buildScript.includes('Building frontend for Android asset bundle'));
    assert.equal(buildScript.includes("'-A', path.join(stagedAppRoot, 'src', 'main', 'assets')"), false);
    assert.ok(buildScript.includes("run(jar, ['uf', unsignedApk, '-C', path.join(stagedAppRoot, 'src', 'main'), 'assets'])"));
    assert.ok(buildScript.includes('function assertAndroidAssets(apkFile)'));
    assert.ok(buildScript.includes("entries.includes('assets/www/index.html')"));
    assert.ok(buildScript.includes("entry.includes('\\\\')"));
  });


  test('ships a launcher icon for the installed APK', () => {
    const manifest = readText('android/app/src/main/AndroidManifest.xml');

    assert.ok(manifest.includes('android:icon="@drawable/app_icon"'));
    assert.equal(existsSync(path.join(repoRoot, 'android/app/src/main/res/drawable/app_icon.png')), true);
  });
  test('guards Huawei and older Android WebView editor failures', () => {
    const activity = readText('android/app/src/main/java/com/homeoldnote/app/MainActivity.java');

    assert.ok(activity.includes('WebView.setWebContentsDebuggingEnabled(true)'));
    assert.ok(activity.includes('settings.setTextZoom(100)'));
    assert.ok(activity.includes('settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE)'));
    assert.ok(activity.includes('addJavascriptInterface(new AndroidBridge(), "HomeNoteAndroid")'));
    assert.ok(activity.includes('onConsoleMessage(ConsoleMessage consoleMessage)'));
    assert.ok(activity.includes('injectRuntimeErrorHook(view)'));
    assert.ok(activity.includes("window.addEventListener('error'"));
    assert.ok(activity.includes("window.addEventListener('unhandledrejection'"));
    assert.ok(activity.includes('onRenderProcessGone'));
    assert.ok(activity.includes('页面脚本异常'));
  });
});
