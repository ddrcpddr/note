# Note Station 样例结构分析

## 样例文件

| 项目 | 内容 |
| --- | --- |
| 文件名 | `example-notestation-export.nsx` |
| 本地位置 | `data/imports/notestation/example-notestation-export.nsx` |
| 文件大小 | `22,413,647 bytes`，约 `21.38 MiB` |
| 修改时间 | `2026-06-29 11:27:02` |
| 文件类型判断 | 文件头为 `PK`，可识别为 ZIP/压缩包格式 |
| 是否可解压/读取 | 可读取 Zip central directory；本次实现不解压到磁盘，只在内存中读取条目 |
| 总条目数 | `129` |
| 未压缩总大小 | `31,831,852 bytes`，约 `30.36 MiB` |

## 内部结构树（脱敏）

真实条目名多数是 Note Station 内部 ID 或附件 hash。为避免暴露隐私，以下只展示结构模式和数量。

```text
<export>.nsx
├── config.json                                # 1 个，导出索引
├── 1026_<note-id>                             # 93 个，笔记 JSON 对象
├── 1026_<notebook-id>                         # 10 个，笔记本 JSON 对象
├── file_<hash>                                # 15 个，附件/图片资源
└── file_thumb_1024_<hash>                     # 10 个，缩略图资源
```

## config.json 结构

`config.json` 顶层字段：

| 字段 | 类型 | 数量/状态 |
| --- | --- | --- |
| `note` | array of internal IDs | `93` |
| `notebook` | array of internal IDs | `10` |
| `shortcut` | null | 未使用 |
| `todo` | array | `0` |

## 笔记条目结构

每个 `1026_<note-id>` 条目是 JSON 对象。已观察到的字段键名：

```text
attachment, brief, content, ctime, encrypt, latitude, location, longitude,
mtime, parent_id, source_url, tag, thumb, title
```

字段覆盖统计：

| 字段 | 结果 |
| --- | --- |
| 标题 `title` | 93/93 可读取 |
| 正文 `content` | 93/93 可读取 |
| 摘要 `brief` | 90/93 可读取 |
| 创建时间 `ctime` | 93/93 可读取 |
| 更新时间 `mtime` | 93/93 可读取 |
| 父笔记本 `parent_id` | 93/93 可读取 |
| 附件引用 `attachment` | 4 条记录包含附件引用 |
| 标签 `tag` | 未发现有效标签 |
| 加密标记 `encrypt` | 0 条记录显示为加密 |

## 笔记本条目结构

每个 `1026_<notebook-id>` 条目是 JSON 对象。已观察到的字段键名：

```text
category, ctime, mtime, stack, title
```

可用于建立 Note Station 笔记本到当前系统分类/原始路径的映射。

## 附件结构

| 资源类型 | 数量 | 文件签名判断 |
| --- | ---: | --- |
| `file_<hash>` | 15 | 12 个 PNG，3 个 JPG |
| `file_thumb_1024_<hash>` | 10 | 10 个 PNG 缩略图 |
| 笔记正文中的附件引用 | 4 | dry-run 计为 4 个用户附件 |

说明：缩略图资源不直接计入每条记录的附件数；它们只作为归档内资源统计。

## 初步字段判断

| Note Station 字段 | 当前判断 |
| --- | --- |
| `title` | 可映射到 `notes.title` |
| `content` | 可映射到 `notes.content`，当前 sandbox 导入会转为纯文本 |
| `brief` | 可作为脱敏摘要来源，缺失时从正文截取 |
| `ctime` | 可映射到 `notes.created_at` / `notes.occurred_at` |
| `mtime` | 可映射到 `notes.updated_at` |
| `parent_id` | 可关联 notebook，形成原始分类和来源路径 |
| `tag` | 本样例未发现有效标签，后续解析器保留支持 |
| `attachment` | 可生成附件元数据；本阶段不复制真实附件文件 |
| `thumb` | 作为缩略图资源统计，不作为用户附件导入 |
| `encrypt` | 本样例均未加密；若后续遇到加密记录，应进入失败列表 |

## 当前能解析的内容

- 93 条笔记标题。
- 93 条笔记正文。
- 93 条创建时间。
- 93 条更新时间。
- 10 个笔记本。
- 4 个原始分类/笔记本分类结果。
- 4 个笔记附件引用。
- 归档内 25 个附件/缩略图资源的类型统计。

## 当前不能解析或不确定的内容

