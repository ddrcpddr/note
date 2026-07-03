# Note Station 导入

更新时间：2026-07-03

## 最新方向：面向富文本最终结构重新导入

当前项目仍处于测试阶段，现有 SQLite 数据库、测试记录、测试附件、已导入测试数据都可以丢失。产品功能完善后，将重新导入 Synology Note Station 导出的 `.nsx` 文件。因此后续 Note Station 导入不再围绕当前测试库做过度兼容，而是服务于最终富文本数据结构。

新的导入目标：

- 不删除原始 `.nsx` 文件。
- `.nsx`、dry-run JSON、数据库、附件、备份、导出和日志仍然禁止提交 Git。
- 允许清空测试库、重建附件测试目录、调整 `notes` 字段和导入逻辑。
- 重新导入时尽量保留原始 HTML / 富文本结构、表格、图片引用、附件关联、链接、列表、待办状态、颜色、高亮、删除线和下划线。
- 无法完整转换为编辑器结构的复杂内容，至少要能通过安全 HTML 展示。

建议新字段映射：

| Note Station 内容 | 新字段 / 表 | 策略 |
| --- | --- | --- |
| 纯文本正文 | `notes.content_text` | 搜索、列表摘要、降级展示、Markdown fallback |
| 安全富文本 HTML | `notes.content_html` | 详情页展示和 HTML 导出，必须经服务端清理 |
| 编辑器结构 | `notes.content_json` | Tiptap / ProseMirror JSON，用于再次编辑；无法转换时可为空 |
| 原始 HTML | `notes.source_html` | 保留原始 Note Station 内容用于溯源和未来增强，不直接渲染 |
| 原始路径 / 笔记本 | `notes.original_path` / `notes.original_category` / metadata | 用于导入后整理 |
| 图片 | `attachments` | 复制到 `data/attachments/notestation/<importId>/<noteId>/`，正文 Image 节点引用附件 id |
| 普通附件 | `attachments` | 保存元数据、相对路径、source_attachment_id，不保存二进制到数据库 |
| 表格 | `content_html` + `content_json` | 尽量转换为 Tiptap Table；失败时保留安全 HTML 展示 |
| 待办列表 | `content_json` TaskList / TaskItem | 尽量保留 checked 状态；失败时保留 HTML / 文本 |
| 链接 | `content_html` / `content_json` | 仅保留安全协议，详情页安全打开 |
| 颜色 / 高亮 | `content_html` / `content_json` | 只允许白名单颜色和背景色 |

重新导入建议流程：

1. 停止当前服务或确认没有写库进程。
2. 保留原始 `.nsx` 在 `data/imports/notestation/`，不要提交。
3. 可清空测试数据库和测试附件目录，但不要删除 `.nsx`。
4. 运行新版 dry-run，输出字段质量、附件映射、HTML/表格/待办识别结果。
5. 用户确认 dry-run 后，再写入测试库或正式试用库。
6. 导入完成后验证首页、搜索、分类、详情富文本、图片、附件、表格、JSON 导出、Markdown 导出。

---

阶段 3 实现的是可扩展导入框架和可演示样例流程。因为还没有真实 Synology Note Station 导出样例，本阶段不猜测真实格式。

## 当前能力

- 支持创建 Note Station 样例导入预览。
- 支持展示：
  - 记录数量
  - 附件数量
  - 原始分类数量
  - 成功数量
  - 失败数量
- 支持确认导入并写入本地 SQLite。
- 导入记录标记为 `notestation_import`。
- 无法识别作者时归属到当前执行导入的成员，并保留来源元数据。
- 保留原始元数据：
  - 原始标题
  - 原始路径
  - 原始分类
  - 原始创建时间
  - 原始更新时间
  - 原始记录 JSON
- 失败项写入 `import_failures`，不会静默丢弃。

## API

### 创建样例预览

```http
POST /api/imports/notestation/sample-preview
```

请求体：

```json
{
  "memberId": "self"
}
```

### 真实导入 dry-run 预检

```http
POST /api/imports/notestation/dry-run
```

请求体示例：

```json
{
  "fileName": "real-export.zip",
  "fileType": "zip"
}
```

当前 dry-run 不会写入正式数据库，也不会生成可提交的 `importId`；在没有真实样例文件前，它会返回需要用户补充的文件信息和 `needs_real_sample` 状态。

### 查询预览

```http
GET /api/imports/notestation/:importId
```

### 确认导入

```http
POST /api/imports/notestation/:importId/commit
```

确认后会写入 `notes`、`note_tags` 和必要的 `tags`。当前该确认流程只适用于 `sample-preview` 生成的样例批次，不代表真实 Note Station 文件格式。

## 当前限制

