# Figma Page Specs

## 1. Canvas Rules

Primary canvas sizes:

- Mobile: 390 x 844.
- Large mobile: 430 x 932.
- Optional tablet reference: 768 x 1024, only for checking layout expansion.

All pages should keep V1 spacing and tone:

- Page background: warm off-white.
- Cards: white, soft shadow, large radius.
- Main action: green.
- Bottom navigation: persistent on primary tabs.
- Text: large, readable Chinese.

## 2. Required Pages

### 2.1 Home

Purpose: daily entry point for family records.

Must include:

- Product title and short subtitle.
- Search entry.
- Member filter using the customizable member system.
- Category / quick filter chips.
- Record cards.
- Floating new-record button.
- Bottom navigation.

Record card must show:

- Category icon and color.
- Title.
- Summary.
- Tags when present.
- Member identity.
- Time.
- Source indicator when imported from Note Station.
- Attachment count when present.

Imported records:

- Use `notestation_import` as source wording, but present it humanly: “Note Station 导入”.
- Do not expose raw file paths as main content.
- `uncategorized` should read as “未分类 / 待整理”.

### 2.2 Search

Purpose: find family records across imported and manual notes.

Must include:

- Search input.
- Recent searches or suggested safe examples.
- Filters: member, category, tags, source, time range.
- Result list using same record card pattern as home.
- Empty state.
- No-result state.

Search must support imported records and manual records equally.

### 2.3 New Record

Purpose: fast mobile note creation.

Must include:

- Title input.
- Body input.
- Category selector.
- Member selector using current member default.
- Type selector or lightweight chips.
- Attachment entry placeholder.
- Save action.
- Save status.

Member behavior:

- Default to current member.
- Allow switching member before saving.
- Show avatar/color consistently.
- Do not use fixed “爸爸/妈妈” labels.

### 2.4 Detail

Purpose: comfortable reading and later editing.

Must include:

- Back action.
- Title.
- Member identity.
- Category.
- Created/updated time.
- Source type.
- Content body.
- Attachment list.
- Original Note Station metadata section for imported records.
- Related records placeholder if useful.

Imported record detail should show:

- Source: Note Station 导入.
- Original category/notebook path as secondary metadata.
- Original created/updated time.
- Attachment metadata and relative status.

Do not display full raw HTML metadata as visible content. Raw structure is saved for future restoration, not primary reading.

### 2.5 Categories

Purpose: browse family-life areas.

Must include:

- Category grid/list.
- Record counts.
- Highlight for `uncategorized` / 待整理.
- Category icon and color.
- Entry into filtered home/list view.

Do not turn this into an admin taxonomy manager in V1. If category management is needed later, keep it secondary.

### 2.6 Settings

Purpose: data confidence, member management, backup/export, import.

Must include:

- Data storage status.
- Database path summary, without real full NAS address in Figma examples.
- Attachments path summary.
- Backup path summary.
- Export path summary.
- Manual backup action.
- JSON export action.
- Note Station import status / entry.
- Member management entry.
- Current member switcher.

Settings must feel reassuring, not technical. Avoid presenting it as a backend control panel.

### 2.7 Member Management

Purpose: manage the household identity system.

This page is required for the next design phase even if current code only supports current member switching.

Must support:

- Member list.
- Rename member.
- Change avatar.
- Change color.
- Switch current member.
- Add optional member placeholder.
- Disable/delete/archive member as a future consideration, not a primary destructive action.

Default design members:

- 我
- 老婆
- 孩子
- 父母
- 老人/岳父母
- 宠物
- 其他

All names must be editable.

### 2.8 Note Station Import

Purpose: safe import visibility.

Must include:

- Import entry state.
- Dry-run / preview state.
- Sandbox-tested wording if represented.
- Formal import completed summary.
- Failure list state.
- Success state.
- Attachment summary.

Use only desensitized counts and generic examples. Do not show real imported note body.

Current true import numbers that may be used as statistics:

- 93 imported records.
- 20 attachment metadata rows.
- 0 failures.
- Imported records currently in `uncategorized` for later cleanup.

### 2.9 Backup and Export States

Can be part of Settings or separate flow frames.

Must cover:

- Ready state.
- Backup in progress.
- Backup success.
- Backup failed / NAS unavailable.
- JSON export ready.
- JSON export success.

Use generic local/NAS path placeholders, not real paths.

## 3. Page Status Matrix

Each page should include key states when applicable:

- Loading.
- Empty.
- Error.
- Success.
- Imported data present.
- Mobile narrow width stress case.

## 4. Copy Style

Use plain family language.

Good:

- “记录家里的大小事”
- “这些历史记录已经导入，之后可以慢慢整理分类。”
- “备份完成，数据又多一份安心。”

Avoid:

- “管理控制台”
- “权限矩阵”
- “企业级协同”
- “数据治理中心”
