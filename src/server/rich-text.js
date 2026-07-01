const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'code',
  'pre'
]);

const VOID_TAGS = new Set(['br']);
const BLOCKED_TAGS = 'script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|svg|math';
const BLOCKED_BLOCK_RE = new RegExp(`<\\s*(${BLOCKED_TAGS})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi');
const BLOCKED_SINGLE_RE = new RegExp(`<\\s*\\/?\\s*(${BLOCKED_TAGS})\\b[^>]*>`, 'gi');

export function buildRichContentFromMetadata(rawMetadataValue) {
  const rawMetadata = parseRawMetadata(rawMetadataValue);
  if (!rawMetadata) return null;

  const originalContent = String(rawMetadata.originalContent || '').trim();
  const originalFormat = String(rawMetadata.originalContentFormat || '').toLowerCase();
  if (!originalContent || originalFormat !== 'html') return null;

  const html = sanitizeRichTextHtml(originalContent);
  if (!stripTags(html)) return null;

  return {
    format: 'html',
    html,
    source: 'raw_metadata.originalContent'
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

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
