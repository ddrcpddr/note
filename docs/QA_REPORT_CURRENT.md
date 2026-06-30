# 当前 MVP 验收报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 当前 commit | `ca08d70` |
| 测试时间 | `2026-06-29 10:26:33 +08:00` |
| 测试范围 | 家庭生活记录工具 MVP，包含 Express API、SQLite 数据、Note Station 样例导入、dry-run、备份、导出与生产构建 |
| 测试结论 | 当前 MVP 自动化验收通过，建议继续进入真实 NAS / 手机试用准备 |

## 本次运行的命令

| 命令 | 结果 | 说明 |
| --- | --- | --- |
| `npm.cmd run check` | 通过 | 数据库、分类与记录基础检查通过；本机正式 `data/database/app.db` 当前记录数为 12 |
| `npm.cmd run test` | 通过 | 9 项 API 集成测试通过，使用临时 `NOTE_DATA_DIR`，不污染正式 `data/` |
| `npm.cmd run build` | 通过 | Vite 生产构建通过 |

## 自动化覆盖项

| 测试项 | 结果 |
| --- | --- |
| 读取默认成员、分类、标签和记录列表 | 通过 |
| 新建记录并读取详情 | 通过 |
| 关键词搜索 | 通过 |
| 分类筛选 | 通过 |
| 成员筛选 | 通过 |
| 标签筛选 | 通过 |
| 切换当前家庭成员 | 通过 |
| 无效成员切换返回 404 | 通过 |
| 不传 `memberId` 新建记录时使用当前成员 | 通过 |
| 数据库备份成功路径 | 通过 |
| NAS 离线时备份返回 503 并记录失败状态 | 通过 |
| JSON 导出生成文件 | 通过 |
| JSON 导出超过 200 条时仍包含全部记录 | 通过 |
| Note Station 样例预览 | 通过 |
| Note Station 样例确认导入 | 通过 |
| Note Station 样例重复确认导入保持幂等 | 通过 |
| 真实 Note Station dry-run 不写入记录 | 通过 |
| 真实 Note Station dry-run 不生成可提交 `importId` | 通过 |

## 本次发现并修复的问题

| 问题 | 处理 |
| --- | --- |
| JSON 导出复用列表查询，最多只会导出 200 条记录 | 新增 `listNotes({ limit: 'all' })` 路径，导出使用全量记录；新增超过 200 条记录的回归测试 |
| 备份成功后立刻模拟 NAS 离线，最近备份状态可能仍显示上一条成功记录 | 最近备份查询增加 `id DESC` 作为同秒排序兜底 |
| Note Station 样例导入确认响应复用 200 条列表窗口，长期数据后可能返回空 `notes` | 样例导入确认响应改用全量列表过滤导入记录 |

## 当前真实可用功能

| 功能 | 当前状态 |
| --- | --- |
| SQLite 持久化 | 真实可用 |
| 新建记录 | 真实写入 SQLite |
| 记录列表 / 详情 | 真实从 SQLite 读取 |
| 搜索与筛选 | 真实基于 SQLite 查询和前端筛选 |
| 成员切换 | 真实写入当前成员状态，但不是登录系统 |
| 手动备份 | 真实复制 SQLite 数据库文件 |
| JSON 导出 | 真实生成包含全量记录的 JSON 文件 |
| Note Station 样例导入 | 真实写入样例导入记录和失败项 |
| Note Station dry-run | 真实提供安全预检，不写正式数据库 |
| Docker Compose 配置 | 配置可解析，等待 Docker daemon 或 NAS 环境实机验证 |
| PWA manifest | 已存在，可被浏览器识别 |

## 当前仍然是模拟或预留的功能

| 功能 | 当前状态 |
| --- | --- |
| NAS 在线 / 离线 | 设置页模拟状态，不连接真实 NAS |
| 附件上传 | 仅保存附件元数据，不保存真实上传文件 |
| 真实 Note Station 导入 | 使用样例与 dry-run 框架，不解析真实导出文件 |
| 登录与权限 | 使用家庭成员切换，不做真实登录 |
| 离线同步 | 未实现离线写入与冲突合并 |
| Markdown 导出 | 预留或灰显，不作为 MVP 真实能力 |

## 数据安全检查

| 检查项 | 结果 |
| --- | --- |
| 数据库文件不提交到 GitHub | 通过 |
| 备份文件不提交到 GitHub | 通过 |
| 导出文件不提交到 GitHub | 通过 |
| 附件文件不提交到 GitHub | 通过 |
| `.gitignore` 包含运行数据目录 | 通过 |
| JSON 导出全量记录 | 通过 |

## 当前阻塞项

无代码阻塞项。

进入真实试用前，仍需要用户后续提供：

- 真实群晖 Note Station 导出样例文件。
- 目标 NAS 部署环境信息。
- 家庭成员名单与是否需要简单访问口令。

## 是否建议进入下一阶段

建议进入下一阶段：在家庭局域网 / NAS 环境做真实手机试用，随后根据用户提供的真实 Note Station 样例实现解析器，并优先补真实附件上传。
## 最终收口验收补充（2026-06-29 11:05 +08:00）

本次在 `main` 分支、`ccd9992` 之后继续执行收口验收，并创建 `docs/RUN_RESULT_HANDOFF.md`。

### Git 检查

| 检查项 | 结果 |
| --- | --- |
| `git status` | 工作区干净，分支已跟踪 `origin/main` |
| `git log --oneline -10` | 已确认最近提交包含 `ccd9992`、`ca08d70`、`8916685` |
| `HEAD` 与 `origin/main` | 验收开始时一致：`ccd99929de8938286097099c1d6207c6e57c7435` |

### 运行检查

| 检查项 | 结果 |
| --- | --- |
| 依赖状态 | `node_modules/.bin/vite` 存在，`npm.cmd ls vite --depth=0` 显示 `vite@6.4.3`，无需重复 `npm install` |
| `npm.cmd run check` | 通过，分类数 11，本地正式记录数 12 |
| `npm.cmd run test` | 通过，9 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| `npm.cmd run dev` | 已启动，前端 `http://localhost:5173`，后端 `http://localhost:3300` |
| `/api/health` | 通过，返回 `ok: true` |

### API 功能验收

| 项目 | 结果 |
| --- | --- |
| 首页数据读取 | 通过，`/api/app-data` 返回记录、成员、分类 |
| 新建记录 | 通过，API 创建最终验收记录 |
| 详情读取 | 通过，按 ID 可读取新建记录 |
| 新建后刷新式读取 | 通过，重新查询仍存在 |
| 搜索 | 通过 |
| 分类筛选 | 通过 |
| 成员筛选 | 通过 |
| 分类页计数来源 | 通过，分类接口返回记录数 |
| 存储目录状态 | 通过，返回数据库、附件、备份、导出目录 |
| 手动备份 | 通过，生成 `.db` 备份文件 |
| JSON 导出 | 通过，生成 `.json` 文件 |
| Note Station 样例预览 | 通过 |
| Note Station 样例确认导入 | 通过，导入 3 条样例记录 |
| 导入后搜索 | 通过，可搜索到导入记录 |

### 移动端 UI 验收

使用 Playwright CLI 在 390x844 视口检查：

| 页面 | 横向溢出 | 结果 |
| --- | --- | --- |
| 首页 | 否 | 通过 |
| 详情页 | 否 | 通过 |
| 新建记录页 | 否 | 通过 |
| 搜索页 | 否 | 通过 |
| 分类页 | 否 | 通过 |
| 设置页 | 否 | 通过 |
| Note Station 导入页 | 否 | 通过 |