- 本样例未发现有效标签，因此标签映射需要等更多样例确认。
- 附件原始文件名和业务含义需要进一步确认；当前只保留 Note Station 内部附件 ID/资源名作为元数据。
- `stack` 是否存在多级笔记本层级，本样例可解析字段，但需要更多层级样例确认。
- 图片/附件文件本阶段不复制到正式附件目录。
- 真实导入到正式数据库前仍需要用户确认 dry-run 预览结果是否符合预期。

## dry-run 结果

本次命令：

```bash
node src/server/scripts/notestation-dry-run.js data/imports/notestation/example-notestation-export.nsx
```

含标题和脱敏摘要的完整 dry-run JSON 已生成到本地忽略目录：

```text
data/imports/notestation/notestation-dry-run-preview.json
```

该文件包含真实记录标题和摘要，只用于本机检查，不提交 GitHub。

统计结果：

| 项目 | 结果 |
| --- | ---: |
| 总记录数 | 93 |
| 成功解析数量 | 93 |
| 失败数量 | 0 |
| 记录附件数量 | 4 |
| 归档附件/缩略图资源数量 | 25 |
| 分类/笔记本数量 | 4 个实际被记录引用，10 个 notebook 条目 |
| 标签数量 | 0 |

## sandbox 导入验证

已将 dry-run 结果写入测试数据库，不污染正式数据库。

| 项目 | 结果 |
| --- | --- |
| sandbox 数据目录 | `data/imports/notestation/sandbox-db` |
| 本次 sandbox importId | `import_nsx_sandbox_mqyoos5g_opxd42` |
| 写入记录数 | 93 |
| 写入失败数 | 0 |
| 写入附件元数据 | 4 |
| 首页数据 API | 可读取，sandbox 总记录数为 96（3 条 seed + 93 条导入） |
| 搜索 | 可找到导入记录 |
| 分类筛选 | `uncategorized` 可筛出导入记录 |
| 详情 | 可显示标题、正文、来源、时间和附件信息 |
| 失败记录查看 | 本样例 dry-run 失败数为 0，因此无失败记录可展示 |

## 后续解析策略

1. 保持 dry-run 为第一入口，不直接写正式数据库。
2. 继续使用内存读取 Zip，避免把真实内容解压到工作区。
3. 正式导入前展示标题、脱敏摘要、时间、原始路径、附件数和失败项。
4. 笔记本先保留为 `originalCategory` 和 `originalPath`；正式分类映射需用户确认。
5. 附件先写元数据，真实复制附件文件需单独确认目标附件目录和命名规则。
6. 遇到空正文、加密记录或无法解析 JSON 的条目，进入失败列表，不静默丢弃。

## dry-run 字段质量复核（2026-06-29 12:54:14 +08:00）

详见 `docs/NOTESTATION_DRY_RUN_REVIEW.md`。

复核结论：

- 93 条记录全部有标题、正文、创建时间、更新时间和原始路径 / 笔记本信息。
- 本样例未发现有效标签，因此正式导入标签为空。
- 4 条记录带附件引用，sandbox 阶段只写入附件元数据，不复制真实附件文件。
- 0 条解析失败。
- 已使用 `data/database/sandbox-notestation-import.db` 完成 sandbox 导入验证，正式数据库未写入。

## 正式导入前预检（2026-06-29 13:19:53 +08:00）

已对真实 `.nsx` 执行无确认预检命令：

```bash
node src/server/scripts/notestation-formal-import.js data/imports/notestation/example-notestation-export.nsx
```

命令返回 `confirmed: false`、`requiresConfirmation: true`、`willWriteFormalDatabase: false`，说明本次只展示统计，不写正式数据库。

| 项目 | 结果 |
| --- | ---: |
| 总记录数 | 93 |
| 可导入记录 | 93 |
| 失败项 | 0 |
| 附件引用 | 4 |
| 原始分类/笔记本数量 | 4 |
| 标签数量 | 0 |

正式导入准备已补充：

- 纯文本正文写入 `notes.content`。
- 原始 HTML / 富文本正文保留到 `notes.raw_metadata.originalContent`。
- 分类先落到 `uncategorized`，原始分类和路径继续保留到 metadata。
- 附件正式导入时复制到 `data/attachments/`，数据库仅保存相对路径和元数据。
- 正式写库必须带 `--confirm`，且写入前自动备份数据库到 `data/backups/`。

本阶段仍未执行正式导入。
