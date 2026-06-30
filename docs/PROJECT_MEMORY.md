# 项目聊天记忆

## 2026-06-28

### 仓库

- GitHub 仓库：`https://github.com/ddrcpddr/note`
- 本地目录：`X:\GitHub项目\note`
- 仓库名确认：`note`

### 产品方向

用户想开发一个家庭生活记录工具，用来替代 Synology Note Station。

原来的 Note Station 用于记录家庭事务、维修记录、购物消费、孩子 / 老人 / 宠物相关事项、房屋设备、账号信息、临时想法、备忘和流水账等。

现在的主要问题：

- 安卓手机端体验不好。
- 内容越来越像口水账。
- 记录多了以后缺少结构化整理能力。
- 后期回顾和查找不够方便。

新工具定位：

- 私有化。
- 家庭自用。
- 轻量。
- 手机端友好。
- 更像家庭生活时间线和家庭事项档案，而不是普通笔记软件。

### 多人和 NAS 决策

重要补充需求：

- 工具不是只给一个人用，家庭其他成员也会写 note。
- 所有家庭成员写的记录统一保存到家里的 NAS。
- MVP 优先采用 NAS / 局域网服务器集中部署。
- 手机端通过浏览器或 PWA 访问同一个服务。
- 数据库文件保存在 NAS 指定目录。
- 附件文件保存在 NAS 指定附件目录。
- 不优先做每台手机本地数据库再同步到 NAS 的复杂方案。
- 家庭成员登录后都可以查看全部记录。
- 记录需要显示创建人。
- 首页和搜索页需要支持按成员筛选。
- MVP 暂不做复杂权限隔离。

### 已确认技术栈

- 前端：React + Vite
- 后端：Express
- 数据库：SQLite
- 附件：NAS / 本地文件夹存储
- 访问方式：手机浏览器 / PWA
- 部署：NAS 或家庭局域网服务器优先
- 仓库：GitHub 的 `ddrcpddr/note`

### 数据目录目标

目标目录结构：

```text
data/
  database/
    app.db
    backups/
  attachments/
  imports/
    notestation/
  exports/
  logs/
```

### 已确认 MVP 范围

MVP 需要覆盖：

- 首页 / 生活时间线
- 快速新建记录
- 默认分类体系
- 标签系统
- 家庭成员标识
- 成员筛选
- Note Station 历史数据导入
- 详情页
- 搜索
- NAS 存储与备份
- JSON 导出

### UI 方向

- 手机端优先，尤其是安卓。
- 简洁、温和、现代。
- 不要像后台管理系统。
- 不要太多表格。
- 首页像生活时间线，而不是传统文档列表。
- 卡片式布局。
- 分类、标签、成员筛选清晰但不喧宾夺主。
- 适合长期记录家庭琐事，界面要耐看。

### 导入原则

- 不假设 Synology Note Station 导出格式固定。
- 等用户提供实际导出样例后，先分析结构，再写解析逻辑。
- 导入模块要单独封装。
- 导入前要预览。
- 导入失败记录要可查看。
- 导入后保留原始标题、正文、创建时间、更新时间、附件、原始路径、原始分类等信息。
- 导入执行成员需要被记录。
- 导入记录默认归属到执行导入的当前成员，并保留来源元数据。

### 开发约定

- 不一次性生成难以维护的大项目。
- 每一步说明做了什么。
- 代码结构要清楚。
- README 要说明安装、运行、备份、导入数据。
- 每完成一个阶段给出测试方法。
- 优先保证功能闭环，不先做花哨功能。
- 手机端 UI 是重点。
- 同项目隔壁 agent 正在用 Product Design 生成产品原型图，本线程避免覆盖其原型产物。

## 2026-06-29

### V1 前端原型阶段

- 用户明确要求：以截图中的 7 张 V1 页面为唯一视觉参考，不参考 V2，不调用 Product Design，不继续生成 PNG。
- 当前原型采用 React + Vite + Tailwind CSS，先使用 mock 数据，不接真实后端、SQLite 或导入解析逻辑。
- 已实现的移动端页面：
  - 首页 / 生活时间线
  - 记录详情页
  - 设置 / NAS 备份页
  - 新建记录页
  - 搜索页
  - 分类页
  - 导入 Note Station 页
- 已补充文档：
  - `docs/V1_STYLE_GUIDE.md`
  - `docs/PRODUCT_DESIGN_CONTEXT.md`
  - `docs/PROJECT_MEMORY.md`
- 页面验证重点：
  - 手机宽度下避免横向溢出。
  - 分类页改为单列卡片，避免中文被挤成竖排。
  - 导入页长标题和文件名使用截断，统计卡改为两列，更适合手机阅读。
- 用户新增长期约定：每个阶段结束后推送到 GitHub，并把项目记忆同步到 `docs/PROJECT_MEMORY.md`。

### V1 参考图提交约定

- 已删除本地 `design/home-records-prototype` 中的 V2 PNG、V2 README 和 V2 生成脚本。
- GitHub 只提交 7 张 V1 页面参考图：
  - `page-1-home-selected.png`
  - `page-2-new-record.png`
  - `page-3-record-detail.png`
  - `page-4-search.png`
  - `page-5-categories.png`
  - `page-6-import-note-station.png`
  - `page-7-settings-backup.png`
- `concept-*` 图片、zip、设计 README 和 `Thumbs.db` 不作为本轮 V1 唯一视觉参考，已从本地设计目录清理。

### 可点击 mock 原型阶段

- 本阶段仍然只做前端 mock 原型，不接真实后端、数据库、NAS API、登录或 Note Station 解析。
- 已补齐的关键 mock 交互：
  - 首页快速筛选：全部、待办、重要、有附件。
  - 旧阶段首页成员筛选曾使用“爸爸、妈妈、历史导入”等示例；当前默认成员已调整为“我、爱人”。
  - 首页分类筛选，并支持从分类页点击分类回到首页筛选。
  - 搜索页关键词、分类、标签、成员、时间范围筛选。
  - 从首页和搜索结果进入详情页。
  - 新建记录页支持输入标题、正文，切换记录类型、标签、模拟附件，并模拟保存后进入详情页。
  - 设置页支持模拟 NAS 在线 / 离线状态和手动备份反馈。
  - 导入 Note Station 页支持模拟选择文件、解析预览、确认导入、导入完成 4 步流程。
- 移动端检查结果：
  - `npm run build` 通过。
  - 使用构建后的 `vite preview` 在 390px 手机宽度检查。
  - 页面主体宽度无真实横向滚动；筛选胶囊的横向滑动属于预期交互。
  - 搜索页头部按钮已收窄，避免手机端贴边。
  - 分类筛选已补强：分类也能命中同名标签，例如“维修 / 售后”可显示带“维修”标签的记录。
- 当前仍然保持 V1 浅色背景、绿色主色、圆角卡片、轻阴影、底部导航和生活感，不引入 V2 风格。
- 后续待办：
  - 真实后端 API 和 SQLite 表结构落地。
  - 数据目录 `data/` 初始化和备份脚本。
  - Note Station 样例文件结构分析与导入解析模块。
  - PWA manifest、离线提示和局域网部署说明。

### 阶段 2：本地数据层

- 使用 Node 内置 SQLite 实现本地持久化，数据库默认位置为 `data/database/app.db`。
- 新增并初始化 MVP 数据表：
  - `members`
  - `categories`
  - `notes`
  - `tags`
  - `note_tags`
  - `attachments`
  - `imports`
  - `import_failures`
  - `backups`
- 默认写入家庭成员、分类、常用标签和 3 条示例记录。
- 前端优先从 `/api/app-data` 读取 SQLite 数据，服务端不可用时回落到阶段 1 mock 数据。
- 新建记录会通过 `POST /api/notes` 保存到 SQLite；标题为空时由正文自动生成。
- 附件阶段 2 只保存元数据，不做真实上传。
- 真实数据库文件、附件、备份和导出文件不会提交到 GitHub。
- 已创建 `docs/DATA_MODEL.md` 记录数据结构和阶段限制。