补充观察：

- 底部导航在首页、分类、搜索、设置页保持统一。
- 新建悬浮按钮位于底部导航上方，没有被遮挡。
- 页面仍保持 V1 浅色背景、绿色主色、圆角卡片和家庭生活记录风格。
- 页面没有变成后台管理系统。
- 浏览器控制台 0 error、0 warning，仅有 React DevTools info 提示。

### 文件安全验收

| 检查项 | 结果 |
| --- | --- |
| 数据库文件 | 未跟踪，位于 `.gitignore` 忽略范围 |
| 备份文件 | 未跟踪，位于 `.gitignore` 忽略范围 |
| 导出文件 | 未跟踪，位于 `.gitignore` 忽略范围 |
| 附件目录 | 仅跟踪 `.gitkeep` |
| 导入目录 | 仅跟踪 `.gitkeep` |
| 日志文件 | 未发现跟踪 |
| password/token/secret 字符串 | `git grep` 未发现 |
| 真实 NAS 地址 / 私有 IP | 未发现跟踪内容中写死 |

## Bug sweep：缺失 Note Station 导入批次错误收敛（2026-06-29 11:40:58 +08:00）

| 项目 | 内容 |
| --- | --- |
| 当前 commit | 修复前基线 `65b980f Add mvp bugfix QA skill`；本节随 `Fix:` 提交入库 |
| 测试时间 | `2026-06-29 11:40:58 +08:00` |
| 复现步骤 | 请求 `GET /api/imports/notestation/missing-import-id` |
| 问题原因 | `getImportPreview(importId)` 没有检查数据库查询结果是否为空，直接读取 `batch.file_name`，导致返回 JS 内部 TypeError 文本 |
| 修复内容 | 在 `getImportPreview` 中对缺失批次抛出稳定业务错误 `导入批次不存在`；新增回归测试覆盖 404 响应体 |
| 运行命令 | `npm.cmd run test` 先失败复现；修复后 `npm.cmd run build`、`npm.cmd run check`、`npm.cmd run test` 通过；浏览器打开首页、设置页和导入入口通过；API 冒烟通过 |
| 测试结果 | 新增测试后先红灯：实际错误为 `Cannot read properties of undefined (reading 'file_name')`；修复后 10 项 API 测试全部通过 |
| 仍然存在的问题 | 真实 Note Station 导出解析仍需要用户提供脱敏样例；本次不猜真实格式、不新增导入功能 |
| 下一步建议 | 后续若继续导入模块，优先在真实样例到位后补解析器测试；缺失资源类错误保持稳定业务文案 |

### 本次 bug sweep 验收结果

| 检查项 | 结果 |
| --- | --- |
| 首页记录数据 | 通过，`/api/app-data` 返回记录列表，浏览器首页可显示记录 |
| 详情读取 | 通过，按新建记录 ID 可读取详情 |
| 新建记录 | 通过，API 新建 `Bug sweep 冒烟记录` 成功 |
| 新建后读取 | 通过，重新查询仍可读取该记录 |
| 搜索 | 通过，关键词 `Bug sweep` 可找到新建记录 |
| 分类筛选 | 通过，`category=family` 可找到新建记录 |
| 成员筛选 | 通过，`member=dad` 可找到新建记录 |
| 设置页 | 通过，Playwright 手机宽度打开设置页 |
| 手动备份 | 通过，生成本地 `.db` 备份文件，运行数据未提交 |
| JSON 导出 | 通过，生成本地 `.json` 导出文件，运行数据未提交 |
| 导入页面 | 通过，设置页导入入口可打开；缺失导入批次返回稳定 404 JSON |
| 移动端 UI | 本次非 UI 修复；手机宽度下首页和设置页基础冒烟通过，未改 V1 风格 |

## Note Station sandbox 导入测试（2026-06-29 12:54:14 +08:00）

| 项目 | 内容 |
| --- | --- |
| 测试范围 | 从真实 `.nsx` dry-run JSON 导入 sandbox 数据库，并通过 API 验证读取 |
| sandbox 数据库 | `data/database/sandbox-notestation-import.db` |
| 正式数据库 | 未写入 |
| 导入记录数 | 93 |
| 失败记录数 | 0 |
| 附件元数据 | 4 |
| 标签 | 0 |
| 首页数据 | 通过，sandbox 首页数据可见 93 条导入记录 |
| 搜索 | 通过 |
| 分类筛选 | 通过，`uncategorized` 可筛出导入记录 |
| 详情 | 通过，可读取标题、正文、来源、时间、分类和附件元数据 |
| 失败项 | 本样例无失败项，`import_failures` 为 0 |
| 隐私文件检查 | `.nsx`、dry-run JSON、sandbox DB 和 `data/` 均未进入 Git 跟踪 |

本轮仍不复制真实附件文件，不提交任何真实笔记正文、附件、图片或数据库文件。

## Note Station 正式导入前准备验收（2026-06-29 13:19:53 +08:00）

| 项目 | 内容 |
| --- | --- |
| 当前 commit | `cc50526` |
| 测试时间 | `2026-06-29 13:19:53 +08:00` |
| 范围 | 正式导入前确认命令、自动备份、附件复制、原始正文保留、无确认预检 |
| 结论 | 准备流程已实现；正式数据库未执行导入，等待用户确认 |

### 复现 / 验证步骤

1. 先新增测试覆盖无 `--confirm` 预检，确认不会创建目标数据库。
2. 新增测试覆盖带 `--confirm` 的临时测试库导入，确认会创建备份、导入记录、复制附件并写入附件元数据。
3. 对真实 `.nsx` 执行无确认预检。

### 问题原因

此前只有 dry-run 和 sandbox 导入脚本；正式导入前缺少显式确认门、正式 DB 备份、附件复制、原始 HTML / 富文本保留和失败附件记录机制。

### 修复内容

- 新增 `src/server/scripts/notestation-formal-import.js`。
- 扩展 `src/server/importers/notestation/nsx.js`，支持读取 NSX 条目并在需要时保留原始正文结构。
- 扩展 `tests/notestation-nsx.test.js`，覆盖预检不写库和确认后备份/附件复制。
- 更新 Note Station 导入相关文档。

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库当前记录数 18 |
| `npm.cmd run test` | 通过，13 项测试通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| `node src/server/scripts/notestation-formal-import.js data/imports/notestation/20260629_112626_15568_ddrcpddr.nsx` | 通过，仅输出 preflight 统计，不写正式数据库 |

### 真实样例预检结果

| 项目 | 结果 |
| --- | ---: |
| 总记录数 | 93 |
| 可导入记录 | 93 |
| 失败项 | 0 |
| 附件引用 | 4 |
| 原始分类/笔记本数量 | 4 |
| 标签数量 | 0 |

### 仍然存在的问题

- 正式 `data/database/app.db` 尚未执行导入，需用户确认后才可运行 `--confirm`。
- 标签在当前样例中为 0，无法进一步验证真实标签映射。
- 附件 MIME 目前按文件名做基础猜测，正式导入后仍建议人工检查附件可打开性。

### 下一步建议

用户确认后再执行正式导入命令；导入后立即做首页、搜索、分类、详情、附件路径和失败项验收。

## Note Station 正式导入验收（2026-06-29 13:42:52 +08:00）

