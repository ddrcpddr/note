---
name: mvp-bugfix-qa
description: Use when working in the current family life note project to fix bugs, verify MVP QA flows, check mobile UI regressions, validate persistence, backup, export, or Note Station import behavior, especially when the user says "使用 mvp-bugfix-qa skill 修复 bug".
---

# MVP Bugfix QA

Use this skill only for the current family life note project. Follow a reproduce-first, minimal-fix, verify-before-commit workflow.

## Project Principles

- Treat V1 as the only visual reference.
- Do not call Product Design.
- Do not generate new PNG assets.
- Do not redesign the UI.
- Do not make pages look like an admin dashboard.
- Do not connect to a real NAS address unless the user provides it.
- Do not guess the real Synology Note Station export format unless the user provides a real sample.
- Do not commit `data/`, `backups/`, `exports/`, `attachments/`, database files, logs, real import files, passwords, tokens, or real NAS addresses.

## Required Bugfix Flow

Run these steps in order every time:

1. Read `docs/PROJECT_MEMORY.md`, `docs/QA_REPORT_CURRENT.md`, `docs/RUN_RESULT_HANDOFF.md`, and `README.md`.
2. Run `git status`.
3. Reproduce the user-described problem.
4. If the problem cannot be reproduced, record why and tell the user; do not edit code.
5. Identify the smallest cause.
6. Make only the smallest necessary fix.
7. Do not perform large refactors.
8. Do not add opportunistic new features.
9. Run `npm run build`.
10. If `npm run check` exists, run it.
11. If `npm run test` exists, run it.
12. Update `docs/QA_REPORT_CURRENT.md`.
13. Update `docs/PROJECT_MEMORY.md`.
14. Output the changed-file list.
15. Commit with a message starting with `Fix:`.

Prefer adding or updating a focused automated test before changing behavior. If a test-first cycle is impractical for a documentation-only or configuration-only fix, say why in the QA report.

## Required QA Coverage

After each fix, check at least:

- Home page can display notes.
- Detail page can open.
- New note can be saved.
- Newly saved note persists after refresh.
- Search works.
- Category filter works.
- Member filter works.
- Settings page opens.
- Manual backup works when the fix touches storage, settings, or backup behavior.
- JSON export works when the fix touches storage, settings, export, or data listing behavior.
- Note Station import page opens when the fix touches import, routing, storage, or data listing behavior.

## Mobile UI Checks

For UI-related fixes, verify:

- No obvious horizontal overflow at phone width.
- Text does not collide or sit on borders.
- Buttons are not blocked.
- Bottom navigation stays consistent.
- The page keeps the V1 style.
- The page does not look like an admin system.

## Data Safety Checks

Before every commit, confirm:

- Database files are not staged.
- `data/` runtime data is not staged.
- `backups/` files are not staged.
- `exports/` files are not staged.
- `attachments/` files are not staged.
- Real import files are not staged.
- `.gitignore` still protects runtime data.

Useful checks:

```bash
git status --short
git status --ignored --short data
git ls-files data
```

Only `.gitkeep` files should be tracked under runtime data folders.

## Stop Conditions

Stop and ask the user before continuing if any of these happen:

- `npm run build` fails twice in a row.
- A real Note Station export sample is required.
- A real NAS path is required.
- An account, password, or token is required.
- A large dependency is needed.
- A database structure refactor is needed.
- The core product direction would need to change.

## QA Report Format

Ensure `docs/QA_REPORT_CURRENT.md` includes at least:

- Test time.
- Current commit.
- Reproduction steps.
- Root cause.
- Fix summary.
- Commands run.
- Test results.
- Remaining issues.
- Next recommendation.

## Completion Rules

Do not claim the bug is fixed until the reproduction path is verified after the change and the required commands have passed. If verification is partial, state exactly which checks were skipped and why.
