# V1 Visual Final Audit

Date: 2026-06-29
Branch: main
Scope: compare current frontend implementation against the 7 V1 reference PNGs under `design/home-records-prototype/` while preserving current MVP functionality.

## Baseline Principles

- V1 remains the only visual reference.
- No Product Design call, no new images, no database/schema changes.
- Current MVP functionality is preserved: manual notes, search, category/member/source filters, Note Station preview/import flow, backup/export, PWA/NAS readiness.
- Default members remain `我 / 爱人` only.

## Page-by-page Audit

| V1 Reference | Current Alignment | Notes |
| --- | --- | --- |
| `page-1-home-selected.png` | Close | Home now keeps the V1 rhythm: large title, subtitle, rounded search, one quick-filter row, today card, timeline cards, floating plus, rounded bottom dock. Extra member/category filters are hidden behind `更多` to preserve functionality. |
| `page-2-new-record.png` | Close | New record keeps V1 top bar, title/body cards, compact type grid, tag row, attachment row, and floating bottom save area. Current-member selector is retained as a small strip because it is a current product requirement. |
| `page-3-record-detail.png` | Close | Detail page keeps large category icon, bold title, category/tags, metadata rows, content card, attachment card, related records, and rounded bottom actions. Creator/status are shown as chips to preserve current fields without making the page feel like an admin screen. |
| `page-4-search.png` | Close | Search keeps the V1 title, history chip, large search field, filter card, record results, and bottom nav. Member/source filters are folded into advanced filtering to keep the main filter block closer to V1. |
| `page-5-categories.png` | Close | Categories uses two-column cards, compact icons, counts, update text, floating `记一件事` button, and rounded bottom dock. Runtime category images are used instead of hand-drawn placeholder icons. |
| `page-6-import-note-station.png` | Close with product-safe differences | Import keeps V1 stepper/card/summary/preview/card rhythm. Copy now avoids unnecessary implementation terms in the main UI, but still preserves real `.nsx`, preview, backup, failure item, and safe import behavior. |
| `page-7-settings-backup.png` | Close with MVP differences | Settings starts with backup, export, attachment/data locations, Note Station import, and privacy note. It keeps storage paths because NAS self-hosting requires transparency; row chevrons and backup card have been softened toward V1. |

## Remaining Intentional Differences

- Some pages keep current MVP additions that were not in the old static V1 images: `我 / 爱人` member context, Note Station source metadata, source filtering, and protected import language.
- Settings still shows relative data paths such as `data/database/app.db` because NAS deployment transparency is part of the product.
- Browser routes are still internal React screens rather than URL-level routes; this does not affect mobile visual alignment.
- V1 reference content is illustrative; current app uses real/imported records and sanitized product copy.

## Verification Summary

- Automated mobile audit covers 8 screens at 390px and 430px.
- DOM metrics confirm 390px page width, 36px main titles, and 20px card radius.
- No page-level horizontal overflow was found in the latest audit.
- Sensitive runtime data remains ignored and outside commits.

## Conclusion

The current frontend is now close enough to V1 for the mobile MVP trial stage while preserving the real family NAS note workflow. Further changes should be treated as minor visual polish after user phone testing rather than core V1 alignment work.