| 项目 | 内容 |
| --- | --- |
| 当前 commit | `913bb7d` |
| 测试时间 | `2026-06-29 13:42:52 +08:00` |
| 范围 | 正式数据库导入、附件复制、失败项记录、首页/搜索/分类/详情/备份/导出验收 |
| 结论 | 正式导入成功，附件复制成功，自动化检查通过；真实数据文件未进入 Git 跟踪 |

### 复现 / 执行步骤

1. 执行正式导入命令 `node src/server/scripts/notestation-formal-import.js ... --confirm`。
2. 首次执行发现附件复制失败，原因是真实 NSX 附件字段为 map 结构。
3. 使用首次导入前备份恢复正式数据库，避免重复导入。
4. 新增附件 map 结构测试并修复 `normalizeAttachments`。
5. 重新执行正式导入并完成 API 验收。

### 问题原因

真实 Note Station 附件字段形态为 `{key: { md5, name, ext, size... }}`。旧解析只支持字符串、数组或直接含 `id/name` 的对象，导致附件被错误命名为 `attachment-1`，无法对应 `.nsx` 内的 `file_<md5>` 条目。

### 修复内容

- `src/server/importers/notestation/nsx.js` 支持附件 map 结构，并将 `md5` 映射到 `file_<md5>`。
- `tests/notestation-nsx.test.js` 新增真实附件 map 结构覆盖，确认正式导入会复制附件且无失败项。
- 正式数据库已从首次自动备份恢复后重跑导入，避免重复记录。

### 正式导入结果

| 项目 | 结果 |
| --- | ---: |
| 导入批次 | `import_nsx_formal_mqysc6bn_h0ypw4` |
| 导入前记录数 | 18 |
| 导入后记录数 | 111 |
| 本次导入记录 | 93 |
| 失败项 | 0 |
| 附件元数据 | 20 |
| 附件复制成功 | 20 |
| 附件复制失败 | 0 |
| 标签 | 0 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库记录数 111 |
| `npm.cmd run test` | 通过，13 项测试通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| 正式导入后 API 验收脚本 | 通过，首页/搜索/分类/详情/附件路径/备份/导出均通过 |

### API 验收结果

| 检查项 | 结果 |
| --- | --- |
| 首页显示导入记录 | 通过，首页 app-data 可见正式导入样本 |
| 搜索导入记录 | 通过 |
| 分类筛选导入记录 | 通过，`uncategorized` 可见正式导入样本 |
| 详情标题/正文/来源/时间 | 通过 |
| 附件元数据和相对路径 | 通过，20 条附件元数据，抽样路径文件存在 |
| 失败项 | 通过，本次正式导入失败项为 0 |
| 手动备份 | 通过 |
| JSON 导出 | 通过 |

### 仍然存在的问题

- 本样例标签数为 0，未能验证真实标签导入。
- 所有 Note Station 原始分类暂落入 `uncategorized`，后续可人工整理分类。
- 附件 MIME 类型仍以文件名基础推断为主，建议后续人工抽查附件可打开性。

### 下一步建议

建议用户人工检查首页、搜索、分类页、1 条带附件详情页、设置页备份/导出这 5 个流程。

## 项目同步与安全复核（2026-06-29 13:55:04 +08:00）

| 项目 | 内容 |
| --- | --- |
| 同步前最新功能提交 | `76a1a99 Fix: import Note Station attachments` |
| 当前分支 | `main` |
| 本地领先远程 | 同步检查开始时领先 6 个 commit |
| 检查范围 | Git 状态、敏感文件跟踪、运行数据忽略、项目文档同步、check/test/build |

### Git 与安全检查

| 检查项 | 结果 |
| --- | --- |
| `git status --short --branch` | `main...origin/main [ahead 6]`，同步前工作区干净 |
| `git log --oneline -10` | 最近提交包含正式导入附件修复、正式导入准备、sandbox 导入、dry-run 解析和 QA skill |
| 未推送提交 | 同步检查开始时 6 个 |
| `git ls-files data` | 仅跟踪 5 个 `.gitkeep` 占位文件 |
| `git status --ignored data` | 正式 DB、sandbox DB、备份、导出、附件和导入目录均被忽略 |
| `.nsx` / dry-run JSON | 未被 Git 跟踪 |
| 日志文件 | 未发现被 Git 跟踪的日志文件 |
| 密码 / token / 真实 NAS 地址 | `git grep` 未发现真实敏感值；命中项为规则说明、npm 包名或元数据 |

### 最近工作沉淀状态

| 工作项 | 状态 |
| --- | --- |
| 多 Agent 协作计划与执行 | 已记录 |
| QA / 验收报告 | 已生成并更新 |
| `.nsx` 识别 | 成功 |
| dry-run 解析 | 成功，93 条成功、0 失败 |
| sandbox 导入 | 成功，正式库未污染 |
| 正式导入前保护流程 | 已完成，preflight + `--confirm` + 自动备份 + 回滚说明 |
| 正式导入 | 已完成，93 条记录、20 个附件、0 失败 |
| 自动化检查 | 最近一轮 `check/test/build` 通过 |

### 下一阶段判断

代码和文档同步 push 后，可以进入 Figma 原型设计文档准备阶段；但仍需用户确认：只基于 V1 风格整理、不改 UI、不调用 Product Design、不生成新 PNG，以及是否允许使用脱敏截图进入 image2 图片素材说明文档。

## Figma 原型对齐修正验收（2026-06-29 15:59 +08:00）

| 项目 | 内容 |
| --- | --- |
| 基线 commit | `53e5a72 Record image2 icon sizing requirements` |
| 测试范围 | Figma 原型小步前端对齐：成员管理、新建页成员选择、搜索来源筛选、未分类文案、导入页文案、设置页路径表达、移动端 390/430 检查 |
| 结论 | 自动化检查通过，页面级移动端横向溢出为 0；仍建议后续做截图级视觉微调 |

### 本轮修正内容

| 页面 / 区域 | 结果 |
| --- | --- |
| 成员管理 | 独立 `members` screen；从设置页进入；默认只展示“我 / 爱人”，支持切换当前成员；改名/头像/颜色为禁用的后续能力 |
| 新建记录 | 增加当前成员展示和成员 chip，保存时使用本次选择的成员 |
| 搜索页 | 增加来源筛选：全部、手动创建、Note Station 导入 |
| 分类页 | `uncategorized` 统一显示为 `未分类 / 待整理` |
| 导入页 | 文案从模拟导入改为 `.nsx`、dry-run、sandbox、自动备份、完成摘要和失败项可见的真实流程表达 |
| 设置页 | 增加成员管理入口；路径反馈改为 `data/...` 相对表达，避免过度技术化 |
| 底部导航 | 采用 Figma 线程规则：首页、分类、搜索、设置保留底部导航；新建、详情、导入、成员管理使用顶部返回 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库记录数 111 |
| `npm.cmd run test` | 通过，13 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| `npx.cmd playwright install chromium` | 通过，Chromium / headless shell 已安装到本机 Playwright 缓存 |
| Playwright 390/430 DOM 检查 | 通过，8 个页面可达，页面级横向溢出为 0，控制台无 warning/error |

### 移动端页面检查

