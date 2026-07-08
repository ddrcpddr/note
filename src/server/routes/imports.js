import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { getDataPaths } from '../db/database.js';
import {
  commitNotestationImport,
  createNotestationDryRunPreview,
  createNotestationNsxPreview,
  createNotestationSamplePreview,
  getImportPreview
} from '../importers/notestation/index.js';
import { listNotes } from './notes.js';

export const importsRouter = Router();

const MAX_NSX_UPLOAD_BYTES = 256 * 1024 * 1024;

importsRouter.post('/notestation/sample-preview', (request, response) => {
  const memberId = request.body?.memberId || 'self';
  response.status(201).json(createNotestationSamplePreview(memberId));
});

importsRouter.post('/notestation/dry-run', async (request, response) => {
  try {
    if (isNsxBinaryUpload(request)) {
      const uploaded = await saveNsxUpload(request);
      if (shouldPreviewAsync(request, uploaded.fileSize)) {
        const preview = createNotestationNsxPreview(uploaded.filePath, uploaded.memberId, { async: true });
        response.status(202).json(preview);
        return;
      }

      response.status(201).json(createNotestationNsxPreview(uploaded.filePath, uploaded.memberId));
      return;
    }

    response.json(createNotestationDryRunPreview(request.body || {}));
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
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
    const memberId = request.body?.memberId || 'self';
    const result = commitNotestationImport(request.params.importId, memberId);
    const notes = result.importedNoteIds?.length
      ? listNotes({ limit: 'all' }).filter((note) => result.importedNoteIds.includes(note.id))
      : [];
    response.json({ ...result, notes });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

function isNsxBinaryUpload(request) {
  const contentType = String(request.headers['content-type'] || '').toLowerCase();
  return contentType.includes('application/octet-stream') || Boolean(request.headers['x-file-name']);
}

async function saveNsxUpload(request) {
  const buffer = await readRequestBuffer(request, MAX_NSX_UPLOAD_BYTES);
  if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50) {
    throw new Error('选择的文件不是可识别的 .nsx / ZIP 文件。');
  }

  const paths = getDataPaths();
  mkdirSync(paths.importsDir, { recursive: true });
  const originalName = decodeHeaderValue(request.headers['x-file-name']) || 'notestation-import.nsx';
  const fileName = ensureNsxExtension(safeUploadFileName(originalName));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetPath = path.join(paths.importsDir, `${timestamp}-${fileName}`);
  writeFileSync(targetPath, buffer);

  return {
    filePath: targetPath,
    fileSize: buffer.length,
    memberId: decodeHeaderValue(request.headers['x-member-id']) || 'self'
  };
}

function shouldPreviewAsync(request, fileSize) {
  const asyncHeader = String(request.headers['x-async-import'] || '').toLowerCase();
  return asyncHeader === '1' || asyncHeader === 'true' || fileSize > 5 * 1024 * 1024;
}

function readRequestBuffer(request, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    request.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('NSX 文件超过 256 MB，暂不支持网页端直接上传。'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function decodeHeaderValue(value) {
  if (!value) return '';
  const text = Array.isArray(value) ? value[0] : String(value);
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function safeUploadFileName(value) {
  const fileName = path.basename(String(value || 'notestation-import.nsx')).replace(/[\\/:*?"<>|]+/g, '_').trim();
  return fileName || 'notestation-import.nsx';
}

function ensureNsxExtension(fileName) {
  return fileName.toLowerCase().endsWith('.nsx') ? fileName : `${fileName}.nsx`;
}
