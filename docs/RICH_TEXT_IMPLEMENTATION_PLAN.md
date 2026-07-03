# 富文本编辑实施方案

更新时间：2026-07-03

本文件已根据新的开发前提重写：当前项目仍处于测试阶段，现有 SQLite 数据库、测试记录、测试附件、已导入测试数据都可以丢失。产品功能完善后，将重新导入 Synology Note Station `.nsx` 文件。因此后续富文本目标不再围绕当前测试库做复杂兼容，而是转为：

> 面向重新导入 Note Station 数据的最终富文本能力补齐。

本阶段仍不做 Android、不重做整套 UI、不调用 Product Design / Figma、不生成新图片；但允许调整数据库结构、做破坏性迁移、清空测试数据库、重建测试附件目录、重新设计 notes 正文字段和 Note Station 导入后的富文本存储方式。禁止删除原始 `.nsx` 文件，禁止提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。

## 1. 当前正文数据现状

当前代码已经有第一版轻量富文本能力：

- `notes.content`：纯文本正文，用于搜索、列表摘要、降级展示和导出 fallback。
- `notes.content_html`：可空字段，保存当前轻量 `contenteditable` 编辑器产生并经服务端清理后的 HTML。
- `notes.raw_metadata.originalContent`：Note Station 导入时保留的原始 HTML / 富文本字符串。
- `raw_metadata.originalContentFormat`：标记原始内容是否为 `html`。
- 详情页展示顺序：`content_html` -> `raw_metadata.originalContent` -> `notes.content`。
- 搜索仍基于 `notes.content`。
- JSON / Markdown 导出当前主要围绕纯文本和 `content_html` 做基础处理。

这个结构适合第一版试用，但不适合长期恢复 Note Station 富文本。主要问题：

- `content_html` 只有安全 HTML，没有编辑器结构，复杂编辑能力会越来越难维护。
- Note Station 原始 HTML 被塞在 `raw_metadata` 中，不利于后续重新导入、展示、再编辑和导出。
- 当前 sanitizer 只允许基础标签，图片、表格、待办、颜色、高亮会丢失或降级。
- 当前轻量 `contenteditable` 不适合表格、待办、多级列表、图片粘贴和工具栏状态维护。

## 2. 最终富文本目标

第一目标不是保护现有测试数据，而是建立一套长期可用的数据和编辑能力：

- 新建记录、编辑记录、详情页展示都以富文本为一等能力。
- 搜索、列表摘要和降级展示继续依赖纯文本。
- Note Station 重新导入时尽量保留原始 HTML、表格、图片引用、附件关联、链接、列表、待办状态、颜色、高亮、删除线、下划线。
- 无法完整编辑的复杂结构至少要安全展示，不静默丢弃。
- 图片和附件统一进入本地附件系统，不依赖外部图片链接作为主要方案。

## 3. 编辑器选型

最终采用 **Tiptap / ProseMirror**。

推荐原因：

- 能覆盖当前目标：粗体、斜体、下划线、删除线、标题、列表、待办、引用、链接、图片、表格、代码、文本颜色、高亮、对齐、撤销 / 重做。
- ProseMirror JSON 适合长期保存编辑器原始结构，便于再次编辑和未来扩展。
- Tiptap 的 React 集成成熟，适合当前 React + Vite 项目。
- 表格、TaskList、TaskItem、Image、Link、TextStyle、Color、Highlight、TextAlign 等扩展都有成熟实现。
- 移动端可用性比自己维护复杂 `contenteditable` 更稳。
- 后续可以用 HTML 作为展示层、JSON 作为编辑层、纯文本作为搜索层，边界清楚。

代价：

- 会引入比当前更大的依赖包，但这是为了支持表格、待办、图片和复杂富文本所必须付出的合理成本。
- Tiptap 对移动端工具栏需要我们自己设计，不应直接堆满按钮。
- Note Station HTML 到 ProseMirror JSON 的映射需要分阶段处理，不能期待一次 100% 还原。

