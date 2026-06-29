# Image Asset Generation Plan

## 1. Stage Boundary

This is a plan for a future image2 Agent. Do not generate images in this documentation stage.

image2 is responsible for auxiliary assets only. Figma is responsible for pages, components, layout, and prototype flows.

## 2. Recommended Order

1. PWA app icon.
2. Default member avatar set for 我 and 爱人.
3. Category icon set.
4. Empty state illustration.
5. Search no-result illustration.
6. Note Station import success / failure illustrations.
7. NAS backup success / failure illustrations.
8. Attachment placeholder icons.

## 3. Asset Matrix

| Asset | Priority | Suggested Size | Background | Usage |
| --- | --- | --- | --- | --- |
| PWA app icon | P0 | 1024 x 1024 | Solid | Manifest / home screen |
| Member avatars | P0 | 512 x 512 each | Transparent or color circle | Member chips / management |
| Category icons | P0 | 256 x 256 each | Transparent | Category chips / cards |
| Empty state | P1 | 1200 x 900 | Transparent or warm solid | Home empty state |
| Search no result | P1 | 1200 x 900 | Transparent or warm solid | Search page |
| Import success | P1 | 1200 x 900 | Transparent or warm solid | Note Station import |
| Import failure | P1 | 1200 x 900 | Transparent or warm solid | Import failure list |
| Backup success | P1 | 1200 x 900 | Transparent or warm solid | Settings backup |
| Backup failure | P1 | 1200 x 900 | Transparent or warm solid | Settings backup error |
| Attachment placeholders | P2 | 256 x 256 each | Transparent | Detail attachment list |

## 4. Review Checklist

For each generated asset, check:

- Matches V1 warm family tone.
- Does not look like backend/admin software.
- Does not use high-saturation tech blue or cyber style.
- Contains no real personal data.
- Contains no real Note Station content.
- Contains no real NAS address or credentials.
- Works at mobile size.
- Does not conflict with lucide/system icons in the app.

## 5. File Naming Plan

Suggested future names:

```text
app-icon-1024.png
avatar-self.png
avatar-partner.png
# Optional future member roles, only if user adds them:
# avatar-child.png
# avatar-parents.png
# avatar-elders.png
# avatar-pet.png
# avatar-other.png
category-family.png
category-house.png
category-repair.png
category-shopping.png
category-account.png
category-kids.png
category-health.png
category-pet.png
category-work.png
category-temporary.png
category-uncategorized.png
empty-home.png
empty-search.png
import-success.png
import-review-needed.png
backup-success.png
backup-unavailable.png
attachment-image.png
attachment-pdf.png
attachment-document.png
attachment-unknown.png
```

Do not save generated assets into Git until the user confirms the final asset set and privacy review.

## 6. Figma Coordination

Figma should use named placeholders first:

- `asset/app-icon`
- `asset/empty-home`
- `asset/empty-search`
- `asset/import-success`
- `asset/import-review-needed`
- `asset/backup-success`
- `asset/backup-unavailable`
- `asset/avatar-*`
- `asset/category-*`

image2 output can later replace those placeholders.

## 7. Stop Conditions

Stop and ask the user if:

- A prompt would require real note content.
- A prompt would require real family photos.
- A prompt would require a real NAS address or screenshot.
- The desired style conflicts with V1.
- The user asks for full-page UI images instead of auxiliary assets.

## 8. 2026-06-29 First Asset Batch

User requested the first complete visual asset batch for the family life record tool. This round generated auxiliary assets only and did not modify app UI code or business logic.

### Output Root

```text
design/image-assets/v1/
```

### Generated PNG Illustrations

| Asset | File | Purpose | Figma | Frontend |
| --- | --- | --- | --- | --- |
| PWA app icon | `illustrations/app-icon-1024.png` | Home-screen / PWA / browser icon source | Import directly; later export smaller sizes | Use after review for manifest icon derivatives |
| Empty home state | `illustrations/empty-home.png` | No records state on home/list pages | Import directly | Use in empty-state component |
| Search no result | `illustrations/empty-search.png` | Search page no-result state | Import directly | Use in search empty-state component |
| Note Station import success | `illustrations/import-success.png` | Import completion state | Import directly | Use in import flow success state |
| NAS backup success | `illustrations/backup-success.png` | Backup completed state | Import directly | Use in settings / backup status |
| NAS unavailable | `illustrations/backup-unavailable.png` | NAS connection or backup unavailable state | Import directly | Use in gentle error / offline backup state |

### Generated SVG Avatar Icons

