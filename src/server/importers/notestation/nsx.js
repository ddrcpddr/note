import { readFileSync } from 'node:fs';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';

const TEXT_SUMMARY_LIMIT = 96;

export function analyzeNsxFile(filePath) {
  const archive = openZipArchive(filePath);
  const configEntry = archive.entries.get('config.json');
  const config = configEntry ? readJsonEntry(archive, 'config.json') : null;
  const noteIds = Array.isArray(config?.note) ? config.note.filter((id) => typeof id === 'string') : [];
  const notebookIds = Array.isArray(config?.notebook) ? config.notebook.filter((id) => typeof id === 'string') : [];
  const noteFieldStats = collectNoteFieldStats(archive, noteIds);
  const attachmentEntries = archive.entryList.filter((entry) => isAttachmentEntry(entry.name));

  return {
    fileName: path.basename(filePath),
    fileSize: archive.buffer.length,
    isZip: true,
    canRead: true,
    entryCount: archive.entryList.length,
    fileCount: archive.entryList.filter((entry) => !entry.name.endsWith('/')).length,
    config: {
      exists: Boolean(configEntry),
      noteCount: noteIds.length,
      notebookCount: notebookIds.length,
      todoCount: Array.isArray(config?.todo) ? config.todo.length : 0
    },
    structure: summarizeStructure(archive.entryList, noteIds, notebookIds),
    noteFields: noteFieldStats,
    attachmentEntryCount: attachmentEntries.length,
    attachmentMagicCounts: countBy(attachmentEntries.map((entry) => `${entry.name.startsWith('file_thumb_') ? 'thumbnail' : 'file'}:${detectBufferKind(readEntryBuffer(archive, entry.name))}`))
  };
}

export function readNsxEntryBuffer(filePath, entryName) {
  const archive = openZipArchive(filePath);
  return readEntryBuffer(archive, entryName);
}

export function dryRunNsxFile(filePath, options = {}) {
  const archive = openZipArchive(filePath);
  const config = readJsonEntry(archive, 'config.json');
  const noteIds = Array.isArray(config.note) ? config.note.filter((id) => typeof id === 'string') : [];
  const notebookIds = Array.isArray(config.notebook) ? config.notebook.filter((id) => typeof id === 'string') : [];
  const notebooks = new Map();

  for (const id of notebookIds) {
    try {
      notebooks.set(id, readJsonEntry(archive, id));
    } catch {
      notebooks.set(id, null);
    }
  }

  const records = [];
  const failures = [];
  const categoryNames = new Set();
  const tagNames = new Set();
  let attachmentCount = 0;

  for (const id of noteIds) {
    try {
      const note = readJsonEntry(archive, id);
      const title = normalizeText(note.title) || '未命名 Note Station 记录';
      const content = normalizeText(note.content);
      const brief = normalizeText(note.brief);
      const originalCategory = resolveNotebookTitle(notebooks, note.parent_id);
      const originalPath = resolveNotebookPath(notebooks, note.parent_id, title);
      const tags = normalizeTags(note.tag);
      const attachments = normalizeAttachments(note.attachment);

      if (!content) {
        failures.push({
          originalId: id,
          originalTitle: title,
          originalPath,
          errorMessage: '记录缺少正文，dry-run 未纳入可导入记录。'
        });
        continue;
      }

      if (originalCategory) categoryNames.add(originalCategory);
      for (const tag of tags) tagNames.add(tag);
      attachmentCount += attachments.length;

      records.push({
        originalId: id,
        title,
        summary: makeSummary(brief || content),
        originalTitle: title,
        originalCategory,
        originalPath,
        originalCreatedAt: normalizeTimestamp(note.ctime),
        originalUpdatedAt: normalizeTimestamp(note.mtime),
        tags,
        attachmentCount: attachments.length,
        attachments,
        sourcePath: id,
        sourceType: 'notestation_import',
        ...(options.includeContent ? { content: makeContent(content) } : {}),
        rawMetadata: {
          parentId: note.parent_id || null,
          encrypted: Boolean(note.encrypt),
          hasLocation: Boolean(note.location || note.latitude || note.longitude),
          contentLength: content.length,
          originalContentFormat: looksLikeHtml(content) ? 'html' : 'text',
          originalNotebookPath: originalPath,
          ...(options.includeRawContent ? { originalContent: content } : {})
        }
      });
    } catch (error) {
      failures.push({
        originalId: id,
        originalTitle: id,
        originalPath: id,
        errorMessage: `记录解析失败：${error.message}`
      });
    }
  }

  return {
    importId: null,
    dryRun: true,
    fileName: path.basename(filePath),
    fileType: 'nsx',
    status: 'previewed',
    totalCount: noteIds.length,
    successCount: records.length,
    failedCount: failures.length,
    attachmentCount,
    originalCategoryCount: categoryNames.size,
    tagCount: tagNames.size,
    records,
    failures,
    originalCategories: [...categoryNames].sort(),
    tags: [...tagNames].sort()
  };
}

function openZipArchive(filePath) {
  const buffer = readFileSync(filePath);
  if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50) {
    throw new Error('NSX 文件不是可识别的 ZIP/PK 压缩包。');
  }

  const eocdOffset = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  const entryList = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error('ZIP central directory 损坏或无法读取。');
    }

    const flags = buffer.readUInt16LE(offset + 8);
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const nameBuffer = buffer.subarray(offset + 46, offset + 46 + nameLength);
    const name = nameBuffer.toString(flags & 0x0800 ? 'utf8' : 'utf8');
    const entry = { name, method, compressedSize, uncompressedSize, localHeaderOffset };
    entries.set(name, entry);
    entryList.push(entry);
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return { buffer, entries, entryList };
}

