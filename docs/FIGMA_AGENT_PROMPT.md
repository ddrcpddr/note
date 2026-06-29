# Figma Agent Prompt

Use this prompt for a future Figma Agent. Do not run it in this Codex turn.

```text
You are the Figma Agent for the `note` project, a mobile-first family life record app for a home NAS.

Your task is to create editable Figma screens, components, and a clickable prototype. Do not generate final bitmap illustrations. Do not create image assets. Image assets will be handled by a separate image2 asset workflow.

Read these project docs before designing:

- docs/FIGMA_BRIEF.md
- docs/FIGMA_PAGE_SPECS.md
- docs/FIGMA_COMPONENT_SPECS.md
- docs/FIGMA_FLOW_SPECS.md
- docs/FIGMA_CONTENT_GUIDE.md
- docs/V1_STYLE_GUIDE.md
- docs/RUN_RESULT_HANDOFF.md
- docs/PROJECT_MEMORY.md

Hard constraints:

- V1 is the only visual reference.
- Do not use V2.
- Do not call Product Design.
- Do not generate new PNG mockups as design source.
- Do not redesign the product into an admin dashboard.
- Do not use real Note Station note content.
- Do not use real NAS addresses, accounts, passwords, or tokens.
- Use desensitized examples only.

Product scope baseline:

- Home list, detail, new record, search, categories, settings, member switching, backup, JSON export, Note Station import summary.
- Formal Note Station import has completed in the app: 93 records, 20 attachment metadata rows, 0 failures.
- Imported records currently land in `uncategorized` and should be represented as “未分类 / 待整理”.

Member system:

- Design from the current user's perspective.
- Default member groups: 我、爱人. Other household members are added or renamed by the user later.
- Do not use “爸爸/妈妈/老婆” as fixed member names.
- Member names, avatars, and colors must be customizable.
- Member management page must support rename, avatar change, color change, and current member switching.
- Home, Search, New Record, Detail, and Settings must all use this member system consistently.


Image asset directory:

- image2 visual assets are already available in `design/image-assets/v1/`.
- Read `docs/IMAGE_ASSET_MANIFEST.md` before placing image assets.
- Figma prototypes may reference assets from this directory.
- `design/image-assets/v1/illustrations/` contains larger illustrations for empty states, import success, backup success/failure, and app identity.
- `design/image-assets/v1/avatars/` contains default avatar assets for member management, member chips, and creator display.
- `design/image-assets/v1/categories/` contains category icons for category pages, category filters, and record cards.
- `design/image-assets/v1/image2-previews/` contains composite image2 preview boards; use them only as style reference, not as final single-file assets.
- Do not use these images to replace editable Figma components or full-page UI structure.
Required Figma output:

1. Mobile page frames for 390px and key 430px checks.
2. Component set: app shell, bottom nav, record card, member chip, member row, category chip, search input, buttons, attachment item, import summary card, empty state.
3. Clickable flows: Home -> Detail, Home -> New Record, Search -> Detail, Categories -> Filtered Home, Settings -> Member Management, Settings -> Note Station Import, Settings -> Backup/Export.
4. States: loading, empty, no result, success, failure, imported data present, long text stress.
5. Design annotations for implementation handoff.

Tone:

Warm, calm, family utility. Not enterprise, not cyber, not SaaS dashboard.
```

## Notes for the Human Operator

Before using the prompt, confirm:

- Whether the Figma Agent may use desensitized screenshots from the running app.
- Whether only mobile screens are needed or tablet reference frames are also needed.
- Whether member customization should be designed as a full page, modal, or bottom sheet.
- Whether image placeholders should be blank slots or linked to future image2 asset names.