| Asset | File | Purpose | Figma | Frontend |
| --- | --- | --- | --- | --- |
| Self avatar | `avatars/avatar-self.svg` | Default current-user avatar | Import directly as editable vector | Use directly as img/SVG component |
| Partner avatar | `avatars/avatar-partner.svg` | Default partner avatar | Import directly as editable vector | Use directly as img/SVG component |
| Child avatar | `avatars/avatar-child.svg` | Default child avatar | Import directly as editable vector | Use directly as img/SVG component |
| Parents avatar | `avatars/avatar-parents.svg` | Default parents avatar | Import directly as editable vector | Use directly as img/SVG component |
| Elders avatar | `avatars/avatar-elders.svg` | Default elder / in-law avatar | Import directly as editable vector | Use directly as img/SVG component |
| Pet avatar | `avatars/avatar-pet.svg` | Default pet avatar | Import directly as editable vector | Use directly as img/SVG component |
| Other avatar | `avatars/avatar-other.svg` | Default custom / other member avatar | Import directly as editable vector | Use directly as img/SVG component |

### Generated SVG Category Icons

| Asset | File | Purpose | Figma | Frontend |
| --- | --- | --- | --- | --- |
| Family tasks | `categories/category-family.svg` | 家庭事务 | Import directly as editable vector | Use directly as img/SVG component |
| House / equipment | `categories/category-house.svg` | 房屋 / 设备 | Import directly as editable vector | Use directly as img/SVG component |
| Repair / after-sales | `categories/category-repair.svg` | 维修 / 售后 | Import directly as editable vector | Use directly as img/SVG component |
| Shopping / spending | `categories/category-shopping.svg` | 购物 / 消费 | Import directly as editable vector | Use directly as img/SVG component |
| Documents / accounts | `categories/category-account.svg` | 证件 / 账号 | Import directly as editable vector | Use directly as img/SVG component |
| Child / education | `categories/category-kids.svg` | 孩子 / 教育 | Import directly as editable vector | Use directly as img/SVG component |
| Elder / health | `categories/category-health.svg` | 老人 / 健康 | Import directly as editable vector | Use directly as img/SVG component |
| Pet | `categories/category-pet.svg` | 宠物 | Import directly as editable vector | Use directly as img/SVG component |
| Work / misc | `categories/category-work.svg` | 工作 / 杂事 | Import directly as editable vector | Use directly as img/SVG component |
| Temporary notes | `categories/category-temporary.svg` | 临时记录 | Import directly as editable vector | Use directly as img/SVG component |
| Uncategorized | `categories/category-uncategorized.svg` | 未分类 | Import directly as editable vector | Use directly as img/SVG component |

### Review Notes

- The PNG illustrations were generated with the built-in image generation tool and copied into the project from Codex generated-image storage.
- The avatar and category assets were created as project-local SVG files so Figma and frontend code can reuse them without sprite slicing.
- All assets avoid real Note Station content, real NAS addresses, account text, passwords, tokens, QR codes, and private family data.
- No full-page UI prototype images were generated.
- The app icon should be manually reviewed before replacing the current manifest icon, because PWA icons need strong recognition at very small sizes.
- The two NAS illustrations can be used as-is or manually A/B reviewed in Figma if the error state feels too prominent.
### 2026-06-29 Image2 Icon Preview Addendum

After review, the manually created SVG avatar and category icons were not considered visually satisfying enough. Image2 was used to generate higher-fidelity bitmap preview sheets without deleting the SVG files.

| Asset | File | Status | Note |
| --- | --- | --- | --- |
| Image2 avatar set preview | `image2-previews/avatar-set-image2-preview.png` | Review candidate | More polished and warm; may be used as visual direction before splitting into individual PNG avatars. |
| Image2 category icon set preview | `image2-previews/category-set-image2-preview.png` | Review candidate | More cohesive than the hand-authored SVG category icons; suitable for Figma review before individual export. |

Decision note: image2 outputs bitmap images, not native editable SVG. If editable vectors are required later, use the accepted image2 preview as the visual reference for manual vectorization or Figma tracing.
### 2026-06-29 Image2 Icon Style Accepted

The user approved the current image2 direction for both icon preview sheets:

- `image2-previews/avatar-set-image2-preview.png`
- `image2-previews/category-set-image2-preview.png`

Current decision:

- Use these two image2 styles as the preferred direction for member avatars and category icons.
- Keep the hand-authored SVG files only as rough placeholders / implementation references, not as the preferred final visual style.
- Do not regenerate or split icons yet. Wait until the target icon dimensions and usage surfaces are confirmed.
- If later adjustments are needed, regenerate from the accepted image2 direction after defining final sizes.
### 2026-06-29 Closeout: Accepted Image2 Reference Only

