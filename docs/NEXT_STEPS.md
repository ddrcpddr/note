# 下一步建议

## 最建议先做的 5 件事

1. 用手机在同一局域网内完整试用首页、新建、搜索、分类、详情和设置页。
2. 在 NAS 或 Docker 环境跑通 `docker compose up -d --build`，确认 `/data` 挂载可写。
3. 检查 Note Station 导入后的未分类记录和一条带附件详情页，确认来源信息、附件元数据可读。
4. 在 NAS 试运行时决定是否配置 `NOTE_ACCESS_PIN`；默认成员当前只保留“我 / 爱人”。
5. 继续验收真实附件上传：新附件会保存到 `data/attachments/`，数据库只保存元数据和相对路径。

## 当前不建议马上做

- 不建议先做复杂权限系统。
- 不建议先做手机本地数据库双向同步。
- 不建议在没有真实样例前硬猜 Note Station 格式。
- 不建议接真实外网访问，除非先确认 NAS 网络和访问安全策略。

## 下次开发优先级

| 优先级 | 任务 | 原因 |
| --- | --- | --- |
| P0 | 真实手机 / NAS 环境试用 | 当前本地 MVP 已通过自动化验证，需要确认家庭局域网实际访问体验 |
| P0 | NAS 上跑通 Docker / Node 部署 | 让家人可以真实试用 |
| P0 | 导入后未分类整理人工验收 | 确认旧笔记迁移后能找、能看、能慢慢整理 |
| P1 | 导入后未分类整理 | Note Station 迁移后需要逐步把旧记录整理到合适分类 |
| P1 | 成员改名 / 头像 / 颜色 | 当前只保留“我 / 爱人”，后续再开放自定义 |
| P2 | Markdown 导出 | 方便长期归档，但不是试用首要条件 |

## 最近验证记录

最近一次自动化验证结果：

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过 |
| `npm.cmd run test` | 通过，最新本地验证为 20 项测试通过，覆盖 API、附件上传、访问口令、Note Station 解析 / 正式导入保护、PWA manifest 与 Docker ignore 安全规则 |
| `npm.cmd run build` | 通过 |
| `git status --short --branch` | 本轮文档更新前，功能提交为 `ca08d70 Strengthen-MVP-API-coverage` |

本轮新增重点：

- 新增 `docs/AGENT_WORKPLAN.md`，明确 Lead / Dev / QA / Docs / Import / UI Polish 的职责边界。
- 修复 JSON 导出只导出 200 条列表窗口的问题。
- 修复最近备份状态在同秒写入时可能取错记录的问题。
- 修复 Note Station 样例导入确认响应在大量记录后可能返回空 `notes` 的问题。
- 自动化测试扩展到成员切换、NAS 离线备份失败、JSON 全量导出和样例导入闭环。

最近提交：

```text
ca08d70 Strengthen-MVP-API-coverage
8916685 Document-agent-workplan
4add048 Record final validation results
325e66b Document sample data
adef873 Improve user-facing status messages
59d3916 Add known bug list
8912a2c Add developer handover notes
2eb30f3 Add MVP user manual
```
## 最终收口后的下一步

本轮最终收口已完成，详见 `docs/RUN_RESULT_HANDOFF.md`。

下一步不要继续扩展新功能，建议先由用户人工验收：

1. 手机打开首页，检查记录列表和底部导航。
2. 新建记录，刷新后搜索该记录。
3. 设置页切换成员后再新建记录。
4. 设置页执行备份和 JSON 导出。
5. 导入 Note Station 样例并搜索导入记录。

人工验收通过后，再进入下一轮开发：真实 NAS 部署验证、导入后分类整理、真实附件上传、简单访问口令。


## 同步检查后的下一步（2026-06-29 13:55:04 +08:00）

当前建议顺序：

1. 先完成本轮同步文档提交并 push 到 GitHub。
2. 用户人工检查 5 个流程：首页列表、搜索、分类页 `uncategorized`、一条带附件详情页、设置页备份和 JSON 导出。
3. 若人工验收通过，再进入 Figma 原型设计文档阶段。
4. Figma 阶段只整理当前 V1 风格和页面状态，不重做 UI，不调用 Product Design，不生成新的 PNG。
5. 再进入 image2 图片素材说明文档阶段，明确哪些图片/附件/截图可以脱敏引用，哪些真实家庭内容不能进入设计文档或 Git。

进入 Figma / image2 前需要确认：

- 是否以当前 V1 为唯一视觉参考继续整理。
- 是否只做文档，不改代码和 UI。
- 是否允许使用真实导入后的页面截图；若允许，截图必须脱敏。
- image2 图片素材说明文档需要 Markdown、表格，还是 Figma 注释格式。
- 是否需要先 push 当前代码和文档，确保家里电脑可以同步同一状态。

## 真实手机与 NAS / Docker 试运行后续（2026-06-30）

当前已经完成本机生产模式和 Docker Desktop 试运行验证，下一步不建议继续盲目新增功能，而是进入真实家庭局域网人工验收。

### 立刻做