function findEndOfCentralDirectory(buffer) {
  const minOffset = Math.max(0, buffer.length - 22 - 0xffff);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error('找不到 ZIP end of central directory。');
}

function readEntryBuffer(archive, name) {
  const entry = typeof name === 'string' ? archive.entries.get(name) : name;
  if (!entry) throw new Error(`ZIP 条目不存在：${name}`);
  const { buffer } = archive;
  const localOffset = entry.localHeaderOffset;

  if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
    throw new Error(`ZIP local header 损坏：${entry.name}`);
  }

  const nameLength = buffer.readUInt16LE(localOffset + 26);
  const extraLength = buffer.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + nameLength + extraLength;
  const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.method === 0) return Buffer.from(compressed);
  if (entry.method === 8) return inflateRawSync(compressed);
  throw new Error(`不支持的 ZIP 压缩方法：${entry.method}`);
}

function readEntryText(archive, name) {
  return readEntryBuffer(archive, name).toString('utf8');
}

function readJsonEntry(archive, name) {
  return JSON.parse(readEntryText(archive, name));
}

function collectNoteFieldStats(archive, noteIds) {
  const stats = {
    title: 0,
    content: 0,
    brief: 0,
    ctime: 0,
    mtime: 0,
    parentId: 0,
    tag: 0,
    attachment: 0,
    encrypted: 0
  };

  for (const id of noteIds) {
    try {
      const note = readJsonEntry(archive, id);
      if (normalizeText(note.title)) stats.title += 1;
      if (normalizeText(note.content)) stats.content += 1;
      if (normalizeText(note.brief)) stats.brief += 1;
      if (note.ctime !== undefined && note.ctime !== null) stats.ctime += 1;
      if (note.mtime !== undefined && note.mtime !== null) stats.mtime += 1;
      if (normalizeText(note.parent_id)) stats.parentId += 1;
      if (normalizeTags(note.tag).length) stats.tag += 1;
      if (normalizeAttachments(note.attachment).length) stats.attachment += 1;
      if (note.encrypt) stats.encrypted += 1;
    } catch {
      // Analysis keeps going and dry-run will report per-record failures.
    }
  }

  return stats;
}

function summarizeStructure(entries, noteIds, notebookIds) {
  const noteSet = new Set(noteIds);
  const notebookSet = new Set(notebookIds);
  const counts = { config: 0, noteJson: 0, notebookJson: 0, attachments: 0, thumbnails: 0, other: 0 };

  for (const entry of entries) {
    if (entry.name === 'config.json') counts.config += 1;
    else if (noteSet.has(entry.name)) counts.noteJson += 1;
    else if (notebookSet.has(entry.name)) counts.notebookJson += 1;
    else if (entry.name.startsWith('file_thumb_')) counts.thumbnails += 1;
    else if (entry.name.startsWith('file_')) counts.attachments += 1;
    else counts.other += 1;
  }

  return counts;
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean);
  return String(value).split(',').map(normalizeText).filter(Boolean);
}

function normalizeAttachments(attachment) {
  const items = [];
  const values = [];
  if (Array.isArray(attachment)) values.push(...attachment);
  else if (attachment) values.push(attachment);

  for (const [index, value] of values.entries()) {
    if (typeof value === 'string') {
      items.push({ id: value, fileName: value, originalName: value });
    } else if (value && typeof value === 'object') {
      const id = normalizeText(value.id || value.file_id || value.filename || value.name || value.path || `attachment-${index + 1}`);
      const originalName = normalizeText(value.name || value.filename || value.title || id);
      items.push({ id, fileName: id, originalName });
    }
  }

  return items;
}

function resolveNotebookTitle(notebooks, parentId) {
  const notebook = notebooks.get(parentId);
  return normalizeText(notebook?.title) || '未分类';
}

function resolveNotebookPath(notebooks, parentId, title) {
  const parts = [];
  const visited = new Set();
  let currentId = parentId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const notebook = notebooks.get(currentId);
    if (!notebook) break;
    const notebookTitle = normalizeText(notebook.title);
    if (notebookTitle) parts.unshift(notebookTitle);
    const stack = normalizeText(notebook.stack);
    currentId = notebooks.has(stack) ? stack : '';
  }

  parts.push(title);
  return `/${parts.filter(Boolean).join('/')}`;
}

function normalizeTimestamp(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
  }

  const text = String(value).trim();
  if (/^\d+$/.test(text)) return normalizeTimestamp(Number(text));
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toISOString();
}


function makeContent(value) {
  return stripHtml(normalizeText(value)).replace(/\s+/g, ' ').trim();
}
function makeSummary(value) {
  const text = stripHtml(normalizeText(value)).replace(/\s+/g, ' ').trim();
  if (text.length <= TEXT_SUMMARY_LIMIT) return text;
  return `${text.slice(0, TEXT_SUMMARY_LIMIT)}...`;
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function looksLikeHtml(value) {
  return /<[^>]+>/.test(value);
}

function isAttachmentEntry(name) {
  return name.startsWith('file_') || name.startsWith('file_thumb_');
}

function detectBufferKind(buffer) {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return 'pdf';
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b) return 'zip-or-office';
  if (buffer.length >= 1 && (buffer[0] === 0x7b || buffer[0] === 0x5b)) return 'json';
  return 'binary-or-unknown';
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
