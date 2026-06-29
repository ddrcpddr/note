# 家庭生活记录工具 PRD

## 1. 产品定位

本项目是一个面向家庭成员共同使用的私有化生活记录系统，用来替代 Synology Note Station 在家庭琐事记录场景中的核心能力。

它不是复杂的商业笔记软件，也不是企业协同系统，而是一个轻量、温和、手机端友好的家庭生活档案工具。家庭成员可以通过手机浏览器或 PWA 访问同一个部署在家里 NAS 或局域网服务器上的应用，所有记录、附件和导入数据集中保存在 NAS 上，方便统一备份、统一管理和长期保存。

核心心智是：

- 像生活时间线，而不是文件夹列表。
- 像家庭事项档案，而不是普通笔记本。
- 多人可用，但不做复杂权限系统。
- 数据集中在 NAS，MVP 不做每台手机本地数据库双向同步。

## 2. 核心目标

1. 支持家庭成员通过手机访问并记录家庭事项。
2. 每条记录显示创建人；默认成员为“我”和“爱人”，后续可自定义为老婆、妻子、配偶或其他称呼。
3. 首页、搜索页支持按成员筛选记录。
4. 新建记录足够快，适合安卓手机端随手记录。
5. 通过分类、标签、成员、来源、时间等字段降低流水账感。
6. 支持导入 Synology Note Station 导出的历史记录。
7. 导入后保留原始标题、正文、时间、附件、原始路径、原始分类和来源信息。
8. 应用优先部署在 NAS 或局域网服务器上，数据直接存储在 NAS 目录。
9. 数据库和附件目录方便整体备份。
10. 支持手动导出 JSON，并为后续 Markdown 导出预留。

## 3. MVP 功能范围

### 3.1 首页 / 生活时间线

- 按时间倒序展示所有记录。
- 每条记录以卡片展示。
- 卡片显示：
  - 标题
  - 摘要
  - 时间
  - 分类
  - 标签
  - 创建人头像或昵称
  - 是否有附件
  - 保存/同步状态
- 支持快速搜索入口。
- 支持按分类筛选。
- 支持按标签筛选。
- 支持按成员筛选。

### 3.2 快速新建记录

- 手机端底部固定“新建记录”入口。
- 默认记录当前登录成员为创建人。
- 新建时可选择记录类型：
  - 普通记录
  - 家庭事务
  - 维修维护
  - 购物消费
  - 账号资料
  - 重要备忘
  - 临时想法
- 支持标题、正文、分类、标签、时间、附件。
- 标题为空时，系统使用正文前几十个字自动生成标题。
- 保存时显示状态：
  - 保存中
  - 已保存
  - 保存失败
  - 离线，待同步

### 3.3 家庭成员

- MVP 支持简单成员身份。
- 家庭成员登录后都可以查看全部记录。
- 每条记录显示创建人。
- 每个成员可以新建、编辑自己写的记录。
- MVP 暂不做复杂权限隔离。
- 后续扩展：
  - 私密记录
  - 仅自己可见
  - 家庭共享范围
  - 成员权限角色

### 3.4 分类体系

默认分类：

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

分类可以后续编辑。分类页显示每个分类的记录数量。

### 3.5 标签系统

- 一条记录可以有多个标签。
- 标签用于跨分类检索。
- 常见标签包括：水电、宽带、物业、发票、保修、医院、学校、车辆、家电、密码、NAS。
- 支持标签管理和标签筛选。

### 3.6 记录详情页

- 查看完整记录内容。
- 支持编辑。
- 显示：
  - 创建人
  - 创建时间
  - 更新时间
  - 分类
  - 标签
  - 来源：手动创建 / Note Station 导入
  - 同步状态
  - 附件
- 预留关联记录区域。
- 如果多人同时编辑同一条记录，MVP 先提示：“记录已被其他成员更新，请刷新后再编辑。”

### 3.7 搜索

