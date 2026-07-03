const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'hr',
  'code',
  'pre'
]);

const VOID_TAGS = new Set(['br', 'hr']);
const BLOCKED_TAGS = 'script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|svg|math';
const BLOCKED_BLOCK_RE = new RegExp(`<\\s*(${BLOCKED_TAGS})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi');
const BLOCKED_SINGLE_RE = new RegExp(`<\\s*\\/?\\s*(${BLOCKED_TAGS})\\b[^>]*>`, 'gi');

export function buildRichContentFromMetadata(rawMetadataValue) {
  const rawMetadata = parseRawMetadata(rawMetadataValue);
  if (!rawMetadata) return null;

  const originalContent = String(rawMetadata.originalContent || '').trim();
  const originalFormat = String(rawMetadata.originalContentFormat || '').toLowerCase();
  if (!originalContent || originalFormat !== 'html') return null;

  return buildRichContent(originalContent, 'raw_metadata.originalContent');
}

export function buildRichContentFromNote(row = {}) {
  const userHtml = String(row.contentHtml || row.content_html || '').trim();
  if (userHtml) {
    const richContent = buildRichContent(userHtml, 'content_html');
    if (richContent) return richContent;
  }

  return buildRichContentFromMetadata(row.rawMetadata || row.raw_metadata);
}

function buildRichContent(htmlValue, source) {
  const html = sanitizeRichTextHtml(htmlValue);
  if (!stripTags(html)) return null;

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
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(BLOCKED_BLOCK_RE, '')
    .replace(BLOCKED_SINGLE_RE, '');

  return html.replace(/<\/?([a-zA-Z][\w:-]*)([^>]*)>/g, (match, tagName, attrs) => {
    const tag = String(tagName || '').toLowerCase();
    const isClosing = /^<\s*\//.test(match);

    if (tag === 'div') {
      return isClosing ? '</p>' : '<p>';
    }

    if (tag === 'img') {
      return isClosing ? '' : '<span class="rich-text-attachment-placeholder">图片附件已保留在附件列表</span>';
    }

    if (!ALLOWED_TAGS.has(tag)) return '';
    if (isClosing) return VOID_TAGS.has(tag) ? '' : `</${tag}>`;
    if (VOID_TAGS.has(tag)) return `<${tag}>`;

    if (tag === 'a') {
      const href = sanitizeHref(extractHref(attrs));
      if (!href) return '<a>';
      return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">`;
    }

    return `<${tag}>`;
  });
}

export function richTextHtmlToPlainText(value) {
  const html = sanitizeRichTextHtml(value);
  return decodeHtmlEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\s*hr\s*\/?>/gi, '\n')
      .replace(/<\s*\/(p|h2|h3|li|blockquote|pre)\s*>/gi, '\n')
      .replace(/<\s*(p|h2|h3|li|blockquote|pre|ul|ol)\b[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{2,}/g, '\n')
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
  markdown = markdown.replace(/<h2>([\s\S]*?)<\/h2>/gi, (_, body) => `\n## ${inlineMarkdown(body)}\n`);
  markdown = markdown.replace(/<h3>([\s\S]*?)<\/h3>/gi, (_, body) => `\n### ${inlineMarkdown(body)}\n`);
  markdown = markdown.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (_, body) => `\n> ${inlineMarkdown(body).replace(/\n/g, '\n> ')}\n`);
  markdown = markdown.replace(/<li>([\s\S]*?)<\/li>/gi, (_, body) => `\n- ${inlineMarkdown(body)}`);
  markdown = markdown.replace(/<hr>/gi, '\n---\n');
  markdown = markdown.replace(/<p>([\s\S]*?)<\/p>/gi, (_, body) => `\n${inlineMarkdown(body)}\n`);
  markdown = inlineMarkdown(markdown);
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');

  return markdown || String(fallback || '').trim();
}

function inlineMarkdown(value) {
  return decodeHtmlEntities(
    String(value || '')
      .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*')
      .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `[${stripTags(label)}](${decodeHtmlEntities(href)})`)
      .replace(/<br>/gi, '\n')
      .replace(/<\/?(ul|ol)>/gi, '')
      .replace(/<[^>]*>/g, '')
  ).trim();
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

function extractHref(attrs) {
  const match = String(attrs || '').match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+))/i);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

function sanitizeHref(value) {
  const decoded = decodeAttributeValue(value).trim();
  if (!decoded) return '';

  const compact = decoded.replace(/[\u0000-\u001f\u007f\s]+/g, '');
  const lower = compact.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('file:')) {
    return '';
  }

  if (/^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(decoded)) {
    return decoded;
  }

  return '';
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
