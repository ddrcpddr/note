function parseArgs(argv) {
  const options = {
    baseUrl: 'http://127.0.0.1:3300',
    readOnly: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1];
      index += 1;
    } else if (arg === '--read-only') {
      options.readOnly = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.baseUrl = options.baseUrl.replace(/\/+$/, '');
  return options;
}

async function requestJson(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${route} returned ${response.status}: ${text}`);
  }
  return data;
}

async function requestText(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`);
  const text = await response.text();
  return { response, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runCheck(checks, name, fn) {
  try {
    const result = await fn();
    checks.push({ name, ok: true, ...(result || {}) });
  } catch (error) {
    checks.push({ name, ok: false, error: error.message });
  }
}

export async function runHttpSmoke(options) {
  const checks = [];
  let appData;
  let noteList;
  let firstNote;

  await runCheck(checks, 'health', async () => {
    const health = await requestJson(options.baseUrl, '/api/health');
    assert(health.ok === true, 'health.ok should be true');
    assert(health.dbPath, 'health should include dbPath');
    return { dbPath: health.dbPath };
  });

  await runCheck(checks, 'app-data', async () => {
    appData = await requestJson(options.baseUrl, '/api/app-data');
    assert(Array.isArray(appData.members) && appData.members.length >= 2, 'app-data should include members');
    assert(Array.isArray(appData.categories) && appData.categories.length >= 1, 'app-data should include categories');
    assert(Array.isArray(appData.notes), 'app-data should include notes');
    return { members: appData.members.length, categories: appData.categories.length, notes: appData.notes.length };
  });

  await runCheck(checks, 'notes-list', async () => {
    noteList = await requestJson(options.baseUrl, '/api/notes?limit=3');
    assert(Array.isArray(noteList.notes), 'notes list should include notes array');
    assert(noteList.notes.length >= 1, 'notes list should include at least one note');
    firstNote = noteList.notes[0];
    return { notes: noteList.notes.length, firstNoteId: firstNote.id };
  });

  await runCheck(checks, 'note-detail', async () => {
    assert(firstNote?.id, 'first note id should exist before detail check');
    const detail = await requestJson(options.baseUrl, `/api/notes?id=${encodeURIComponent(firstNote.id)}`);
    assert(detail.notes?.length === 1, 'detail query should return exactly one note');
    assert(detail.notes[0].id === firstNote.id, 'detail note id should match');
    return { noteId: firstNote.id };
  });

  await runCheck(checks, 'search', async () => {
    const keyword = String(firstNote?.title || '').slice(0, 2) || '家';
    const result = await requestJson(options.baseUrl, `/api/notes?search=${encodeURIComponent(keyword)}`);
    assert(Array.isArray(result.notes), 'search should return notes array');
    return { keyword, notes: result.notes.length };
  });

  await runCheck(checks, 'category-filter', async () => {
    const categoryId = firstNote?.categoryId || appData?.categories?.[0]?.id;
    assert(categoryId, 'category id should exist');
    const result = await requestJson(options.baseUrl, `/api/notes?category=${encodeURIComponent(categoryId)}`);
    assert(Array.isArray(result.notes), 'category filter should return notes array');
    return { categoryId, notes: result.notes.length };
  });

  await runCheck(checks, 'member-filter', async () => {
    const memberId = firstNote?.memberId || appData?.members?.[0]?.id;
    assert(memberId, 'member id should exist');
    const result = await requestJson(options.baseUrl, `/api/notes?member=${encodeURIComponent(memberId)}`);
    assert(Array.isArray(result.notes), 'member filter should return notes array');
    return { memberId, notes: result.notes.length };
  });

  await runCheck(checks, 'categories-api', async () => {
    const result = await requestJson(options.baseUrl, '/api/categories');
    assert(Array.isArray(result.categories) && result.categories.length >= 1, 'categories api should include categories');
    return { categories: result.categories.length };
  });

  if (!options.readOnly) {
    await runCheck(checks, 'storage-probe', async () => {
      const result = await requestJson(options.baseUrl, '/api/storage/probe', { method: 'POST' });
      assert(result.ok === true, 'storage probe should be ok');
      return { checked: Object.keys(result.checks || {}).length };
    });

    await runCheck(checks, 'manual-backup', async () => {
      const result = await requestJson(options.baseUrl, '/api/storage/backup', {
        method: 'POST',
        body: JSON.stringify({ nasOnline: true })
      });
      assert(result.backup?.fileSize > 0, 'backup should have fileSize');
      return { fileSize: result.backup.fileSize };
    });

    await runCheck(checks, 'json-export', async () => {
      const result = await requestJson(options.baseUrl, '/api/storage/export-json', { method: 'POST' });
      assert(result.export?.fileSize > 0, 'export should have fileSize');
      return { fileSize: result.export.fileSize };
    });
  }

  await runCheck(checks, 'frontend-shell', async () => {
    const { response, text } = await requestText(options.baseUrl, '/');
    if (response.status === 404) {
      return { skipped: true, reason: 'dist/ frontend is not being served in this mode' };
    }
    assert(response.ok, `frontend shell returned ${response.status}`);
    assert(/<html|<!doctype|id="root"/i.test(text), 'frontend shell should look like HTML');
    return { status: response.status };
  });

  return {
    ok: checks.every((check) => check.ok),
    baseUrl: options.baseUrl,
    readOnly: options.readOnly,
    checks
  };
}

if (process.argv[1] && process.argv[1].endsWith('http-smoke.js')) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await runHttpSmoke(options);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
