import sanitizeHtml from 'sanitize-html';

const COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$|^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
const SAFE_PROTOCOLS = ['http', 'https', 'mailto', 'tel'];

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
    'h1', 'h2', 'h3', 'h4',
    'ul', 'ol', 'li',
    'blockquote', 'hr',
    'a', 'img', 'figure', 'figcaption',
    'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span', 'label', 'input'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'data-attachment-id'],
    div: ['style', 'data-text-align', 'data-notestation-inline-images'],
    figure: ['data-attachment-id'],
    span: ['style', 'data-checked'],
    ul: ['data-type'],
    label: [],
    input: ['type', 'checked', 'disabled'],
    p: ['style', 'data-text-align'],
    h1: ['style', 'data-text-align'],
    h2: ['style', 'data-text-align'],
    h3: ['style', 'data-text-align'],
    h4: ['style', 'data-text-align'],
    li: ['data-type', 'data-checked'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan']
  },
  allowedSchemes: [...SAFE_PROTOCOLS, 'data'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data']
  },
  transformTags: {
    a: sanitizeLinkTag,
    img: sanitizeImageTag,
    span: sanitizeStyledTag,
    p: sanitizeAlignedTag,
    h1: sanitizeAlignedTag,
    h2: sanitizeAlignedTag,
    h3: sanitizeAlignedTag,
    h4: sanitizeAlignedTag,
    div: sanitizeAlignedTag,
    input: sanitizeCheckboxTag
  },
  exclusiveFilter(frame) {
    return frame.tag === 'img' && !frame.attribs.src;
  }
};

export function prepareStoredRichText({ content = '', contentHtml = '', contentJson = null, sourceHtml = '', attachmentMap = {} } = {}) {
  const htmlWithAttachments = replaceDraftImageSources(String(contentHtml || ''), attachmentMap);
  const sanitizedHtml = sanitizeRichTextHtml(htmlWithAttachments);
  const rawSourceHtml = String(sourceHtml || '').trim();
  const sanitizedSourceHtml = rawSourceHtml ? sanitizeRichTextHtml(rawSourceHtml) : '';
  const normalizedJson = normalizeContentJson(contentJson);
  const text = (
    richTextHtmlToPlainText(sanitizedHtml)
    || richTextJsonToPlainText(normalizedJson)
    || richTextHtmlToPlainText(sanitizedSourceHtml)
    || String(content || '')
  ).trim();

  return {
    contentText: text,
    contentHtml: sanitizedHtml || null,
    contentJson: normalizedJson ? JSON.stringify(normalizedJson) : null,
    sourceHtml: rawSourceHtml || null,
    legacyContent: text || String(content || '').trim(),
    contentFormat: normalizedJson ? 'tiptap_json' : (sanitizedHtml || sanitizedSourceHtml) ? 'html' : 'plain_text',
    contentVersion: 2
  };
}

export function buildRichContentFromMetadata(rawMetadataValue) {
  const rawMetadata = parseRawMetadata(rawMetadataValue);
  if (!rawMetadata) return null;

  const originalContent = String(rawMetadata.originalContent || '').trim();
  const originalFormat = String(rawMetadata.originalContentFormat || '').toLowerCase();
  if (!originalContent || originalFormat !== 'html') return null;

  return buildRichContent(originalContent, 'raw_metadata.originalContent');
}

export function buildRichContentFromNote(row = {}, attachments = []) {
  const userHtml = String(row.contentHtml || row.content_html || '').trim();
  const sourceHtml = String(row.sourceHtml || row.source_html || '').trim();
  const sourceType = String(row.sourceType || row.source_type || '').trim();
  const sourceWithAttachments = sourceHtml && sourceType === 'notestation_import'
    ? inlineNsxImageRefsFromAttachments(sourceHtml, attachments)
    : '';

  const sourceHasInlineAttachment = hasInlineAttachmentImage(sourceWithAttachments);
  const userHasInlineAttachment = hasInlineAttachmentImage(userHtml);
  const userHasStaleAttachmentRefs = hasStaleAttachmentRefs(userHtml, attachments);

  if (sourceWithAttachments && sourceHasInlineAttachment && (!userHasInlineAttachment || userHasStaleAttachmentRefs)) {
    const richContent = buildRichContent(sourceWithAttachments, 'source_html');
    if (richContent) return richContent;
  }

  if (userHtml) {
    const richContent = buildRichContent(userHtml, 'content_html');
    if (richContent) return richContent;
  }

  if (sourceHtml) {
    const richContent = buildRichContent(sourceWithAttachments || sourceHtml, 'source_html');
    if (richContent) return richContent;
  }

  return buildRichContentFromMetadata(row.rawMetadata || row.raw_metadata);
}