建议依赖：

```text
@tiptap/react
@tiptap/starter-kit
@tiptap/extension-underline
@tiptap/extension-link
@tiptap/extension-image
@tiptap/extension-task-list
@tiptap/extension-task-item
@tiptap/extension-table
@tiptap/extension-table-row
@tiptap/extension-table-header
@tiptap/extension-table-cell
@tiptap/extension-text-style
@tiptap/extension-color
@tiptap/extension-highlight
@tiptap/extension-text-align
@tiptap/extension-placeholder
sanitize-html
```

`sanitize-html` 用于服务端 HTML 清理。相较 DOMPurify + jsdom，它在 Node 服务端更直接，适合白名单标签、属性和协议控制。

## 4. 最终数据结构建议

允许破坏性迁移，因此建议把 `notes` 正文字段重整为长期结构：

```text
notes.content_text    TEXT NOT NULL DEFAULT ''
notes.content_html    TEXT
notes.content_json    TEXT
notes.source_html     TEXT
notes.content_format  TEXT NOT NULL DEFAULT 'tiptap_json'
notes.content_version INTEGER NOT NULL DEFAULT 2
```

字段职责：

- `content_text`：纯文本，唯一搜索源；用于列表摘要、快速预览、Markdown 降级和旧内容兜底。
- `content_html`：安全展示 HTML，用于详情页渲染、HTML 导出和不支持编辑的复杂导入内容展示。
- `content_json`：Tiptap / ProseMirror JSON，用户新建和编辑后的 canonical 编辑结构。
- `source_html`：Note Station 原始 HTML，仅用于重新导入溯源、未来增强转换和人工排查；普通页面不直接渲染。
- `content_format`：标记当前记录主要内容来源，例如 `tiptap_json`、`imported_html`、`plain_text`。
- `content_version`：用于后续再次升级富文本结构。

迁移策略：

- 因当前测试数据可丢，第一轮可以直接清空测试数据库或重建 `notes` 相关表。
- 不需要为当前 100 多条测试记录写复杂兼容迁移。
- 可以保留一个开发用 reset 命令，例如 `npm.cmd run reset-test-data`，只清空数据库和附件测试目录，不删除 `.nsx`。
- 如果需要保留少量示例记录，使用新 schema 重新 seed。

## 5. 附件和图片结构

`attachments` 继续统一管理图片和普通附件，但建议补充字段：

```text
attachments.kind              TEXT DEFAULT 'file' -- image | file | notestation_resource
attachments.content_ref_id    TEXT            -- 正文中引用该附件的节点 id
attachments.source_attachment_id TEXT         -- Note Station 原附件 id / md5 / key
attachments.source_path       TEXT            -- .nsx 内部路径，仅元数据
attachments.width             INTEGER
attachments.height            INTEGER
attachments.sort_order        INTEGER DEFAULT 0
attachments.is_inline         INTEGER DEFAULT 0
```

图片保存策略：

- 上传图片保存到 `data/attachments/images/<noteId or draftId>/`。
- 粘贴图片时先创建 draft attachment，保存记录后绑定到 note。
- 编辑器正文插入图片节点，节点属性保存 `attachmentId` 和相对展示 URL，例如 `/api/attachments/:id/file`。
- 数据库只保存附件元数据和相对路径，不保存二进制。
- 禁止把外部图片链接作为主要存储方式；外链图片可作为链接保留，但默认不内联加载，避免隐私泄漏和不可控依赖。

普通附件策略：

- 附件上传后仍进入 `attachments`。
- 正文中可以插入附件引用节点，例如 `attachmentReference`，显示文件名、大小、类型和打开 / 下载入口。
- 详情页附件列表继续保留，正文内引用与列表共享同一份附件元数据。
- Note Station 重新导入时，尽量将 `.nsx` 内资源复制到 `data/attachments/notestation/<importId>/<noteId>/`，并用 `source_attachment_id` 建立映射。

