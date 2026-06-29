# Image Asset Manifest

## 1. Scope

This manifest records the current image2-generated visual assets for the V1 design handoff.

Actual directory:

```text
design/image-assets/v1/
```

Current subfolders:

- `avatars/`
- `categories/`
- `illustrations/`
- `image2-previews/`

Rules:

- Do not move or delete these files during Figma handoff.
- Do not treat `image2-previews/` as final sliced production assets.
- Do not place real Note Station content, real NAS addresses, credentials, database files, exports, backups, or attachments in this directory.
- Figma may reference these assets as visual sources, but UI structure and components should stay editable in Figma.

## 2. Asset Summary

| Type | Count | Frontend readiness | Figma readiness | Notes |
| --- | ---: | --- | --- | --- |
| avatars | 9 files: 2 final PNG defaults + 7 optional SVG presets | PNG defaults are frontend-ready after integration decision | Yes | First-batch defaults are `avatar-self.png` and `avatar-partner.png`; other avatar SVG files are optional future role presets |
| categories | 22 files: 11 final PNG icons + 11 SVG references | PNG icons are frontend-ready after icon mapping decision | Yes | Use PNG category icons as the first-batch final assets; SVG files remain references/placeholders |
| illustrations | 7 PNG files | Yes, after size/performance review | Yes | Empty, import success/review, backup, and app icon assets |
| image2-previews | 2 | No | Style reference only | Composite preview boards, not final single-purpose assets |

## 3. Detailed Registry

| File | Relative path | Type | Purpose | Direct frontend use | Figma use | Style reference only | Needs split / regeneration |
| --- | --- | --- | --- | --- | --- | --- | --- |
| avatar-child.svg | `design/image-assets/v1/avatars/avatar-child.svg` | avatars | Optional future avatar for child member group | Yes, after member avatar mapping | Yes, member management and creator display | No | Maybe, if custom avatar upload/edit states need more variants |
| avatar-elders.svg | `design/image-assets/v1/avatars/avatar-elders.svg` | avatars | Optional future avatar for elders / parents-in-law member group | Yes, after member avatar mapping | Yes, member management and creator display | No | Maybe, if elders and parents-in-law are split later |
| avatar-other.svg | `design/image-assets/v1/avatars/avatar-other.svg` | avatars | Optional future avatar for other member group | Yes, after member avatar mapping | Yes, member management and creator display | No | Maybe, if more household roles are added |
| avatar-parents.svg | `design/image-assets/v1/avatars/avatar-parents.svg` | avatars | Optional future avatar for parents member group | Yes, after member avatar mapping | Yes, member management and creator display | No | Maybe, if father/mother are separately customized by user |
| avatar-partner.svg | `design/image-assets/v1/avatars/avatar-partner.svg` | avatars | Default avatar for partner / 爱人 member | Yes, after member avatar mapping | Yes, member management and creator display | No | Maybe, if user customizes partner avatar |
| avatar-pet.svg | `design/image-assets/v1/avatars/avatar-pet.svg` | avatars | Optional future avatar for pet member group | Yes, after member avatar mapping | Yes, member management and creator display | No | Maybe, if multiple pets need separate avatars |
| avatar-self.svg | `design/image-assets/v1/avatars/avatar-self.svg` | avatars | Default avatar for current user / self | Yes, after member avatar mapping | Yes, member management and creator display | No | Maybe, if user-uploaded avatar support is added |
| category-account.svg | `design/image-assets/v1/categories/category-account.svg` | categories | Category icon for documents / accounts | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-family.svg | `design/image-assets/v1/categories/category-family.svg` | categories | Category icon for household tasks | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-health.svg | `design/image-assets/v1/categories/category-health.svg` | categories | Category icon for elder / health records | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-house.svg | `design/image-assets/v1/categories/category-house.svg` | categories | Category icon for house / equipment | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-kids.svg | `design/image-assets/v1/categories/category-kids.svg` | categories | Category icon for child / education records | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-pet.svg | `design/image-assets/v1/categories/category-pet.svg` | categories | Category icon for pet records | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-repair.svg | `design/image-assets/v1/categories/category-repair.svg` | categories | Category icon for repair / after-sales records | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-shopping.svg | `design/image-assets/v1/categories/category-shopping.svg` | categories | Category icon for shopping / spending records | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-temporary.svg | `design/image-assets/v1/categories/category-temporary.svg` | categories | Category icon for temporary notes | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| category-uncategorized.svg | `design/image-assets/v1/categories/category-uncategorized.svg` | categories | Category icon for uncategorized / to-organize imported records | Yes, after category icon mapping | Yes, especially imported Note Station records | No | Maybe, if “待整理” gets a distinct icon later |
| category-work.svg | `design/image-assets/v1/categories/category-work.svg` | categories | Category icon for work / miscellaneous records | Yes, after category icon mapping | Yes, category page, filters, record cards | No | Usually no |
| app-icon-1024.png | `design/image-assets/v1/illustrations/app-icon-1024.png` | illustrations | PWA app icon source | Yes, after generating required icon sizes and manifest mapping | Yes, app identity reference | No | Yes, needs downscaled app icon sizes before frontend production use |
| backup-success.png | `design/image-assets/v1/illustrations/backup-success.png` | illustrations | Backup success illustration | Yes, after image size optimization | Yes, settings backup success state | No | Maybe, if transparent/background variants are needed |
| backup-unavailable.png | `design/image-assets/v1/illustrations/backup-unavailable.png` | illustrations | Backup failure / NAS unavailable illustration | Yes, after image size optimization | Yes, settings backup failure state | No | Maybe, if transparent/background variants are needed |
| empty-home.png | `design/image-assets/v1/illustrations/empty-home.png` | illustrations | Home empty state illustration | Yes, after image size optimization | Yes, home empty state | No | Maybe, if different aspect ratio is needed |
| empty-search.png | `design/image-assets/v1/illustrations/empty-search.png` | illustrations | Search no-result illustration | Yes, after image size optimization | Yes, search no-result state | No | Maybe, if different aspect ratio is needed |
| import-success.png | `design/image-assets/v1/illustrations/import-success.png` | illustrations | Note Station import success illustration | Yes, after image size optimization | Yes, import success state | No | Maybe, if failure/review-needed companion image is generated later |
| avatar-set-image2-preview.png | `design/image-assets/v1/image2-previews/avatar-set-image2-preview.png` | image2-previews | Composite preview for avatar set style | No | Yes, as reference only | Yes | Yes, split into individual avatar files already exists in `avatars/`; regenerate only if style changes |
| category-set-image2-preview.png | `design/image-assets/v1/image2-previews/category-set-image2-preview.png` | image2-previews | Composite preview for category icon style | No | Yes, as reference only | Yes | Yes, split into individual category files already exists in `categories/`; regenerate only if style changes |

