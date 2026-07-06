export function buildSyncRequestDescriptor(mutation) {
  const isUpdate = mutation?.action === 'update';
  const noteId = mutation?.serverId || mutation?.noteId;
  return {
    endpoint: isUpdate ? '/api/notes/' + encodeURIComponent(noteId) : '/api/notes',
    method: isUpdate ? 'PATCH' : 'POST',
    payload: mutation?.payload || {}
  };
}

export async function syncPendingMutationBatch({
  readPendingMutations,
  requestMutation,
  normalizeSyncedNote = (note) => note,
  upsertLocalNote,
  deleteLocalNote,
  markMutationSynced,
  markMutationFailed,
  onMutationSynced = () => {}
}) {
  const mutations = await readPendingMutations();
  if (!mutations.length) {
    return {
      syncedCount: 0,
      failedMessage: '',
      failedMutation: null
    };
  }

  let syncedCount = 0;
  let failedMessage = '';
  let failedMutation = null;

  for (const mutation of mutations) {
    try {
      const syncedNote = normalizeSyncedNote(await requestMutation(mutation), mutation);
      await upsertLocalNote({ ...syncedNote, syncStatus: 'synced', isOffline: false });
      if (mutation.localId && mutation.localId !== syncedNote.id) await deleteLocalNote(mutation.localId);
      await markMutationSynced(mutation.id);
      onMutationSynced({ mutation, syncedNote });
      syncedCount += 1;
    } catch (error) {
      failedMessage = error?.message || 'sync failed';
      failedMutation = mutation;
      await markMutationFailed(mutation, failedMessage);
      break;
    }
  }

  return {
    syncedCount,
    failedMessage,
    failedMutation
  };
}
