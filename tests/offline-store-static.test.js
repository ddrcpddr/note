import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Offline first local store', () => {
  test('defines an IndexedDB store for long-term offline notes and sync state', () => {
    const storePath = path.join(repoRoot, 'src/client/offlineStore.js');
    assert.equal(existsSync(storePath), true);

    const source = readText('src/client/offlineStore.js');

    assert.ok(source.includes("const OFFLINE_DB_NAME = 'home-notes-offline-first-v1'"));
    assert.ok(source.includes("const OFFLINE_DB_VERSION = 1"));
    assert.ok(source.includes("createObjectStore('notes'"));
    assert.ok(source.includes("createObjectStore('attachments'"));
    assert.ok(source.includes("createObjectStore('categories'"));
    assert.ok(source.includes("createObjectStore('members'"));
    assert.ok(source.includes("createObjectStore('tags'"));
    assert.ok(source.includes("createObjectStore('syncQueue'"));
    assert.ok(source.includes("createObjectStore('meta'"));
    assert.ok(source.includes('export async function saveLocalSnapshot'));
    assert.ok(source.includes('export async function readLocalSnapshot'));
    assert.ok(source.includes('export async function upsertLocalNote'));
    assert.ok(source.includes('export async function queueLocalMutation'));
    assert.ok(source.includes('export async function readPendingMutations'));
    assert.ok(source.includes('export async function markMutationSynced'));
  });

  test('compacts offline create then edit into one pending create mutation', () => {
    const source = readText('src/client/offlineStore.js');

    assert.ok(source.includes("const existingMutations = await getAll('syncQueue')"));
    assert.ok(source.includes("item.action === 'create'"));
    assert.ok(source.includes("String(localId || '').startsWith('local-')"));
    assert.ok(source.includes("if (existingCreate && mutation.action === 'update')"));
    assert.ok(source.includes('payload: mutation.payload'));
    assert.ok(source.includes('return mergedCreate'));
  });


  test('removes UI-only React values before IndexedDB structured cloning', async () => {
    const { toIndexedDbSafeValue } = await import('../src/client/offlineStore.js');
    const icon = () => null;
    const input = {
      id: 'category-family',
      name: '家庭事务',
      icon,
      categoryIcon: icon,
      nested: { keep: 'ok', bad: Symbol('react.forward_ref') },
      tags: [{ label: '待办', marker: Symbol('x') }]
    };

    const safe = toIndexedDbSafeValue(input);

    assert.equal(safe.id, 'category-family');
    assert.equal(safe.name, '家庭事务');
    assert.equal(safe.nested.keep, 'ok');
    assert.equal(safe.icon, undefined);
    assert.equal(safe.categoryIcon, undefined);
    assert.equal(safe.nested.bad, undefined);
    assert.deepEqual(safe.tags, [{ label: '待办' }]);
    assert.doesNotThrow(() => structuredClone(safe));
  });
  test('wires the React app to local-first storage before falling back to network-only behavior', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes("from './offlineStore.js'"));
    assert.ok(source.includes('safeReadLocalSnapshot()'));
    assert.ok(source.includes('safeSaveLocalSnapshot({'));
    assert.ok(source.includes('upsertLocalNote(localNote)'));
    assert.ok(source.includes('await refreshPendingMutationState()'));
    assert.ok(!source.includes('OFFLINE_CREATE_QUEUE_KEY'));
    assert.ok(source.includes("'local-only'"));
    assert.ok(source.includes("'dirty'"));
    assert.ok(source.includes('queueLocalMutation({'));
    assert.ok(source.includes('safeReadPendingMutations()'));
    assert.ok(source.includes('syncPendingLocalMutations()'));
    assert.ok(source.includes("if (dataMode === 'locked') return;"));
    assert.ok(source.includes('notes: notesData.slice(0, OFFLINE_APP_DATA_CACHE_LIMIT)'));
    assert.ok(source.includes("if (dataMode !== 'sqlite') return;"));
    assert.ok(source.includes("setDataMode('offline-first')"));
  });
});

