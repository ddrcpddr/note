# 数据模型

应用使用 Node 内置 SQLite，数据库默认位置为：

```text
data/database/app.db
```

真实数据库文件不提交到 GitHub，目录通过 `.gitkeep` 保留。

## 数据表

### members

家庭成员表。当前不做复杂权限隔离，成员用于记录创建人和筛选。

- `id`
- `name`
- `avatar`
- `color`
- `sort_order`
- `is_current`
- `is_system`
- `created_at`
- `updated_at`

### categories

分类表，对应家庭生活事项分类。

- `id`
- `name`
- `slug`
- `color`
- `icon`
- `sort_order`
- `is_system`
- `created_at`
- `updated_at`

### notes

记录主表。

- `id`
- `title`
- `content`：纯文本正文，用于搜索、摘要和导出 fallback。
- `content_html`：可空，保存服务端清理后的用户富文本 HTML。
- `summary`
- `category_id`
- `member_id`
- `note_type`
- `occurred_at`
- `created_at`
- `updated_at`
- `source_type`
- `source_id`
- `save_status`
- `visibility`
- `original_title`
- `original_path`
- `original_category`
- `original_created_at`
- `original_updated_at`
- `raw_metadata`
- `is_archived`
- `is_deleted`

`visibility` 目前默认 `family`，用于后续扩展私密记录。

### tags

标签表。

- `id`
- `name`
- `slug`
- `color`
- `usage_count`
- `created_at`
- `updated_at`

### note_tags

记录和标签的多对多关系表。

- `note_id`
- `tag_id`

### attachments

附件元数据表。当前支持保存上传附件文件，并在表中记录元数据和相对路径。

- `id`
- `note_id`
- `file_name`
- `original_name`
- `mime_type`
- `file_size`
- `storage_path`
- `hash`
- `source_type`
- `created_at`

### imports

导入批次表，为 Note Station 导入做准备。

- `id`
- `source_type`
- `file_name`
- `file_path`
- `status`
- `total_count`
- `success_count`
- `failed_count`
- `created_by_member_id`
- `created_at`
- `completed_at`

### import_failures

导入失败项表。

- `id`
- `import_id`
- `original_title`
- `original_path`
- `error_message`
- `raw_data`
- `created_at`

### backups

备份记录表。

- `id`
- `status`
- `file_path`
- `file_size`
- `error_message`
- `created_at`

## 默认数据

初始化时会写入：

- 默认家庭成员：我、爱人。成员名称后续可自定义为老婆、妻子、配偶或其他称呼。
- 默认分类：家庭事务、房屋 / 设备、维修 / 售后、购物 / 消费、证件 / 账号、孩子 / 教育、老人 / 健康、宠物、工作 / 杂事、临时记录、未分类。
- 常用标签：待办、重要、维修、购物、账单、发票、保修、NAS、物业、医院。
- 三条示例记录。

## 正文和富文本

- `notes.content` 是唯一必须存在的正文字段，保存纯文本。
- `notes.content_html` 只保存用户新建 / 编辑时产生的安全 HTML，可为空。
- Note Station 导入的原始 HTML 不写入 `content_html`，仍保留在 `raw_metadata.originalContent` 中。
- 详情页展示顺序：用户富文本 `content_html` -> 导入原始 HTML -> 纯文本 `content`。
- 搜索始终基于纯文本 `content`。

## API

当前已实现：

- `GET /api/app-data`：读取成员、分类、标签、记录和数据目录。
- `GET /api/notes`：读取记录，支持搜索、分类、成员、标签和来源筛选。
- `POST /api/notes`：创建记录，支持纯文本和 `contentHtml` 富文本输入，标题为空时从纯文本正文自动生成。
- `PATCH /api/notes/:id`：编辑记录，支持同步更新纯文本和富文本。
- `GET /api/categories`：读取分类和记录数量。
- `POST /api/storage/backup`：手动备份数据库。
- `POST /api/storage/export-json`：导出 JSON。
- `POST /api/storage/export-markdown`：导出 Markdown。
- `POST /api/import/notestation/*`：Note Station dry-run、sandbox / 正式导入相关流程。

## 当前限制

- 不接入真实外网账号系统。
- 不做复杂权限隔离。
- 富文本暂不支持表格、协同编辑、块拖拽或正文内图片排版。
- Note Station 新样例仍必须先 dry-run，再考虑导入。
