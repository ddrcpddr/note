# Offline First Android Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Android WebView app usable for long-term offline daily notes, with local-first storage and later sync to the NAS/Docker server.

**Architecture:** Add a browser IndexedDB local store used by both Android WebView and normal mobile browser. The app writes new and edited notes locally first, then syncs dirty records to the existing Express/SQLite API when the server is available. The first pass keeps conflict handling conservative: single-device edits sync automatically, conflicting server edits are marked for review instead of overwritten.

**Tech Stack:** React, WebView/PWA, IndexedDB without new dependencies, existing Express APIs, existing SQLite service as NAS center.

---

### Task 1: Local Store Module

**Files:**
- Create: `src/client/offlineStore.js`
- Test: `tests/offline-store-static.test.js`

- [ ] Add static tests that require a named IndexedDB database, object stores for notes, attachments, categories, members, tags, syncQueue, meta, and exported helpers.
- [ ] Implement `offlineStore.js` with small Promise wrappers around IndexedDB.
- [ ] Keep the API dependency-free and usable in Android WebView.

### Task 2: Frontend Local-First Wiring

**Files:**
- Modify: `src/client/main.jsx`
- Test: `tests/frontend-ui.test.js`

- [ ] Load local IndexedDB snapshot before or alongside `/api/app-data`.
- [ ] Save successful server app-data into the local store.
- [ ] Create notes locally first with sync status `local-only`.
- [ ] Edit local and server-backed notes locally first with sync status `dirty`.
- [ ] Sync dirty create/update records when the service is reachable.
- [ ] Keep current `localStorage` queue as a migration fallback only, not the long-term store.

### Task 3: Attachment and Rich Text Offline Payload

**Files:**
- Modify: `src/client/main.jsx`
- Modify: `src/client/offlineStore.js`
- Test: `tests/frontend-ui.test.js`

- [ ] Store attachment metadata in note payloads.
- [ ] Preserve rich text HTML and JSON in local notes.
- [ ] Do not attempt large Blob sync in this first pass unless the existing editor already provides base64/data payloads.
- [ ] Mark records with unsynced inline assets as dirty and safe to retry.

### Task 4: Documentation and Android Handoff

**Files:**
- Modify: `docs/OFFLINE_SYNC_PLAN.md`
- Modify: `docs/ANDROID_WRAPPER_PLAN.md`
- Modify: `docs/PROJECT_MEMORY.md`
- Modify: `docs/QA_REPORT_CURRENT.md`
- Modify: `docs/NEXT_STEPS.md`

- [ ] Record the strategy change from short offline fallback to local-first IndexedDB.
- [ ] Document current limits: first launch still needs a loaded app shell unless assets are bundled later; multi-device conflicts are not automatic.
- [ ] Explain how to manually test: create offline, edit offline, reconnect, confirm sync.

### Task 5: Verification and Commit

**Files:**
- All changed files.

- [ ] Run `npm.cmd run check`.
- [ ] Run `npm.cmd run test`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd run android:build`.
- [ ] Confirm `git status` does not include data, database, backups, exports, attachments, `.nsx`, APK, logs, passwords, tokens, or real NAS addresses.
- [ ] Commit with `Add local-first offline note storage`.
- [ ] Push to GitHub.

## Scope Boundaries

- Do not move the full product to Android native SQLite in this pass.
- Do not build multi-device automatic conflict resolution in this pass.
- Do not submit runtime data or generated APKs to Git.
- Do not hardcode real NAS addresses.