| 页面 | 390px 溢出 | 430px 溢出 | 底部导航规则 |
| --- | --- | --- | --- |
| 首页 | 否 | 否 | 显示底部导航 |
| 详情 | 否 | 否 | 顶部返回，无底部导航 |
| 新建记录 | 否 | 否 | 顶部返回，无底部导航 |
| 分类 | 否 | 否 | 显示底部导航 |
| 搜索 | 否 | 否 | 显示底部导航 |
| 设置 | 否 | 否 | 显示底部导航 |
| 成员管理 | 否 | 否 | 顶部返回，无底部导航 |
| 导入 Note Station | 否 | 否 | 顶部返回，无底部导航 |

### 仍然存在的问题

- 前端仍使用内部 React `screen` 状态，不是 URL 级独立路由。
- 成员改名、换头像、换颜色当前已收敛为禁用入口；后续如需要再设计成员编辑 API / 数据字段。
- 正式 Note Station 导入仍保留在命令行保护流程中，不从浏览器直接执行，避免误写正式数据库。
- image2 头像和分类图标仍是风格参考，尚未生成最终可直接使用的独立资产。

### 下一步建议

建议下一轮只做视觉微调：基于 390px/430px 截图检查按钮间距、长标题换行、导入页和设置页文案密度；等 image2 单文件素材生成后，再替换成员头像和分类图标。

## 默认成员称呼调整验收（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 调整原因 | 默认使用“爱人”比“老婆”更温和、更中性，更适合家庭生活记录工具默认展示 |
| 默认成员 | `我`、`爱人` |
| 自定义能力 | 当前只保留“我 / 爱人”切换；改名、头像、颜色和新增成员以后再做 |
| 数据安全 | 未修改真实 Note Station 导入正文、附件、数据库运行数据或备份/导出文件 |

### 同步范围

| 范围 | 结果 |
| --- | --- |
| 前端默认成员 | `fallbackMembers` 仅保留 `self/我` 和 `partner/爱人` |
| 首页成员筛选 | 默认显示全部成员、我、爱人；旧 `dad/mom` 数据显示兼容为我/爱人 |
| 新建记录页 | 当前成员选择默认显示我、爱人，保存时使用选择成员 |
| 搜索页 | 成员筛选同步为我、爱人 |
| 详情页 | 创建人显示通过兼容映射同步为我/爱人 |
| 初始化数据 | `src/shared/defaults.js` 默认成员和 seed notes 改为 `self/partner` |
| 导入默认执行成员 | 样例导入、sandbox/formal 导入脚本默认执行成员改为 `self`，不修改真实已导入内容 |
| 文档 | Figma 文档、默认头像素材说明、README、样例数据、PRD/Prototype/Data Model、Note Station 导入文档和项目记忆已同步 |

### 待验证命令

本节提交前需要重新运行：`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`。

## 阶段 1：runtime 素材移动端视觉验收（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 基线 commit | `f912224 Use runtime image assets in frontend` |
| 范围 | runtime WebP 头像、分类图标、空状态 / 导入 / 备份插画接入后的 390px / 430px 移动端视觉验收 |
| 结论 | 已发现并修复 1 个真实移动端 UI bug；复测 16 个页面宽度组合全部通过 |

### 检查页面

| 页面 | 390px | 430px | 说明 |
| --- | --- | --- | --- |
| 首页 | 通过 | 通过 | 修复长 URL 标题溢出后通过 |
| 详情 | 通过 | 通过 | 详情标题也增加长词换行保护 |
| 新建记录 | 通过 | 通过 | 当前成员头像和成员 chip 正常 |
| 搜索 | 通过 | 通过 | 来源 / 成员 / 分类筛选保持可用 |
| 分类 | 通过 | 通过 | 11 个 runtime 分类图标正常显示 |
| 设置 | 通过 | 通过 | 成员头像、备份状态区域正常 |
| 导入 Note Station | 通过 | 通过 | 导入待检查插画正常，不遮挡操作 |
| 成员管理 | 通过 | 通过 | 默认只展示我 / 爱人，头像正常 |

### 发现并修复的问题

| 问题 | 原因 | 修复 |
| --- | --- | --- |
| 首页 390px / 430px 下，真实记录标题为长 URL 时会把记录卡片右侧按钮推出屏幕 | 标题 `h3` 没有对 URL / 长连续字符启用强制换行 | 记录卡片标题和详情标题增加 `overflow-wrap: anywhere`，不修改真实记录内容 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| Playwright 临时移动端审计脚本，390px / 430px x 8 screens | 复测通过，`failed: 0` |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，13 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

### 安全说明

- 本轮只修改前端显示层和文档，不修改数据库、导入逻辑、真实 Note Station 内容或附件。
- 临时 Playwright 截图和脚本已清理，不进入 Git。
- 默认成员仍只保留“我 / 爱人”。

## 阶段 2：MVP 日常使用体验补齐（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 真实试用前的轻量文案和入口收口，不新增功能、不改数据库 |
| 结论 | 已减少离线 / 未实现能力的误导表达；移动端复查通过 |

### 本轮小修正

| 区域 | 调整 |
| --- | --- |
| 新建记录离线兜底 | 当家庭记录服务不可用时，不再提示“模拟保存”或最终显示“已保存到 NAS”，改为“临时保存在当前页面 / 等待家庭记录服务恢复” |
| 附件入口 | “已添加 1 个模拟附件”改为“已添加 1 个附件占位”，避免误认为真实上传已完成 |
| 设置页备份 | “模拟离线”改为“测试离线”，“已完成一次模拟备份”改为“已完成一次备份” |
| 设置页导出 | 移除灰显的 Markdown 导出入口，MVP 只展示真实可用的 JSON 导出 |
| 路径提示 | 服务不可用时显示“默认本地路径”，不再强调“模拟路径” |

### 验收

| 检查项 | 结果 |
| --- | --- |
| Playwright 390px / 430px x 8 screens 移动端审计 | 通过，`failed: 0` |
| 旧默认成员称呼 | 未出现 `老婆 / 妈妈 / 爸爸` 默认展示 |
| 导航规则 | 首页 / 分类 / 搜索 / 设置有底部导航；二级页面顶部返回 |

本轮仍未新增成员、权限、真实 NAS 连接、真实附件上传或数据库结构修改。


## 阶段 3：成员体系 MVP 收口（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 默认成员只保留“我 / 爱人”，清理成员管理页和文档中的误导入口 |
| 结论 | 当前版本只支持切换“我 / 爱人”；新增成员、改名、头像和颜色编辑均明确为后续能力 |

### 本轮修正

| 区域 | 调整 |
| --- | --- |
| 成员管理页 | 改名 / 头像 / 颜色按钮改为禁用状态，说明当前只支持切换记录人 |
| 设置页成员说明 | 改为“当前默认成员固定为我和爱人；编辑以后再做” |
| 用户手册 / README | 同步当前版本只支持两个成员之间切换，新增和改名以后再做 |
| 项目记忆 | 记录分类里的孩子 / 老人 / 宠物仍属于分类体系，不是默认成员 |

### 验收

| 检查项 | 结果 |
| --- | --- |
| Playwright 390px / 430px x 8 screens 移动端审计 | 通过，`failed: 0` |
| 默认成员 | 仅“我 / 爱人” |
| 非默认称呼 | 未作为默认成员展示 |

本轮未新增成员功能、未改权限、未改数据库结构。

## 阶段 4：Note Station 导入后整理体验（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 导入记录详情来源展示、未分类待整理提示、来源筛选 API 覆盖 |
| 结论 | 小步对齐通过；未修改真实导入数据和数据库结构 |

