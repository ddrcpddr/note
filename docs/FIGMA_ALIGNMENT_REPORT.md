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

## 7. Runtime Asset Mobile QA Update

- Time: 2026-06-29.
- Runtime WebP assets have been integrated into the frontend and checked at 390px and 430px widths across 8 screens.
- The only real UI issue found in this pass was long URL-like record titles overflowing the home record card. Record card titles and detail titles now use `overflow-wrap: anywhere` so real imported titles are preserved while still fitting mobile screens.
- Bottom navigation rules remain unchanged: Home, Categories, Search, Settings show bottom navigation; New Record, Detail, Note Station Import, Member Management use top back navigation.
- Default members remain `我` and `爱人`; no old default labels are shown.
- The earlier note that image2 assets were not final individual frontend assets is now outdated for first-batch assets: frontend uses runtime variants, while source assets remain for Figma and regeneration.

## 8. V1 Typography And Layout Alignment Update（2026-06-29）

Reference images used in this pass:

- `design/home-records-prototype/page-1-home-selected.png`
- `design/home-records-prototype/page-2-new-record.png`
- `design/home-records-prototype/page-3-record-detail.png`
- `design/home-records-prototype/page-4-search.png`
- `design/home-records-prototype/page-5-categories.png`
- `design/home-records-prototype/page-6-import-note-station.png`
- `design/home-records-prototype/page-7-settings-backup.png`

Observed V1 strengths:

- Page titles are confident but not oversized; cards use a smaller, steadier title/body/meta hierarchy.
- Cards feel light: warm white background, subtle border, small shadow, and consistent 20px-ish radius.
- Category cards use a two-column mobile grid with compact icon/title/count/update rhythm.
- Record cards emphasize title, short summary, tags, and one clean metadata row instead of too many competing status rows.
- Secondary pages use top back navigation and fixed bottom actions without making the screen feel like an admin panel.
- Settings prioritizes backup/export/data location before less frequent member-management actions.

Frontend changes made:

- Global card radius/shadow and chip density were softened to better match V1.
- Main page titles were normalized to a 36px tier; section/card text was reduced into a 17-21px range where appropriate.
- New Record type selection changed from large two-column cards to compact four-column cards like the V1 reference.
- Categories changed to a two-column card grid; common category names now stay on one line at 390px.
- Detail page title/body/attachment typography was reduced and spacing tightened.
- Import page removed the oversized top illustration block and starts with the stepper, closer to V1.
- Settings page now starts with Data Backup, with Member Management moved lower so the first screen stays close to V1.

Validation:

- Playwright mobile audit passed at 390px and 430px across 8 screens: `failed: 0`.
- DOM metrics confirmed page title font size is 36px, card radius is 20px, body scroll width equals viewport width, and common category titles no longer wrap.

Remaining differences:

- Home still retains member/category filter functionality, so it has more filter rows than the original V1 static image.
- Browser import page keeps the safer current implementation wording for dry-run / sandbox / backup flow, not the exact old static ZIP upload copy.
- Settings still includes member management because it is part of the current product scope, but it is no longer the first settings section.

## 9. V1 Home Filter Rhythm Refinement（2026-06-29）

This pass responds to the V1 reference where the home first screen keeps only one lightweight quick-filter row.

Frontend changes made:

- Home no longer shows member and category filters expanded by default.
- The first screen keeps search, quick filters, and a `更多` chip, matching the lighter V1 rhythm more closely.
- Member and category filters remain available inside a compact `更多筛选` panel, so existing MVP filtering functionality is preserved.
- If an advanced member/category filter is active, the panel stays visible so users can see why the list is narrowed.

Validation:

- `npm.cmd run build` passed after the change.
- Playwright mobile audit passed at 390px and 430px across 8 screens: `failed: 0`.
- DOM metrics confirmed the home page remains 390px wide at a 390px viewport, page title remains 36px, and card radius remains 20px.

Remaining differences:

- Search still exposes more filter dimensions than the original static V1 image because current MVP requires keyword, category, tag, member, time, and source filtering.
- Import and settings pages keep current real-flow safety wording instead of reverting to older static mock wording.

## 10. V1 Navigation And Filter Refinement（2026-06-29）

This pass focuses on areas that still felt more like a web dashboard than the V1 mobile app references.

Frontend changes made:

- Bottom navigation changed from a full-width hard bottom bar to an inset rounded dock, closer to the V1 Settings/Categories navigation treatment.
- Mobile shell bottom padding increased so the inset dock does not cover page content.
- Search keeps the V1-visible filter rhythm of category, tag, and time range first.
- Search member/source filters are preserved but moved behind a lightweight `成员 / 来源` advanced row; active advanced filters remain visible.
- New Record keeps the required current-member selector but changes it from a full settings-like card into a compact member strip, reducing form weight and moving closer to the V1 new-record page.

Validation:

- `npm.cmd run build` passed after the frontend changes.
- Playwright mobile audit passed at 390px and 430px across 8 screens: `failed: 0`.
- DOM metrics confirmed page titles remain 36px, cards remain 20px radius, and 390px pages do not exceed viewport width.

Remaining differences:

- Current MVP still exposes member and source filtering because those are real product requirements after Note Station import and member selection.
- New Record still shows current member because it is an agreed product requirement, even though the original static V1 page did not include it.

## 11. V1 Floating Actions And Secondary Bottom Bars（2026-06-29）

This pass focuses on the mobile action controls that remain visible near the bottom of the screen.

Frontend changes made:

- Categories floating create button now includes the small `记一件事` label, matching the V1 category reference more closely.
- Home keeps the simpler circular plus button, matching the V1 home reference.
- New Record, Detail, and Note Station Import bottom action areas now use a shared inset rounded action bar instead of a hard full-width bottom strip.
- The inset action bar keeps the existing actions and click behavior, but visually follows the softer rounded dock treatment used in V1.

Validation:

- `npm.cmd run build` passed after the frontend changes.
- Playwright mobile audit passed at 390px and 430px across 8 screens: `failed: 0`.
- DOM metrics confirmed page titles remain 36px, card radius remains 20px, and 390px pages do not exceed viewport width.

Remaining differences:

- Secondary action bars are still fixed for usability and to avoid hiding primary actions on long imported notes.
- Current MVP keeps its real Note Station safety wording and member selector even where the older V1 static mock did not show those product additions.

## 12. V1 Record And Detail Information Hierarchy（2026-06-29）

This pass focuses on record card density and detail-page information hierarchy.

Frontend changes made:

- Record card summaries now clamp to two lines, keeping imported long text from making cards feel heavier than the V1 timeline reference.
- Detail page keeps the core V1-style metadata rows focused on create time, update time, and source.
- Creator and saved status are still shown, but now as small chips below the main metadata rows instead of extra table-like rows.
- The detail content section uses a list-style icon, closer to the V1 detail reference than a tag icon.

Validation:

- `npm.cmd run build` passed after the frontend changes.
- Playwright mobile audit passed at 390px and 430px across 8 screens: `failed: 0`.
- DOM metrics confirmed page titles remain 36px, card radius remains 20px, and 390px pages do not exceed viewport width.

Remaining differences:

- Detail page still preserves creator/status and Note Station import metadata because they are real current MVP information.
- Long detail content remains fully readable in the detail page; only timeline summaries are visually clamped.
