import { readAttachmentsFromSqlite, upsertAttachmentsToSqlite } from '../data/local/localAttachmentsRepository.js';
import { readCategoriesFromSqlite, upsertCategoriesToSqlite } from '../data/local/localCategoriesRepository.js';
import { initializeLocalDatabase, shouldUseNativeSqlite } from '../data/local/localDb.js';
import { readMembersFromSqlite, upsertMembersToSqlite } from '../data/local/localMembersRepository.js';
import { readTagsFromSqlite, upsertTagsToSqlite } from '../data/local/localTagsRepository.js';
import { deleteLocalNoteFromSqlite, markLocalNoteArchivedInSqlite, readLocalNotesFromSqlite, upsertLocalNoteToSqlite } from '../data/local/localNotesRepository.js';
import { markMutationFailedInSqlite, queueMutationToSqlite, readPendingMutationsFromSqlite, removeMutationFromSqlite } from '../data/local/syncQueueRepository.js';

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
    if (item?.id) store.put(toIndexedDbSafeValue(item));
  }
  await transactionDone(transaction);
  db.close();
}

async function putMeta(key, value) {
  const db = await openOfflineDb();
  if (!db) return;
  const transaction = db.transaction('meta', 'readwrite');
  transaction.objectStore('meta').put(toIndexedDbSafeValue({ key, value, updatedAt: new Date().toISOString() }));
  await transactionDone(transaction);
  db.close();
}

function isCloneableBinary(value) {
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  if (value instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(value)) return true;
  return false;
}

function toIndexedDbSafeValue(value, seen = new WeakSet()) {
  if (value === null) return null;
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint') return value;
  if (type === 'undefined' || type === 'function' || type === 'symbol') return undefined;
  if (value instanceof Date) return value.toISOString();
  if (isCloneableBinary(value)) return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => toIndexedDbSafeValue(item, seen))
      .filter((item) => item !== undefined);
  }
  if (type !== 'object') return undefined;
  if (seen.has(value)) return undefined;
  seen.add(value);

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    const safeItem = toIndexedDbSafeValue(item, seen);
    if (safeItem !== undefined) output[key] = safeItem;
  }
  seen.delete(value);
  return output;
}

function extractSnapshotAttachments(snapshot = {}, notes = []) {
  const byId = new Map();
  const addAttachment = (attachment, fallbackNoteId = null, index = 0) => {
    if (!attachment) return;
    const noteId = attachment.noteId || attachment.note_id || fallbackNoteId;
    const filename = attachment.filename || attachment.name || attachment.fileName || '附件';
    const id = attachment.id || attachment.localId || `${noteId || 'note'}-${filename}-${index}`;
    if (!id || byId.has(id)) return;
    byId.set(id, { ...attachment, id, noteId, filename, name: attachment.name || filename });
  };

  if (Array.isArray(snapshot.attachments)) snapshot.attachments.forEach((attachment, index) => addAttachment(attachment, attachment.noteId, index));
  notes.forEach((note) => {
    if (!Array.isArray(note?.attachments)) return;
    note.attachments.forEach((attachment, index) => addAttachment(attachment, note.id, index));
  });
  return [...byId.values()].filter((attachment) => attachment.id && attachment.noteId);
}
async function getMeta(key) {
  const db = await openOfflineDb();
  if (!db) return null;
  const transaction = db.transaction('meta', 'readonly');
  const result = await requestToPromise(transaction.objectStore('meta').get(key));
  db.close();
  return result?.value ?? null;
}

export async function initializeLocalStore() {
  return initializeLocalDatabase();
}
export async function saveLocalSnapshot(snapshot = {}) {
  await initializeLocalStore();
  const notes = Array.isArray(snapshot.notes) ? snapshot.notes : [];
  const categories = Array.isArray(snapshot.categories) ? snapshot.categories : [];
  const members = Array.isArray(snapshot.members) ? snapshot.members : [];
  const tags = Array.isArray(snapshot.tags) ? snapshot.tags : [];
  const attachments = extractSnapshotAttachments(snapshot, notes);

  await putMany('notes', notes.map((note) => ({
    ...note,
    syncStatus: note.syncStatus || 'synced',
    isOffline: Boolean(note.isOffline),
    localUpdatedAt: note.localUpdatedAt || new Date().toISOString()
  })));
  await putMany('categories', categories);
  await putMany('members', members);
  await putMany('tags', tags.map((tag, index) => ({ id: tag.id || tag.name || tag.label || `tag-${index}`, ...tag })));
  await putMany('attachments', attachments);
  await putMeta('snapshot', {
    currentMemberId: snapshot.currentMemberId || 'self',
    savedAt: snapshot.savedAt || new Date().toISOString()
  });
  if (shouldUseNativeSqlite()) {
    await upsertCategoriesToSqlite(categories);
    await upsertMembersToSqlite(members);
    await upsertTagsToSqlite(tags);
    await upsertAttachmentsToSqlite(attachments);
    for (const note of notes) await upsertLocalNoteToSqlite(note);
  }
}