### 本轮修正

| 区域 | 调整 |
| --- | --- |
| 详情页 | Note Station 导入记录显示原始分类和原始路径；缺失时显示安全占位 |
| 分类页 | `未分类 / 待整理` 卡片显示导入记录待整理数量 |
| Notes API | 新增 `source` 查询参数，支持 `notestation_import` / `manual` 来源过滤 |
| 自动化测试 | MVP API 测试增加来源筛选断言 |

### 验收

| 检查项 | 结果 |
| --- | --- |
| Playwright 390px / 430px x 8 screens 移动端审计 | 通过，`failed: 0` |
| 单项 API 测试 | `node --test tests\mvp-api.test.js` 通过，10 项 |
| 隐私数据 | 未输出或提交真实笔记正文、附件、数据库、备份、导出或 `.nsx` |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，13 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |


## 阶段 5：PWA / NAS 部署收口（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | PWA/NAS 部署配置、Docker 构建上下文安全、交接文档同步 |
| 结论 | 配置已收口到可进入 NAS 实机试用；不包含真实 NAS 地址或账号信息 |

### 本轮修正

| 区域 | 调整 |
| --- | --- |
| 服务启动 | 移除固定创建工作目录 `data/...` 的逻辑，统一由数据库层按 `NOTE_DATA_DIR` 创建真实数据目录 |
| Docker 构建上下文 | `.dockerignore` 增加 `*.nsx`、数据库、备份、导出、附件、日志和 `output/` 忽略规则 |
| 文档 | README、NAS_DEPLOYMENT、DEV_HANDOVER、NEXT_STEPS、PROJECT_MEMORY 同步当前 PWA/NAS 试用状态 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，13 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| `docker compose config` | 未运行成功：当前机器未安装或未暴露 `docker` 命令，需在 NAS / Docker daemon 可用环境实机验证 |


## 阶段 6：自动化 QA 回归补强（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | NOTE_DATA_DIR、PWA manifest/runtime icons、Docker 构建上下文安全规则 |
| 结论 | 自动化测试从 13 项扩展到 16 项；新增测试首次运行通过 |

### 本轮新增覆盖

| 覆盖项 | 说明 |
| --- | --- |
| 数据目录隔离 | `/api/health` 返回的 `dataPaths` 必须位于测试进程传入的 `NOTE_DATA_DIR` 下 |
| PWA 安装配置 | manifest、standalone、portrait、runtime 图标和 index meta/link 均存在 |
| Docker 安全忽略 | `.dockerignore` 必须包含 `data`、`*.nsx`、数据库、备份、导出、附件、日志和临时输出 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## 阶段 7：最终交接包（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 最终交接文档、阶段提交列表、人工验收流程、NAS 试用边界 |
| 结论 | 文档已收口；提交前重新运行三件套 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## V1 字体和布局对齐 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 按 7 张 V1 PNG 调整字体层级、卡片密度、分类页两列布局、新建页类型栅格、详情/导入/设置页节奏 |
| 结论 | 第一轮视觉对齐通过移动端自动巡检；功能未重构 |

### 本轮修正

| 页面 / 区域 | 调整 |
| --- | --- |
| 全局 | 中文系统字体优先，卡片阴影减轻，圆角收敛到 20px，chip 更紧凑 |
| 首页 | 页面标题、搜索、今日卡、记录卡字号降噪；记录卡减少竞争性状态行 |
| 新建记录 | 记录类型改为 V1 风格四列紧凑卡片 |
| 详情页 | 标题、正文、附件和关联记录字号/间距降低一档 |
| 搜索页 | 搜索框和筛选区字号更贴近 V1 |
| 分类页 | 改成两列分类卡片，常规分类标题单行显示 |
| 导入页 | 移除顶部大插画块，保留安全导入流程并靠近 V1 stepper/card 节奏 |
| 设置页 | 数据备份优先，成员管理入口移到后段 |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |
| DOM 指标 | 390px 下无页面级横向溢出；页面标题 36px；卡片圆角 20px；分类常规标题不换行 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## V1 首页筛选节奏二次对齐 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 首页首屏筛选区，保持功能但靠近 V1 单行快捷筛选布局 |
| 结论 | 通过。首页默认不再展开成员/分类筛选，移动端无溢出 |

### 本轮修正

| 页面 / 区域 | 调整 |
| --- | --- |
| 首页 | 成员筛选和分类筛选收进 `更多筛选` 面板 |
| 首页 | 快捷筛选行增加 `更多` chip，默认首屏更接近 V1 |
| 首页 | 当成员或分类筛选已生效时继续显示高级筛选面板，避免隐藏筛选状态 |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |
| DOM 指标 | 390px 下页面宽度等于视口；首页标题 36px；卡片圆角 20px |

### 提交前最终验证

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## V1 导航和筛选细节二次对齐 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 底部导航、搜索筛选区、新建记录当前成员区 |
| 结论 | 通过。页面更接近 V1 手机 App 节奏，功能仍保留 |

### 本轮修正

| 页面 / 区域 | 调整 |
| --- | --- |
| 底部导航 | 从整条底栏改成内浮圆角 dock，靠近 V1 分类/设置页导航 |
| 搜索页 | 默认只展开分类、标签、时间范围，成员/来源收进 `成员 / 来源` 高级筛选 |
| 新建记录 | 当前成员从完整信息卡收敛为轻量成员条，保留“我 / 爱人”切换 |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |
| DOM 指标 | 390px 下页面宽度等于视口；页面标题 36px；卡片圆角 20px |

### 提交前最终验证

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## V1 浮动按钮和二级页底部操作栏 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 首页/分类浮动新建按钮，新建/详情/导入页底部操作栏 |
| 结论 | 通过。底部操作更接近 V1 的圆润手机 App 表达，功能不变 |

### 本轮修正

| 页面 / 区域 | 调整 |
| --- | --- |
| 首页 | 保留 V1 风格纯圆形加号按钮 |
| 分类页 | 加号按钮增加 `记一件事` 小字，贴近 V1 分类页参考 |
| 新建记录 | 底部保存区改为内浮圆角操作栏 |
| 详情页 | 底部更多/分享操作区改为内浮圆角操作栏 |
| 导入页 | 底部取消/确认操作区改为内浮圆角操作栏 |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |
| DOM 指标 | 390px 下页面宽度等于视口；页面标题 36px；卡片圆角 20px |

### 提交前最终验证

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## V1 记录卡片和详情信息层级 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 首页/搜索记录卡片摘要，详情页元信息区和内容标题 |
| 结论 | 通过。信息层级更接近 V1，字段未丢失 |

### 本轮修正

| 页面 / 区域 | 调整 |
| --- | --- |
| 记录卡片 | 摘要限制为两行，避免真实导入长摘要撑高时间线卡片 |
| 详情页 | 主元信息保留创建、更新、来源三行 |
| 详情页 | 创建人和状态改为轻量 chip，减少表格/后台感 |
| 详情页 | 内容标题图标改为 list 风格，贴近 V1 详情页 |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |
| DOM 指标 | 390px 下页面宽度等于视口；页面标题 36px；卡片圆角 20px |

### 提交前最终验证

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## V1 设置和导入页文案收敛 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 设置页备份卡、Note Station 导入步骤和主要提示文案 |
| 结论 | 通过。页面更接近 V1 家庭用户语言，真实流程不变 |

### 本轮修正

