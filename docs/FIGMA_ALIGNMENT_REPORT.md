# Figma Prototype Alignment Report

## 1. Scope

- Time: 2026-06-29 15:59:28 +08:00
- Baseline commit before this frontend alignment: `53e5a72 Record image2 icon sizing requirements`
- Goal: small-step frontend alignment with the current Figma prototype and V1 style.
- Non-goals: no database schema change, no large refactor, no Product Design call, no new image generation, no real data modification.

## 2. Adopted Navigation Rule

This round adopts the same rule confirmed by the Figma prototype thread:

- Primary pages keep the unified bottom navigation: Home, Categories, Search, Settings.
- Secondary pages use a top back action and do not show bottom navigation: New Record, Detail, Note Station Import, Member Management.
- The frontend must treat each Figma mobile frame as an independent page/screen reference. The horizontal arrangement on the Figma canvas is design presentation only.

## 3. Pages Aligned

### Home / Timeline

- Kept the existing mobile single-column timeline.
- Record cards now display member avatar initials instead of only a generic person icon.
- `uncategorized` is presented as `未分类 / 待整理`.

### New Record

- Added current member display.
- Added lightweight member selection chips before saving.
- Saving a new record now uses the selected member for that draft.
- The page stays a simple mobile note form, not a complex admin form.

### Search

- Added source filter on top of existing keyword, category, tag, member, and time filters.
- Source options: `全部`, `手动创建`, `Note Station 导入`.
- Search matching also includes the human source label.

### Categories

- Unified the uncategorized label to `未分类 / 待整理`.
- Kept the page as life-oriented category cards, not a taxonomy management screen.

### Note Station Import

- Replaced the old mock-oriented wording with current real-flow wording:
  - supports `.nsx` recognition;
  - starts from dry-run preview;
  - references sandbox and backup-before-formal-import flow;
  - keeps failure items visible;
  - avoids exposing real note content.
- Did not wire the browser page to execute the formal import command, to avoid accidental writes to the formal database.

### Settings / NAS Storage And Backup

- Added entry to Member Management.
- Kept backup/export/status in plain family-user language.
- Displayed data paths as relative placeholders such as `data/backups/` and `data/exports/` instead of full local paths in user-facing feedback.

### Member Management

- Added an independent `members` screen.
- The page shows current member, member list, avatar, color, current marker, and entry points for rename/avatar/color edits.
- Current version only switches the current member through the existing API/state; rename/avatar/color are UI placeholders for later editable member support.
- No permission matrix, login, destructive delete, or database schema change was added.

## 4. Mobile Usability Notes

Static/CSS alignment:

- Main app shell remains `max-width: 430px` with `overflow-x-hidden`.
- Chip rows remain intentionally horizontally scrollable inside their row only.
- Primary bottom navigation remains limited to the four main tabs.
- Secondary pages have fixed bottom action bars or top back action; content already keeps bottom padding through the mobile shell.

Browser check status:

- A production build passed after the UI changes.
- Playwright Chromium installation/check is tracked in the QA report for this same round.

## 5. Still Not Fully Aligned

- The frontend still uses internal React `screen` state, not URL-level routes such as `/members` or `/search`.
- Member rename, avatar change, and color change are visible entry points but not yet persisted because there is no backend API/schema for editing member profiles.
- Formal Note Station import is intentionally not executable from the browser page; it remains a protected command-line flow.
- Figma image2 avatar/category assets are not yet final individual frontend assets, so the app still uses initials and Lucide category icons.

## 6. Recommendation

This round is enough for a small prototype alignment pass. A later visual polish round can focus on screenshot-based 390px/430px spacing, exact copy tuning, and replacing initials/icons with final image2 assets after those assets are generated as individual files.