function inlineNsxImageRefsFromAttachments(html, attachments = []) {
  if (!html || !attachments.length) return html;
  const imageAttachments = attachments.filter((attachment) => {
    const mimeType = String(attachment.mimeType || attachment.mime_type || '').toLowerCase();
    return mimeType.startsWith('image/') || attachment.kind === 'image' || /\.(png|jpe?g|gif|webp)$/i.test(String(attachment.originalName || attachment.original_name || attachment.fileName || attachment.file_name || ''));
  });
  if (!imageAttachments.length) return html;

  const usedIds = new Set();
  const withRefs = String(html).replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    const attachment = findNsxImageAttachment(attrs, imageAttachments);
    if (!attachment) return match;
    const attachmentId = attachment.id;
    if (!attachmentId) return match;
    usedIds.add(String(attachmentId));
    const originalName = attachment.originalName || attachment.original_name || attachment.fileName || attachment.file_name || '图片';
    const width = extractAttribute(attrs, 'width');
    const height = extractAttribute(attrs, 'height');
    const sizeAttrs = [
      /^\d{1,5}$/.test(width) ? ` width="${width}"` : '',
      /^\d{1,5}$/.test(height) ? ` height="${height}"` : ''
    ].join('');
    return `<img src="/api/attachments/${escapeAttribute(attachmentId)}/file" alt="${escapeAttribute(originalName)}" data-attachment-id="${escapeAttribute(attachmentId)}"${sizeAttrs}>`;
  });

  const appendedImages = imageAttachments
    .filter((attachment) => attachment.id && !usedIds.has(String(attachment.id)))
    .map((attachment) => {
      const attachmentId = String(attachment.id);
      const originalName = attachment.originalName || attachment.original_name || attachment.fileName || attachment.file_name || '图片';
      return `<figure data-attachment-id="${escapeAttribute(attachmentId)}"><img src="/api/attachments/${escapeAttribute(attachmentId)}/file" alt="${escapeAttribute(originalName)}" data-attachment-id="${escapeAttribute(attachmentId)}"><figcaption>${escapeHtml(originalName)}</figcaption></figure>`;
    });

  if (!appendedImages.length) return withRefs;
  return `${withRefs}<div data-notestation-inline-images="true">${appendedImages.join('')}</div>`;
}

function findNsxImageAttachment(attrs, attachments = []) {
  const ref = extractAttribute(attrs, 'ref');
  const src = extractAttribute(attrs, 'src');
  const alt = extractAttribute(attrs, 'alt');
  const title = extractAttribute(attrs, 'title');
  const decodedRef = decodeBase64Text(ref);
  const probes = [decodedRef, src, alt, title].filter(Boolean);

  return attachments.find((attachment) => {
    const names = [
      attachment.originalName || attachment.original_name,
      attachment.fileName || attachment.file_name,
      attachment.sourceAttachmentId || attachment.source_attachment_id,
      attachment.sourcePath || attachment.source_path
    ].filter(Boolean);
    return probes.some((probe) => names.some((name) => isNsxImageReferenceMatch(probe, name)));
  });
}

function isNsxImageReferenceMatch(probe, name) {
  const normalizedProbe = normalizeReference(probe);
  const normalizedName = normalizeReference(name);
  if (!normalizedProbe || !normalizedName) return false;
  return normalizedProbe === normalizedName || normalizedProbe.endsWith(`/${normalizedName}`) || normalizedProbe.endsWith(normalizedName);
}

function normalizeReference(value) {
  const text = String(value || '').replace(/\\/g, '/').trim();
  if (!text) return '';
  const basename = text.split('/').pop() || text;
  try {
    return decodeURIComponent(basename).toLowerCase();
  } catch {
    return basename.toLowerCase();
  }
}
function hasInlineAttachmentImage(html) {
  return /<img\b[^>]+\/api\/attachments\//i.test(String(html || ''));
}

function hasStaleAttachmentRefs(html, attachments = []) {
  const refs = extractAttachmentRefs(html);
  if (!refs.length) return false;
  const currentIds = new Set(attachments.map((attachment) => String(attachment.id || '')).filter(Boolean));
  if (!currentIds.size) return true;
  return refs.some((id) => !currentIds.has(id));
}