### 阶段 3：Note Station 导入框架

- 没有真实 Synology Note Station 导出样例，因此没有猜测真实格式。
- 新增导入模块目录：`src/server/importers/notestation/`。
- 实现样例导入预览和确认导入 API：
  - `POST /api/imports/notestation/sample-preview`
  - `GET /api/imports/notestation/:importId`
  - `POST /api/imports/notestation/:importId/commit`
- 导入页接入 API，可完成选择样例文件、解析预览、确认导入、导入完成 4 步流程。
- 导入记录写入本地 SQLite，`source_type` 标记为 `notestation_import`。
- 导入记录保留原始标题、路径、分类、创建时间、更新时间和原始 JSON 元数据。
- 无法解析的样例记录写入 `import_failures` 并在导入页展示。
- 阶段 3 仍不处理真实附件文件和真实导出格式。
- 已创建 `docs/NOTESTATION_IMPORT.md` 记录导入框架、API 和后续扩展方式。

### 阶段 4：NAS 存储与备份

- 实现本地目录模拟 NAS 存储，不连接真实 NAS，不写死 NAS 地址。
- 数据根目录默认是 `data/`，可用 `NOTE_DATA_DIR` 环境变量覆盖。
- 当前目录结构：
  - `data/database/app.db`
  - `data/attachments/`
  - `data/backups/`
  - `data/imports/notestation/`
  - `data/exports/`
- 新增存储 API：
  - `GET /api/storage/status`
  - `POST /api/storage/backup`
  - `POST /api/storage/export-json`
- 设置页会显示数据库位置、附件目录、备份目录、导出目录、最近备份时间。
- 设置页支持手动备份、JSON 导出、NAS 在线 / 离线模拟和备份失败提示。
- `.gitignore` 已确保数据库、备份、导出、附件和导入原始文件不会提交。
- 已创建 `docs/NAS_DEPLOYMENT.md` 记录部署目录、API 和限制。

### 阶段 5：家庭成员与 MVP 收尾

- 新增成员 API：
  - `GET /api/members`
  - `POST /api/members/current`
- 设置页新增“家庭成员”区域，可切换当前记录人。
- 新建记录默认使用当前成员。
- MVP 阶段所有家庭成员默认可以查看全部记录，复杂权限暂不实现。
- `notes.visibility` 字段已预留，默认值为 `family`，后续可扩展私密记录。
- README 已整理，覆盖安装、运行、构建、初始化数据、备份、导出 JSON、功能范围和后续待办。
- 当前 MVP 可演示：
  - 切换成员
  - 新建记录
  - 查看详情
  - 搜索记录
  - 导入历史记录样例
  - 备份 / 导出

### 当前 MVP QA 验收

- 新增 `docs/QA_REPORT_CURRENT.md`，记录当前 MVP 自动验收结果。
- 已验证：
  - `npm.cmd install`
  - `npm.cmd run check`
  - `npm.cmd run build`
  - `GET /api/health`
  - 首页、详情、新建、搜索、分类、导入、设置页面移动端核心流程
  - 新建记录、搜索、分类筛选、成员筛选、标签筛选
  - 手动备份和 JSON 导出
  - Note Station 样例导入流程
- 当前 MVP 验收结论：建议进入下一阶段。

### 阶段 A：MVP 自动化测试

- 新增 `tests/mvp-api.test.js`，使用 Node 内置 `node:test`，不引入大型测试依赖。
- 新增 `npm run test`。
- 测试会启动独立 Express 服务，并使用临时 `NOTE_DATA_DIR`，避免污染项目正式 `data/`。
- 覆盖：
  - 读取默认数据和记录列表
  - 新建记录
  - 读取记录详情
  - 关键词搜索
  - 分类筛选
  - 成员筛选
  - 标签筛选
  - 数据库备份
  - JSON 导出
- Windows 上临时目录删除曾遇到 SQLite 文件短暂占用，已通过等待服务进程退出和重试清理解决。

### 阶段 B：PWA 基础支持

- 新增 `public/manifest.webmanifest`。
- 新增 `public/icons/app-icon.svg` 作为 PWA 图标占位。
- `index.html` 已补充移动端与 PWA meta：
  - `theme-color`
  - `mobile-web-app-capable`
  - `apple-mobile-web-app-capable`
  - `apple-touch-icon`
  - manifest 链接
- MVP 阶段不启用复杂 service worker，避免缓存 API 请求影响家庭 NAS 在线试用。

### 阶段 C：Docker / NAS 部署准备

- 新增 `Dockerfile`，使用 Node 22，容器内构建前端并运行 Express 服务。
- 新增 `docker-compose.yml`，默认把 `./data` 挂载到容器内 `/data`。
- 新增 `.dockerignore`，排除 `node_modules`、`dist`、`data`、`.git` 和本地环境文件。
- Express 服务现在会在存在 `dist/` 时托管前端构建产物，因此容器内一个端口即可访问前端和 API。
- 默认容器端口为 `3300`，`NOTE_DATA_DIR=/data`。
- 文档中只写示例 NAS 路径，不写死用户真实 NAS 地址，也不包含账号密码。

### 阶段 D：真实 Note Station 导入准备

- 新增 `docs/NOTESTATION_REAL_IMPORT_PLAN.md`，说明真实导入前需要用户提供的样例文件和字段信息。
- 新增 `POST /api/imports/notestation/dry-run`。
- 当前 dry-run 不写入正式数据库，只返回 `needs_real_sample`、失败提示和 required sample info。
- 自动化测试已覆盖 dry-run 不写入记录。
- 仍然不硬猜真实 Note Station 导出格式，等用户提供脱敏样例后再实现 JSON / HTML / Markdown / ZIP 解析器。

### 阶段 E：最终整理

- README 补充当前真实功能、当前模拟功能和后续需要用户提供的信息。
- 新增 `docs/NEXT_STEPS.md`，列出下一步最建议做的 5 件事。
- 阶段 E 仍不接真实 NAS、不猜真实 Note Station 格式、不做复杂登录或权限。

### 安全加固 1：README 完善

- README 新增常见问题：
  - 端口占用
  - 数据库初始化
  - 如何查看数据目录
  - 如何重置本地测试数据
  - Windows PowerShell 使用 `npm.cmd`
- 本项只改文档，不改核心代码。

### 安全加固 2：QA 报告完善

- `docs/QA_REPORT_CURRENT.md` 增加清晰表格：
  - 当前真实可用功能
  - 当前模拟功能
  - 后续需要用户提供的信息
- 记录 Docker CLI 存在但 Docker daemon 未运行的环境限制。

### 安全加固 3：普通用户使用手册

- 新增 `docs/USER_MANUAL_MVP.md`。
- 面向普通家庭成员说明首页、新建记录、详情、搜索、分类、导入、备份、导出和成员切换。
- 避免写成开发文档。

### 安全加固 4：开发交接文档

- 新增 `docs/DEV_HANDOVER.md`。
- 记录项目定位、技术栈、关键目录、常用命令、数据目录、真实能力、模拟能力和后续注意事项。
- 明确 V1 是唯一视觉参考，不使用 V2，不调用 Product Design，不生成新 PNG。

### 安全加固 5：已知问题列表

- 新增 `docs/BUG_LIST.md`。
- 只记录测试中真实遇到或当前代码明确可见的问题。
- 当前无 P0 必须修阻塞项。

### 安全加固 6：错误提示文案

- 仅修改用户可见文案，不改底层逻辑。
- 优化了保存失败、搜索空状态、分类空状态、导入失败、备份失败、JSON 导出失败和 NAS 离线提示。
- 文案更强调“已有记录不会被修改”和“检查家庭记录服务 / NAS 连接”。