## 6. Note Station 重新导入策略

重新导入 `.nsx` 时采用四层保留：

1. 原始内容：原始 HTML 写入 `notes.source_html`，不直接渲染。
2. 安全展示：原始 HTML 经 `sanitize-html` 白名单清理后写入 `notes.content_html`。
3. 编辑结构：能转换的 HTML 尽量转换为 Tiptap JSON，写入 `notes.content_json`。
4. 搜索文本：从安全 HTML / JSON 提取纯文本，写入 `notes.content_text`。

格式处理：

- 表格：保留为安全 HTML；能转换为 Tiptap Table JSON 的写入 `content_json`。手机详情页表格容器使用横向滚动。
- 图片：解析 `.nsx` 内附件映射，复制到本地附件目录；HTML 中图片引用改写为本地附件 URL 或 Tiptap Image 节点。
- 附件：建立 `attachments.source_attachment_id` 与 Note Station 原附件 key / md5 的关系。
- 链接：保留 `http`、`https`、`mailto`、`tel`，危险协议移除。
- 列表：保留 `ul`、`ol`、嵌套层级，尽量转换为 Tiptap list JSON。
- 待办：识别 Note Station 中可能的 checkbox / task 标记，转换为 TaskList / TaskItem，保存 checked 状态。
- 颜色 / 高亮：允许有限 `color`、`background-color` style，转换为 Color / Highlight 标记；不允许任意 CSS。
- 删除线 / 下划线：保留 `s`、`del`、`u`。
- 无法识别的复杂节点：从 `content_json` 中降级，但保留在 `content_html` 和 `source_html`，确保至少能安全展示。

## 7. 安全策略

所有 HTML 必须经过服务端清理。前端编辑器输出也不可信。

允许标签建议：

```text
p, br, strong, b, em, i, u, s, del,
h1, h2, h3, h4,
ul, ol, li,
blockquote, hr,
a,
img,
pre, code,
table, thead, tbody, tr, th, td,
span
```

允许属性建议：

- `a.href`, `a.title`, `a.target`, `a.rel`
- `img.src`, `img.alt`, `img.width`, `img.height`, `img.data-attachment-id`
- `span.style` 仅允许 `color` 和 `background-color`
- `td.colspan`, `td.rowspan`, `th.colspan`, `th.rowspan`
- task list 可使用 `data-checked` 或转换为 JSON 后保存 checked 属性

禁止：

- `script`、`iframe`、`object`、`embed`、`form`、`input` 等可执行或交互注入标签。
- 所有 `on*` 事件属性。
- `javascript:`、`vbscript:`、`file:`、不可信 `data:` 链接。
- 任意 CSS、position、display、font-size、background-image 等会破坏页面或泄漏隐私的样式。
- 外部图片默认不作为内联主内容加载。

链接打开：详情页链接使用新窗口 / 新标签打开，并加 `rel="noopener noreferrer"`。

## 8. 导出策略

JSON 导出：

- 必须包含 `contentText`。
- 有富文本时包含 `contentHtml` 和 `contentJson`。
- Note Station 导入记录可选择包含 `sourceHtmlIncluded: true` 和导入元数据，但不要默认把真实原始 HTML 展开到普通列表导出中，避免文件过大；可在高级导出模式中包含。
- 附件导出只导出元数据和相对路径，不导出二进制。

Markdown 导出：

- 优先从 `content_json` 转 Markdown。
- 其次从 `content_html` 转 Markdown。
- 最后使用 `content_text`。
- 表格尽量转换为 Markdown 表格；复杂单元格降级为纯文本。
- 待办列表转换为 `- [ ]` / `- [x]`。
- 图片转换为 `![alt](relative-path)`；附件引用转换为链接列表。
- 无法完整转换时不中断导出，使用纯文本 fallback 并记录 warning。