1. 在同一局域网安卓手机访问 `http://<电脑或NAS局域网IP>:3300`。
2. 按 `docs/MOBILE_TRIAL_CHECKLIST.md` 做 15 项手机端验收。
3. 试运行前按 `docs/BACKUP_RESTORE_DRILL.md` 保存数据库、附件目录和 NAS 快照。
4. NAS 实机部署时确认 `/data` 挂载目录可写，访问 `/api/health` 应返回 `/data/database/app.db`，并在设置页运行“检查当前数据目录”。
5. 记录真实手机反馈，再决定 P1：真实附件上传、简单访问口令、导入后分类整理、成员编辑或安卓封装。

### 暂时不要做

- 不要重做 UI 或改变 V1 风格。
- 不要新增复杂权限系统。
- 不要硬接真实 NAS 账号或外网访问。
- 不要重复正式导入 Note Station，除非先备份或恢复到导入前快照。
- 不要提交 `data/`、数据库、备份、导出、附件、`.nsx`、日志、密码、token 或真实 NAS 地址。

## P1 功能开发顺序（2026-06-30）

安卓原生 App 封装排到最后。当前建议按以下顺序继续：

1. 按 `docs/MOBILE_TRIAL_CHECKLIST.md` 和 `docs/ANDROID_WRAPPER_PLAN.md` 完成真实 Android 手机 Web / PWA 试运行。
2. 按 `docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md` 确认包名、封装路线、最低 Android 版本、NAS 地址配置策略和签名方式。
3. 确认后再启动 Android WebView / TWA 工程。

已完成：编辑已有记录；删除 / 归档记录；真实附件上传；简单访问口令 / PIN；导入后批量整理未分类记录；成员改名、头像和颜色编辑；定时自动备份；Markdown 导出；NAS 数据目录读写探测；Android 原生封装前置评估和决策清单。后续继续保持小步提交，每步先测试、再实现、再更新 QA 和项目记忆。

## 当前 Docker 测试入口（2026-06-30）

已先启动临时 Docker 实例，方便当前本机查看效果：

```text
http://127.0.0.1:3310/
```

对应烟测命令：

```bash
npm.cmd run smoke -- --base-url http://127.0.0.1:3310
```

注意：该实例使用 `note-trial-data` Docker 命名卷，不是正式 `data/`。下一步正式试运行前仍需用户确认是否恢复最近健康备份，然后再用默认 Docker / NAS 数据目录重新验收。
### Gate 2：真实手机局域网试运行准备（2026-06-30）

- 已将用户提供的持续开发工作计划保存到 `docs/CODEX_CONTINUOUS_DEVELOPMENT_PLAN.md`，作为后续 Lead Agent 的 Gate 流程参考。
- 当前 Gate 判断：Gate 0 正式数据库恢复已完成；Gate 1 Docker 真实 `data/` smoke 已通过；本轮进入 Gate 2，只做真实手机局域网试运行准备，不开发新功能。
- 已更新 `docs/MOBILE_TRIAL_CHECKLIST.md`，补充恢复后正式库前提、Docker 真实 `data/` 挂载、手机局域网访问、防火墙排查、Markdown 导出、小附件上传、PIN、存储目录探测、长链接和底部导航检查。
- 当前局域网 IP 仅在聊天回复中提示，不写入仓库，避免把真实地址固化到 Git。
- 下一步停止点：等待用户用 Android 手机访问 `http://<局域网IP>:3300/` 做真实试运行；在真实反馈前，不继续新增功能、Android 工程或视觉重做。
## 真实手机反馈修复记录（2026-06-30 20:12）

- 已修复首页“今天要记 / 快速记录”点击无反应：现在点击会进入现有“新记录”页。
- 新增前端静态回归测试 `tests/frontend-ui.test.js`，防止首页快捷入口再次退化为纯展示卡片。
- 本轮验证：`npm.cmd run build`、`npm.cmd run check`、`npm.cmd run test`、Docker 重建和 `npm.cmd run smoke -- --base-url http://127.0.0.1:3300` 均通过。
- 下一步仍建议继续真实手机试运行，只修实际反馈的小 bug；不要在未完成一轮试用前扩展新功能或重做 UI。

## Gate 3：试运行反馈管理（2026-06-30）

已新增：

- `docs/TRIAL_FEEDBACK_TEMPLATE.md`
- `docs/TRIAL_FEEDBACK_LOG.md`

下一步真实手机试运行时，请尽量按模板记录：页面、操作步骤、预期结果、实际结果、截图路径、是否影响数据和严重程度。当前已登记并关闭两条反馈：标签编辑 / 导入页文案、首页今天要记无响应。

当前仍不建议新增大功能。继续真实试用，出现 P0 / P1 问题时按 `mvp-bugfix-qa` 流程小步修复。

## Gate 4：备份 / 恢复演练已强化（2026-06-30）

已更新 `docs/BACKUP_RESTORE_DRILL.md`，下一次真实手机 / NAS 试运行前请先按该文档完成：

1. 停止 Node / Docker 后备份 `data/database/app.db`。
2. 同步备份 `data/attachments/`。
3. 记录当前 Git commit。
4. NAS 上保留数据目录快照。
5. 出问题时先对目标备份运行 `npm.cmd run restore-db -- --backup <backup.db>` dry-run，确认 `ok=true` 后再追加 `--confirm`。

当前仍建议继续真实手机试运行，只处理 P0 / P1 真实反馈；不要在未完成一轮稳定试用前继续扩展大功能、Android 工程或外网访问方案。