### 安全加固 7：示例数据说明

- 新增 `docs/SAMPLE_DATA.md`。
- 说明默认成员、分类、标签和示例记录来自 `src/shared/defaults.js`。
- 说明如何删除 `data/database/app.db` 后重新运行 `npm run check` 来重置本地测试数据。

### 安全加固 8：最后总验收

- 已运行：
  - `npm.cmd run check`
  - `npm.cmd run test`
  - `npm.cmd run build`
  - `git status --short --branch`
  - `git log --oneline -10`
- 结果：
  - check 通过
  - test 通过，5 项测试通过
  - build 通过
  - `main...origin/main`，工作区干净
- `docs/NEXT_STEPS.md` 已补充最后总验收记录和最近提交列表。
### 主控 Agent 阶段：QA 加固与计划治理

- 新增 `docs/AGENT_WORKPLAN.md`，明确 Lead Agent、主开发 Agent、QA Agent、Docs / Deploy Agent、Import Agent、UI Polish Agent 的职责边界、允许修改范围、禁止事项、验收标准和 commit 策略。
- 使用子 Agent 做了只读审计：QA 发现 JSON 导出复用 200 条列表窗口的真实数据风险；Docs / Deploy 发现 README 和 NEXT_STEPS 中部分待办已过期；Import 确认当前 dry-run 策略守住了“不硬猜真实格式”的边界。
- 修复 JSON 导出只导出列表页 200 条记录的问题：普通列表仍默认限制 200 条，JSON 导出改用 `listNotes({ limit: 'all' })` 导出全量记录。
- 修复最近备份状态在同一秒内插入多条记录时可能取错上一条记录的问题，最近备份查询增加 `id DESC` 兜底排序。
- 修复 Note Station 样例导入确认响应在大量记录后可能因为列表窗口限制而返回空 `notes` 的问题。
- 自动化测试从 5 项扩展到 9 项，新增覆盖：当前成员切换、无效成员 404、默认当前成员新建记录、NAS 离线备份失败、JSON 全量导出超过 200 条记录、Note Station 样例预览 / 确认 / 幂等、dry-run `importId: null`。
- 已刷新 `docs/QA_REPORT_CURRENT.md`、`docs/BUG_LIST.md`、`docs/NEXT_STEPS.md`、`docs/NAS_DEPLOYMENT.md`、`docs/NOTESTATION_IMPORT.md`、`docs/NOTESTATION_REAL_IMPORT_PLAN.md`、`docs/USER_MANUAL_MVP.md` 和 `docs/DEV_HANDOVER.md`。
- 当前仍不实现真实附件上传、真实 Note Station 解析、真实 NAS 连接、登录权限和复杂离线同步；这些需要用户提供真实样例或部署环境后再推进。
### 最终收口验收与交接报告

- 用户要求停止继续开发新功能、不再开新 Agent，只对刚才工作做最终收口和验收报告。
- 已执行 Git 检查：`git status` 干净，`HEAD` 与 `origin/main` 在收口开始时均为 `ccd99929de8938286097099c1d6207c6e57c7435`。
- 依赖检查显示 `node_modules/.bin/vite` 和 `vite@6.4.3` 已存在，因此未重复运行 `npm install`，避免无意义锁文件噪音。
- 已运行并通过：`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`。
- 已启动 `npm.cmd run dev`，确认前端 `http://localhost:5173`、后端 `http://localhost:3300`，健康接口返回 `ok: true`。
- 已用 API 验收首页数据、新建记录、详情读取、搜索、分类筛选、成员筛选、分类计数、存储目录、备份、JSON 导出、Note Station 样例预览/确认导入、导入后搜索。
- 已用 Playwright CLI 在 390x844 手机宽度检查首页、详情、新建、搜索、分类、设置、Note Station 导入页，未发现横向溢出，浏览器控制台无 error/warning。
- 已确认运行数据均被 `.gitignore` 忽略，Git 只跟踪 `data/**/.gitkeep`；未发现 password/token/secret 或真实 NAS 地址写入跟踪文件。
- 新增 `docs/RUN_RESULT_HANDOFF.md` 作为本轮交接报告。


### 项目专用 Skill：mvp-bugfix-qa

- 新增 `.agents/skills/mvp-bugfix-qa/SKILL.md`，用于后续在本项目内按固定流程修 bug、跑测试、检查移动端 UI、检查数据持久化、备份、导出和 Note Station 导入流程。
- 触发语示例：`使用 mvp-bugfix-qa skill 修复 bug`。
- Skill 明确要求每次修 bug 按顺序执行：读取项目记忆和 QA 文档、检查 git 状态、复现问题、定位最小原因、小步修复、运行 `npm run build` / `npm run check` / `npm run test`、更新 QA 报告和项目记忆、输出修改文件清单，并使用 `Fix:` 开头的 commit message。
- Skill 明确保持 V1 为唯一视觉参考，不调用 Product Design，不生成新 PNG，不重做 UI，不把页面改成后台管理风格。
- Skill 明确禁止提交数据库、`data/` 运行数据、备份、导出、附件、真实导入文件、日志、密码、token 和真实 NAS 地址。

### Bug sweep：Note Station 缺失导入批次错误收敛

- 使用 `mvp-bugfix-qa` 项目专用 skill 执行 bug sweep，没有新增功能，没有调用 Product Design，没有改 UI 风格。
- 真实发现的小 bug：请求不存在的 Note Station 导入批次时，`getImportPreview(importId)` 会读取空 `batch.file_name`，向前端返回内部 TypeError 文本。
- 已先新增回归测试 `reports missing Note Station import preview with a stable error`，确认测试红灯后再修复。
- 最小修复：`getImportPreview` 在缺失批次时抛出业务错误 `导入批次不存在`，路由继续返回 404 JSON。
- 修复后 API 测试从 9 项扩展到 10 项，并通过；API 冒烟覆盖首页数据、新建、详情、搜索、分类筛选、成员筛选、设置存储状态、备份、JSON 导出、样例导入预览和缺失导入批次错误。
- 本次仍不实现真实 Note Station 导出解析，不接真实 NAS，不提交运行数据。

### 真实 Note Station NSX 样例分析与 dry-run

- 用户已将真实 `.nsx` 放入 `data/imports/notestation/`，当前样例文件为 `20260629_112626_15568_ddrcpddr.nsx`，约 21.38 MiB。
- 已确认 `.nsx` 是 ZIP/PK 压缩包，可在内存中读取，不需要解压到工作区。
- 已新增 `src/server/importers/notestation/nsx.js`，实现 NSX 结构分析与 dry-run 解析；默认 dry-run 输出标题、脱敏摘要、时间、原始路径、附件数和失败项，不输出完整正文。
- 已新增 `src/server/scripts/notestation-dry-run.js`，可生成本地 dry-run JSON；输出文件应放在被忽略的 `data/imports/notestation/` 下。
- 已新增 `src/server/scripts/notestation-sandbox-import.js`，只允许写入 `NOTE_DATA_DIR` 包含 sandbox/test/temp 的测试数据库，防止污染正式数据库。
- 真实样例 dry-run 结果：93 条记录全部解析成功，失败 0，记录附件 4，归档内附件/缩略图资源 25，实际引用分类 4，标签 0。
- 已用 sandbox 数据库验证导入：本次 importId `import_nsx_sandbox_mqyoos5g_opxd42` 写入 93 条记录、0 条失败、4 条附件元数据；正式数据库未写入。
- 已创建 `docs/NOTESTATION_SAMPLE_ANALYSIS.md`，记录脱敏结构分析和后续策略；仍禁止提交 `.nsx`、dry-run JSON、sandbox 数据库、附件和解压内容。

### Note Station sandbox 导入测试