| 页面 / 区域 | 调整 |
| --- | --- |
| 导入页 | 步骤改为 `选择文件 / 预览记录 / 确认导入 / 导入完成` |
| 导入页 | 主提示去掉 `dry-run / sandbox` 等实现词，保留预览、自动备份和不覆盖现有记录的说明 |
| 设置页 | 备份状态文案改得更生活化 |
| 设置页 | NAS 在线/离线测试从大按钮收成轻量状态测试行 |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |
| DOM 指标 | 390px 下页面宽度等于视口；页面标题 36px；卡片圆角 20px |

### 提交前最终验证

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## V1 最终视觉审计 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 7 张 V1 参考图对应当前首页、新建、详情、搜索、分类、导入、设置页面 |
| 结论 | 通过。当前移动端 MVP 已达到与 V1 差不太多的阶段性标准，后续只建议基于真机反馈做微调 |

### 本轮修正

| 页面 / 区域 | 调整 |
| --- | --- |
| 设置页 | 行尾普通 `>` 文本替换为 `ChevronRight` 图标，更接近 V1 设置项表达 |
| 文档 | 新增 `docs/V1_VISUAL_FINAL_AUDIT.md`，逐页记录当前与 7 张 V1 参考图的对齐程度和保留差异 |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

### 仍保留的差异

| 差异 | 原因 |
| --- | --- |
| 设置页保留相对数据路径 | NAS 自部署需要透明性 |
| 导入页保留 `.nsx` 和安全导入说明 | 真实 Note Station 导入流程需要明确边界 |
| 新建/搜索保留成员和来源能力 | 当前 MVP 功能范围需要 |


## V1 主页面标题字号修正 QA（2026-06-29）

| 项目 | 内容 |
| --- | --- |
| 范围 | 首页、搜索、分类、设置左上角主标题和副标题 |
| 结论 | 通过。标题从过大的 36px 收敛到 32px / 30px，更接近 V1 |

### 本轮修正

| 页面 | 调整 |
| --- | --- |
| 首页 | `家事记` 从 36px 改为 32px，副标题从 16px 改为 15px |
| 搜索 | `搜索` 从 36px 改为 32px，副标题从 16px 改为 15px |
| 分类 | `分类` 从 36px 改为 30px，副标题从 16px 改为 15px |
| 设置 | `设置` 从 36px 改为 30px，副标题从 16px 改为 15px |

### 已运行检查

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| DOM 指标 | 首页/搜索标题 32px；分类/设置标题 30px；页面宽度 390px；卡片圆角 20px |
| Playwright 390px / 430px x 8 screens | 通过，`failed: 0` |

## 真实手机与 NAS / Docker 试运行验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 基线 commit | `529c585 Sync project memory` |
| 测试范围 | Git 同步、安全文件检查、本机 check/test/build、生产模式同端口启动、Docker build/up、NAS 数据目录配置、手机人工验收文档 |
| 结论 | 自动化与本机 Docker 验收通过，建议进入家庭局域网真实手机试运行 |

### Git 与安全检查

| 检查项 | 结果 |
| --- | --- |
| `git pull --ff-only` | 已最新 |
| `git status --short --branch` | `main...origin/main`，本轮开始时工作区干净 |
| `HEAD` 与 `origin/main` | 一致，`529c5858a613253230e6d1c7cb3a5a401e6f451f` |
| `git ls-files data` | 仅跟踪 5 个 `.gitkeep` |
| `.nsx`、数据库、备份、导出、附件、日志 | 未被 Git 跟踪 |
| 敏感词 / 私有地址扫描 | 命中均为规则说明、占位示例或 npm 包名；未发现真实密码、token、私钥或真实 NAS 地址 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 111 条记录 |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过 |
| `PORT=3410 npm.cmd run server` | 通过，生产 Express 同端口提供 API 和前端 |
| `docker compose build` | 通过 |
| `docker compose up -d` | 通过，容器 `note` healthy |

### 本机生产模式验收

| 地址 / 路径 | 结果 |
| --- | --- |
| `http://localhost:3410/api/health` | 200 JSON |
| `http://localhost:3410/api/app-data` | 200 JSON |
| `http://localhost:3410/` | 200 HTML |
| `/detail`、`/new`、`/search`、`/categories`、`/settings`、`/import`、`/members` | 200 HTML，SPA fallback 正常 |

### Docker / NAS 验收

| 检查项 | 结果 |
| --- | --- |
| Docker daemon | 可用，Docker Desktop 4.73.0 / Engine 29.4.3 |
| 容器状态 | `note` running，healthy |
| 宿主访问 | `http://localhost:3300/` 和 `/api/health` 可访问 |
| 容器数据目录 | `/data/database`、`/data/attachments`、`/data/backups`、`/data/imports/notestation`、`/data/exports` |
| compose 挂载 | `./data:/data`，NAS 实机部署时改成真实 NAS 数据目录但不提交仓库 |

### 仍需人工验收

- 安卓手机打开局域网地址和 PWA 添加到桌面。
- 新建记录后刷新不丢失。
- 搜索、分类、成员筛选是否符合家庭使用习惯。
- Note Station 导入记录详情中的来源、原始路径和附件元数据是否可读。
- 设置页备份和 JSON 导出文件是否落到 NAS 挂载目录。

## 编辑已有记录 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 详情页进入编辑、PATCH 更新记录、标签替换、成员 / 分类更新、附件保持不变 |
| 原则 | 不新增大功能，不重做 UI，不修改真实 Note Station 导入数据，不做附件上传 / 删除 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 先新增 `updates an existing note and refreshes its tags` 测试 | 红灯，`PATCH /api/notes/:id` 缺失导致返回前端 HTML，JSON 解析失败 |
| 实现 `PATCH /api/notes/:id` | 首次绿灯前发现 SQL 参数数量错误，测试返回 `column index out of range` |
| 修正 SQL 参数 | 单文件 `node --test tests/mvp-api.test.js` 通过，12 项通过 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| 创建记录后编辑标题和正文 | 自动化测试通过 |
| 编辑分类和成员 | 自动化测试通过 |
| 替换标签，旧标签不再命中新记录 | 自动化测试通过 |
| 详情页右上角编辑入口 | 已接入复用表单 |
| 编辑附件 | 暂不支持；编辑页明确提示附件不在本次修改范围 |

### 编辑功能最终验证

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过 |
| `npm.cmd run test` | 通过，17 项测试全部通过 |
| `npm.cmd run build` | 通过 |

备注：`data/database/app.db` 是正式运行数据库，仍被 Git 忽略；本轮不提交任何真实运行数据。

## 删除 / 归档记录 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 详情页更多操作、软归档、软删除、普通列表隐藏、分类计数同步 |
| 原则 | 不硬删除数据库行，不删除附件文件，不修改真实 Note Station 导入内容，不改数据库结构 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 先新增 `archives and soft deletes a note from normal lists` 测试 | 红灯，归档接口缺失导致返回前端 HTML |
| 实现归档和软删除 API | 单文件 API 测试转绿 |
| 补充分类计数断言 | 红灯，归档记录仍计入分类数量 |
| 修正 app-data 和分类 API 统计条件 | 单文件 API 测试转绿，13 项通过 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| 归档记录后默认列表和搜索不显示 | 自动化测试通过 |
| `includeArchived=true` 可查到归档记录 | 自动化测试通过 |
| 归档后分类计数减少 | 自动化测试通过 |
| 软删除后归档查询也不可见 | 自动化测试通过 |
| 附件文件不被删除 | 本轮只更新记录状态，不触碰附件文件 |

