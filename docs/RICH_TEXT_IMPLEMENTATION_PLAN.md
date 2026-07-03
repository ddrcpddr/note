# 富文本编辑实施记录

更新时间：2026-07-03

本文件记录家庭生活记录工具的富文本编辑实现方式。项目当前按个人和家庭自用节奏推进，本阶段只补齐日常记录需要的稳定富文本能力，不做复杂块编辑器、协同编辑、表格或 Android 封装。

## 当前正文数据结构

- `notes.content` 继续保存纯文本正文，是搜索、首页摘要、旧记录 fallback、JSON / Markdown 导出的基础字段。
- `notes.content_html` 是本阶段新增的可空字段，用于保存用户在新建 / 编辑时产生并经服务端清理后的富文本 HTML。
- Note Station 导入记录保留的原始 HTML 仍位于 `notes.raw_metadata` 中的 `originalContent`，格式标记为 `originalContentFormat: "html"`。
- 旧纯文本记录默认没有 `content_html`，详情页继续按纯文本显示；进入编辑页时会被转换成基础段落 HTML，保存后才写入 `content_html`。

## 已采用方案

第一版采用轻量 `contenteditable` 编辑器，不引入 Tiptap、Lexical 或其他大型编辑器依赖。

选择原因：

- 当前需求是家庭日常记录，基础格式够用比复杂能力更重要。
- 不增加大依赖，构建体积和维护成本更可控。
- 移动端输入体验接近普通文本输入。
- 浏览器原生支持撤销 / 重做。
- 后续如果真的需要复杂编辑器，仍可基于 `content_html` 和 `content` 做迁移。

## 已支持能力

新建记录页和编辑记录页已经接入轻量富文本工具栏：

- 段落和换行。
- 粗体。
- 斜体。
- H2 / H3 标题。
- 无序列表。
- 有序列表。
- 引用。
- 链接。
- 分隔线。
- 浏览器原生撤销 / 重做。

详情页展示规则：

1. 如果记录有 `content_html`，优先展示安全清理后的用户富文本。
2. 如果没有 `content_html`，但 Note Station 导入元数据里有 HTML，则展示清理后的导入原始格式。
3. 如果都没有，则展示 `notes.content` 纯文本。
4. 详情页提供“格式 / 纯文本”切换，首页卡片仍只展示纯文本摘要。

## 数据兼容策略

- `notes.content` 不迁移、不删除、不改语义，继续作为纯文本核心字段。
- 新建或编辑富文本时，前端提交 `contentHtml`；服务端从清理后的 HTML 提取纯文本写入 `notes.content`。
- `notes.content_html` 只保存清理后的 HTML，不保存未清理编辑器输出。
- 旧记录在未编辑前保持原样；被编辑后会写入新的 `content_html`，同时保留纯文本字段。
- Note Station 导入原始 HTML 不会被本阶段改写；用户编辑导入记录后，用户版本写入 `content_html`，原始导入内容仍留在 `raw_metadata` 中。

## 安全策略

服务端统一清理 HTML，前端不信任编辑器输出。

允许的基础标签：

- `p`、`br`、`strong`、`b`、`em`、`i`、`u`、`s`
- `h2`、`h3`
- `ul`、`ol`、`li`
- `blockquote`
- `a`
- `hr`
- `code`、`pre`

禁止或移除：

- `script`、`style`、`iframe`、`object`、`embed`
- 表单相关标签
- `svg`、`math`
- 所有事件属性，例如 `onclick`、`onerror`
- `javascript:`、`data:`、`vbscript:`、`file:` 链接

图片处理：

- 正文中的 `img` 暂不直接渲染。
- 无法安全映射到本地附件路径的图片会显示为附件占位提示。
- 附件仍通过现有附件列表和元数据处理。

## 搜索与导出兼容

搜索：

- 服务端搜索继续使用 `notes.content` 纯文本。
- 不搜索 HTML 标签，不搜索未清理 HTML。

JSON 导出：

- 继续导出纯文本字段。
- 如果记录有用户编辑后的富文本，会包含 `contentHtml`，且内容是清理后的 HTML。
- 不主动导出完整 `raw_metadata.originalContent`，避免把导入原始内容扩大到普通导出形状。

Markdown 导出：

- 有 `contentHtml` 时，优先把基础 HTML 转成 Markdown 子集。
- 没有 `contentHtml` 时，继续使用纯文本 `content`。
- 复杂 HTML 结构会降级为纯文本，保证导出不中断。

## 变更文件

- `src/server/db/database.js`：新增 `notes.content_html` 字段和迁移。
- `src/server/rich-text.js`：扩展 HTML 清理、纯文本提取、纯文本转 HTML、HTML 转 Markdown、富文本来源选择。
- `src/server/routes/notes.js`：创建 / 编辑记录支持 `contentHtml`，返回安全富文本。
- `src/server/routes/storage.js`：Markdown 导出支持富文本转 Markdown。
- `src/client/main.jsx`：新建 / 编辑页接入富文本编辑器，详情页展示用户富文本。
- `src/client/styles.css`：补充富文本展示和编辑器样式。
- `tests/rich-text.test.js`、`tests/mvp-api.test.js`：覆盖安全清理、创建编辑、搜索、JSON / Markdown 导出兼容。

## 暂未实现

- 表格。
- 任务列表。
- 多人协同编辑。
- 块拖拽。
- AI 整理。
- 正文内图片排版和图片上传插入。
- 复杂移动端浮层工具栏。
- Android 封装。

## 验证结果

2026-07-03 已运行：

- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，当前正式库记录数 113。
- `npm.cmd run test`：通过，11 个测试套件 / 40 项测试全部通过。
- `npm.cmd run build`：通过。

## 建议人工测试

1. 新建一条记录，分别使用标题、粗体、斜体、列表、引用、链接和分隔线，保存后进入详情页查看格式。
2. 编辑一条旧纯文本记录，确认原内容进入编辑器后不丢失，保存后仍能搜索到纯文本关键词。
3. 打开一条 Note Station 导入记录，确认“格式 / 纯文本”切换正常。
4. 编辑一条 Note Station 导入记录，确认保存后显示用户编辑后的格式，搜索仍按纯文本命中。
5. 分别执行 JSON 导出和 Markdown 导出，确认导出文件生成且富文本内容没有破坏导出流程。