- 用户确认 dry-run JSON 内容正确后，进入 sandbox 导入测试阶段。
- 新增 `NOTE_DB_PATH` 支持，可将服务和导入脚本指向单独 sandbox DB 文件，例如 `data/database/sandbox-notestation-import.db`。
- `notestation-dry-run.js` 新增 `--include-content` 参数，仅用于生成被 Git 忽略的本地 JSON，供 sandbox 导入保留正文。
- `notestation-sandbox-import.js` 现在可读取 dry-run JSON 或 `.nsx`；写入前要求 `NOTE_DB_PATH` 或 `NOTE_DATA_DIR` 包含 sandbox/test/temp，防止污染正式数据库。
- 本次 sandbox 导入 importId 为 `import_nsx_sandbox_mqyqp5tj_fep9yu`，写入 93 条记录、0 条失败、4 条附件元数据；正式 `data/database/app.db` 未写入。
- API 验证通过：首页数据、搜索、分类筛选、详情标题/正文/来源/时间/分类/附件元数据均可读取；本样例标签数为 0。
- 新增 `docs/NOTESTATION_DRY_RUN_REVIEW.md`，只记录统计和字段质量，不包含真实正文。

### Note Station 正式导入前保护流程

- 用户已确认 dry-run 和 sandbox 导入结果，可以进入正式导入前准备阶段，但要求不得直接写入正式数据库。
- 新增 `src/server/scripts/notestation-formal-import.js`：默认只做 preflight，输出记录数、附件数、分类数、失败数；只有显式传入 `--confirm` 才会写入配置的数据库。
- 正式确认导入前会自动备份数据库到 `data/backups/app-before-notestation-import-<timestamp>.db`，导入事务失败时回滚并在错误中给出备份恢复说明。
- 正式导入策略：所有记录先进入 `uncategorized`，保留 `originalCategory`、`originalPath` 和 `raw_metadata.originalNotebookPath`；`notes.content` 保存纯文本，`raw_metadata.originalContent` 保存原始 HTML / 富文本内容。
- 附件正式导入时复制到 `data/attachments/notestation/<importId>/<noteId>/`，数据库只保存附件元数据和相对路径；附件失败会进入 `import_failures`，不影响笔记记录本身导入。
- 新增自动化测试覆盖：无 `--confirm` 不创建 DB；有 `--confirm` 时在临时测试库中备份、导入、复制附件、保留原始正文。
- 已对真实 `.nsx` 执行无确认预检：93 条记录、93 条可导入、0 失败、4 个附件引用、4 个原始分类、0 标签；正式数据库未写入。

### Note Station 正式导入完成

- 用户确认 dry-run、sandbox 和正式导入前检查结果后，已允许执行正式导入。
- 首次正式导入触发自动备份，但发现真实附件结构解析不足：Note Station 附件是 `{key: { md5, name, ext, size... }}` map，旧解析降级为 `attachment-1`，导致附件复制失败。
- 已用首次正式导入前备份恢复 `data/database/app.db`，避免正式库留下重复导入记录；随后修复附件解析并重新执行正式导入。
- 新增/更新测试覆盖附件 map 结构，确认正式导入会从 `.nsx` 内 `file_<md5>` 复制附件。
- 最终正式导入批次：`import_nsx_formal_mqysc6bn_h0ypw4`。
- 正式库记录数从 18 增至 111；本次导入 93 条记录、0 条失败、20 条附件元数据、20 个附件复制成功、0 个附件复制失败。
- 本次导入所有记录仍先落入 `uncategorized`，原始分类/笔记本路径保留在 `originalCategory`、`originalPath` 和 metadata 中。
- 已验证首页、搜索、分类筛选、详情字段、附件路径、手动备份、JSON 导出、`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 均通过。
- `.nsx`、dry-run JSON、正式数据库、备份、附件和导出文件仍在 `.gitignore` 保护范围内，不提交 GitHub。

### 项目同步检查与下一阶段准备（2026-06-29 13:55:04 +08:00）

- 本次同步前最新功能提交：`76a1a99 Fix: import Note Station attachments`，分支为 `main`，本地相对 `origin/main` 领先 6 个 commit。
- 多 Agent / 多角色协作任务已经执行并沉淀到文档：Lead Agent 计划、QA 验收、Docs / Deploy 整理、Import Agent 路线和 UI Polish 边界均已记录在 `docs/AGENT_WORKPLAN.md`、`docs/RUN_RESULT_HANDOFF.md`、`docs/QA_REPORT_CURRENT.md` 和本文件中。
- QA / 验收报告已生成并持续更新：当前 `docs/QA_REPORT_CURRENT.md` 覆盖 MVP API、移动端基础验收、Note Station dry-run、sandbox 导入、正式导入前保护流程和正式导入验收。
- 真实 Synology Note Station `.nsx` 文件已成功识别为 ZIP/PK 结构，可在内存中读取，不需要把真实内容解压到工作区。
- dry-run 解析已成功：真实样例 93 条记录全部解析成功，失败 0；解析器可读取标题、纯文本正文、原始 HTML / 富文本、创建时间、更新时间、原始路径、原始分类和附件元数据。
- sandbox 导入测试已成功：写入 sandbox DB 93 条记录，失败 0，附件元数据验证通过，正式数据库当时未污染。
- 正式导入前保护流程已完成并验证：默认 preflight 不写库；`--confirm` 前自动备份 `data/database/app.db` 到 `data/backups/`；失败时提供回滚说明。
- 正式导入已完成：最终批次 `import_nsx_formal_mqysc6bn_h0ypw4`，正式库记录数从 18 增至 111，导入 93 条记录、失败 0、附件元数据 20、附件复制成功 20。
- 首次正式导入发现真实附件字段是 `{key: { md5, name, ext, size... }}` map 结构，已用自动备份恢复正式库后修复解析器并重新导入，避免重复导入记录。
- 最近一次完整检查通过：`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 均通过；`npm.cmd run test` 当前 13 项测试通过。
- `.gitignore` 当前保护的运行数据包括：`data/`、`.nsx`、dry-run JSON、sandbox 数据库、正式数据库、备份文件、导出文件、附件文件、真实 Note Station 导入目录和日志文件。
- Git 当前只跟踪 `data/attachments/.gitkeep`、`data/backups/.gitkeep`、`data/database/.gitkeep`、`data/exports/.gitkeep`、`data/imports/.gitkeep` 这类占位文件；真实数据文件不进入 Git。
- 当前尚未进入 Figma 原型设计文档阶段，也尚未进入 image2 图片素材说明文档阶段。
- 建议下一阶段在用户确认后进入 Figma 原型设计文档 / image2 图片素材说明文档准备，但进入前仍需先确认：是否基于当前 V1 风格整理、是否只做文档不改 UI、是否需要脱敏截图、是否允许使用真实导入后的页面状态作为参考。

### Image2 图标方向确认（2026-06-29）

- 用户认可 `design/image-assets/v1/image2-previews/avatar-set-image2-preview.png` 和 `design/image-assets/v1/image2-previews/category-set-image2-preview.png` 这两张 image2 预览图的风格方向。
- 当前头像组和分类图标组优先采用这两种 image2 风格；此前手写 SVG 图标仅保留为占位 / 实现参考，不作为最终推荐视觉。
- 暂不继续拆分或重生成单个图标；等后续确定图标尺寸和具体使用位置后，再按同一风格重新生成或拆分。
- 仍保持 V1 为唯一视觉参考：温和、清爽、生活化、浅色背景、绿色主色、圆角、轻量插画感。
### Image2 首批视觉素材收口（2026-06-29）

- image2 首批视觉素材方向已确认：头像组采用 `design/image-assets/v1/image2-previews/avatar-set-image2-preview.png` 的方向，分类图标组采用 `design/image-assets/v1/image2-previews/category-set-image2-preview.png` 的方向。
- 这两张图目前只是视觉风格参考，不是最终前端可直接使用的单个头像或单个分类图标文件。
- 本轮暂不拆分头像和分类图标，也不继续重新生成图片。
- 后续等 Figma 原型页面、实际显示尺寸和使用场景确认后，再按该风格生成最终单文件素材。

