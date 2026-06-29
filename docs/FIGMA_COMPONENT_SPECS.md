# Figma Component Specs

## 1. Component Principles

Components must match V1 and remain editable in Figma. They should be simple enough to translate back to the current React app.

Do not create decorative card systems that make the app look like a dashboard. Keep it mobile, warm, and practical.

## 2. Core Components

### 2.1 App Shell

Properties:

- Page title.
- Optional subtitle.
- Content area.
- Bottom navigation.
- Optional floating new button.

States:

- Home tab selected.
- Category tab selected.
- Search tab selected.
- Settings tab selected.

### 2.2 Bottom Navigation

Items:

- 首页
- 分类
- 搜索
- 设置

Properties:

- Icon.
- Label.
- Selected state.

Rules:

- Selected uses V1 green.
- Unselected uses soft gray.
- Same component across pages.

### 2.3 Record Card

Fields:

- Title.
- Summary.
- Category.
- Category icon.
- Member avatar/name.
- Time.
- Tags.
- Source.
- Attachment count.

Variants:

- Manual record.
- Note Station imported record.
- With attachments.
- Without attachments.
- Long title.
- Empty/missing summary fallback.

Note Station imported record should display source gently, for example “Note Station 导入”.

### 2.4 Member Chip

Purpose: member display and filtering.

Fields:

- Avatar.
- Name.
- Color.
- Selected state.
- Current member marker.

Default design options:

- 我
- 爱人

Additional members are user-defined and can later be renamed to 老婆、妻子、配偶、孩子、父母、老人/岳父母、宠物 or 其他.

Rules:

- Names are editable user labels.
- Do not use “爸爸/妈妈/老婆” as fixed product labels.
- Avatar can be initials, icon, or generated default avatar.
- Color is customizable.

### 2.5 Member Management Row

Fields:

- Avatar preview.
- Editable name.
- Color swatch.
- Current member toggle.
- Edit action.

Actions:

- Rename.
- Change avatar.
- Change color.
- Set as current member.

### 2.6 Category Chip

Fields:

- Icon.
- Name.
- Count.
- Color.
- Selected state.

Required categories in current baseline:

- 家庭事务
- 房屋 / 设备
- 维修 / 售后
- 购物 / 消费
- 证件 / 账号
- 孩子 / 教育
- 老人 / 健康
- 宠物
- 工作 / 杂事
- 临时记录
- 未分类

`未分类` should visually support “待整理” for imported records.

### 2.7 Search Input

Fields:

- Placeholder.
- Search icon.
- Clear action.
- Focus state.

States:

- Empty.
- Typing.
- Has results.
- No results.

### 2.8 Primary Button

Variants:

- Filled green.
- Secondary outline.
- Destructive caution.
- Disabled.
- Loading.

Use action-oriented labels:

- 保存记录
- 立即备份
- 导出 JSON
- 开始预览
- 确认导入

### 2.9 Attachment Item

Fields:

- File icon.
- Original name.
- Relative path/status.
- File size when available.
- Source type.

Variants:

- Image attachment.
- PDF/document.
- Unknown file.
- Imported from Note Station.
- Missing/unavailable file.

Do not display real file names from the user's data. Use generic examples.

### 2.10 Import Summary Card

Fields:

- Total records.
- Success count.
- Failure count.
- Attachment count.
- Category count.
- Status.

Current safe stats:

- 93 records.
- 20 attachments.
- 0 failures.

### 2.11 Empty State

Fields:

- Small illustration slot.
- Title.
- Body copy.
- Optional action.

Illustration slot can use image2 assets later, not Figma-generated bitmaps in this stage.

## 3. Tokens

Use V1 tokens:

- Primary green: `#0F8F80`.
- Deep green: `#087267`.
- Light green background: `#EAF6F2`.
- Page background: `#FCFAF6`.
- Card background: `#FFFFFF`.
- Input background: `#F3F4F1`.

Typography:

- System Chinese font stack.
- Large mobile headings.
- Comfortable body text.

Radius:

- Cards: 18-22px.
- Chips: 999px.
- Small tags: 8-10px.

Shadow:

- Soft and light; no heavy dashboard panels.

## 4. Accessibility Notes

- Member color must not be the only identifier; always show avatar/name.
- Important states must have text labels.
- Touch targets should be at least 44px.
- Long Chinese names and long imported titles must wrap gracefully.
- No horizontal scrolling at 390px width.
