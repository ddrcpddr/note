import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildSyncRequestDescriptor, syncPendingMutationBatch } from '../src/client/offlineSync.js';

describe('offline sync behavior', () => {
  test('builds create and update requests from queued mutations', () => {
    assert.deepEqual(buildSyncRequestDescriptor({
      action: 'create',
      payload: { title: '离线新增' }
    }), {
      endpoint: '/api/notes',
      method: 'POST',
      payload: { title: '离线新增' }
    });

    assert.deepEqual(buildSyncRequestDescriptor({
      action: 'update',
      serverId: 'note with spaces',
      payload: { title: '离线编辑' }
    }), {
      endpoint: '/api/notes/note%20with%20spaces',
      method: 'PATCH',
      payload: { title: '离线编辑' }
    });
  });

  test('syncs successful mutations, keeps the first failure for retry and stops the batch', async () => {
    const mutations = [
      {
        id: 'm-create',
        action: 'create',
        localId: 'local-1',
        payload: { title: '离线新增最终版' }
      },
      {
        id: 'm-update',
        action: 'update',
        noteId: 'note-2',
        serverId: 'note-2',
        payload: { title: '离线编辑服务端记录' }
      },
      {
        id: 'm-never-run',
        action: 'create',
        localId: 'local-3',
        payload: { title: '后续记录' }
      }
    ];

    const upserts = [];
    const deletedLocalIds = [];
    const syncedIds = [];
    const failed = [];
    const uiUpdates = [];
    const requested = [];

    const result = await syncPendingMutationBatch({
      readPendingMutations: async () => mutations,
      requestMutation: async (mutation) => {
        requested.push(mutation.id);
        if (mutation.id === 'm-update') throw new Error('server unavailable');
        return {
          id: 'note-created',
          title: mutation.payload.title,
          isOffline: true,
          syncStatus: 'local-only'
        };
      },
      normalizeSyncedNote: (note) => ({ ...note, title: `[synced] ${note.title}` }),
      upsertLocalNote: async (note) => upserts.push(note),
      deleteLocalNote: async (noteId) => deletedLocalIds.push(noteId),
      markMutationSynced: async (mutationId) => syncedIds.push(mutationId),
      markMutationFailed: async (mutation, message) => failed.push({ id: mutation.id, message }),
      onMutationSynced: (event) => uiUpdates.push(event)
    });

    assert.deepEqual(requested, ['m-create', 'm-update']);
    assert.equal(result.syncedCount, 1);
    assert.equal(result.failedMessage, 'server unavailable');
    assert.equal(result.failedMutation.id, 'm-update');
    assert.deepEqual(syncedIds, ['m-create']);
    assert.deepEqual(failed, [{ id: 'm-update', message: 'server unavailable' }]);
    assert.deepEqual(deletedLocalIds, ['local-1']);
    assert.equal(upserts.length, 1);
    assert.equal(upserts[0].id, 'note-created');
    assert.equal(upserts[0].title, '[synced] 离线新增最终版');
    assert.equal(upserts[0].isOffline, false);
    assert.equal(upserts[0].syncStatus, 'synced');
    assert.equal(uiUpdates.length, 1);
    assert.equal(uiUpdates[0].mutation.id, 'm-create');
    assert.equal(uiUpdates[0].syncedNote.id, 'note-created');
  });
});
