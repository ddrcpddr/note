# Agent Workplan

## Current State

`note` is a mobile-first family life record system for a home NAS. It replaces the family use case of Synology Note Station without becoming an enterprise collaboration or admin system.

The current MVP already has:

- React + Vite mobile UI using the V1 visual direction.
- Express API with SQLite persistence.
- Members, categories, tags, notes, import batches, backups, and exports.
- Home, detail, new note, search, categories, import, and settings views.
- Sample Note Station import flow and real-import dry-run endpoint.
- Local NAS-style data folders, database backup, and JSON export.
- Basic PWA manifest and Docker / Docker Compose preparation.
- API integration tests using a temporary `NOTE_DATA_DIR`.

The current MVP still deliberately does not have:

- Real login or complex permissions.
- Real NAS connection checks.
- Real attachment file upload.
- Real Synology Note Station export parsing.
- Complex offline sync.

## Ground Rules

- V1 is the only visual reference.
- Do not call Product Design.
- Do not generate new PNG design files.
- Do not change the UI into an admin dashboard.
- Do not introduce large dependencies or large architecture changes without stopping for approval.
- Do not hard-code real NAS paths, account names, passwords, tokens, or private personal data.
- Do not commit runtime data under `data/`, including databases, backups, exports, attachments, real import files, or logs.
- Each task starts from a clean branch and current `origin/main`.
- Each task must run `npm.cmd run check`, `npm.cmd run test`, and `npm.cmd run build` before commit.
- Stop if build or test fails twice in a row.

## Agent Roles

### Lead Agent

Responsibilities:

- Own overall sequencing, branch hygiene, commits, pushes, and final summary.
- Read project memory and keep `docs/PROJECT_MEMORY.md` current.
- Coordinate sub-agents and prevent overlapping edits.
- Integrate results and run final verification.

Allowed files:

- All files, but only after assigning narrower scopes to other agents.

### Main Development Agent

Responsibilities:

- Implement current-stage core functionality only.
- Prefer small, testable vertical slices.
- Avoid broad refactors and avoid changing established page structure.

Allowed files:

- `src/server/**`
- `src/client/**`
- `src/shared/**`
- `tests/**`
- Related docs for implemented behavior.

Forbidden:

- Replacing the UI direction.
- Rewriting the data layer without approval.
- Implementing real Note Station parsing without real samples.

### QA Agent

Responsibilities:

- Run check, test, build, and API smoke checks.
- Inspect likely MVP bugs.
- Update QA report and bug list.
- Fix only very small bugs found during QA.

Allowed files:

- `tests/**`
- `docs/QA_REPORT_CURRENT.md`
- `docs/BUG_LIST.md`
- Small local fixes directly tied to failed verification.

Forbidden:

- Building new product features.
- Large refactors.

### Docs / Deploy Agent

Responsibilities:

- Keep README, NAS deployment, Docker notes, user manual, handover, and `.gitignore` guidance current.
- Ensure Docker/NAS docs use example paths only.
- Confirm runtime data stays ignored.

Allowed files:

- `README.md`
- `docs/NAS_DEPLOYMENT.md`
- `docs/USER_MANUAL_MVP.md`
- `docs/DEV_HANDOVER.md`
- `docs/NEXT_STEPS.md`
- `.gitignore`
- `.dockerignore`
- Docker docs and small Docker metadata only.

Forbidden:

- Core app feature work.
- Real NAS credentials or real private paths.

### Import Agent

Responsibilities:

- Maintain sample import and dry-run readiness.
- Improve documentation and tests around the safe import workflow.
- List exactly what real samples are needed from the user.

Allowed files:

- `src/server/importers/notestation/**`
- `src/server/routes/imports.js`
- `tests/**`
- `docs/NOTESTATION_IMPORT.md`
- `docs/NOTESTATION_REAL_IMPORT_PLAN.md`

Forbidden:

- Guessing the true Synology Note Station export format.
- Writing real imported files to Git.
- Implementing real parsers without user-provided samples.

### UI Polish Agent

Responsibilities:

- Low-priority mobile polish after functional verification passes.
- Fix overflow, clipped text, button overlap, empty states, and error copy.

Allowed files:

- `src/client/**`
- `docs/V1_STYLE_GUIDE.md` only if documenting an already-approved V1 clarification.

Forbidden:

- New visual direction.
- New generated design assets.
- Major page redesign.

## Current Execution Order

1. QA current MVP:
   - `npm.cmd run check`
   - `npm.cmd run test`
   - `npm.cmd run build`
   - API smoke for `/api/health`, `/api/app-data`, notes, storage, and import dry-run.
2. Fix only true QA bugs.
3. Strengthen automated tests where current behavior has risk:
   - New note creation.
   - List and detail reads.
   - Search, category, member, and tag filters.
   - Backup and JSON export.
   - Import dry-run.
   - Current member switching if not already covered.
   - NAS-offline backup failure behavior if not already covered.
4. Keep PWA support basic:
   - Manifest and mobile meta.
   - No complex offline sync or service worker caching of API responses.
5. Keep Docker / NAS deployment prepared:
   - `/data/database`
   - `/data/attachments`
   - `/data/backups`
   - `/data/imports/notestation`
   - `/data/exports`
   - No real NAS path.
6. Keep Note Station real import in safe preparation mode:
   - Dry-run or sandbox only.
   - Clear required sample checklist.
   - No real parser until sample files exist.
7. Refresh docs:
   - `README.md`
   - `docs/QA_REPORT_CURRENT.md`
   - `docs/USER_MANUAL_MVP.md`
   - `docs/DEV_HANDOVER.md`
   - `docs/NEXT_STEPS.md`
   - `docs/BUG_LIST.md`
   - `docs/PROJECT_MEMORY.md`

## Branch And Commit Strategy

Use `main` for this focused continuation because the workspace is clean and the requested tasks are small. If a task grows beyond documentation, tests, and narrow MVP hardening, create a feature branch or worktree before proceeding.

Planned commits:

1. `Document agent workplan`
2. `Refresh MVP QA validation`
3. `Strengthen MVP API coverage`
4. `Refresh deployment and import docs`
5. `Record final validation results`

Each commit must be followed by a clean `git status --short --branch`.

## Acceptance Criteria

- Workplan exists and matches the project constraints.
- QA report reflects current commit and fresh command results.
- Tests cover the MVP API flows listed above.
- PWA and Docker/NAS docs are accurate without real private details.
- Import docs clearly state that real parsing needs a user-provided sample.
- `npm.cmd run check`, `npm.cmd run test`, and `npm.cmd run build` pass.
- Git status is clean after commits.
- Changes are pushed to `origin/main` when remote access is available.
