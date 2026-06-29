import { Router } from 'express';
import {
  commitNotestationImport,
  createNotestationDryRunPreview,
  createNotestationSamplePreview,
  getImportPreview
} from '../importers/notestation/index.js';
import { listNotes } from './notes.js';

export const importsRouter = Router();

importsRouter.post('/notestation/sample-preview', (request, response) => {
  const memberId = request.body?.memberId || 'history';
  response.status(201).json(createNotestationSamplePreview(memberId));
});

importsRouter.post('/notestation/dry-run', (request, response) => {
  response.json(createNotestationDryRunPreview(request.body || {}));
});

importsRouter.get('/notestation/:importId', (request, response) => {
  try {
    response.json(getImportPreview(request.params.importId));
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
});

importsRouter.post('/notestation/:importId/commit', (request, response) => {
  try {
    const memberId = request.body?.memberId || 'history';
    const result = commitNotestationImport(request.params.importId, memberId);
    const notes = result.importedNoteIds?.length
      ? listNotes({ limit: 'all' }).filter((note) => result.importedNoteIds.includes(note.id))
      : [];
    response.json({ ...result, notes });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

