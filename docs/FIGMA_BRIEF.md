# Figma Brief

## 1. Purpose

This document prepares a future Figma Agent to create editable design files and clickable prototypes for the family life record app. This round is documentation only: do not call Figma from Codex, do not generate images, and do not change app code.

## 2. Product Summary

The product is a mobile-first family life record system deployed on a home NAS. It replaces the family-use parts of Synology Note Station: quick daily notes, household repairs, purchases, documents, elder care, child education, pets, backup, JSON export, and imported historical notes.

The product should feel like a warm family utility, not an enterprise collaboration product, not a document management backend, and not a technical NAS console.

## 3. Current Functional Baseline

Use the current code and verified state as the design scope baseline.

Real and usable now:

- Home note list.
- Note detail page.
- New note creation.
- Search.
- Category filtering.
- Member filtering and current member switching.
- Category page with counts.
- Settings page with data paths, backup, JSON export, and Note Station entry.
- PWA basics.
- SQLite persistence.
- Manual database backup.
- JSON full export.
- Note Station `.nsx` dry-run parsing.
- Note Station sandbox import.
- Note Station formal import already completed: 93 imported notes, 20 attachment metadata rows, 0 failures.

Still simulated or awaiting future confirmation:

- Real login / PIN / permissions.
- Real NAS connection status. Current NAS status is local/simulated.
- Custom member management UI is required by the design brief but not fully implemented in current code.
- Imported Note Station records currently land in `uncategorized`; future manual categorization is needed.
- Tags from the real sample are 0, so real tag behavior cannot be visually overclaimed.
- New manual attachment upload is still metadata-oriented and needs future implementation.

## 4. Non-Negotiable Visual Direction

V1 is the only visual reference.

Use:

- Warm off-white page background.
- Green primary color.
- Soft cards.
- Large readable Chinese typography.
- Mobile-first layout.
- Bottom navigation.
- Light, calm, family-life tone.

Do not use:

- V2 visual directions.
- Product Design plugin outputs.
- New PNG mockups as design source.
- Admin dashboard layouts.
- Dense enterprise tables as primary screens.
- Cyber, high-saturation tech-blue, or SaaS-control-room aesthetics.

## 5. Member System Direction

Design the product from the current user's perspective. Default member groups for design should be:

- 我
- 老婆
- 孩子
- 父母
- 老人/岳父母
- 宠物
- 其他

Do not hard-code “爸爸/妈妈” as fixed product identities in Figma screens. They can appear only as editable example names if needed, but the component and information architecture must treat names as user-defined.

The member system must support later customization:

- Rename member.
- Change avatar.
- Change color.
- Switch current member.
- Use the same member identity across home, search, new record, detail, filters, and settings.

## 6. Privacy Requirements

All content in Figma must be desensitized.

Do not include:

- Real Note Station note titles or body text.
- Real NAS address.
- Real usernames.
- Passwords, tokens, or API keys.
- Real family identities, phone numbers, addresses, documents, invoices, or medical details.

Use safe examples such as:

- “周末整理阳台工具箱”
- “给家里路由器贴标签”
- “记录一次家电保养”
- “导入的历史记录待分类”

## 7. Figma Output Expectations

Future Figma Agent should create:

- Editable mobile screens.
- Component system.
- Clickable flow prototype.
- Responsive notes for 390px and 430px mobile widths.
- Interaction states for loading, empty, error, success, and offline/NAS-unavailable states.
- Design annotations for handoff back to code.

Figma should not create final bitmap illustrations. Those belong to the image asset workflow.
