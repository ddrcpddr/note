# Note Station 导入

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
- 无法识别作者时归属到 `历史导入` 或当前执行导入的成员。
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
  "memberId": "history"
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