## 真实附件上传 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 新建记录选择真实附件、后端写入附件目录、数据库保存元数据和相对路径 |
| 原则 | 不把附件文件写入数据库，不提交 `data/attachments/`，不修改真实 Note Station 导入数据，不引入大型依赖 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 新增 `stores uploaded attachment file under NOTE_DATA_DIR` 测试 | 红灯，只有元数据，真实文件未落盘 |
| 实现附件落盘 helper | 单文件 API 测试转绿 |
| 新增 `accepts a mobile photo-sized attachment payload` 测试 | 红灯，原 `2mb` JSON 上限不够 |
| 将 Express JSON 上限调整为 `12mb` | 单文件 API 测试转绿，15 项通过 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| 附件写入 `NOTE_DATA_DIR/attachments` | 自动化测试通过 |
| 数据库只保存附件元数据和相对路径 | 自动化测试通过 |
| 新建记录页可选择真实文件 | 前端已接入文件选择和 base64 payload |
| 编辑页修改附件 | 暂不支持，页面有明确提示 |
| 超大文件处理 | 当前试运行上限为 12MB 请求体，后续可再做分片或 multipart |

## 简单访问口令 / PIN P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 可选 `NOTE_ACCESS_PIN`、锁屏、解锁 cookie、API 保护 |
| 原则 | 不做账号系统，不写死真实口令，不提交密码/token，不影响默认无 PIN 部署 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 新增 `tests/access-pin.test.js` | 红灯，`/api/access/status` 不存在，返回 404 |
| 实现访问口令 API 和中间件 | PIN 单测转绿 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| 未配置 `NOTE_ACCESS_PIN` 时默认不锁 | 由现有 API 测试继续覆盖 |
| 配置 `NOTE_ACCESS_PIN` 后未解锁访问 app API 返回 401 | 自动化测试通过 |
| 错误口令失败 | 自动化测试通过 |
| 正确口令设置 cookie 后可访问 app data | 自动化测试通过 |
| 前端锁屏 | 已接入轻量移动端锁屏，构建通过 |

## 导入后批量整理未分类 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | Note Station 导入后未分类记录批量整理到常用分类 |
| 原则 | 不修改真实导入正文，不删除附件，不覆盖原始路径 / 原始分类元数据，不移动手动未分类记录 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 新增 `bulk categorizes imported uncategorized notes only` 测试 | 红灯，`/api/notes/bulk-categorize` 不存在，返回前端 HTML |
| 实现批量整理 API | 单文件 API 测试转绿，16 项通过 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| Note Station 导入且未分类记录可批量移动到目标分类 | 自动化测试通过 |
| 手动创建的未分类记录不会被误移动 | 自动化测试通过 |
| 整理后可按目标分类 + Note Station 来源筛选查到 | 自动化测试通过 |
| 原始路径 / 原始分类 / 附件元数据 | 本轮只改 `category_id`，不触碰这些字段 |
| 前端分类页整理入口 | 已接入轻量 chip 操作，构建通过 |

## 默认成员资料编辑 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 默认“我 / 爱人”成员改名、头像字、颜色编辑 |
| 原则 | 不新增成员，不做权限系统，不写死家庭真实姓名，不恢复旧默认称呼 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 新增 `updates default member display profile` 测试 | 红灯，成员 PATCH 接口不存在，返回前端 HTML |
| 实现成员资料 PATCH、`members.color` 增量字段和 app-data 返回 | 单文件 API 测试转绿，17 项通过 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| 改名、头像字、颜色保存 | 自动化测试通过 |
| app-data 返回更新后的成员资料 | 自动化测试通过 |
| 新建记录使用更新后的成员名 | 自动化测试通过 |
| 前端成员管理页可编辑 | 已接入，构建通过 |
| 新增成员 | 暂不开放，符合当前约束 |

## 定时自动备份 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 可选定时复制 `app.db` 到备份目录，并记录备份状态 |
| 原则 | 默认关闭，不写死 NAS 路径，不提交备份文件，不引入后台任务依赖 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 新增 `tests/auto-backup.test.js` | 红灯，启用自动备份环境变量后没有生成备份 |
| 抽取备份函数并按环境变量启动定时器 | 自动备份单测转绿 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| 默认不自动生成备份 | 代码默认 interval 为 0 |
| 设置 `NOTE_AUTO_BACKUP_INTERVAL_MS` 后生成备份 | 自动化测试通过 |
| 最新备份状态可通过 `/api/storage/status` 读取 | 自动化测试通过 |
| 备份文件位置 | `data/backups/`，继续被 Git 忽略 |

## Markdown 导出 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 全量记录 Markdown 导出，设置页入口 |
| 原则 | 不提交导出文件，不暴露真实笔记内容到文档，不替代 JSON 导出 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 新增 `exports notes as Markdown` 测试 | 红灯，`/api/storage/export-markdown` 不存在 |
| 实现 Markdown 导出 API | 单文件 API 测试转绿，18 项通过 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| Markdown 文件写入 `data/exports/` | 自动化测试通过 |
| 导出包含标题、正文、记录 ID | 自动化测试通过 |
| 设置页入口 | 已接入，构建通过 |
| JSON 导出 | 保持可用 |

## NAS / 存储目录读写探测 P1 验收（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 当前 `NOTE_DATA_DIR` 下 database、attachments、backups、exports 目录读写权限探测 |
| 原则 | 不接真实 NAS 账号，不写死 NAS 地址，不提交探测文件或运行数据 |

### TDD 过程

| 步骤 | 结果 |
| --- | --- |
| 新增 `probes writable storage directories` 测试 | 红灯，`/api/storage/probe` 不存在 |
| 实现存储目录探测 API | 单文件 API 测试转绿 |

### 验收点

| 检查项 | 结果 |
| --- | --- |
| database 目录可写 | 自动化测试通过 |
| attachments 目录可写 | 自动化测试通过 |
| backups 目录可写 | 自动化测试通过 |
| exports 目录可写 | 自动化测试通过 |
| 设置页探测入口 | 已接入，`npm.cmd run build` 通过 |
| 敏感文件 | 探测文件立即删除，`data/` 继续被 Git 忽略 |

## Android 原生封装前置评估（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | Android 封装路线、前置验收和用户确认项 |
| 原则 | Android 排最后；不引入大依赖；不写真实 NAS 地址；不生成签名文件；不改变 Web/NAS 数据架构 |

### 评估结论

| 检查项 | 结果 |
| --- | --- |
| 当前数据位置 | 服务端 SQLite / NAS 数据目录，不适合直接做纯本地 Android 数据库 |
| PWA 基础 | 已具备 manifest、runtime 图标和移动端布局 |
| WebView 壳 | 可作为后续推荐封装路线，但需要用户确认包名、NAS 地址配置和签名策略 |
| TWA | 需要 HTTPS 域名和 assetlinks，当前家庭局域网场景不建议首选 |
| 原生离线同步 | 属于大架构变更，当前不建议 |

### 当前状态

本轮只创建封装准备文档，不创建 Android 工程、不安装依赖、不修改业务代码。

## Android 封装决策清单文档检查（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | Android 工程启动前的用户确认项和安全边界 |
| 结果 | 已创建 `docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md` |

### 检查点