function extractAttachmentRefs(html) {
  const text = String(html || '');
  if (!text.includes('/api/attachments/') && !text.includes('data-attachment-id')) return [];
  const refs = new Set();
  for (const match of text.matchAll(/\/api\/attachments\/([\w-]+)\/file/gi)) refs.add(match[1]);
  for (const match of text.matchAll(/data-attachment-id=["']([\w-]+)["']/gi)) refs.add(match[1]);
  return [...refs];
}

function decodeBase64Text(value) {
  if (!value) return '';
  try {
    return Buffer.from(String(value), 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function buildRichContent(htmlValue, source) {
  const html = sanitizeRichTextHtml(htmlValue);
  if (!stripTags(html) && !/<img\b|<table\b|data-attachment-id/i.test(html)) return null;

  return {
    format: 'html',
    html,
    source
  };
}

export function sanitizeRichTextHtml(value) {
  let html = String(value || '');
  if (!html.trim()) return '';

  html = html
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<!doctype[^>]*>/gi, '');

  return sanitizeHtml(html, SANITIZE_OPTIONS).trim();
}

export function richTextHtmlToPlainText(value) {
  const html = sanitizeRichTextHtml(value);
  return decodeHtmlEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\s*hr\s*\/?>/gi, '\n---\n')
      .replace(/<\s*\/tr\s*>/gi, '\n')
      .replace(/<\s*\/(p|h1|h2|h3|h4|li|blockquote|pre|div|table)\s*>/gi, '\n')
      .replace(/<\s*\/(td|th)\s*>/gi, '\t')
      .replace(/<img\b[^>]*alt="([^"]*)"[^>]*>/gi, (_, alt) => alt ? `\n[图片：${alt}]\n` : '\n[图片]\n')
      .replace(/<[^>]*>/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

export function plainTextToRichTextHtml(value) {
  const text = String(value || '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';

  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function htmlToMarkdownSubset(value, fallback = '') {
  const html = sanitizeRichTextHtml(value);
  if (!html.trim()) return String(fallback || '').trim();

  let markdown = html;
  markdown = markdown.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, body) => `\n# ${inlineMarkdown(body)}\n`);
  markdown = markdown.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, body) => `\n## ${inlineMarkdown(body)}\n`);
  markdown = markdown.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, body) => `\n### ${inlineMarkdown(body)}\n`);
  markdown = markdown.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, body) => `\n#### ${inlineMarkdown(body)}\n`);
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, body) => `\n> ${inlineMarkdown(body).replace(/\n/g, '\n> ')}\n`);
  markdown = markdown.replace(/<li[^>]*data-checked="true"[^>]*>([\s\S]*?)<\/li>/gi, (_, body) => `\n- [x] ${inlineMarkdown(body)}`);
  markdown = markdown.replace(/<li[^>]*data-checked="false"[^>]*>([\s\S]*?)<\/li>/gi, (_, body) => `\n- [ ] ${inlineMarkdown(body)}`);
  markdown = markdown.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, body) => `\n- ${inlineMarkdown(body)}`);
  markdown = markdown.replace(/<img\b[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, (_, src, alt) => `\n![${decodeHtmlEntities(alt)}](${decodeHtmlEntities(src)})\n`);
  markdown = markdown.replace(/<hr\s*\/?>/gi, '\n---\n');
  markdown = markdown.replace(/<table[\s\S]*?<\/table>/gi, (table) => tableToMarkdown(table));
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, body) => `\n${inlineMarkdown(body)}\n`);
  markdown = inlineMarkdown(markdown);
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');

  return markdown || String(fallback || '').trim();
}

export function richTextJsonToPlainText(value) {
  const json = normalizeContentJson(value);
  if (!json) return '';
  const pieces = [];
  walkTipTapJson(json, (node) => {
    if (typeof node.text === 'string') pieces.push(node.text);
    if (['paragraph', 'heading', 'listItem', 'taskItem'].includes(node.type)) pieces.push('\n');
  });
  return pieces.join('').replace(/\n{3,}/g, '\n\n').trim();
}

export function normalizeContentJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return null;
  }
}

export function parseRawMetadata(rawMetadataValue) {
  if (!rawMetadataValue) return null;
  if (typeof rawMetadataValue === 'object') return rawMetadataValue;

  try {
    return JSON.parse(String(rawMetadataValue));
  } catch {
    return null;
  }
}

function replaceDraftImageSources(html, attachmentMap) {
  return String(html || '').replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    const draftRef = extractAttribute(attrs, 'data-draft-ref');
    const attachment = draftRef ? attachmentMap[draftRef] : null;
    if (!attachment) return match;
    const alt = extractAttribute(attrs, 'alt') || attachment.originalName || attachment.fileName || '图片';
    return `<img src="/api/attachments/${escapeAttribute(attachment.id)}/file" alt="${escapeAttribute(alt)}" data-attachment-id="${escapeAttribute(attachment.id)}">`;
  });
}