- 暂不解析真实 Note Station 导出文件。
- 暂不处理真实附件文件。
- 上传控件目前是演示入口，使用内置样例数据。
- 真实 JSON / HTML / Markdown / ZIP 解析需要用户提供导出样例后再适配。

## 后续扩展计划

导入模块目录：

```text
src/server/importers/notestation/
```

后续可在该目录下增加解析器：

- `json-parser.js`
- `html-parser.js`
- `markdown-parser.js`
- `zip-parser.js`

解析器应统一返回：

```js
{
  records: [],
  failures: [],
  attachments: [],
  originalCategories: []
}
```

任何失败项都必须进入失败列表，由导入页展示给用户确认。


## 真实 NSX dry-run 解析（2026-06-29）

用户已提供真实 `.nsx` 样例后，项目新增只读 dry-run 解析能力：

```bash
node src/server/scripts/notestation-dry-run.js data/imports/notestation/example-notestation-export.nsx
```

该命令只读取 `.nsx`，不会写入正式数据库，不会解压真实内容到工作区。含真实标题和脱敏摘要的输出应保存到 `data/imports/notestation/` 下，该目录被 Git 忽略。

### NSX 字段映射

| Note Station 来源字段 | 当前系统字段 | 当前策略 |
| --- | --- | --- |
| 原始标题 `title` | `notes.title` | 直接映射 |
| 原始正文 `content` | `notes.content` | sandbox 导入转为纯文本；正式导入前可再决定是否保留 HTML |
| 原始摘要 `brief` | `notes.summary` | 优先使用，缺失时从正文截取 |
| 原始分类 / 笔记本 `parent_id -> notebook.title` | `categories` / `notes.original_category` | dry-run 保留为 `originalCategory`；sandbox 导入暂落到 `uncategorized`，避免自动创建错误分类 |
| 原始标签 `tag` | `tags` / `note_tags` | 本样例未发现有效标签；解析器保留数组/逗号字符串支持 |
| 创建时间 `ctime` | `notes.created_at` / `notes.occurred_at` / `notes.original_created_at` | 解析为 ISO 字符串；无法解析时保留原始值 |
| 更新时间 `mtime` | `notes.updated_at` / `notes.original_updated_at` | 解析为 ISO 字符串；无法解析时保留原始值 |
| 附件 `attachment` | `attachments` | 当前只写元数据，不复制真实附件文件 |
| 缩略图 `thumb` | import metadata / resource statistics | 只做资源统计，不计入用户附件数 |
| 原始路径 `notebook path + title` | import metadata / `notes.original_path` | 由 notebook 层级和标题组合生成 |
| 来源 | `notes.source_type` | 固定为 `notestation_import` |

### Sandbox 导入命令

只允许写入 sandbox/test/temp 数据目录：

```bash
NOTE_DATA_DIR=data/imports/notestation/sandbox-db node src/server/scripts/notestation-sandbox-import.js data/imports/notestation/example-notestation-export.nsx
```

脚本会拒绝在未设置 `NOTE_DATA_DIR`，或 `NOTE_DATA_DIR` 不包含 `sandbox`、`test`、`temp` 的情况下运行，防止污染正式数据库。

### 当前真实样例 dry-run 结果

| 项目 | 结果 |
| --- | ---: |
| 总记录数 | 93 |
| 成功解析数量 | 93 |
| 失败数量 | 0 |
| 记录附件数量 | 4 |
| 归档附件/缩略图资源数量 | 25 |
| 实际引用分类数 | 4 |
| 标签数量 | 0 |

正式导入前仍建议先由用户检查 `data/imports/notestation/notestation-dry-run-preview.json` 中的标题、摘要、分类和附件数量是否合理。

## Sandbox dry-run JSON 导入验证（2026-06-29 12:54:14 +08:00）

本阶段从被 Git 忽略的 dry-run JSON 写入单独 sandbox 数据库：

```powershell
$env:NOTE_DB_PATH = "D:\工作文件夹\XYZL\领航未来\GitHub项目\note\data\database\sandbox-notestation-import.db"
node src\server\scripts\notestation-sandbox-import.js data\imports\notestation\notestation-dry-run-preview-with-content.json
```

安全约束：

- 脚本要求 `NOTE_DB_PATH` 或 `NOTE_DATA_DIR` 包含 `sandbox`、`test` 或 `temp`，否则拒绝写入。
- 本阶段不写入正式 `data/database/app.db`。
- `.nsx`、dry-run JSON、sandbox DB、附件和运行数据均位于 `.gitignore` 保护范围。

结果：

| 项目 | 结果 |
| --- | ---: |
| 写入记录 | 93 |
| 写入失败项 | 0 |
| 写入附件元数据 | 4 |
| 标签 | 0 |

分类策略：本阶段将记录落入当前已有 `uncategorized` 分类，同时保留 `originalCategory` 和 `originalPath`。正式导入前建议由用户确认是否需要建立 Note Station 笔记本到现有分类的映射表。