## 9. 手机端工具栏设计

不要做 Notion 式复杂块编辑器。手机端采用“常用一排 + 更多面板”：

常用一排：

- 粗体
- 列表
- 待办
- 链接
- 图片
- 更多

更多面板：

- 斜体、下划线、删除线
- 标题级别
- 文字颜色
- 背景高亮
- 引用
- 分隔线
- 缩进 / 反缩进
- 对齐
- 表格
- 代码
- 清除格式
- 撤销 / 重做

交互原则：

- 工具栏横向滚动或底部抽屉，不遮挡输入光标。
- 表格编辑在手机端只提供基础操作：插入 2x2、添加行、添加列、删除行、删除列、删除表格。
- 图片上传和附件上传使用同一套附件系统。
- 长表格详情页横向滚动，不撑破页面。

## 10. 第一轮直接做

第一轮目标是建立最终架构和日常高频能力：

1. 引入 Tiptap / ProseMirror 和服务端 `sanitize-html`。
2. 重建正文数据结构：`content_text`、`content_html`、`content_json`、`source_html`。
3. 允许清空测试库并重新 seed。
4. 新建 / 编辑页接入 Tiptap：段落、标题、粗体、斜体、下划线、删除线、列表、待办、引用、链接、分隔线、撤销 / 重做。
5. 详情页优先渲染安全 HTML；没有 HTML 时使用纯文本。
6. 搜索改为基于 `content_text`。
7. JSON / Markdown 导出适配新字段。
8. Note Station dry-run / import 改为写入新字段，至少保留 `source_html`、`content_html`、`content_text`。
9. 图片 / 附件仍保留当前上传能力，但正文内图片插入可以先做最小可用：上传图片后插入 Image 节点并保存附件元数据。
10. 表格第一轮至少支持安全展示和简单新建 / 编辑。

## 11. 稍后补

- 更完整的 Note Station task / checkbox 格式识别。
- 图片尺寸读取、缩略图、预览、替换和删除。
- 附件引用节点的更精致展示。
- 完整表格工具栏和单元格操作体验。
- 更强的 HTML -> Tiptap JSON 转换覆盖率。
- 富文本导入差异报告。
- 批量重新导入后的整理工具。
- 工具栏状态高亮和快捷键提示。

## 12. 技术风险

- Note Station `.nsx` 内部 HTML 结构可能存在多个变体，表格、待办、图片引用格式需要用真实样例反复 dry-run。
- HTML -> ProseMirror JSON 不可能一次覆盖所有复杂格式，必须保留 `source_html` 和 `content_html` 作为安全展示 fallback。
- 图片粘贴涉及未保存记录的 draft attachment，需要设计临时附件清理策略。
- 表格在手机端编辑体验天然复杂，第一轮只做简单表格，不追求桌面级能力。
- 颜色和高亮如果允许任意 style，会带来 XSS 和视觉破坏风险，必须严格白名单。
- Tiptap 依赖会增大构建体积，需要接受这一点或后续按需优化。

## 13. 推荐实施顺序

1. 文档确认本方案。
2. 新增数据库 reset / destructive migration 策略，明确不会删除 `.nsx`。
3. 引入 Tiptap 和 sanitizer 依赖。
4. 建立 `rich-text` 服务端模块：sanitize、JSON/HTML/text/Markdown 转换。
5. 重建 notes 字段和 seed 数据。
6. 新建 / 编辑页接入 Tiptap。
7. 详情页接入安全 HTML 展示和附件引用。
8. 图片上传 / 粘贴接入本地附件系统。
9. Note Station 重新导入链路写入新字段。
10. JSON / Markdown 导出适配。
11. 自动化测试覆盖新字段、XSS、搜索、导出、导入、图片、表格、待办。
12. 用户重新导入真实 `.nsx`，再做导入效果修正。