function sanitizeLinkTag(tagName, attribs) {
  const href = sanitizeHref(attribs.href);
  if (!href) return { tagName: 'a', attribs: {} };
  return {
    tagName,
    attribs: {
      href,
      title: attribs.title || '',
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  };
}

function sanitizeImageTag(tagName, attribs) {
  const src = sanitizeImageSrc(attribs.src);
  if (!src) return { tagName, attribs: {} };
  const next = {
    src,
    alt: attribs.alt || '图片'
  };
  if (attribs['data-attachment-id']) next['data-attachment-id'] = String(attribs['data-attachment-id']).replace(/[^\w-]/g, '');
  if (/^\d{1,5}$/.test(String(attribs.width || ''))) next.width = attribs.width;
  if (/^\d{1,5}$/.test(String(attribs.height || ''))) next.height = attribs.height;
  return { tagName, attribs: next };
}

function sanitizeCheckboxTag(tagName, attribs) {
  if (String(attribs.type || '').toLowerCase() !== 'checkbox') return { tagName, attribs: {} };
  const next = { type: 'checkbox', disabled: 'disabled' };
  if (Object.prototype.hasOwnProperty.call(attribs, 'checked')) next.checked = 'checked';
  return { tagName, attribs: next };
}

function sanitizeStyledTag(tagName, attribs) {
  const style = sanitizeInlineStyle(attribs.style);
  const next = {};
  if (style) next.style = style;
  if (attribs['data-checked'] === 'true' || attribs['data-checked'] === 'false') next['data-checked'] = attribs['data-checked'];
  return { tagName, attribs: next };
}

function sanitizeAlignedTag(tagName, attribs) {
  const style = sanitizeInlineStyle(attribs.style);
  const next = {};
  const align = String(attribs['data-text-align'] || '').toLowerCase();
  const styleAlign = String(attribs.style || '').match(/text-align\s*:\s*(left|center|right)/i)?.[1]?.toLowerCase();
  const textAlign = ['left', 'center', 'right'].includes(align) ? align : styleAlign;
  const styleParts = [];
  if (style) styleParts.push(style);
  if (textAlign) {
    next['data-text-align'] = textAlign;
    styleParts.push(`text-align:${textAlign}`);
  }
  if (styleParts.length) next.style = [...new Set(styleParts)].join(';');
  if (tagName === 'div' && attribs['data-notestation-inline-images'] === 'true') {
    next['data-notestation-inline-images'] = 'true';
  }
  return { tagName, attribs: next };
}

function sanitizeInlineStyle(value) {
  const rules = String(value || '').split(';').map((rule) => rule.trim()).filter(Boolean);
  const allowed = [];
  for (const rule of rules) {
    const [rawProp, ...rawValueParts] = rule.split(':');
    const prop = String(rawProp || '').trim().toLowerCase();
    const val = rawValueParts.join(':').trim();
    if ((prop === 'color' || prop === 'background-color') && COLOR_RE.test(val)) {
      allowed.push(`${prop}:${val}`);
    }
  }
  return allowed.join(';');
}

function sanitizeHref(value) {
  const decoded = decodeAttributeValue(value).trim();
  if (!decoded) return '';
  const compact = decoded.replace(/[\u0000-\u001f\u007f\s]+/g, '');
  const lower = compact.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('file:')) return '';
  if (/^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(decoded)) return decoded;
  return '';
}

function sanitizeImageSrc(value) {
  const src = decodeAttributeValue(value).trim();
  if (!src) return '';
  if (/^\/api\/attachments\/[\w-]+\/file$/i.test(src)) return src;
  if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(src)) return src;
  if (/^https?:\/\//i.test(src)) return src;
  return '';
}

function tableToMarkdown(tableHtml) {
  const rows = [...String(tableHtml).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((rowMatch) => {
    return [...rowMatch[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) => inlineMarkdown(cell[1]).replace(/\|/g, '\\|'));
  }).filter((row) => row.length);
  if (!rows.length) return '';
  const header = rows[0];
  const separator = header.map(() => '---');
  return `\n${[header, separator, ...rows.slice(1)].map((row) => `| ${row.join(' | ')} |`).join('\n')}\n`;
}

function inlineMarkdown(value) {
  return decodeHtmlEntities(
    String(value || '')
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>')
      .replace(/<(s|del)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~')
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `[${stripTags(label)}](${decodeHtmlEntities(href)})`)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?(ul|ol|tbody|thead)>/gi, '')
      .replace(/<[^>]*>/g, '')
  ).trim();
}

function walkTipTapJson(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (Array.isArray(node.content)) {
    for (const child of node.content) walkTipTapJson(child, visit);
  }
}

function extractAttribute(attrs, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'<>]+))`, 'i');
  const match = String(attrs || '').match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

function decodeAttributeValue(value) {
  return String(value || '')
    .replace(/&colon;/gi, ':')
    .replace(/&#58;/g, ':')
    .replace(/&#x3a;/gi, ':')
    .replace(/&amp;/gi, '&');
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}


