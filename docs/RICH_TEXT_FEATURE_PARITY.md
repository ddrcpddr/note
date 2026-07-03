# 富文本功能对齐清单

更新时间：2026-07-03

目标：面向重新导入 Note Station 数据的最终富文本能力补齐。当前测试数据库和测试附件可以丢失，后续功能稳定后重新导入 `.nsx`。

| 能力 | 目标状态 | 第一轮策略 | 风险 / 备注 |
| --- | --- | --- | --- |
| 粗体 | 支持新建、编辑、展示、导出 | Tiptap StarterKit / mark | 低 |
| 斜体 | 支持新建、编辑、展示、导出 | Tiptap StarterKit / mark | 低 |
| 下划线 | 支持新建、编辑、展示、导出 | `@tiptap/extension-underline` | 低 |
| 删除线 | 支持新建、编辑、展示、导出 | StarterKit Strike | 低 |
| 标题级别 | 至少 H1-H4 或 H2-H4 | Tiptap Heading，手机工具栏只露出常用级别 | 低 |
| 正文段落 | 支持 | StarterKit Paragraph | 低 |
| 文字颜色 | 支持有限色板 | TextStyle + Color，只允许白名单颜色 | 中，需限制 style |
| 背景高亮 | 支持有限色板 | Highlight，只允许白名单颜色 | 中，需限制 style |
| 清除格式 | 支持 | Tiptap unsetAllMarks / clearNodes | 低 |
| 撤销 / 重做 | 支持 | Tiptap history | 低 |
| 无序列表 | 支持 | BulletList | 低 |
| 有序列表 | 支持 | OrderedList | 低 |
| 多级列表 | 支持 | listItem + sink/lift | 中，移动端缩进按钮要简单 |
| 缩进 / 反缩进 | 支持列表缩进 | sinkListItem / liftListItem | 中 |
| 待办 / 复选框列表 | 支持 checked 保存 | TaskList + TaskItem nested | 中，Note Station 识别需样例验证 |
| 引用 | 支持 | Blockquote | 低 |
| 分隔线 | 支持 | HorizontalRule | 低 |
| 左 / 中 / 右对齐 | 支持段落和标题 | TextAlign | 中，sanitize 需允许受控属性或转 class |
| 行内代码 | 支持 | Code mark | 低 |
| 代码块 | 第一轮支持基础展示 / 编辑 | CodeBlock | 中，不先引入高亮依赖 |
| 插入链接 | 支持 | Link extension + 简单弹窗 / prompt | 中，移动端编辑体验需打磨 |
| 编辑链接 | 支持基础修改 | 点击链接按钮修改 href | 中 |
| 删除链接 | 支持 | unsetLink | 低 |
| 安全打开链接 | 支持 | `target=_blank` + `rel=noopener noreferrer` | 低 |
| 上传图片并插入正文 | 第一轮做最小可用 | 上传到本地附件，Image 节点保存 attachmentId | 中高，涉及 draft attachment |
| 粘贴图片进入正文 | 稍后增强或第一轮试做 | clipboard image -> attachment -> Image 节点 | 高，移动端兼容性不稳定 |
| 图片详情展示 | 支持 | 本地附件 URL 渲染 | 中 |
| 上传附件 | 继续支持 | 复用现有附件接口并补充元数据 | 中 |
| 附件插入正文引用 | 第一轮可做基础节点 | attachmentReference 节点或链接卡片 | 中 |
| 附件打开 / 下载 | 支持 | `/api/attachments/:id/file` | 中，需安全路径校验 |
| Note Station 附件关联 | 重新导入时尽量恢复 | `source_attachment_id` / `source_path` 映射 | 中高，依赖真实 NSX 结构 |
| 表格展示 | 必做 | sanitize 后 HTML / Tiptap Table；详情页横向滚动 | 中 |
| 新建简单表格 | 第一轮做 | 插入 2x2 表格 | 中 |
| 编辑简单表格 | 第一轮做基础 | add/delete row/column if controllable | 中高，手机体验复杂 |
| 复杂表格 | 至少安全展示 | 保留 `source_html` 和 `content_html` fallback | 高 |
| Note Station 原始 HTML | 必须保留 | `notes.source_html` | 中，注意导出隐私和体积 |
| Note Station HTML 安全展示 | 必须支持 | `notes.content_html` | 中 |
| Note Station HTML 可编辑 | 尽力转换 | 能转 JSON 的进入 `content_json`，不能转则 read-only fallback | 高 |
| 搜索 | 继续基于纯文本 | `notes.content_text` | 低 |
| JSON 导出 | 包含富文本结构 | 导出 text/html/json 和附件元数据 | 中 |
| Markdown 导出 | 尽量转换 | JSON -> Markdown，失败用 text fallback | 中高 |

## 第一轮验收标准

- 新建记录可保存 Tiptap JSON、HTML 和纯文本。
- 编辑记录可重新打开并保留粗体、列表、待办、链接等基础格式。
- 详情页只渲染安全 HTML，不执行危险脚本或事件属性。
- 搜索只命中 `content_text`，不依赖 HTML 标签。
- JSON 导出包含富文本数据。
- Markdown 导出能输出基础格式、待办和链接。
- 图片上传后文件进入 `data/attachments/`，数据库只保存元数据和相对路径。
- 表格在手机详情页不会撑破页面。
- Note Station dry-run / import 能把原始 HTML 写入 `source_html`，安全 HTML 写入 `content_html`，纯文本写入 `content_text`。

## 暂不追求

- 100% 还原所有 Note Station 私有样式。
- 桌面级复杂表格编辑。
- 协同编辑。
- 块拖拽。
- AI 整理。
- Android 封装。