| 检查项 | 结果 |
| --- | --- |
| 是否创建 Android 工程 | 未创建 |
| 是否安装 Android / Gradle / Capacitor 依赖 | 未安装 |
| 是否生成 keystore 或签名密钥 | 未生成 |
| 是否写入真实 NAS 地址 | 未写入 |
| 是否改变业务代码或数据库结构 | 未改变 |

## 试运行报告刷新检查（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | `TRIAL_RUN_READINESS_REPORT` 和 `RUN_RESULT_HANDOFF` 当前状态同步 |
| 结果 | 已刷新 Docker、测试数量、当前可用功能和 Android 决策暂停点 |

### 检查点

| 检查项 | 结果 |
| --- | --- |
| Docker 容器 | `note` healthy |
| 健康接口 | `http://127.0.0.1:3300/api/health` 返回 200 |
| 当前测试数量 | 26 项自动化测试通过 |
| 真实运行数据 | `data/` 仍被 Git 忽略 |
| Android 工程 | 尚未创建，等待用户确认决策清单 |

## Docker 试运行数据库完整性问题（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 触发 | Docker HTTP 烟测中 SPA 路由 200，但 `/api/app-data`、`/api/notes?limit=3`、`/api/categories` 返回 500 |
| 错误 | `database disk image is malformed` |
| 根因状态 | 已确认 `data/database/app.db` 主机和容器 integrity_check 均失败 |
| 最近健康备份 | `data/backups/app-2026-06-29T05-40-32-597Z.db`，111 条记录，integrity_check ok |
| 当前处理 | 已停止 Docker 容器，未自动恢复，等待用户确认 |

详见：`docs/DATABASE_INTEGRITY_RECOVERY.md`。
## Fix: SQLite 完整性检查收敛（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 基线 commit | `666c783 Document database integrity recovery plan` |
| 范围 | `npm run check` 对 SQLite 损坏库的检测能力 |
| 复现步骤 | 在当前正式库损坏状态下运行 `npm.cmd run check`；旧逻辑只读取分类数和记录数，可能误报通过 |
| 问题原因 | `src/server/scripts/check.js` 未执行 `PRAGMA integrity_check`，局部损坏但 `COUNT(*)` 仍可返回时无法发现问题 |
| 修复内容 | `check.js` 在读取统计前先对现有数据库执行只读 `PRAGMA integrity_check`；新增 `tests/check-script.test.js` 覆盖健康临时数据目录输出 `integrityCheck: ok` |
| 运行命令 | `node --test tests/check-script.test.js` 通过；`npm.cmd run test` 通过，27 项测试；`npm.cmd run build` 通过；临时健康 `NOTE_DATA_DIR` 下 `npm.cmd run check` 通过 |
| 当前正式库结果 | `npm.cmd run check` 现在会正确失败，错误为 `SQLite integrity_check failed`，因为 `data/database/app.db` 已确认损坏 |
| 仍然存在的问题 | 正式库恢复仍需用户确认是否用最近健康备份 `data/backups/app-2026-06-29T05-40-32-597Z.db` 替换当前损坏库 |
| 下一步建议 | 用户确认后先备份当前损坏库副本，再恢复健康备份、重新运行 `npm.cmd run check/test/build` 和 Docker API 烟测 |
## Fix: 数据库确认门恢复工具（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 基线 commit | `20879ca Fix: detect corrupted SQLite database in check` |
| 范围 | SQLite 损坏后的安全恢复流程，不直接替换正式库 |
| 复现步骤 | 当前正式库 `data/database/app.db` 损坏，`npm.cmd run check` 正确失败；需要一个不会误操作的恢复入口 |
| 问题原因 | 只有文档化手工复制步骤，用户确认后仍容易手动选错备份或忘记先保存当前损坏库副本 |
| 修复内容 | 新增 `npm.cmd run restore-db -- --backup <backup.db>` dry-run；只有追加 `--confirm` 才会先保存当前库到 `data/backups/app-before-restore-<timestamp>.db`，再用完整性检查通过的备份替换正式库 |
| 运行命令 | `node --test tests/database-restore.test.js` 通过；`npm.cmd run restore-db -- --backup data/backups/app-2026-06-29T05-40-32-597Z.db` dry-run 通过且 `restored=false`；`npm.cmd run test` 通过，30 项；`npm.cmd run build` 通过 |
| 当前正式库结果 | `npm.cmd run check` 仍正确失败，说明尚未执行 `--confirm` 恢复，正式库仍等待用户确认 |
| 仍然存在的问题 | 未经用户确认，不替换 `data/database/app.db`；Docker / 手机试运行仍需恢复后重新验证 |
| 下一步建议 | 用户确认后执行 `npm.cmd run restore-db -- --backup data/backups/app-2026-06-29T05-40-32-597Z.db --confirm`，再运行 `check/test/build` 和 Docker API 烟测 |

## Fix: Docker 临时试运行与 HTTP 烟测（2026-06-30）

| 项目 | 内容 |
| --- | --- |
| 范围 | 启动不污染正式数据的 Docker 临时实例，并新增可重复 HTTP 烟测命令 |
| 当前 Docker 测试地址 | `http://127.0.0.1:3310/` |
| Docker 数据目录 | Docker 命名卷 `note-trial-data`，不是项目正式 `data/` |
| 复现步骤 | 之前默认 compose 挂载正式 `./data` 时会碰到损坏的 `data/database/app.db`，业务 API 不适合继续试运行 |
| 处理方式 | 构建 `note-trial:current`，使用临时命名卷启动 `note-trial`，再对该实例运行 HTTP 烟测 |
| 修复内容 | 新增 `src/server/scripts/http-smoke.js`、`tests/http-smoke.test.js` 和 `npm.cmd run smoke` |
| 当前正式库状态 | `npm.cmd run check` 仍失败，错误为 SQLite `integrity_check` 不通过；未执行正式恢复 |

### 运行命令

| 命令 | 结果 |
| --- | --- |
| `docker build -t note-trial:current .` | 通过，容器内 `npm run build` 通过 |
| `docker run -d --name note-trial -p 3310:3300 -e PORT=3300 -e NOTE_DATA_DIR=/data -v note-trial-data:/data note-trial:current` | 通过 |
| `http://127.0.0.1:3310/api/health` | 通过，返回 `ok: true`，`dbPath=/data/database/app.db` |
| `npm.cmd run smoke -- --base-url http://127.0.0.1:3310` | 通过，API、前端 shell、备份、JSON 导出均通过 |
| `node --test tests/http-smoke.test.js` | 通过，2 项 |
| `npm.cmd run test` | 通过，32 项 |
| `npm.cmd run build` | 通过 |
| `npm.cmd run check` | 失败，符合预期：正式本地数据库已损坏，等待用户确认恢复 |

### 烟测覆盖

- `/api/health`
- `/api/app-data`
- `/api/notes?limit=3`
- 记录详情查询
- 关键词搜索
- 分类筛选
- 成员筛选
- `/api/categories`
- `/api/storage/probe`
- `/api/storage/backup`
- `/api/storage/export-json`
- 前端首页 shell

### 仍然存在的问题

- `note-trial` 是临时测试容器，使用测试卷，不代表正式 Note Station 导入库已经恢复。
- 正式试运行仍需用户明确确认后执行 `npm.cmd run restore-db -- --backup data/backups/app-2026-06-29T05-40-32-597Z.db --confirm`，再重启默认 Docker / NAS 服务并重新烟测。