## 正式导入前保护流程（2026-06-29 13:19:53 +08:00）

已新增正式导入前确认命令：

```bash
node src/server/scripts/notestation-formal-import.js data/imports/notestation/example-notestation-export.nsx
```

默认模式只做 preflight，不写正式数据库。当前真实样例预检结果：

| 项目 | 结果 |
| --- | ---: |
| 总记录数 | 93 |
| 可导入记录 | 93 |
| 已知失败项 | 0 |
| 附件引用 | 4 |
| 原始分类/笔记本数量 | 4 |
| 标签数量 | 0 |

只有用户确认后，才允许执行带 `--confirm` 的正式写入命令：

```bash
node src/server/scripts/notestation-formal-import.js data/imports/notestation/example-notestation-export.nsx --confirm
```

正式写入策略：

- 分类统一落入当前已有 `uncategorized`，避免误建分类；`originalCategory`、`originalPath` 和 `raw_metadata.originalNotebookPath` 会保留原始笔记本路径，便于后续人工整理。
- `notes.content` 保存纯文本正文，用于当前页面展示和搜索。
- 如果 `.nsx` 中存在 HTML / 富文本正文，原始字符串保存在 `notes.raw_metadata.originalContent`，并用 `raw_metadata.originalContentFormat` 标记格式。
- 附件文件复制到 `data/attachments/notestation/<importId>/<noteId>/` 下。
- 数据库只保存附件元数据、大小、MIME 猜测值和相对 `storage_path`，不把附件二进制写入数据库。
- 附件复制失败不会回滚整条笔记，会写入 `import_failures` 并在命令报告里输出 `attachmentFailures` 统计。

正式数据库保护：

- `--confirm` 执行前会先备份当前配置的数据库。
- 默认正式数据库为 `data/database/app.db`。
- 备份文件放在 `data/backups/app-before-notestation-import-<timestamp>.db`。
- 如果导入失败，脚本会回滚本次事务；如需手动恢复，可停止服务后用对应备份文件替换当前数据库，再重启服务。

安全边界：

- 本阶段没有对正式 `data/database/app.db` 执行 `--confirm`。
- `.nsx`、dry-run JSON、sandbox DB、正式 DB、备份和附件均在 `.gitignore` 保护范围内，不允许提交。

## 正式导入执行结果（2026-06-29 13:42:52 +08:00）

用户确认 dry-run、sandbox 导入和正式导入前检查后，已执行正式导入。

### 执行命令

```bash
node src/server/scripts/notestation-formal-import.js data/imports/notestation/example-notestation-export.nsx --confirm
```

### 导入保护

- 执行前自动备份正式数据库。
- 最终成功导入前备份文件：`data/backups/app-before-notestation-import-2026-06-29T05-36-38-145Z.db`。
- 若需要回滚：停止服务，用上述备份文件替换 `data/database/app.db`，再重启服务。
- 备份文件属于运行数据，已被 `.gitignore` 忽略，不提交 GitHub。

### 正式导入结果

| 项目 | 结果 |
| --- | ---: |
| 导入批次 | `import_nsx_formal_mqysc6bn_h0ypw4` |
| 导入前正式库记录数 | 18 |
| 导入后正式库记录数 | 111 |
| 本次导入记录数 | 93 |
| 失败记录数 | 0 |
| 附件元数据数 | 20 |
| 附件复制成功数 | 20 |
| 附件复制失败数 | 0 |
| 原始分类/笔记本数量 | 4 |
| 标签数量 | 0 |

### 附件解析修正

首次正式导入时发现真实 NSX 附件字段不是简单数组，而是 `{key: { md5, name, ext, size... }}` map 结构。旧解析会把每条带附件记录降级成 `attachment-1`，导致附件复制失败。

处理过程：

1. 使用首次正式导入前自动备份恢复 `data/database/app.db`，避免重复导入记录。
2. 修复 `normalizeAttachments`，将附件对象的 `md5` 映射到归档内 `file_<md5>` 条目。
3. 新增测试覆盖真实附件 map 结构。
4. 重新执行正式导入，20 个附件引用全部复制成功。

### 验收结果

