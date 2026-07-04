const OFFLINE_DB_NAME = 'home-notes-offline-first-v1';
const OFFLINE_DB_VERSION = 1;

const STORE_NAMES = ['notes', 'attachments', 'categories', 'members', 'tags', 'syncQueue', 'meta'];

function canUseIndexedDb() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
}

async function openOfflineDb() {
  if (!canUseIndexedDb()) return null;

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', { keyPath: 'id' });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('attachments')) {
        const store = db.createObjectStore('attachments', { keyPath: 'id' });
        store.createIndex('noteId', 'noteId', { unique: false });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
      }
      if (!db.objectStoreNames.contains('categories')) db.createObjectStore('categories', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('members')) db.createObjectStore('members', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('tags')) db.createObjectStore('tags', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
  });
}

async function getAll(storeName) {
  const db = await openOfflineDb();
  if (!db) return [];
  const transaction = db.transaction(storeName, 'readonly');
  const result = await requestToPromise(transaction.objectStore(storeName).getAll());
  db.close();
  return Array.isArray(result) ? result : [];
}

async function putMany(storeName, items = []) {
  const db = await openOfflineDb();
  if (!db) return;
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  for (const item of items) {
    if (item?.id) store.put(item);
  }
  await transactionDone(transaction);
  db.close();
}

async function putMeta(key, value) {
  const db = await openOfflineDb();
  if (!db) return;
  const transaction = db.transaction('meta', 'readwrite');
  transaction.objectStore('meta').put({ key, value, updatedAt: new Date().toISOString() });
  await transactionDone(transaction);
  db.close();
}

async function getMeta(key) {
  const db = await openOfflineDb();
  if (!db) return null;
  const transaction = db.transaction('meta', 'readonly');
  const result = await requestToPromise(transaction.objectStore('meta').get(key));
  db.close();
  return result?.value ?? null;
}

export async function saveLocalSnapshot(snapshot = {}) {
  const notes = Array.isArray(snapshot.notes) ? snapshot.notes : [];
  const categories = Array.isArray(snapshot.categories) ? snapshot.categories : [];
  const members = Array.isArray(snapshot.members) ? snapshot.members : [];
  const tags = Array.isArray(snapshot.tags) ? snapshot.tags : [];

  await putMany('notes', notes.map((note) => ({
    ...note,
    syncStatus: note.syncStatus || 'synced',
    isOffline: Boolean(note.isOffline),
    localUpdatedAt: note.localUpdatedAt || new Date().toISOString()
  })));
  await putMany('categories', categories);
  await putMany('members', members);
  await putMany('tags', tags.map((tag, index) => ({ id: tag.id || tag.name || tag.label || `tag-${index}`, ...tag })));
  await putMeta('snapshot', {
    currentMemberId: snapshot.currentMemberId || 'self',
    savedAt: snapshot.savedAt || new Date().toISOString()
  });
}

export async function readLocalSnapshot() {
  const [notes, categories, members, tags, meta] = await Promise.all([
    getAll('notes'),
    getAll('categories'),
    getAll('members'),
    getAll('tags'),
    getMeta('snapshot')
  ]);

  if (!notes.length && !categories.length && !members.length) return null;

  return {
    notes,
    categories,
    members,
    tags,
    currentMemberId: meta?.currentMemberId || 'self',
    savedAt: meta?.savedAt || null
  };
}

export async function upsertLocalNote(localNote) {
  if (!localNote?.id) return;
  await putMany('notes', [{
    ...localNote,
    localUpdatedAt: new Date().toISOString()
  }]);
}

export async function deleteLocalNote(noteId) {
  const db = await openOfflineDb();
  if (!db || !noteId) return;
  const transaction = db.transaction('notes', 'readwrite');
  transaction.objectStore('notes').delete(noteId);
  await transactionDone(transaction);
  db.close();
}

export async function queueLocalMutation(mutation) {
  if (!mutation?.action || !mutation?.payload) return null;
  const now = new Date().toISOString();
  const item = {
    id: mutation.id || `mutation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    action: mutation.action,
    noteId: mutation.noteId || mutation.localId || null,
    localId: mutation.localId || mutation.noteId || null,
    serverId: mutation.serverId || null,
    payload: mutation.payload,
    status: 'pending',
    createdAt: mutation.createdAt || now,
    updatedAt: now,
    attempts: mutation.attempts || 0,
    lastError: null
  };
  await putMany('syncQueue', [item]);
  return item;
}

export async function readPendingMutations() {
  const mutations = await getAll('syncQueue');
  return mutations
    .filter((item) => item.status !== 'synced')
    .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
}

export async function markMutationSynced(mutationId) {
  const db = await openOfflineDb();
  if (!db || !mutationId) return;
  const transaction = db.transaction('syncQueue', 'readwrite');
  transaction.objectStore('syncQueue').delete(mutationId);
  await transactionDone(transaction);
  db.close();
}

export async function markMutationFailed(mutation, errorMessage) {
  if (!mutation?.id) return;
  await putMany('syncQueue', [{
    ...mutation,
    status: 'failed',
    attempts: Number(mutation.attempts || 0) + 1,
    lastError: errorMessage || 'sync failed',
    updatedAt: new Date().toISOString()
  }]);
}

export { OFFLINE_DB_NAME, OFFLINE_DB_VERSION, STORE_NAMES };