### Image2 V1 素材目录登记

- 用户确认 image2 生成素材目录为 `design/image-assets/v1/`。
- 当前目录包含 `avatars/`、`categories/`、`illustrations/`、`image2-previews/`。
- 已新增 `docs/IMAGE_ASSET_MANIFEST.md` 作为素材登记表，记录文件名、相对路径、所属类型、用途、是否可直接用于前端、是否可用于 Figma、是否仅作风格参考以及后续是否需要拆分或二次生成。
- Figma 交接规则已更新：Figma Agent 可以引用 `design/image-assets/v1/` 中的素材，但页面结构、组件系统和点击流仍应保持可编辑；`image2-previews/` 只作为风格参考，不作为最终单文件素材。
- `illustrations/` 可用于空状态、搜索无结果、导入成功、备份成功/失败等页面；`avatars/` 用于成员管理和创建人显示；`categories/` 用于分类页、分类筛选和记录卡片。
- 本阶段未移动或删除素材文件，未修改业务逻辑，未提交真实 Note Station 数据、数据库、备份、导出或附件运行数据。

### Figma 线程补充 image2 图标尺寸要求（2026-06-29）

- 后续最终生成家庭成员头像时，沿用 `design/image-assets/v1/image2-previews/avatar-set-image2-preview.png` 的视觉方向；每个独立头像源尺寸为 `512 x 512 px`，优先 PNG，路径为 `design/image-assets/v1/avatars/`。
- 后续最终生成默认分类图标时，沿用 `design/image-assets/v1/image2-previews/category-set-image2-preview.png` 的视觉方向；每个独立分类图标源尺寸为 `256 x 256 px`，优先透明背景 PNG，路径为 `design/image-assets/v1/categories/`。
- 当前两张 preview 只是 image2 视觉风格参考，不是最终前端可直接使用的单个头像或单个分类图标文件。
- 本轮只记录尺寸和后续规则，不拆分头像和分类图标，不重新生成图片，不修改业务代码。
- 后续等 Figma 原型页面、实际显示尺寸和使用位置确认后，再按该风格生成最终单文件素材；头像需在 `24 px` 可辨认并保留 `12%-16%` 圆形裁切安全边距，分类图标需在 `16-20 px` 可辨认且主体占画布约 `64%-72%`。
### Figma 原型前端对齐修正（2026-06-29）

- 本轮基于 Figma 原型线程同步和项目内 Figma 文档做小步前端对齐，不调用 Figma、不生成图片、不改数据库结构、不修改真实导入数据。
- 采用最终导航规则：首页、分类、搜索、设置为主导航页面并保留底部导航；新建、详情、导入 Note Station、成员管理为二级页面，使用顶部返回且不显示底部导航。
- 新增独立 `members` screen，可从设置页进入；页面展示当前成员、成员列表、头像、颜色、当前成员标记，以及改名、头像、颜色入口。当前只持久化切换当前成员，不实现复杂权限。
- 新建记录页新增当前成员展示和轻量成员 chip，保存时使用本次选择的成员；成员体系当前默认只展示“我、爱人”，并兼容旧数据库中的 dad/mom/history 显示映射。
- 搜索页新增来源筛选：全部、手动创建、Note Station 导入；记录卡片增加成员头像显示。
- 分类页和导入相关展示将 `uncategorized` 统一表达为 `未分类 / 待整理`。
- Note Station 导入页文案从“模拟上传 / 模拟完成”调整为真实流程表达：`.nsx` 识别、dry-run 预览、sandbox、正式导入前自动备份、导入摘要和失败项列表；浏览器页面仍不直接执行正式导入命令。
- 设置页新增成员管理入口，并将用户可见路径反馈收敛到 `data/...` 相对路径，避免完整本机路径让页面显得过于技术化。
- 已创建 `docs/FIGMA_ALIGNMENT_REPORT.md` 记录本轮采用规则、已对齐项、未对齐项和下一轮建议。
- 验证结果：`npm.cmd run check` 通过（正式库 111 条记录），`npm.cmd run test` 通过（13 项），`npm.cmd run build` 通过；Playwright Chromium 安装后完成 390px / 430px 自动检查，8 个页面均无页面级横向溢出，控制台无 warning/error。

### 默认家庭成员称呼调整（2026-06-29）

- 根据用户反馈，默认成员不再使用“老婆”或“老婆大人”等称呼，统一调整为“我”和“爱人”。
- “爱人”作为更温和、中性的默认 partner 称呼；用户后续仍可在成员管理中自定义改名为老婆、妻子、配偶或其他称呼。
- 前端默认成员、首页成员筛选、新建记录成员选择、搜索成员筛选、详情创建人显示均同步为“我 / 爱人”。
- `src/shared/defaults.js` 的初始化成员调整为 `self` / `partner`，seed notes 也改用这两个成员；旧数据库中的 `dad` / `mom` / `history` 仅作为兼容映射显示，不修改真实 Note Station 导入正文、附件或数据库运行数据。
- Figma 文档、默认头像素材说明、README、样例数据说明、PRD/Prototype/Data Model 中的默认成员说明已同步更新。

### Image2 默认成员头像需求收敛（2026-06-29）

- 后续首批家庭成员默认头像只保留两个：`avatar-self` 对应“我”，`avatar-partner` 对应“爱人”。
- “爱人”头像应保持中性、温和，可代表配偶 / 伴侣；不要写死性别、爸爸 / 妈妈、老婆等身份文字。
- 孩子、父母、老人 / 岳父母、宠物、其他头像只作为未来可选扩展，不作为本轮首批必生成素材。
- 分类图标仍保留 11 个：家庭事务、房屋 / 设备、维修 / 售后、购物 / 消费、证件 / 账号、孩子 / 教育、老人 / 健康、宠物、工作 / 杂事、临时记录、未分类 / 待整理。
### Image2 首批缺失素材补齐（2026-06-29）

- 已按 Figma 尺寸补齐首批最终单文件 PNG：`avatar-self.png`、`avatar-partner.png`、11 个 `category-*.png`、`import-review-needed.png`。
- `avatar-partner.png` 已根据用户反馈替换为更年轻、有活力的小女生 / 爱人形象，避免显老气。
- 头像源尺寸为 `512 x 512 px`；分类图标源尺寸为 `256 x 256 px`；导入待处理插画为 `1200 x 900 px`。
- 当前首批必需视觉素材已无缺失；后续只需根据前端实际加载策略生成压缩/runtime 版本，不要再扩大默认成员头像范围。
### 首批视觉素材前端接入（2026-06-29）

- 已将视觉素材线程提交 `50357b9 Add first batch image assets` 推送到 `origin/main`，推送前确认 Git 只跟踪 `data/` 下 `.gitkeep` 占位文件，未跟踪真实 `.nsx`、数据库、备份、导出、附件或日志。
- 新增 `src/client/assetMap.js`，集中映射首批 PNG 素材：`avatar-self.png`、`avatar-partner.png`、11 个 `category-*.png`，以及空状态、导入、备份相关插画。
- 前端页面开始接入真实素材：成员筛选、新建记录当前成员、成员管理、设置页当前成员使用头像 PNG；分类页、记录卡片、详情页使用分类 PNG；首页/搜索/分类空状态、导入页、备份状态使用 illustrations PNG。
- 默认成员仍只内置“我”和“爱人”；其他成员头像不作为默认首批展示。真实 Note Station 导入内容、数据库和附件未修改。
- 本轮验证：`npm.cmd run check` 通过（正式库 111 条记录），`npm.cmd run test` 通过（13 项），`npm.cmd run build` 通过。构建产物显示 1200x900 插画体积约 1.1MB-1.35MB，后续建议单独生成压缩/runtime 版本。

