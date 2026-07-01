# Rich Text Plan

## Stage

This document covers stage 1 only: safe read-only rendering and data compatibility. It does not introduce a rich text editor, a block editor, or a database migration.

## Current Body Storage

- `notes.content` stores the plain text body. It is still the canonical field for current page fallback, search, JSON export, Markdown export, and simple editing.
- Note Station formal import writes stripped plain text into `notes.content` so imported notes remain searchable and readable even when rich content is unavailable.
- Note Station formal import preserves the original source body in `notes.raw_metadata.originalContent` when available.
- `notes.raw_metadata.originalContentFormat` records whether the preserved source body looked like `html` or `text` during parsing.
- Imported rows may also keep `original_path`, `original_category`, `original_created_at`, and `original_updated_at` for source traceability.
- Before this stage, the detail page rendered only `note.content` as plain text.
- JSON export and Markdown export are based on `listNotes({ limit: 'all' })` and continue to use `note.content` as the stable output body.

## Why Read-Only First

The app is already in real household trial state and contains real Note Station data. A full editor would require format decisions, migration rules, copy/paste behavior, mobile keyboard handling, attachment embedding, undo behavior, and export rules. Those are too risky for this phase.

Stage 1 therefore keeps the existing storage contract intact:

- Plain text remains the durable fallback.
- Search remains based on plain text.
- Existing JSON and Markdown exports remain stable.
- Rich HTML is optional display data for imported records only.
- The change is reversible because no existing database rows are rewritten.

## Rendering Strategy

The server derives a new optional API field named `richContent` only when all conditions are true:

- The note is requested through an API path that opts in to rich text.
- `raw_metadata.originalContentFormat` is `html`.
- `raw_metadata.originalContent` exists and has renderable content after sanitizing.

The default `listNotes()` result does not include `richContent`. This keeps storage exports from accidentally including raw or sanitized HTML.

The detail page behavior is:

- If safe rich content exists, show a small `原始格式 / 纯文本` switch.
- `原始格式` renders sanitized HTML.
- `纯文本` renders `notes.content`.
- If no safe rich content exists, render only `notes.content`.
- Home cards and search results continue to show plain text summaries only.

## XSS Risks

Original Note Station HTML is untrusted input. It may contain script tags, event handlers, unsafe links, embedded frames, or image references that should not be executed in the browser.

The app must never insert `raw_metadata.originalContent` directly into the page.

## Allowed Tags

Stage 1 allows a small set of formatting tags:

- `p`
- `br`
- `strong`, `b`
- `em`, `i`
- `u`, `s`
- `ul`, `ol`, `li`
- `blockquote`
- `a`
- `code`, `pre`

`div` is converted to `p` for basic paragraph preservation.

## Blocked Tags And Attributes

The sanitizer removes dangerous block or embed tags, including:

- `script`
- `style`
- `iframe`
- `object`
- `embed`
- `form`
- `input`, `button`, `textarea`, `select`, `option`
- `link`, `meta`
- `svg`, `math`

The sanitizer does not preserve arbitrary attributes. This removes event attributes such as `onclick`, `onerror`, `onmouseover`, inline styles, and unknown attributes.

## Links

Links only keep `href` when the protocol is considered safe:

- `http:`
- `https:`
- `mailto:`
- `tel:`
- relative app paths such as `/`, `./`, `../`, and `#`

Blocked protocols include `javascript:`, `data:`, `vbscript:`, and `file:`.

Safe links are rendered with `target="_blank"` and `rel="noopener noreferrer"`.

## Images And Attachments

Stage 1 does not render arbitrary image URLs from imported HTML. Imported images may refer to internal Note Station paths, extracted attachment names, or remote URLs. If the app cannot safely map an image reference to a local attachment path, the image is replaced by an attachment placeholder:

`图片附件已保留在附件列表`

Real attachment metadata continues to be shown in the existing attachment section. Future work can add safe local image mapping after attachment path rules are verified.

## Export Compatibility

- JSON export remains based on default `listNotes({ limit: 'all' })`, which does not include `richContent`.
- Markdown export continues to render `note.content`.
- Search remains based on `notes.content`, title, category, member, and tags. It does not search inside `raw_metadata.originalContent`.

## Future Rich Text Editor Stage

Do not start editor development until the following decisions are made:

1. Whether the app stores edited rich text as sanitized HTML, Markdown, or another format.
2. Whether `notes.content` remains plain-text primary body or becomes a generated search field.
3. How mobile paste, undo, headings, lists, links, and attachments should work.
4. How JSON and Markdown exports should represent rich content.
5. Whether a mature lightweight editor dependency is acceptable.
6. How to migrate existing manual notes without rewriting real imported records unexpectedly.

A later editor stage should be test-first and should preserve a plain-text fallback for search and recovery.