- 首页 app-data 可看到本次正式导入记录。
- 搜索可找到本次正式导入样本记录。
- `uncategorized` 分类可筛出本次正式导入记录。
- 详情 API 可读取标题、纯文本正文、来源、原始路径、原始分类、原始创建/更新时间和附件元数据。
- 附件相对路径对应的文件存在于 `data/attachments/` 下。
- 设置页相关 API：手动备份和 JSON 导出通过。
- `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 均通过。

### 安全说明

本次不提交 `.nsx`、dry-run JSON、sandbox DB、正式 DB、备份文件、附件文件、导出文件或任何真实笔记正文。

## 导入后查看与整理体验（2026-06-29）

当前正式导入后的记录仍优先落入 `未分类 / 待整理`，避免自动误建分类。页面层已做以下收口：

- 详情页对 `notestation_import` 记录显示 Note Station 来源信息，包括原始分类和原始路径。
- 分类页在 `未分类 / 待整理` 卡片显示导入记录待整理数量，提醒用户后续可以人工整理。
- Notes API 支持 `source=notestation_import`，用于搜索页来源筛选和后续自动化验收。
- 当前仍不做批量分类迁移、不猜测 Note Station 原分类与家庭分类的自动映射，也不修改真实导入内容。

## 2026-07-03 富文本字段兼容更新

为支持后续重新导入 `.nsx` 并尽量保留 Note Station 富文本结构，导入链路已更新为写入新的正文结构：

- `notes.content_text`：从 Note Station 正文提取的纯文本，用于搜索、列表摘要和降级展示。
- `notes.content_html`：服务端清理后的安全 HTML，用于详情页展示。
- `notes.content_json`：Tiptap / ProseMirror 编辑结构。当前对复杂 Note Station HTML 仍以安全 HTML 为主，后续按真实样例逐步增强转换。
- `notes.source_html`：Note Station 原始 HTML，用于重新导入溯源和未来转换增强；页面不会直接渲染该字段。
- `attachments.kind` / `source_attachment_id` / `source_path`：用于保留图片和附件来源关系。

当前 sample、sandbox、formal import 脚本均已接入上述字段。重新正式导入前仍建议先 dry-run，并重点人工检查表格、待办、图片、附件、链接、颜色和高亮的恢复效果。
## 2026-07-03 网页端 `.nsx` 选择与富文本导入约束

当前导入页已接入真实 `.nsx` 文件选择控件，可以在手机 / 浏览器里点击选择导出文件并进入安全预检状态。网页端完整上传解析仍需后续接入现有 NSX 解析器；在这之前，页面不会写入正式数据库，也不会假装已解析真实正文。

后续实现网页端真实导入时必须遵守：

- `.nsx` 文件先上传或复制到 `data/imports/notestation/`，该目录继续由 `.gitignore` 保护。
- 复用现有 NSX dry-run / formal import 解析链路，不重新硬猜格式。
- 正式导入前继续自动备份数据库。
- Note Station 原始 HTML / 富文本结构优先进入 `content_html` 和 `source_html`。
- 如果可以稳定转换，生成对应 `content_json` 供富文本编辑器再次编辑。
- 图片和附件复制到 `data/attachments/`，数据库只保存元数据、相对路径和正文引用。
- 富文本正文中要尽量恢复图片、附件引用、链接、列表、待办、表格、颜色和高亮。
- 不再开发独立的正文外附件上传入口；附件列表只作为下载、兼容和失败排查辅助。
- 解析失败项必须记录原因，不得静默丢弃。

## 2026-07-03 网页端 `.nsx` 上传、预览与确认导入更新

本节更新并覆盖上方“网页端完整上传解析仍需后续接入”的旧状态说明。

当前导入页已接入真实 `.nsx` 文件选择和上传解析：浏览器选择 `.nsx` 后会把文件内容以 `application/octet-stream` 发送到后端，后端校验 ZIP 文件头，将文件保存到被 Git 忽略的 `data/imports/notestation/`，然后复用现有 NSX dry-run 解析器生成预览。

本轮用本地真实样例 `example-notestation-export.nsx` 对 Docker 3300 服务做 dry-run 验证，只预览不确认导入：

| 项目 | 结果 |
| --- | ---: |
| 总记录数 | 93 |
| 成功解析 | 93 |
| 失败项 | 0 |
| 附件数 | 20 |
| 原始分类 / 笔记本数 | 4 |

网页端确认导入现在复用正式导入保护链路：

- `.nsx` 文件先上传或复制到 `data/imports/notestation/`，该目录继续由 `.gitignore` 保护。
- 复用现有 NSX dry-run / formal import 解析链路，不重新硬猜格式。
- 正式导入前继续自动备份数据库。
- Note Station 原始 HTML / 富文本结构优先进入 `content_html` 和 `source_html`。
- 如果可以稳定转换，生成对应 `content_json` 供富文本编辑器再次编辑。
- 图片和附件复制到 `data/attachments/`，数据库只保存元数据、相对路径和正文引用。
- 富文本正文中要尽量恢复图片、附件引用、链接、列表、待办、表格、颜色和高亮。
- 附件列表只作为下载和兼容展示，不再作为主要编辑入口。
- 解析失败项必须记录原因，不得静默丢弃。

当前测试数据可以清空；用户后续会在功能稳定后重新导入 `.nsx`。不要删除原始 `.nsx`，不要提交上传副本、数据库、附件、备份、导出或任何真实笔记内容。