export async function readLocalSnapshot() {
  await initializeLocalStore();
  if (shouldUseNativeSqlite()) {
    const sqliteNotes = await readLocalNotesFromSqlite();
    const [categories, members, tags, attachments, meta] = await Promise.all([
      readCategoriesFromSqlite(),
      readMembersFromSqlite(),
      readTagsFromSqlite(),
      readAttachmentsFromSqlite(),
      getMeta('snapshot')
    ]);
    if (sqliteNotes.length || categories.length || members.length) {
      const notesWithAttachments = sqliteNotes.map((note) => ({
        ...note,
        attachments: Array.isArray(note.attachments) && note.attachments.length
          ? note.attachments
          : attachments.filter((attachment) => attachment.noteId === note.id)
      }));
      return { notes: notesWithAttachments, categories, members, tags, attachments, currentMemberId: meta?.currentMemberId || 'self', savedAt: meta?.savedAt || null };
    }
  }

  const [notes, categories, members, tags, attachments, meta] = await Promise.all([
    getAll('notes'),
    getAll('categories'),
    getAll('members'),
    getAll('tags'),
    getAll('attachments'),
    getMeta('snapshot')
  ]);

  if (!notes.length && !categories.length && !members.length) return null;

  return {
    notes,
    categories,
    members,
    tags,
    attachments,
    currentMemberId: meta?.currentMemberId || 'self',
    savedAt: meta?.savedAt || null
  };
}

export async function upsertLocalNote(localNote) {
  if (!localNote?.id) return;
  await initializeLocalStore();
  if (shouldUseNativeSqlite()) {
    await upsertAttachmentsToSqlite(extractSnapshotAttachments({}, [localNote]));
    await upsertLocalNoteToSqlite(localNote);
  }
  await putMany('notes', [{
    ...localNote,
    localUpdatedAt: new Date().toISOString()
  }]);
}

export async function deleteLocalNote(noteId) {
  await initializeLocalStore();
  if (shouldUseNativeSqlite()) await deleteLocalNoteFromSqlite(noteId);
  const db = await openOfflineDb();
  if (!db || !noteId) return;
  const transaction = db.transaction('notes', 'readwrite');
  transaction.objectStore('notes').delete(noteId);
  await transactionDone(transaction);
  db.close();
}

export async function queueLocalMutation(mutation) {
  if (!mutation?.action || !mutation?.payload) return null;
  await initializeLocalStore();
  const now = new Date().toISOString();
  const localId = mutation.localId || mutation.noteId || null;
  const existingMutations = await getAll('syncQueue');
  const existingCreate = existingMutations.find((item) => (
    item.status !== 'synced'
    && item.action === 'create'
    && item.localId === localId
    && String(localId || '').startsWith('local-')
  ));

  if (existingCreate && mutation.action === 'update') {
    const mergedCreate = {
      ...existingCreate,
      payload: mutation.payload,
      status: 'pending',
      updatedAt: now,
      lastError: null
    };
    await putMany('syncQueue', [mergedCreate]);
    if (shouldUseNativeSqlite()) await queueMutationToSqlite(mergedCreate);
    return mergedCreate;
  }

  const item = {
    id: mutation.id || `mutation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    action: mutation.action,
    noteId: mutation.noteId || mutation.localId || null,
    localId,
    serverId: mutation.serverId || null,
    payload: mutation.payload,
    status: 'pending',
    createdAt: mutation.createdAt || now,
    updatedAt: now,
    attempts: mutation.attempts || 0,
    lastError: null
  };
  await putMany('syncQueue', [item]);
  if (shouldUseNativeSqlite()) await queueMutationToSqlite(item);
  return item;
}

export async function readPendingMutations() {
  await initializeLocalStore();
  if (shouldUseNativeSqlite()) {
    const sqliteMutations = await readPendingMutationsFromSqlite();
    if (sqliteMutations.length) return sqliteMutations;
  }
  const mutations = await getAll('syncQueue');
  return mutations
    .filter((item) => item.status !== 'synced')
    .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
}

export async function markMutationSynced(mutationId) {
  await initializeLocalStore();
  if (shouldUseNativeSqlite()) await removeMutationFromSqlite(mutationId);
  const db = await openOfflineDb();
  if (!db || !mutationId) return;
  const transaction = db.transaction('syncQueue', 'readwrite');
  transaction.objectStore('syncQueue').delete(mutationId);
  await transactionDone(transaction);
  db.close();
}

export async function markMutationFailed(mutation, errorMessage) {
  if (!mutation?.id) return;
  await initializeLocalStore();
  if (shouldUseNativeSqlite()) await markMutationFailedInSqlite(mutation, errorMessage);
  await putMany('syncQueue', [{
    ...mutation,
    status: 'failed',
    attempts: Number(mutation.attempts || 0) + 1,
    lastError: errorMessage || 'sync failed',
    updatedAt: new Date().toISOString()
  }]);
}

export { OFFLINE_DB_NAME, OFFLINE_DB_VERSION, STORE_NAMES, toIndexedDbSafeValue, markLocalNoteArchivedInSqlite };


