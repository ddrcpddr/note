# 数据模型

本阶段实现的是 MVP 本地持久化数据层。应用使用 Node 内置 SQLite，数据库默认位置为：

```text
data/database/app.db
```

真实数据库文件不提交到 GitHub，目录通过 `.gitkeep` 保留。

## 数据表

### members

家庭成员表。MVP 阶段不做复杂权限隔离，成员用于记录创建人和筛选。

- `id`
- `name`
- `avatar`
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
- `content`
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

附件元数据表。阶段 2 只保存附件元数据，不做真实文件上传。

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

## API

阶段 2 已实现：

- `GET /api/app-data`：读取成员、分类、标签、记录和数据目录。
- `GET /api/notes`：读取记录，支持搜索、分类、成员和标签筛选。
- `POST /api/notes`：创建记录，标题为空时从正文自动生成。
- `GET /api/categories`：读取分类和记录数量。

## 阶段 2 限制

- 不接真实 NAS。
- 不做真实附件上传。
- 不做复杂登录或权限隔离。
- Note Station 导入仅预留表结构，真实导入框架在阶段 3 实现。