### Image2 runtime 小图生成（2026-06-29）

- 已基于现有首批 source 素材生成 runtime 小图，未覆盖源图：`design/image-assets/v1/runtime/avatars/`、`runtime/categories/`、`runtime/illustrations/`、`runtime/pwa/`。
- 头像 runtime：`avatar-self-128.webp`、`avatar-partner-128.webp`，均为 `128 x 128`，约 `1.7-2.1 KB`。
- 分类 runtime：11 个 `category-*-96.webp`，均为 `96 x 96`，约 `0.7-1.2 KB`。
- 插画 runtime：6 个 `*-640.webp`，均为 `640 x 480`，约 `6.2-9.2 KB`。
- PWA runtime：`app-icon-512.png`、`app-icon-192.png`、`app-icon-maskable-512.png`、`favicon-32.png`、`favicon-16.png`；512 图标约 `84.4 KB`，maskable 约 `65.7 KB`，192 约 `14.0 KB`。
- 建议主开发线程前端接入时优先切换到 runtime 路径，source 原图继续供 Figma 和后续再生成使用。

### Runtime 图片前端切换（2026-06-29）

- 已接收视觉素材线程提交 `99cf6de Add runtime image asset variants`，新增 `design/image-assets/v1/runtime/` 下头像、分类、插画和 PWA 小图。
- 前端 `src/client/assetMap.js` 已从 source PNG 切换为 runtime WebP：头像使用 `128x128`，分类图标使用 `96x96`，空状态 / 导入 / 备份插画使用 `640x480`。
- PWA 图标已从 `design/image-assets/v1/runtime/pwa/` 复制到 `public/icons/`，`public/manifest.webmanifest` 改用 `app-icon-192.png`、`app-icon-512.png`、`app-icon-maskable-512.png`，`index.html` 改用 PNG favicon 和 apple-touch-icon。
- source 原图继续保留给 Figma 和后续再生成使用；`image2-previews/` 仍仅作为风格参考。
- 默认成员仍只内置“我 / 爱人”，本轮未修改真实 Note Station 导入数据、数据库、备份、导出或附件运行数据。

### 阶段 1：runtime 素材移动端视觉验收（2026-06-29）

- 已完成 runtime 素材接入后的 390px / 430px 移动端视觉验收，覆盖首页、详情、新建、搜索、分类、设置、导入 Note Station、成员管理 8 个 screen。
- 初次审计发现真实记录里长 URL 标题会在首页记录卡片中横向溢出；这是由连续长字符串不换行导致，非数据问题。
- 已做最小 UI 修复：记录卡片标题和详情页标题增加 `overflow-wrap: anywhere`，保留真实标题内容，不截断或修改数据。
- 复测 16 个页面宽度组合全部通过：底部导航规则正确、无旧默认成员称呼残留、无页面级横向溢出，runtime 图片加载正常。
- 本轮未新增成员功能，默认成员仍只保留“我 / 爱人”；未修改真实 Note Station 导入数据、数据库、备份、导出或附件。

### 阶段 2：MVP 日常使用体验补齐（2026-06-29）

- 已做一轮真实试用前的轻量文案和入口收口，不新增功能、不改数据库。
- 新建记录在家庭记录服务不可用时不再提示“模拟保存”或最终显示“已保存到 NAS”，改为临时页面状态，避免用户误以为已持久化。
- 附件入口从“模拟附件”调整为“附件占位”；设置页将“模拟离线 / 模拟备份”改为“测试离线 / 备份完成”。
- 设置页移除灰显的 Markdown 导出入口，MVP 只展示真实可用的 JSON 导出。
- Playwright 复查 390px / 430px x 8 screens 通过，失败数 0；默认成员仍只展示“我 / 爱人”。

### 阶段 3：成员体系 MVP 收口（2026-06-29）

- 当前默认成员体系进一步收口为仅“我 / 爱人”两个成员；本阶段不新增真实成员功能。
- 成员管理页仍可切换当前记录人，但改名、头像、颜色按钮改为禁用状态，明确属于后续能力，避免误导用户以为当前可编辑。
- 设置页和用户手册同步说明：当前版本先不做新增成员、改名、头像或颜色编辑。
- 分类体系中的“孩子 / 教育、老人 / 健康、宠物”等仍属于分类，不是默认成员，不需要移除。

### 阶段 4：Note Station 导入后整理体验（2026-06-29）

- 已做导入后查看与整理体验的小步收口，不修改真实 Note Station 导入数据、数据库结构或附件文件。
- 详情页对 `notestation_import` 记录新增“Note Station 来源信息”区域，展示原始分类和原始路径；字段缺失时显示温和占位，不暴露空值。
- 分类页在 `未分类 / 待整理` 卡片上增加导入记录待整理数量提示，帮助用户知道正式导入后的记录集中在哪里。
- Notes API 增加 `source` 筛选参数，搜索页已有的来源筛选和自动化测试可以与后端能力保持一致。
- 新增 API 测试覆盖 `source=notestation_import`；本阶段仍不新增分类批量整理、成员新增、权限或数据库结构变更。
- Playwright 复查 390px / 430px x 8 screens 通过，失败数 0；`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 均已通过。


### 阶段 5：PWA / NAS 部署收口（2026-06-29）

- 已将生产服务启动目录创建逻辑收敛到数据库层的 `NOTE_DATA_DIR` / `NOTE_DB_PATH` 规则，避免容器使用 `/data` 时额外在工作目录生成一套空 `data/...`。
- `.dockerignore` 同步增强，忽略 `data/`、`*.nsx`、数据库、备份、导出、附件、日志和临时 `output/`，降低 Docker 构建上下文泄露真实运行数据的风险。
- README、NAS 部署说明、DEV_HANDOVER、NEXT_STEPS 已同步到当前事实：PWA runtime 图标准备完成，真实 `.nsx` 已完成 dry-run / sandbox / 正式导入，当前重点转为 NAS 实机试用和导入后人工整理。
- 当前仍不接真实 NAS 地址、不做外网访问、不新增成员、不实现登录权限或真实附件上传。


### 阶段 6：自动化 QA 回归补强（2026-06-29）

- 在现有 Node 内置测试体系中补充回归护栏，不引入新测试框架或大型依赖。
- MVP API 测试新增 `NOTE_DATA_DIR` 路径断言，确认测试 / 容器 / NAS 部署时数据目录会落到指定根目录，而不是误写工作目录。
- 新增 `tests/pwa-config.test.js`，覆盖 PWA manifest、runtime 图标文件、移动端安装 meta，以及 `.dockerignore` 对 `data/`、`*.nsx`、数据库、备份、导出、附件和日志的忽略规则。
- `npm.cmd run test` 当前为 16 项测试通过，覆盖 MVP API、Note Station NSX dry-run、正式导入保护、PWA/NAS 配置安全。

### 阶段 7：最终交接包（2026-06-29）

- 已更新 `docs/RUN_RESULT_HANDOFF.md`，记录移动端 MVP 进入家庭 NAS 稳定试用阶段的当前分支、阶段提交、真实可用功能、仍模拟项、启动方式、测试方式、数据目录、NAS 部署准备和人工验收流程。
- 当前阶段目标已收束：runtime 素材接入、移动端视觉验收、MVP 文案和成员体系收口、Note Station 导入后整理体验、PWA/NAS 部署准备、自动化 QA 回归均已完成小步提交并推送。
- 仍需用户在真实手机和 NAS / Docker 环境做人工验收；当前机器无 `docker` 命令，无法完成 Docker 实机启动验证。

### V1 字体和布局对齐（2026-06-29）

- 本轮以 `design/home-records-prototype/` 下 7 张 V1 PNG 为唯一视觉参考，不调用 Product Design，不生成新图片，不修改业务逻辑和数据库结构。
- 已提取 V1 的主要规律：页面标题克制、卡片标题/正文/元信息层级稳定、卡片阴影更轻、分类页两列卡片、设置页先强调数据备份。
- 前端已做第一轮 V1 对齐：全局字体栈更贴近系统中文字体，卡片圆角和阴影减轻，页面标题统一到 36px，记录卡片/详情正文/导入页字号降噪，新建记录类型改为四列卡片，分类页改为两列卡片，设置页成员入口移到后段。
- 保留当前功能：默认成员仍为“我 / 爱人”，成员和分类筛选仍可用，Note Station 导入安全流程和来源信息仍保留。
- Playwright 390px / 430px x 8 screens 巡检通过，失败数 0；DOM 指标显示页面无横向溢出，常规分类名已单行显示。

### V1 首页筛选节奏二次对齐（2026-06-29）

- 根据 V1 首页参考图，首页首屏进一步收敛为搜索框 + 一行快捷筛选 + 今日卡 + 最新记录的节奏。
- 成员筛选和分类筛选没有删除，而是收进 `更多筛选` 面板；默认页面更清爽，点击 `更多` 后仍可筛选成员和分类。
- 如果当前已经选择成员或分类筛选，高级筛选面板会保持显示，避免用户看不见生效条件。
- 本轮仍不新增成员、不改数据库、不触碰真实 Note Station 导入数据；默认成员继续只有“我 / 爱人”。
- `npm.cmd run build` 通过；Playwright 390px / 430px x 8 screens 巡检通过，失败数 0；DOM 指标确认首页 390px 下无页面级横向溢出。

### V1 首页筛选节奏最终验证（2026-06-29）

- 提交前重新运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`，全部通过。
- 当前正式库健康检查仍为 111 条记录；自动化测试 16 项通过。
- 本轮只提交前端首页筛选节奏和文档记录，不提交 `data/`、数据库、备份、导出、附件、`.nsx` 或 Playwright 临时截图。

