# Image Asset Brief

## 1. Purpose

This document prepares a future image2 asset workflow. This round does not generate images.

image2 should create auxiliary visual assets only. It must not generate full-page UI mockups or replace Figma page design.

## 2. Product Visual Direction

Assets must match V1:

- Warm family-life tone.
- Soft, simple, friendly.
- Light background compatibility.
- Green primary accent.
- Gentle color palette.
- Clear at mobile sizes.

Avoid:

- High-saturation tech blue.
- Cyber style.
- Enterprise dashboard style.
- Dark sci-fi gradients.
- Busy 3D scenes.
- Stock-photo feeling.

## 3. Allowed Asset Types

image2 may generate:

- PWA App icon.
- Empty state illustration.
- Search no-result illustration.
- Note Station import success illustration.
- Note Station import failure illustration.
- NAS backup success illustration.
- NAS backup failure illustration.
- Default family member avatars.
- Category icons.

## 4. Forbidden Asset Types

image2 must not generate:

- Full-page UI prototype images.
- Screens that replace Figma frames.
- Images containing real Note Station note content.
- Images containing real family privacy.
- Images containing real NAS addresses.
- Images containing account names, passwords, tokens, QR codes, or real documents.
- Highly saturated technology-blue or cyber assets.
- Backend/admin-control-panel visuals.

## 5. Privacy Rules

All generated images must be generic and desensitized.

Do not include:

- Real note titles or body text.
- Real names.
- Real addresses.
- Real screenshots.
- Real invoices or medical records.
- Real NAS IP/domain.

If text appears in an image, it should be generic or omitted. Prefer icon/illustration without readable text.

## 6. Style Guidance

Suggested style:

- Flat or soft vector-like illustration.
- Rounded shapes.
- Light paper/card texture if subtle.
- Small household objects: notebook, folder, plant, router, safe box, calendar, simple photo thumbnail.
- Green accent with warm neutrals.

Do not rely on decorative blobs or one-note gradients.

## 7. Delivery Requirements

Future image2 Agent should output:

- Asset name.
- Purpose.
- Prompt used.
- Suggested size.
- Transparent or solid background requirement.
- Where it appears in Figma/app.
- Accessibility note.

Recommended formats for later export:

- PNG for illustrations.
- SVG or PNG for icons depending on app implementation.
- 1024px source for app icon, later downscaled.

## 8. Integration Notes

Figma should reserve slots for these assets, but image2 owns the actual asset generation. The final app should still work without illustrations; illustrations are supportive, not required for data workflows.