Final closeout decision for this round:

- Current member avatar group uses `image2-previews/avatar-set-image2-preview.png` as the accepted visual direction.
- Current category icon group uses `image2-previews/category-set-image2-preview.png` as the accepted visual direction.
- These two files are image2 visual style references only. They are not final frontend-ready individual avatar files or individual category icon files.
- Do not split, regenerate, or replace these icon sets in this closeout round.
- After the Figma prototype pages, actual display sizes, and usage surfaces are confirmed, generate the final individual avatar files and individual category icon files using this accepted style.

## 8. Actual V1 Asset Directory Registered

The image2-generated V1 asset directory is now confirmed:

```text
design/image-assets/v1/
```

Registered subfolders:

- `avatars/`: individual default member avatar SVG files.
- `categories/`: individual category icon SVG files.
- `illustrations/`: app icon source and state illustration PNG files.
- `image2-previews/`: composite image2 preview boards for style reference only.

Current guidance:

- Use `docs/IMAGE_ASSET_MANIFEST.md` as the source of truth for filenames, paths, usage, frontend readiness, Figma readiness, and follow-up work.
- `image2-previews/` files are not final frontend assets; they are style boards.
- Future generation should focus only on missing companion assets, variants, optimization, or regenerated pieces after user review.
- Do not regenerate existing assets unless the user asks for a style change or quality revision.

## 9. 2026-06-29 Figma Delegated Icon Size Requirements

These requirements come from the Figma prototype thread and apply to future final generation/export of the member avatar set and category icon set. Do not generate, split, or regenerate assets in this documentation update.

### Member Avatar Icons

Accepted visual direction:

- Use `design/image-assets/v1/image2-previews/avatar-set-image2-preview.png` as the current avatar style reference.
- The preview board is only an image2 visual reference. It is not a set of final frontend-ready individual avatar files.

Final source asset requirements for later generation:

- Source size: `512 x 512 px` for each member avatar.
- Preferred format: PNG. Transparent background or a circular light-color background is acceptable.
- Optional format: SVG only if a clean and stable vector result can be produced.
- Save path: `design/image-assets/v1/avatars/`.
- File names: `avatar-self.png`, `avatar-partner.png`. Optional future files may include child, parents, elders, pet, or other if the user adds those members.

Mobile display references:

- Record card creator / small avatar: `24-28 px`.
- Member filter pill: `24-32 px`.
- Member management list: `40-48 px`.
- Current member emphasis area: `56-64 px`.

Design constraints:

- Must remain recognizable at `24 px`, so silhouettes should be simple and strokes should not be too thin.
- Do not hard-code labels such as father/mother; member names remain customizable.
- Default role set: self and partner. Other roles are optional user-added members.
- Express role feeling through color or simple symbols only; avoid realistic portraits and privacy-sensitive identity cues.
- Must work with circular cropping. Keep the main graphic inside a `12%-16%` safe margin.

### Category Icons

Accepted visual direction:

- Use `design/image-assets/v1/image2-previews/category-set-image2-preview.png` as the current category icon style reference.
- The preview board is only an image2 visual reference. It is not a set of final frontend-ready individual category icon files.

Final source asset requirements for later generation:

- Source size: `256 x 256 px` for each category icon.
- Preferred format: PNG with transparent background.
- Optional format: SVG only if a clean and stable vector result can be produced.
- Save path: `design/image-assets/v1/categories/`.
- File names: `category-family.png`, `category-house.png`, `category-repair.png`, `category-shopping.png`, `category-account.png`, `category-kids.png`, `category-health.png`, `category-pet.png`, `category-work.png`, `category-temporary.png`, `category-uncategorized.png`.

Mobile display references:

- Record card left category icon: `40-48 px`.
- Category filter / pill small icon: `16-20 px`.
- Category page card primary icon: `48-56 px`.
- Detail page category visual: `40-56 px`.

Design constraints:

- Must remain recognizable at `16-20 px`, so icons should be very simple with clear silhouettes.
- Use gentle green as the primary color with a few soft accent colors only.
- Avoid high-saturation tech blue and backend/admin-system styling.
- Transparent background is preferred so Figma/frontend can add the light circular container outside the asset.
- Main icon body should occupy about `64%-72%` of the canvas with enough whitespace around it.

### Follow-up Rule

After Figma prototype pages, actual display sizes, and usage surfaces are confirmed, generate the final individual avatar files and individual category icon files using the accepted image2 preview direction. Until then, keep the two preview boards as style references only.