### V1 导航和筛选细节二次对齐（2026-06-29）

- 底部导航从全宽底栏改为内浮圆角 dock，更接近 V1 分类页和设置页底部导航的手机 App 感。
- 搜索页默认展示分类、标签、时间范围三组筛选；成员和来源筛选保留功能，但收进 `成员 / 来源` 高级筛选行，减少首屏技术感。
- 新建记录页的当前成员区域从完整卡片收敛为轻量成员条，继续只展示默认成员“我 / 爱人”，不新增成员功能。
- 本轮未修改业务逻辑、数据库结构、真实 Note Station 导入数据、附件、备份或导出文件。
- `npm.cmd run build` 通过；Playwright 390px / 430px x 8 screens 巡检通过，失败数 0；DOM 指标确认 390px 下无页面级横向溢出。

### V1 导航和筛选细节最终验证（2026-06-29）

- 提交前重新运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`，全部通过。
- 正式库健康检查仍为 111 条记录；自动化测试 16 项通过。
- 本轮只提交前端视觉收敛和文档记录，不提交 `data/`、数据库、备份、导出、附件、`.nsx` 或 Playwright 临时截图。

### V1 浮动按钮和二级页底部操作栏对齐（2026-06-29）

- 分类页浮动新建按钮新增 `记一件事` 小字；首页继续保留纯圆形加号，分别贴近 V1 分类页和首页参考图。
- 新建记录、详情页、导入 Note Station 页底部操作区统一改为内浮圆角操作栏，减少硬贴屏幕底部的网页感。
- 操作按钮、保存、分享、确认导入等功能保持不变；本轮只调整视觉容器。
- 本轮未修改业务逻辑、数据库结构、真实导入数据、附件、备份或导出文件。
- `npm.cmd run build` 通过；Playwright 390px / 430px x 8 screens 巡检通过，失败数 0；DOM 指标确认 390px 下无页面级横向溢出。

### V1 浮动按钮和底部操作栏最终验证（2026-06-29）

- 提交前重新运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`，全部通过。
- 正式库健康检查仍为 111 条记录；自动化测试 16 项通过。
- 本轮只提交前端视觉收敛和文档记录，不提交 `data/`、数据库、备份、导出、附件、`.nsx` 或 Playwright 临时截图。

### V1 记录卡片和详情信息层级对齐（2026-06-29）

- 记录卡片摘要限制为两行，时间线更接近 V1 的标题、短摘要、标签和底部元信息节奏；详情页仍保留完整正文。
- 详情页元信息主列表收敛为创建时间、更新时间和来源三行；创建人和保存状态保留为轻量 chip，信息不丢失但减少表格感。
- 详情页内容区图标从标签图标改成 list 风格，贴近 V1 详情页的内容区表达。
- 本轮未修改业务逻辑、数据库结构、真实 Note Station 导入数据、附件、备份或导出文件。
- `npm.cmd run build` 通过；Playwright 390px / 430px x 8 screens 巡检通过，失败数 0；DOM 指标确认 390px 下无页面级横向溢出。

### V1 记录卡片和详情层级最终验证（2026-06-29）

- 提交前重新运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`，全部通过。
- 正式库健康检查仍为 111 条记录；自动化测试 16 项通过。
- 本轮只提交前端视觉收敛和文档记录，不提交 `data/`、数据库、备份、导出、附件、`.nsx` 或 Playwright 临时截图。

### V1 设置和导入页文案收敛（2026-06-29）

- 导入 Note Station 页步骤文案收敛为 `选择文件 / 预览记录 / 确认导入 / 导入完成`，减少 `dry-run`、`sandbox` 等实现词在主界面的暴露。
- 导入页仍保留真实安全流程：先预览、导入前自动备份、现有记录不会覆盖、失败项保留。
- 设置页备份区文案改为更面向家庭用户的表达，NAS 在线/离线测试从大按钮收敛为轻量状态测试行。
- 本轮未修改导入、备份、导出 API 行为，未修改数据库结构、真实导入数据、附件、备份或导出文件。
- `npm.cmd run build` 通过；Playwright 390px / 430px x 8 screens 巡检通过，失败数 0；DOM 指标确认 390px 下无页面级横向溢出。

### V1 设置和导入页文案最终验证（2026-06-29）

- 提交前重新运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`，全部通过。
- 正式库健康检查仍为 111 条记录；自动化测试 16 项通过。
- 本轮只提交前端文案/视觉收敛和文档记录，不提交 `data/`、数据库、备份、导出、附件、`.nsx` 或 Playwright 临时截图。

### V1 最终视觉审计（2026-06-29）

