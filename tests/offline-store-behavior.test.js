import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import {
  markMutationFailed,
  markMutationSynced,
  queueLocalMutation,
  readLocalSnapshot,
  readPendingMutations,
  saveLocalSnapshot,
  toIndexedDbSafeValue,
  upsertLocalNote
} from '../src/client/offlineStore.js';

class FakeObjectStoreNames {
  constructor(stores) {
    this.stores = stores;
  }

  contains(name) {
    return this.stores.has(name);
  }
}

function completeRequest(request, result) {
  setTimeout(() => {
    request.result = result;
    request.onsuccess?.({ target: request });
  }, 0);
  return request;
}

function createFakeIndexedDb() {
  const stores = new Map();

  class FakeObjectStore {
    constructor(name, keyPath) {
      this.name = name;
      this.keyPath = keyPath;
    }

    createIndex() {}

    put(value) {
      const key = value?.[this.keyPath];
      if (!key) throw new Error(`Missing keyPath ${this.keyPath} for ${this.name}`);
      stores.get(this.name).records.set(key, structuredClone(value));
      return completeRequest({}, key);
    }

    get(key) {
      const value = stores.get(this.name).records.get(key) ?? undefined;
      return completeRequest({}, value === undefined ? undefined : structuredClone(value));
    }

    getAll() {
      return completeRequest({}, [...stores.get(this.name).records.values()].map((value) => structuredClone(value)));
    }

    delete(key) {
      stores.get(this.name).records.delete(key);
      return completeRequest({}, undefined);
    }
  }

  class FakeTransaction {
    constructor() {
      setTimeout(() => this.oncomplete?.(), 0);
    }

    objectStore(name) {
      const store = stores.get(name);
      if (!store) throw new Error(`Missing store ${name}`);
      return new FakeObjectStore(name, store.keyPath);
    }
  }

  class FakeDb {
    constructor() {
      this.objectStoreNames = new FakeObjectStoreNames(stores);
    }

    createObjectStore(name, options = {}) {
      stores.set(name, {
        keyPath: options.keyPath || 'id',
        records: new Map()
      });
      return new FakeObjectStore(name, stores.get(name).keyPath);
    }

    transaction() {
      return new FakeTransaction();
    }

    close() {}
  }

  const db = new FakeDb();

  return {
    open() {
      const request = {};
      setTimeout(() => {
        request.result = db;
        request.onupgradeneeded?.({ target: request });
        request.onsuccess?.({ target: request });
      }, 0);
      return request;
    }
  };
}

beforeEach(() => {
  globalThis.window = {
    indexedDB: createFakeIndexedDb()
  };
});

describe('offline IndexedDB behavior', () => {
  test('persists and restores the local snapshot used by the offline Android app', async () => {
    await saveLocalSnapshot({
      notes: [{
        id: 'local-note-1',
        title: '离线记录',
        content: '断网时写下的内容',
        syncStatus: 'dirty',
        isOffline: true
      }],
      categories: [{ id: 'family', name: '家庭事务' }],
      members: [{ id: 'self', name: '我' }],
      tags: [{ id: 'todo', name: '待办' }],
      currentMemberId: 'self',
      savedAt: '2026-07-06T01:00:00.000Z'
    });

    const snapshot = await readLocalSnapshot();

    assert.equal(snapshot.currentMemberId, 'self');
    assert.equal(snapshot.notes.length, 1);
    assert.equal(snapshot.notes[0].title, '离线记录');
    assert.equal(snapshot.notes[0].syncStatus, 'dirty');
    assert.equal(snapshot.categories[0].name, '家庭事务');
    assert.equal(snapshot.members[0].name, '我');
    assert.equal(snapshot.tags[0].name, '待办');
  });

  test('keeps the latest offline edit inside the pending create mutation for local notes', async () => {
    const localId = 'local-abc123';

    await queueLocalMutation({
      action: 'create',
      localId,
      payload: {
        id: localId,
        title: '离线初稿',
        contentText: '第一版'
      }
    });

    await queueLocalMutation({
      action: 'update',
      localId,
      payload: {
        id: localId,
        title: '离线最终稿',
        contentText: '第二版'
      }
    });

    const pending = await readPendingMutations();

    assert.equal(pending.length, 1);
    assert.equal(pending[0].action, 'create');
    assert.equal(pending[0].localId, localId);
    assert.equal(pending[0].payload.title, '离线最终稿');
    assert.equal(pending[0].payload.contentText, '第二版');
  });

  test('keeps failed sync items visible for retry and removes them after success', async () => {
    const mutation = await queueLocalMutation({
      action: 'update',
      noteId: 42,
      serverId: 42,
      payload: {
        id: 42,
        title: '恢复联网后同步'
      }
    });

    await markMutationFailed(mutation, 'server unavailable');
    const failed = await readPendingMutations();

    assert.equal(failed.length, 1);
    assert.equal(failed[0].status, 'failed');
    assert.equal(failed[0].attempts, 1);
    assert.equal(failed[0].lastError, 'server unavailable');

    await markMutationSynced(failed[0].id);
    assert.deepEqual(await readPendingMutations(), []);
  });

  test('stores updated local notes and strips unsafe values before IndexedDB writes', async () => {
    const cyclic = { id: 'unsafe-note', title: '循环对象' };
    cyclic.self = cyclic;
    cyclic.skip = () => 'not cloneable';

    const safe = toIndexedDbSafeValue(cyclic);
    assert.equal(safe.id, 'unsafe-note');
    assert.equal(safe.title, '循环对象');
    assert.equal('self' in safe, false);
    assert.equal('skip' in safe, false);

    await upsertLocalNote({
      id: 'local-upsert',
      title: '本地编辑',
      contentText: '重启后仍应保留'
    });

    const snapshot = await readLocalSnapshot();
    assert.equal(snapshot.notes.length, 1);
    assert.equal(snapshot.notes[0].title, '本地编辑');
    assert.ok(snapshot.notes[0].localUpdatedAt);
  });
});
