# 真实 Note Station 导入准备计划

## 当前原则

MVP 当前不猜测 Synology Note Station 的真实导出格式。真实解析器需要先基于样例文件做结构分析，再实现对应适配器。

当前已提供 dry-run 入口：

```http
POST /api/imports/notestation/dry-run
```

dry-run 只返回预检结果和需要补充的信息，不会写入正式数据库。

## 需要用户提供的文件或信息

请后续提供一份脱敏后的 Note Station 导出样例，并说明：

| 信息 | 说明 |
| --- | --- |
| 导出文件类型 | 例如 `zip`、`json`、`html`、`md` 或其他格式 |
| 是否包含附件 | 是否有图片、PDF、Office 文件或其他附件 |
| 附件存放方式 | 附件是在 zip 内、同级目录，还是正文内嵌链接 |
| 是否包含创建时间 | 如果有，请说明时间字段或界面上能看到的格式 |
| 是否包含更新时间 | 如果有，请说明时间字段或界面上能看到的格式 |
| 是否包含原始路径 | 例如笔记本、文件夹、标签、层级路径 |
| 是否包含原始分类 | Note Station 中的笔记本 / 分类 / 标签 |
| 字符编码 | 如果能确认，说明是否为 UTF-8 |
| 样例记录数量 | 建议 3-5 条脱敏记录，覆盖正文、附件、标签、失败/空记录 |

## dry-run 策略

真实导入实现前，dry-run 应保持以下行为：

- 不写入 `notes`。
- 不写入 `attachments`。
- 不复制附件文件。
- 可以写入临时预览结果，或只返回内存预览。
- 必须展示失败项，不能静默丢弃。
- 必须保留原始路径、原始标题、原始分类、原始时间字段。

## 测试数据库 / 沙盒策略

后续适配真实导入时，优先使用以下方式之一：

1. 设置临时 `NOTE_DATA_DIR` 后启动服务，在测试数据库中导入。
2. 使用 `dry-run` 只解析和预览，不写正式数据库。
3. 将真实导出样例放入 `data/imports/notestation/` 本地目录，但不要提交到 GitHub。

## 后续解析器接口

建议后续解析器统一返回：

```js
{
  records: [],
  failures: [],
  attachments: [],
  originalCategories: []
}
```

每条记录建议包含：

```js
{
  title: '',
  content: '',
  originalTitle: '',
  originalPath: '',
  originalCategory: '',
  originalCreatedAt: '',
  originalUpdatedAt: '',
  tags: [],
  attachments: [],
  rawMetadata: {}
}
```

## 当前不做的事

- 不硬编码真实 Note Station 格式。
- 不接真实 NAS。
- 不把真实导出文件提交到 GitHub。
- 不跳过失败记录。
- 不在未预览前批量写入正式数据库。