- 新增 `docs/V1_VISUAL_FINAL_AUDIT.md`，逐页对照 `design/home-records-prototype/` 下 7 张 V1 PNG，记录当前实现的对齐程度、保留差异和理由。
- 设置页行尾普通 `>` 文本替换为 `ChevronRight` 图标，作为最后一处低风险视觉抛光。
- 当前首页、新建、详情、搜索、分类、导入、设置已经分别完成 V1 字体/密度/筛选/导航/浮动操作/信息层级/文案收敛。
- 阶段性结论：在保持当前功能的前提下，移动端 MVP 已达到与 V1 差不太多的标准；后续建议只根据真实手机验收反馈做微调。
- 最终验证：Playwright 390px / 430px x 8 screens 通过，失败数 0；`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 全部通过。


### V1 主页面标题字号修正（2026-06-29）

- 用户指出每页左上角标题仍明显偏大；复核 V1 PNG 后确认此前统一 36px 过于机械。
- 当前主页面标题已调整为：首页 `家事记` 32px，搜索 32px，分类 30px，设置 30px；主页面副标题统一 15px。
- 该调整只影响视觉字号，不修改业务逻辑、数据库、导入、备份、导出或成员体系。
- 验证结果：`npm.cmd run build` 通过；DOM 指标确认 390px 下页面宽度正常、标题字号为 32/30px、卡片圆角 20px；Playwright 390px / 430px x 8 screens 通过，失败数 0。

### V1 字体最终试用收口与项目记忆同步（2026-06-30）

- 用户基于本地视觉试用继续反馈 V1 字体尺度，最终将主页面左上角标题统一收敛为 `25px`，首页、搜索、分类、设置保持更克制的标题尺度。
- 记录相关标题按用户确认统一收敛为 `16px`：记录卡片标题、详情页记录标题、关联记录标题；该调整只改视觉字号，不修改业务逻辑、数据结构、导入、备份、导出、成员体系或真实 Note Station 数据。
- 最新功能提交为 `6a0d046 Tune V1 typography scale`，已推送到 GitHub；提交前运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`，全部通过，其中自动化测试为 16 项通过。
- Git 维护：用户允许后已执行 `git prune`，loose objects 从 `12492 / 188.70 MiB` 清理到 `0 / 0 bytes`；未产生代码改动或提交。
- Skill 状态：已从 `multica-ai/andrej-karpathy-skills` 安装并读取 `karpathy-guidelines`，后续编码/评审按“先想清楚、保持简单、外科手术式修改、可验证目标”执行；新安装 skill 通常需重启 Codex 后才会出现在可用技能列表。
- 当前 Git 状态：`main` 与 `origin/main` 对齐，工作区干净；本轮记忆同步前确认 `docs/PROJECT_MEMORY.md` 文件本身与 GitHub 一致，但内容缺少最新字体、Git 维护和 skill 安装记录，因此补充本段。
- 下一步建议仍是先做真实手机和 NAS / Docker 实机验收，再根据真实试用反馈做小步 UI 微调或进入附件上传、简单访问口令等 P1 项。

### 真实手机与 NAS / Docker 试运行验收阶段（2026-06-30）

- 当前进入“真实手机 + NAS/Docker 试运行验收阶段”，本轮不新增大功能、不重做 UI、不调用 Product Design、不生成新图片、不修改真实 Note Station 导入数据。
- 同步检查：`git pull --ff-only` 显示已最新；本轮开始时 `main` 与 `origin/main` 一致，基线提交为 `529c585 Sync project memory`。
- 安全检查：Git 仅跟踪 `data/attachments/.gitkeep`、`data/backups/.gitkeep`、`data/database/.gitkeep`、`data/exports/.gitkeep`、`data/imports/.gitkeep`；`.nsx`、正式数据库、sandbox DB、备份、导出、附件、导入目录和日志均未被跟踪。
- 基础验收：`npm.cmd run check` 通过，正式库 `categoryCount=11`、`noteCount=111`；`npm.cmd run test` 通过，16 项测试全部通过；`npm.cmd run build` 通过。
- 本机生产模式：使用 `PORT=3410 npm.cmd run server` 验证 Express 可同端口提供 API 和 `dist/` 前端，`/api/health`、`/api/app-data`、首页和常见 SPA 路径均返回 200；验证后已停止临时 Node 服务。
- Docker 验收：当前电脑 Docker daemon 可用；`docker compose build` 通过，`docker compose up -d` 通过，容器 `note` 为 healthy；`http://localhost:3300/api/health` 返回 `dbPath=/data/database/app.db`，确认 `NOTE_DATA_DIR=/data` 生效。
- 新增试运行文档：`docs/MOBILE_TRIAL_CHECKLIST.md`、`docs/BACKUP_RESTORE_DRILL.md`、`docs/TRIAL_RUN_READINESS_REPORT.md`。
- 下一步建议：进入真实家庭局域网试运行，优先由用户和家人用安卓手机验收首页、新建、刷新持久化、搜索 / 分类 / 成员筛选、导入记录详情、备份、JSON 导出和 PWA 添加到桌面；试运行后再决定附件上传、简单访问口令、成员编辑或安卓封装。

### P1 功能开发顺序与编辑记录闭环（2026-06-30）

- 用户明确：安卓原生 App 封装排到最后；除安卓封装外，后续功能由主控 Agent 自行排序并依次推进。
- 当前优先级顺序：1 编辑已有记录，2 删除 / 归档，3 真实附件上传，4 简单访问口令 / PIN，5 导入后批量整理未分类，6 成员改名 / 头像 / 颜色，7 定时备份，8 Markdown 导出，9 NAS 真实状态探测，10 安卓原生封装最后。
- 本轮先实现第 1 项“编辑已有记录”：详情页右上角“编辑”进入复用的新建记录表单，可修改标题、正文、记录类型 / 分类、标签和当前成员。
- 后端新增 `PATCH /api/notes/:id`，按 TDD 先补失败测试，再实现最小更新逻辑；更新时替换标签关系，保留附件元数据和 Note Station 原始来源字段，不修改真实导入原文、附件文件或数据库结构。
- 前端编辑模式保留 V1 风格，不重做 UI；编辑已有记录时附件区提示“附件暂不在编辑里修改”，避免误导用户以为当前已支持附件上传 / 删除。
- 对不在记录类型卡片里的原分类（例如未分类、房屋 / 设备），编辑页直接保存会保留原分类，只有用户主动切换记录类型时才改分类。
- 最终验证：`npm.cmd run check` 通过；`npm.cmd run test` 通过，17 项测试全部通过；`npm.cmd run build` 通过。正式运行数据仍只存在于被 Git 忽略的 `data/` 中。

### 删除 / 归档记录闭环（2026-06-30）

- P1 第 2 项“删除 / 归档记录”已完成本地开发：详情页底部“更多”可展开归档和删除操作。
- 后端新增 `POST /api/notes/:id/archive` 和 `DELETE /api/notes/:id`；归档使用已有 `is_archived` 字段，删除使用已有 `is_deleted` 字段，均为软操作，不删除附件文件、不改数据库结构。
- 普通记录列表、搜索和 `/api/app-data` 默认排除已归档和已删除记录；`includeArchived=true` 可用于 API 验证归档记录。
- 分类统计同步排除已归档记录，避免归档后首页隐藏但分类数量仍计入。
- 自动化测试已覆盖：归档后普通列表隐藏、归档查询可见、分类计数减少、软删除后归档查询也不可见。

### 真实附件上传闭环（2026-06-30）

- P1 第 3 项“真实附件上传”已完成本地开发：新建记录页附件区域可以选择真实照片或文件，保存时前端读取文件并随新记录提交。
- 后端 `POST /api/notes` 支持带 `contentBase64` 的附件 payload：附件文件写入 `data/attachments/<noteId>/`，数据库只保存附件元数据和相对路径。
- 未引入 multipart 或大型依赖；当前采用 JSON base64 上传，Express 请求体上限调整为 `12mb`，适合家庭试运行先传小照片、截图、票据文件。
- 编辑记录仍不支持修改附件，页面继续明确提示“附件暂不在编辑里修改”，附件删除后续再做。
- 自动化测试已覆盖：附件文件真实落盘到临时 `NOTE_DATA_DIR/attachments`；较大手机照片级 payload 可通过；数据库返回附件元数据和相对路径。

### 简单访问口令 / PIN 闭环（2026-06-30）

- P1 第 4 项“简单访问口令 / PIN”已完成本地开发：默认关闭；设置 `NOTE_ACCESS_PIN` 后，前端首次打开显示轻量锁屏。
- 后端新增 `GET /api/access/status` 和 `POST /api/access/unlock`，正确口令后写入 HttpOnly cookie；未解锁访问普通 API 会返回 401。
- 该功能不是账号系统，不包含权限分级、不接真实账号密码、不写入真实 token；只用于家庭局域网试运行时的轻量入口保护。
- `docker-compose.yml` 仅加入 `NOTE_ACCESS_PIN: "${NOTE_ACCESS_PIN:-}"` 占位，不提交真实口令。
- 自动化测试已覆盖：开启 `NOTE_ACCESS_PIN` 后 app API 被拦截、错误口令失败、正确口令后可读取 app data。