- 支持标题和正文搜索。
- 支持分类、标签、成员、时间范围筛选。
- 搜索结果以卡片形式展示。
- 空状态文案友好，例如：“还没有找到相关记录，可以换个关键词或减少筛选条件。”

### 3.8 Note Station 历史数据导入

- 支持导入 Synology Note Station 导出的文件。
- 不假设导出格式固定，先建设可扩展导入解析模块。
- 收到实际样例后，先分析文件结构，再写解析逻辑。
- 导入前支持预览。
- 预览内容包括：
  - 识别到的记录数量
  - 分类数量
  - 附件数量
  - 失败项数量
  - 原始路径摘要
- 导入后记录来源为 `note_station_import`。
- 导入记录默认归属到执行导入的当前成员，并保留原始来源元数据。
- 导入后保留原始标题、正文、创建时间、更新时间、附件、原始路径、原始分类等信息。
- 支持查看导入失败记录。

### 3.9 NAS 存储与备份

- 应用优先部署在家里的 NAS 或局域网服务器上。
- 手机端通过浏览器或 PWA 访问同一个服务。
- 数据库文件保存在 NAS 指定目录。
- 附件文件保存在 NAS 指定附件目录。
- 所有家庭成员访问同一个应用，MVP 不做复杂的手机端双向同步。
- 支持手动导出 JSON。
- 支持定期自动备份数据库。
- 后续支持 Markdown 导出。

## 4. 非目标

MVP 暂不做：

- 企业级多租户协作。
- 复杂权限系统。
- 每台手机本地数据库再同步到 NAS 的复杂方案。
- 第三方云同步。
- 外网访问配置自动化。
- 富文本编辑器深度能力。
- 自动 AI 分类。
- 复杂离线编辑和冲突合并。

## 5. 技术方案

### 5.1 推荐技术栈

- 前端：React + Vite
- 后端：Express
- 数据库：SQLite
- 附件：NAS 文件夹存储
- 部署：NAS / 家庭局域网服务器 / Docker
- 访问方式：手机浏览器 / PWA
- 搜索：MVP 先使用 SQLite LIKE，后续升级 SQLite FTS5

### 5.2 部署模式

优先采用集中式局域网部署：

1. 应用运行在 NAS 或家里局域网服务器上。
2. 家庭成员手机访问同一个 Web/PWA 地址。
3. 所有数据直接写入 NAS 上的 SQLite 数据库。
4. 附件直接保存到 NAS 附件目录。
5. 局域网在线时正常使用。
6. 网络断开时提示：“当前无法连接家庭 NAS。”
7. 后续再考虑外网访问、离线草稿和自动同步。

### 5.3 数据目录结构

目标目录结构：

```text
data/
  database/
    app.db
    backups/
      app-2026-06-28-203000.db
  attachments/
    2026/
      06/
        <attachment-file>
  imports/
    notestation/
      batches/
      raw/
      failed/
  exports/
    json/
    markdown/
  logs/
```

要求：

- 数据库和附件要方便整体备份。
- 附件不直接塞进数据库。
- 数据库中保存附件路径和元数据。
- 定期自动备份数据库到 `data/database/backups/`。
- 手动导出 JSON 到 `data/exports/json/`。
- Markdown 导出作为后续功能。

## 6. 数据库表设计草案

### members

家庭成员表。

- `id`
- `display_name`
- `avatar_color`
- `avatar_text`
- `role`
- `is_active`
- `created_at`
- `updated_at`

### notes

记录主表。

- `id`
- `title`
- `content`
- `summary`
- `category_id`
- `note_type`
- `created_by_member_id`
- `last_edited_by_member_id`
- `occurred_at`
- `created_at`
- `updated_at`
- `source_type`
- `source_id`
- `sync_status`
- `version`
- `original_title`
- `original_path`
- `original_category`
- `original_created_at`
- `original_updated_at`
- `is_archived`
- `is_deleted`

### categories

分类表。

- `id`
- `name`
- `slug`
- `color`
- `icon`
- `sort_order`
- `is_system`
- `created_at`
- `updated_at`

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

记录和标签关联表。