## 4. Frontend Integration Notes

Recommended future integration work:

- Map `avatar-self` and `avatar-partner` to the default member avatar presets. Other avatar files are optional future role presets and should not be treated as first-batch defaults.
- Map `categories/*.svg` to category IDs in `src/shared/defaults.js`.
- Generate PWA icon sizes from `illustrations/app-icon-1024.png` before replacing current placeholder icon.
- Optimize illustration PNGs before shipping in the app bundle.
- Keep image assets optional; core data flows must work even when illustrations fail to load.

## 5. Figma Handoff Notes

Figma Agent may reference:

- `illustrations/` for empty states, import success, backup success/failure, and app identity.
- `avatars/` for member management, creator display, member chips, and current member selector.
- `categories/` for category page, category filters, and record cards.
- `image2-previews/` only as style boards, not as final UI assets.

## 6. Safety Review

Current manifest records generated visual assets only. It does not include:

- Real `.nsx` files.
- Real Note Station note body.
- Dry-run JSON.
- Sandbox or formal database files.
- Backups.
- Exports.
- Attachments from imported notes.
- Real NAS address, account, password, token, or API key.

## 7. First-Batch Final PNG Assets

These are the current first-batch single-file assets for Figma and frontend handoff. Preview boards in `image2-previews/` remain style references only.

| File | Relative path | Type | Actual size | Figma recommended use | Direct frontend use | Style reference only | Missing / follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| avatar-self.png | `design/image-assets/v1/avatars/avatar-self.png` | avatar | 512 x 512 | Member management, creator display, member chips, current member selector | Yes, after member avatar mapping | No | None for first batch |
| avatar-partner.png | `design/image-assets/v1/avatars/avatar-partner.png` | avatar | 512 x 512 | Member management, creator display, member chips, current member selector | Yes, after member avatar mapping | No | User requested a younger, lively partner style; current file is the replacement |
| category-family.png | `design/image-assets/v1/categories/category-family.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-house.png | `design/image-assets/v1/categories/category-house.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-repair.png | `design/image-assets/v1/categories/category-repair.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-shopping.png | `design/image-assets/v1/categories/category-shopping.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-account.png | `design/image-assets/v1/categories/category-account.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-kids.png | `design/image-assets/v1/categories/category-kids.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-health.png | `design/image-assets/v1/categories/category-health.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-pet.png | `design/image-assets/v1/categories/category-pet.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-work.png | `design/image-assets/v1/categories/category-work.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-temporary.png | `design/image-assets/v1/categories/category-temporary.png` | category | 256 x 256 | Category page, filters, record cards | Yes, after category icon mapping | No | None |
| category-uncategorized.png | `design/image-assets/v1/categories/category-uncategorized.png` | category | 256 x 256 | Category page, filters, imported records needing organization | Yes, after category icon mapping | No | None |
| import-review-needed.png | `design/image-assets/v1/illustrations/import-review-needed.png` | illustration | 1200 x 900 | Note Station import failure / review-needed state | Yes, after image size optimization | No | None |

## 8. Current Missing Items

No first-batch required visual asset is currently missing for the agreed scope:

- PWA / app icon: present as `illustrations/app-icon-1024.png`.
- Empty home state: present as `illustrations/empty-home.png`.
- Search no-result state: present as `illustrations/empty-search.png`.
- Note Station import success and review-needed states: present as `illustrations/import-success.png` and `illustrations/import-review-needed.png`.
- NAS backup success and unavailable states: present as `illustrations/backup-success.png` and `illustrations/backup-unavailable.png`.
- Default member avatars for first batch: present as `avatars/avatar-self.png` and `avatars/avatar-partner.png`.
- 11 default category icons: present as `categories/category-*.png`.

Recommended frontend follow-up: generate compressed/runtime variants after the actual bundle and display strategy are chosen. Source PNGs should remain in `design/image-assets/v1/`.