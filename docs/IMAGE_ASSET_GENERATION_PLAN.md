# Image Asset Generation Plan

## 1. Stage Boundary

This is a plan for a future image2 Agent. Do not generate images in this documentation stage.

image2 is responsible for auxiliary assets only. Figma is responsible for pages, components, layout, and prototype flows.

## 2. Recommended Order

1. PWA app icon.
2. Default member avatar set.
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
avatar-child.png
avatar-parents.png
avatar-elders.png
avatar-pet.png
avatar-other.png
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
