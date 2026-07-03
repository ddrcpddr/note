# 当前 QA 报告

测试时间：2026-07-03

当前基线 commit：`5fff73d Add safe rich text read-only rendering`

本轮目标：项目状态收口、文档同步、发布路线图整理。此轮不修改业务逻辑、不修改数据库、不新增功能。

## 测试范围

- Git 状态和敏感文件跟踪检查。
- 当前功能状态与文档一致性检查。
- README、PROJECT_MEMORY、NEXT_STEPS、RUN_RESULT_HANDOFF、QA_REPORT_CURRENT 的当前状态同步。
- 新增 PROJECT_STATUS、DOCS_SYNC_AUDIT、ROADMAP_RELEASE_PLAN。
- 执行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`。

## 当前功能验收结论

| 模块 | 当前结论 |
| --- | --- |
| 首页 / 列表 | 已实现，支持记录列表和筛选入口 |
| 新建 / 编辑 | 已实现，支持文本、分类、标签、成员、附件基础上传 |
| 详情页 | 已实现，支持纯文本、附件元数据、来源信息、富文本只读切换 |
| 搜索 | 已实现，基于纯文本和筛选条件 |
| 分类 | 已实现，包含未分类 / 待整理 |
| 成员 | 默认只保留我 / 爱人；支持切换和资料编辑；不支持新增成员 |
| Note Station 导入 | 当前真实样例已完成正式导入；未知样例仍需 dry-run |
| 备份 | 手动备份和自动备份配置已实现 |
| 导出 | JSON 和 Markdown 已实现 |
| 富文本 | 只读安全渲染已实现；编辑器未实现 |
| Docker / NAS | 基础配置已具备；仍需真实 NAS 持续试运行 |
| PWA | 基础 manifest 和图标已具备；不含复杂离线同步 |
| Android | 未开始 |

## 本轮运行命令

以下命令在文档更新完成后执行并记录结果：

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## 测试结果

- `npm.cmd run check`：通过，`ok=true`，`integrityCheck=ok`，`categoryCount=11`，`noteCount=113`。
- `npm.cmd run test`：通过，11 个 suite，36 个 test，36 个 pass，0 个 fail。
- `npm.cmd run build`：通过，Vite 成功生成 `dist/` 构建产物。

## 已知问题和风险

- 文档历史较长，旧文档曾包含过期状态；本轮已通过 PROJECT_STATUS 和 DOCS_SYNC_AUDIT 统一当前事实。
- 真实 NAS 长时间运行仍需用户人工验收。
- 附件管理、富文本编辑、Android、NAS 运维增强、导入后整理增强仍是后续大功能。
- 不应从旧损坏数据库中补数据，除非先做只读 salvage 并征得确认。
- 不应把真实 `.nsx`、数据库、备份、导出、附件、日志或隐私内容提交到 Git。

## 下一步建议

进入 RC1 家庭局域网试运行，先收集真实手机和 NAS 使用反馈，再决定下一轮 P1/P2。
