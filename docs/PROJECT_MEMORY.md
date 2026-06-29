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