- `note_id`
- `tag_id`

### attachments

附件表。

- `id`
- `note_id`
- `file_name`
- `original_name`
- `mime_type`
- `file_size`
- `storage_path`
- `relative_path`
- `hash`
- `source_type`
- `uploaded_by_member_id`
- `created_at`

### import_batches

导入批次表。

- `id`
- `source_type`
- `file_name`
- `file_path`
- `status`
- `started_by_member_id`
- `total_count`
- `success_count`
- `failed_count`
- `attachment_count`
- `created_at`
- `completed_at`

### import_items

导入明细表。

- `id`
- `batch_id`
- `status`
- `note_id`
- `original_id`
- `original_title`
- `original_path`
- `raw_data_path`
- `error_message`
- `created_at`

### backup_logs

备份记录表。

- `id`
- `backup_type`
- `file_path`
- `file_size`
- `status`
- `triggered_by_member_id`
- `error_message`
- `created_at`

### app_settings

应用设置表。

- `key`
- `value`
- `updated_at`

## 7. 页面结构

- `/`：首页 / 生活时间线
- `/search`：搜索页
- `/notes/new`：新建记录
- `/notes/:id`：详情页
- `/notes/:id/edit`：编辑页
- `/categories`：分类管理
- `/tags`：标签管理
- `/members`：成员管理
- `/import`：Note Station 导入入口
- `/import/:batchId`：导入预览 / 结果
- `/settings`：设置 / NAS 存储与备份

## 8. 原型设计更新

### 首页卡片

每张记录卡片增加：

- 创建人头像或昵称。
- 保存/同步状态。
- 附件图标和附件数量。
- 成员筛选入口放在分类筛选附近，使用轻量头像胶囊。

### 新建记录页

- 顶部显示当前成员，例如“我正在记录”或“爱人正在记录”。
- 默认创建人为当前登录成员。
- 保存按钮显示保存状态。
- 网络不可用时提示：“当前无法连接家庭 NAS，记录暂未保存。”

### 详情页

显示：

- 创建人
- 创建时间
- 更新时间
- 来源
- 同步状态
- 最后编辑人

### 设置页

新增“NAS 存储与备份”模块：

- 当前数据存储位置
- 附件存储位置
- 最近备份时间
- 手动备份按钮
- 导出 JSON 按钮
- Markdown 导出灰显
- NAS 连接状态

## 9. Note Station 导入逻辑

导入模块保持单独封装，并增加成员和 NAS 路径意识：

1. 上传导出文件到 `data/imports/notestation/raw/`。
2. 创建导入批次，记录执行导入的成员。
3. 自动识别文件结构。
4. 解析为统一中间格式。
5. 预览记录、分类、附件和失败项。
6. 用户确认后写入数据库。
7. 附件复制到 `data/attachments/`。
8. 每条导入记录保留原始来源信息。
9. 导入失败项写入 `import_items`，并保留 raw data 方便重试。

## 10. 离线与冲突策略

MVP 策略：

- 局域网在线时正常使用。
- 网络断开时提示无法连接 NAS。
- 不做复杂离线同步。
- 后续扩展离线草稿和自动同步。
- 多人同时编辑同一条记录时，使用 `version` 字段做乐观锁。
- 如果保存时发现版本已变化，提示：“记录已被其他成员更新，请刷新后再编辑。”

## 11. 开发阶段

1. 文档和原型：确认多人使用、NAS 存储、移动端页面设计。
2. 项目骨架调整：数据目录改为 NAS 友好结构。
3. 成员基础：成员表、当前成员选择、记录创建人。
4. 记录闭环：首页、新建、详情、编辑。
5. 搜索筛选：标题、正文、分类、标签、成员、时间。
6. 附件能力：上传、本地保存、详情展示。
7. NAS 备份：手动备份、自动备份日志、JSON 导出。
8. 导入框架：批次、预览、失败记录、中间格式。
9. Note Station 样例解析：基于实际导出文件实现 parser。
10. 手机端打磨：安卓优先优化交互和视觉。
