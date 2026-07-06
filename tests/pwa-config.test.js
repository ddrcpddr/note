import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('PWA and NAS deployment config', () => {
  test('keeps installable PWA manifest and runtime icons wired', () => {
    const manifest = JSON.parse(readText('public/manifest.webmanifest'));
    const indexHtml = readText('index.html');

    assert.equal(manifest.name, '家事记');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.orientation, 'portrait');
    assert.equal(manifest.start_url, '/');
    assert.match(indexHtml, /rel="manifest" href="\/manifest\.webmanifest"/);
    assert.match(indexHtml, /apple-mobile-web-app-capable/);

    const icons = new Map(manifest.icons.map((icon) => [`${icon.sizes}:${icon.purpose}`, icon.src]));
    assert.equal(icons.get('192x192:any'), '/icons/app-icon-192.png');
    assert.equal(icons.get('512x512:any'), '/icons/app-icon-512.png');
    assert.equal(icons.get('512x512:maskable'), '/icons/app-icon-maskable-512.png');

    for (const icon of manifest.icons) {
      assert.equal(existsSync(path.join(repoRoot, 'public', icon.src)), true, `${icon.src} should exist`);
    }
  });

  test('registers an app-shell service worker without caching API data', () => {
    const source = readText('src/client/main.jsx');
    const sw = readText('public/sw.js');

    assert.ok(source.includes("navigator.serviceWorker.register(apiUrl('/sw.js'))"));
    assert.ok(source.includes("window.location.protocol !== 'file:'"));
    assert.ok(sw.includes("const APP_CACHE = 'home-notes-app-shell-v1'"));
    assert.ok(sw.includes("'/manifest.webmanifest'"));
    assert.ok(sw.includes("url.pathname.startsWith('/api/')"));
    assert.ok(sw.includes("networkThenCache(request, '/')"));
    assert.ok(sw.includes('cacheFirst(request)'));
  });

  test('keeps Docker build context free from private runtime data patterns', () => {
    const dockerignore = readText('.dockerignore');

    for (const pattern of ['data', '*.nsx', '*.db', '*.sqlite', 'backups', 'exports', 'attachments', 'logs', '*.log', 'output']) {
      assert.ok(dockerignore.split(/\r?\n/).includes(pattern), `${pattern} should be ignored`);
    }
  });
});