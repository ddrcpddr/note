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

- 用户已将真实 `.nsx` 放入 `data/imports/notestation/`，当前样例文件为 `example-notestation-export.nsx`，约 21.38 MiB。
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

### 导入后批量整理未分类闭环（2026-06-30）

- P1 第 5 项“导入后批量整理未分类记录”已完成本地开发：分类页新增“导入记录待整理”轻量面板，可将 Note Station 导入且仍处于 `uncategorized` 的记录批量整理到常用分类。
- 后端新增 `POST /api/notes/bulk-categorize`，只会更新 `source_type = notestation_import` 且 `category_id = uncategorized` 的记录；即使请求中混入手动未分类记录，也不会误改。
- 批量整理只更新 `notes.category_id` 和 `updated_at`，保留 Note Station 原始路径、原始分类 / 笔记本路径、来源字段、正文和附件元数据。
- 前端保持 V1 风格，不做后台表格；分类页用家庭化 chip 表达“整理到 家庭事务 / 维修 / 购物 / 账号 / 临时记录”。
- 自动化测试已覆盖：批量整理导入未分类记录、手动未分类记录不被误改、整理后可通过目标分类和来源筛选查到。

### 默认成员资料编辑闭环（2026-06-30）

- P1 第 6 项“成员改名、头像和颜色编辑”已完成本地开发：成员管理页仍只保留默认“我 / 爱人”，不开放新增成员。
- 后端新增 `PATCH /api/members/:id`，支持更新现有成员的 `name`、`avatar` 和 `color`；`members.color` 为小型增量字段迁移，不引入权限系统或账号体系。
- 前端成员管理页将原禁用按钮改为可编辑面板，支持改名、头像字和颜色 swatch；保存后同步当前成员列表和已有记录卡片中的成员显示。
- 默认成员仍为“我 / 爱人”，不写回“老婆 / 妈妈 / 爸爸”等固定称呼；用户可自行改成想要的称呼。
- 自动化测试已覆盖：更新“爱人”的显示名、头像字和颜色后，成员列表、app-data 和新建记录返回的成员名同步更新。

### 定时自动备份闭环（2026-06-30）

- P1 第 7 项“定时自动备份”已完成本地开发：手动备份逻辑抽取为 `createDatabaseBackup()`，服务启动时可按环境变量启用定时器。
- 默认不启用自动备份；设置 `NOTE_AUTO_BACKUP_INTERVAL_HOURS` 后按小时级间隔把 `app.db` 复制到 `data/backups/`。测试环境可用 `NOTE_AUTO_BACKUP_INTERVAL_MS`。
- 自动备份失败会写入 `backups` 表的 failed 状态和错误信息；不会提交任何备份文件或数据库文件。
- 自动化测试已覆盖：启用 `NOTE_AUTO_BACKUP_INTERVAL_MS` 后，服务会生成备份文件并可通过 `/api/storage/status` 看到 completed 最新备份。

### Markdown 导出闭环（2026-06-30）

- P1 第 8 项“Markdown 导出”已完成本地开发：设置页现在可以导出 JSON 和 Markdown。
- 后端新增 `POST /api/storage/export-markdown`，导出全量 `listNotes({ limit: "all" })` 为单个 Markdown 文件，落到 `data/exports/`。
- Markdown 内容包含记录标题、ID、分类、成员、来源、创建 / 更新时间、标签、附件清单、原始路径和正文；不提交导出文件。
- 自动化测试已覆盖：Markdown 文件写入导出目录，包含导出标题、目标记录标题、正文和记录 ID。

### NAS / 存储目录读写探测闭环（2026-06-30）

- P1 第 9 项“NAS 真实状态探测”收口为不接真实 NAS 账号、不写死 NAS 地址的“数据目录读写探测”：验证当前 `NOTE_DATA_DIR` 下关键目录是否可写。
- 后端新增 `POST /api/storage/probe`，会在 database、attachments、backups、exports 目录写入临时探测文件、读取确认后立即删除；任一目录失败则返回 503 和对应错误。
- 设置页新增“检查当前数据目录”入口，用于家庭 NAS / Docker 试运行前确认挂载目录权限；它不是外网连接检测，也不会保存真实 NAS 地址、账号、密码或 token。
- 自动化测试覆盖：在临时 `NOTE_DATA_DIR` 下调用探测接口，确认四个目录均可写且返回的数据目录与测试目录一致。
- 本轮验证：`npm.cmd run check` 通过，正式库记录数 112；`npm.cmd run test` 通过，26 项测试全部通过；`npm.cmd run build` 通过。
- 完成本阶段后，除安卓原生封装外，当前 P1 功能顺序中的开发项已收口；下一步应进入真实家庭局域网人工试运行，Android 原生 App 继续排最后。

### Android 原生封装前置评估（2026-06-30）

- 当前已进入“安卓原生 App 封装排最后”的最后阶段前置评估；本轮不安装 Android / Capacitor / TWA 依赖，不生成签名文件，不写入真实 NAS 地址。
- 新增 `docs/ANDROID_WRAPPER_PLAN.md`，明确当前项目的数据事实：正式数据保存在 NAS/Express/SQLite 服务端，Android 首选应作为 Web/PWA/WebView 入口，而不是把数据库迁移到手机本地。
- 当前推荐顺序：先用真实 Android 手机完成 PWA / 添加到桌面试运行；若稳定，再由用户确认包名、封装路线、最低 Android 版本、NAS 地址配置策略和签名方式后进入 WebView / TWA 工程。
- TWA 依赖公开 HTTPS 域名与 Digital Asset Links，不适合当前家庭局域网 HTTP 作为首选；真正原生 Android + 本地数据库 / 同步属于大架构变更，暂不建议。
- 仍遵守安全边界：不提交真实 NAS 地址、账号、密码、token、签名密钥、数据库、备份、导出、附件、.nsx 或真实导入内容。

### Android 封装决策清单（2026-06-30）

- 新增 `docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md`，把 Android 工程启动前必须确认的包名、App 名称、封装路线、最低 Android 版本、NAS 地址策略、签名方式和依赖授权整理为可执行清单。
- 推荐路线继续保持为 Android WebView 壳：手机端只作为家庭 NAS Web 应用入口，正式数据仍保存在 NAS / Express / SQLite 服务端。
- 当前暂停点明确为：用户确认决策清单之前，不创建 Android 工程、不安装 Android 依赖、不生成 keystore、不写真实 NAS 地址。

### 试运行报告刷新（2026-06-30）

- 刷新 `docs/TRIAL_RUN_READINESS_REPORT.md` 到当前真实状态：最新提交 `4aa5cd8`、本地领先远程 11 个提交、Docker 容器 `note` healthy、正式库记录数 112、自动化测试 26 项通过。
- 同步 `docs/RUN_RESULT_HANDOFF.md`，追加当前 Docker / Android 决策交接补充，避免后续线程误读早期“16 项测试、附件上传/PIN 未实现”等历史状态。
- 当前 Docker 测试地址为 `http://127.0.0.1:3300/`；手机试运行使用同局域网地址，不把真实 IP 或 NAS 地址写入仓库。

### Docker 试运行发现数据库完整性问题（2026-06-30）

- Docker HTTP 烟测发现真实问题：SPA 页面路径返回 200，但业务 API `/api/app-data`、`/api/notes?limit=3`、`/api/categories` 返回 500。
- Docker 日志显示 `database disk image is malformed`；主机和容器对 `data/database/app.db` 执行 `PRAGMA integrity_check` 均失败，说明正式 SQLite 文件已有损坏。
- 扫描 `data/backups/` 后，最近健康备份为 `app-2026-06-29T05-40-32-597Z.db`，111 条记录；最新 `app-2026-06-30T04-06-15-239Z.db` 同样损坏，不建议恢复。
- 已创建 `docs/DATABASE_INTEGRITY_RECOVERY.md` 记录诊断、恢复候选和安全步骤；已停止 Docker 容器，未自动替换正式库，等待用户确认。
### SQLite 完整性检查加固（2026-06-30）

- Docker 试运行暴露出 `npm.cmd run check` 旧逻辑只读 `COUNT(*)`，在 SQLite 局部损坏时仍可能返回 `ok: true`。
- 已加固 `src/server/scripts/check.js`：如果数据库文件已存在，先用只读连接执行 `PRAGMA integrity_check`，确认通过后才初始化 / 迁移 / 读取统计；输出新增 `integrityCheck: "ok"`。
- 新增 `tests/check-script.test.js`，用临时 `NOTE_DATA_DIR` 验证健康数据库下 check 通过且包含完整性结果。
- 当前正式 `data/database/app.db` 仍然损坏，因此新的 `npm.cmd run check` 会正确失败；这不是代码回归，而是等待用户确认恢复最近健康备份。
- 本轮验证：`node --test tests/check-script.test.js` 通过；`npm.cmd run test` 通过，27 项；`npm.cmd run build` 通过；临时健康数据目录下 `npm.cmd run check` 通过。
### 数据库确认门恢复工具（2026-06-30）

- 新增 `src/server/scripts/restore-database-backup.js` 和 `npm.cmd run restore-db`，用于从健康备份恢复 `data/database/app.db`。
- 默认命令只做 dry-run：验证备份文件存在且 `PRAGMA integrity_check` 为 `ok`，输出目标路径和备份大小，不替换正式数据库。
- 只有追加 `--confirm` 才会复制当前正式库到 `data/backups/app-before-restore-<timestamp>.db`，再用选定健康备份替换正式库，并对恢复后的正式库再次执行完整性检查。
- 新增 `tests/database-restore.test.js` 覆盖 dry-run 不改库、confirm 会恢复并保留前库副本、坏备份会被拒绝。
- 已对真实候选备份 `data/backups/app-2026-06-29T05-40-32-597Z.db` 执行 dry-run，结果 `ok=true`、`restored=false`；未执行 `--confirm`，未替换正式库。
- 本轮验证：`npm.cmd run test` 通过 30 项；`npm.cmd run build` 通过；当前正式库下 `npm.cmd run check` 仍正确失败，等待用户确认恢复。

### Docker 临时试运行与 HTTP 烟测命令（2026-06-30）

- 用户要求先启动一个当前可测试的 Docker 实例，再继续后续验收工作。
- 已确认 `.dockerignore` 排除 `data/`、`.nsx`、数据库、备份、导出、附件和日志，Docker build 不会把真实运行数据打入镜像。
- 已构建当前工作区镜像 `note-trial:current`，容器内 `npm run build` 通过。
- 已用 Docker 命名卷 `note-trial-data` 启动临时容器 `note-trial`，端口映射 `3310:3300`，访问地址为 `http://127.0.0.1:3310/`。
- 临时容器不挂载项目正式 `data/`，因此不会读取或写入当前损坏的正式数据库，也不会碰真实 Note Station 导入数据。
- 新增 `src/server/scripts/http-smoke.js` 和 `npm.cmd run smoke`，用于对运行中的 Node / Docker 服务执行 HTTP 烟测：健康接口、app-data、列表、详情、搜索、分类筛选、成员筛选、分类 API、存储探测、手动备份、JSON 导出和前端 shell。
- 已新增 `tests/http-smoke.test.js`，使用临时 `NOTE_DATA_DIR` 启动独立服务验证烟测脚本和只读模式。
- 对 `http://127.0.0.1:3310` 执行 `npm.cmd run smoke -- --base-url http://127.0.0.1:3310` 通过；临时容器返回 2 个成员、11 个分类和测试记录，备份与 JSON 导出均可用。
- `node --test tests/http-smoke.test.js`、`npm.cmd run test`（32 项）和 `npm.cmd run build` 通过。
- `npm.cmd run check` 当前仍正确失败，原因是正式 `data/database/app.db` 的 SQLite `integrity_check` 不通过；尚未执行 `restore-db --confirm`，等待用户确认是否用最近健康备份恢复正式库。
## 正式数据库恢复完成（2026-06-30）

- 恢复前状态：`npm.cmd run check` 对 `data/database/app.db` 执行 SQLite `PRAGMA integrity_check` 失败，错误包含 `database disk image is malformed` 相关的 B-tree / page 损坏信息。
- 恢复前服务状态：已执行 `docker compose down`，并停止 `note-trial` 临时容器；未发现本地当前项目的 `node` / `npm` 服务进程占用数据库。
- Git 安全状态：恢复前工作区干净；`data/` 下正式数据库、备份、附件、导出、真实导入文件仍被 `.gitignore` 忽略，Git 只跟踪 `.gitkeep`。
- dry-run 命令：`npm.cmd run restore-db -- --backup data/backups/app-2026-06-29T05-40-32-597Z.db`，结果 `ok=true`、`dryRun=true`、`restored=false`。
- 确认恢复命令：`npm.cmd run restore-db -- --backup data/backups/app-2026-06-29T05-40-32-597Z.db --confirm`。
- 使用的健康备份：`data/backups/app-2026-06-29T05-40-32-597Z.db`，大小 `17526784` bytes。
- 损坏库副本：恢复工具已自动保存到 `data/backups/app-before-restore-2026-06-30T08-31-44-809Z.db`，该文件属于运行备份数据，不提交 Git。
- 恢复后 `npm.cmd run check` 通过，输出 `integrityCheck: "ok"`、`categoryCount: 11`、`noteCount: 111`。
- 记录数说明：此前损坏库记忆中曾出现 112 条；本次恢复到最近健康备份后为 111 条。额外 1 条位于损坏库中，不能直接信任，本轮没有从损坏库硬读或 salvage。
- 恢复后 `npm.cmd run test` 通过，32 项测试全部通过；`npm.cmd run build` 通过。
- Docker 真实 data 验证：`docker compose build` 通过，`docker compose up -d` 后容器 `note` 为 healthy，使用默认 `./data:/data` 挂载。
- 关键 API 验证：`/api/health`、`/api/app-data`、`/api/notes?limit=3`、`/api/categories` 均返回 200，不再返回 500。
- HTTP 烟测：`npm.cmd run smoke -- --base-url http://127.0.0.1:3300` 通过；app-data 返回 `notes: 111`，手动备份、JSON 导出和前端 shell 均通过。
- 当前风险：最近健康备份之后、损坏发生之前的 1 条记录未恢复；如确实需要找回，必须单独做只读 salvage 评估，并在用户确认后进行，不能直接从损坏库写回。
- 当前建议：可以继续进入真实手机 / NAS 试运行，但试运行前保留本次恢复用备份和 `app-before-restore` 损坏库副本，避免后续误删。
### Gate 2：真实手机局域网试运行准备（2026-06-30）

- 已将用户提供的持续开发工作计划保存到 `docs/CODEX_CONTINUOUS_DEVELOPMENT_PLAN.md`，作为后续 Lead Agent 的 Gate 流程参考。
- 当前 Gate 判断：Gate 0 正式数据库恢复已完成；Gate 1 Docker 真实 `data/` smoke 已通过；本轮进入 Gate 2，只做真实手机局域网试运行准备，不开发新功能。
- 已更新 `docs/MOBILE_TRIAL_CHECKLIST.md`，补充恢复后正式库前提、Docker 真实 `data/` 挂载、手机局域网访问、防火墙排查、Markdown 导出、小附件上传、PIN、存储目录探测、长链接和底部导航检查。
- 当前局域网 IP 仅在聊天回复中提示，不写入仓库，避免把真实地址固化到 Git。
- 下一步停止点：等待用户用 Android 手机访问 `http://<局域网IP>:3300/` 做真实试运行；在真实反馈前，不继续新增功能、Android 工程或视觉重做。
### Fix：标签编辑和导入页文案收口（2026-06-30）

- 用户在手机试运行中发现：编辑记录取消所有标签后，详情页仍强行显示 `待办`；编辑页 `+ 添加标签` 按钮无反应；Note Station 导入页初始文案把“导入”和“选择导出文件”混在一起，容易误解。
- 根因：前端保存记录时把空标签数组兜底成 `['待办']`；添加标签控件只是静态 `span`；导入页文案沿用 `.nsx 导出文件` 表达。
- 已修复：编辑已有记录时保留原始标签数组，保存时原样提交 `tags`，允许空数组；`+ 添加标签` 改为轻量输入，支持添加自定义标签；导入页初始文案统一为 `Note Station .nsx 文件`、`选择 .nsx 文件` 和 `预览导入记录`。
- 已补回归：`tests/mvp-api.test.js` 在编辑记录测试中覆盖 `PATCH tags: []`，确认详情读取为空标签且旧标签筛选不再命中。
- 已验证：`node --test tests/mvp-api.test.js` 通过 19 项；`npm.cmd run build` 通过；`npm.cmd run check` 通过，正式库 `integrityCheck=ok`、记录数 112；`npm.cmd run test` 通过 32 项；`docker compose build`、`docker compose up -d` 和 `npm.cmd run smoke -- --base-url http://127.0.0.1:3300` 通过。
- 当前 Docker `http://127.0.0.1:3300/` 已重建为修复后的版本，用户可在手机同局域网地址刷新后复测。

### Fix：首页“今天要记 / 快速记录”入口可点击（2026-06-30）

- 用户在真实手机试运行中反馈：首页“今天要记 / 快速记录”卡片点击后没有任何反应。
- 根因：`TodayCard` 是静态 `<section>`，没有 `onClick`；`HomeScreen` 没有接收新建记录 handler，也没有把入口传到 `TodayCard`。
- 已修复：App 在首页向 `HomeScreen` 传入 `() => navigate('new')`；`HomeScreen` 将 `onCreateNote` 传给 `TodayCard`；`TodayCard` 改为保持 V1 视觉样式的 `<button>`，点击后进入现有新记录页。
- 已新增 `tests/frontend-ui.test.js`，覆盖首页今天要记卡片必须连接到新建记录 screen，防止以后退回纯展示卡片。
- 已验证：`node --test tests/frontend-ui.test.js` 先红灯后转绿；`npm.cmd run build` 通过；`npm.cmd run check` 通过，正式库 `integrityCheck=ok`、记录数 113；`npm.cmd run test` 通过 33 项；`docker compose build`、`docker compose up -d` 和 `npm.cmd run smoke -- --base-url http://127.0.0.1:3300` 通过。
- 当前 Docker `http://127.0.0.1:3300/` 已重建为修复后的版本，用户可在手机同局域网地址刷新后复测。

### Gate 3：真实试运行反馈模板与日志（2026-06-30）

- 根据 `docs/CODEX_CONTINUOUS_DEVELOPMENT_PLAN.md` 的 Gate 3，新增 `docs/TRIAL_FEEDBACK_TEMPLATE.md` 和 `docs/TRIAL_FEEDBACK_LOG.md`。
- 反馈模板规定字段：日期、测试人、设备型号、Android 版本、浏览器、访问方式、页面、操作步骤、预期结果、实际结果、截图路径、是否影响数据、严重程度 P0/P1/P2/P3、是否已复现、是否已修复、对应 commit。
- 反馈日志已登记两条真实手机试运行反馈：
  - `TF-20260630-001`：标签清空 / 添加标签 / 导入页文案，已由 `0a52001` 修复。
  - `TF-20260630-002`：首页“今天要记 / 快速记录”点击无反应，已由 `98ad2c9` 修复。
- 本阶段只做文档和流程收口，不新增功能、不重做 UI、不调用 Product Design、不生成图片、不创建 Android 工程。
- 后续真实手机反馈应先写入 `docs/TRIAL_FEEDBACK_LOG.md` 或按模板提供，再按 `mvp-bugfix-qa` 流程一个 bug 一个 `Fix:` commit 处理。

### Gate 4：备份 / 恢复演练强化（2026-06-30）

- 根据持续开发计划进入 Gate 4，本轮只强化备份与恢复流程文档，不新增功能、不修改数据库结构、不接真实 NAS、不创建 Android 工程。
- 已重写 `docs/BACKUP_RESTORE_DRILL.md`，将数据库损坏后的真实经验固化为强流程：试运行前必须备份 `app.db` 和 `attachments/`，恢复前必须停止 Node / Docker，`restore-db` 默认 dry-run，只有 `--confirm` 才真正替换正式库。
- 文档明确不恢复 `integrity_check` 未通过的备份，恢复后必须运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`，Docker / NAS 场景还需运行 `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`。
- 已记录 Docker / NAS 试运行前后保留快照、避免重复 Note Station 导入、恢复附件目录、以及出问题时先保留现场再修复的规则。
- 现有 `tests/database-restore.test.js` 已覆盖 dry-run 不替换正式库、`--confirm` 保留恢复前副本、坏备份拒绝；本轮无需新增重复测试。
- 本轮验证结果：`npm.cmd run check` 通过，正式库 `integrityCheck=ok`、`noteCount=113`；`npm.cmd run test` 通过 33 项；`npm.cmd run build` 通过。
- 提交前安全检查：Git 仍只跟踪 `data/**/.gitkeep`；正式数据库、备份、导出、附件、sandbox DB 和真实导入目录均为 ignored 运行数据。

### 试运行准备报告去矛盾刷新（2026-06-30）

- 发现 `docs/TRIAL_RUN_READINESS_REPORT.md` 前半段仍保留数据库损坏阶段的“暂不建议试运行”旧结论，后文虽追加了恢复完成，但容易误导后续线程。
- 本轮将该报告刷新为当前事实：Gate 0-4 已完成，正式库 `integrityCheck=ok`，Docker 真实 data smoke 已通过，当前建议进入真实家庭局域网 / NAS 人工试运行。
- 本轮只更新文档，不改业务代码、不改数据库、不触碰真实运行数据。
- 本轮报告刷新验证：`npm.cmd run check` 通过，正式库 `integrityCheck=ok`、`noteCount=113`；`npm.cmd run test` 通过 33 项；`npm.cmd run build` 通过。

### Gate 9：MVP 试运行版本冻结（2026-06-30）

- 用户确认“可以冻结 MVP 试运行版本”，本轮进入 Gate 9。
- 新增 `docs/RELEASE_MVP_TRIAL.md`，记录当前版本能做什么、不能做什么、运行方式、Docker / NAS 部署方式、备份恢复方式、手机试运行方式、已知风险和后续路线。
- README 已增加 MVP 试运行冻结版本入口，指向冻结说明、手机验收清单和备份恢复演练。
- 冻结后项目不继续盲目新增功能；下一阶段只接收真实手机 / NAS 试运行反馈，并按 `mvp-bugfix-qa` 流程修 P0 / P1。

### Gate 9 验证结果（2026-06-30）

- 冻结前验证已完成：`npm.cmd run check` 通过，正式库 `integrityCheck=ok`，`noteCount=113`。
- `npm.cmd run test` 通过，10 个测试套件 / 33 项测试全部通过。
- `npm.cmd run build` 通过，Vite 生产构建成功。
- 本轮冻结只提交代码和文档，不提交 `data/`、数据库、备份、导出、附件、`.nsx`、dry-run JSON 或日志。

### Gate 6：Product Design 7 图还原审计（2026-06-30）

- 用户指出持续开发计划仍有 Gate 未执行；重新读取 `docs/CODEX_CONTINUOUS_DEVELOPMENT_PLAN.md` 后确认 Gate 6 尚未单独提交。
- 本轮只执行 Gate 6 审计，不改业务代码、不改数据库、不调用 Product Design、不生成新图片。
- 新增 `docs/PRODUCT_DESIGN_RESTORE_AUDIT.md`，按 7 张 V1 / Product Design 页面图审计首页、新建记录、详情、搜索、分类、导入 Note Station、设置 / 备份。
- 本轮使用当前 Docker 服务 `http://127.0.0.1:3300/` 和 Playwright CLI 做 390px 页面截图审计；截图为临时产物，审计后已删除，不提交 Git。
- 审计结论：当前页面可继续 MVP 试运行；若继续视觉还原，建议先由用户确认 Gate 7，从“分类页 + 设置页”开始小步修复。

### Gate 6 验证结果（2026-06-30）

- `npm.cmd run check` 通过，正式库 `integrityCheck=ok`，`noteCount=113`。
- `npm.cmd run test` 通过，10 个测试套件 / 33 项测试全部通过。
- `npm.cmd run build` 通过。
- 本轮不提交 `output/playwright/` 截图、不提交 `data/`、数据库、备份、导出、附件或真实导入内容。
### Gate 7：分类页 + 设置页视觉对齐第一批（2026-06-30）

- 用户要求进入 Gate 7，并指出不要再重复踩 Windows / Playwright 环境坑；已将该坑和正确解法写入 Codex 本地记忆扩展：Windows 沙箱 cap_sid 问题出现后直接使用 `require_escalated`，Playwright 交互检查使用 Codex bundled Node + pnpm module path。
- 本轮只修 `src/client/main.jsx` 中分类页和设置页的视觉层级，不新增功能、不改业务逻辑、不改数据库、不触碰真实 Note Station 数据、不生成图片、不调用 Product Design。
- 分类页修正：标题和副标题更接近 V1，搜索框更舒展，导入整理卡留白和图标增强，分类卡片高度、图标、标题、数量和更新时间层级增强，双列间距加大。
- 设置页修正：标题和顶部装饰区域更接近 V1，备份卡片留白 / 图标 / 标题 / 按钮增强，备份状态测试和数据目录检查视觉权重下调，设置项图标和标题增强。
- Playwright 390px / 430px 检查：通过底部导航真实进入分类页和设置页；四个组合均 `scrollWidth == innerWidth`，`overflowCount=0`；截图只保存在 `C:\tmp\note-gate7-shots`，不提交 Git。
- 验证结果：`npm.cmd run check` 通过，正式库 `integrityCheck=ok`、`noteCount=113`；`npm.cmd run test` 通过 33 项；`npm.cmd run build` 通过。
- 下一步：Gate 7 第二批建议做“首页 + 搜索页”，只统一记录卡标题、摘要、标签和元信息层级；不要重做整体 UI。

## 2026-07-01 - Figma 规格分类页重建

- 当前前端视觉还原改为以 `docs/FIGMA_IMPLEMENTATION_SPECS.md` 和 `design/home-records-prototype/` 7 张最终图为准，不再用旧的“凭感觉微调 CSS”方式推进。
- 本轮只修分类页视觉层：标题、副标题、搜索框、两列分类卡片、图标尺寸、分类标题、记录数、更新时间、底部留白。
- 分类页已去掉与最终图不一致的额外“导入记录待整理”插卡；`未分类` 改回完整显示 `未分类 / 待整理`。
- 390px / 430px Playwright 验收通过：11 个分类名完整显示，无 `家... / 房... / 维... / 购...`，无文字竖排，无记录数或更新时间竖排，无页面横向溢出；底部导航和浮动按钮不遮挡最后一行分类卡片。
- 验收时发现 3300 被 Docker 服务占用且健康接口显示 `/data/...`，为避免看到旧容器前端，本轮截图验收使用本地构建产物临时端口 `3311`。后续若要用户在 3300 直接查看，需要重建 / 重启 Docker 或改用明确的本地端口。
- 本轮运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 均通过。

## 2026-07-01 - 富文本只读渲染第一阶段

- 本轮进入“富文本能力第一阶段：只读渲染与数据兼容”，不开发完整富文本编辑器、不引入块编辑器、不重构正文数据结构、不修改真实 Note Station 导入数据。
- 已梳理正文存储现状：`notes.content` 继续保存纯文本正文，用于页面 fallback、搜索、JSON 导出和 Markdown 导出；Note Station 导入时保留的原始 HTML 位于 `notes.raw_metadata.originalContent`，格式标记位于 `raw_metadata.originalContentFormat`。
- 新增 `docs/RICH_TEXT_PLAN.md`，明确只读优先、XSS 风险、允许/禁止标签、链接协议规则、图片降级为附件占位、以及后续进入富文本编辑器阶段前需要确认的决策。
- 服务端新增轻量 HTML sanitizer，不引入新依赖；默认 `listNotes()` 不返回 `richContent`，只有 `/api/app-data` 和 `/api/notes` 这类页面/API读取路径 opt-in，避免 JSON / Markdown 导出形状被扩大。
- 详情页仅对 Note Station 导入且存在安全 HTML 的记录显示 `原始格式 / 纯文本` 切换；首页卡片、搜索、分类、成员筛选仍使用纯文本摘要和 `notes.content`。
- 新增 `tests/rich-text.test.js`，覆盖恶意 `script/iframe/on*` 清理、危险链接移除、图片占位、纯文本 fallback、搜索仍基于纯文本、默认导出查询不包含 `richContent`。
- 验证结果：`npm.cmd run check` 通过，正式库 `integrityCheck=ok`、`noteCount=113`；`npm.cmd run test` 通过，11 个测试套件 / 36 项测试全部通过；`npm.cmd run build` 通过。

## 2026-07-03 - 项目状态收口与发布路线图同步

本轮进入“项目状态收口 + 文档同步 + 发布路线图”阶段，不开发新功能、不改 UI、不改数据库、不处理 Android / Figma / 完整富文本编辑器。

当前基线为 `5fff73d Add safe rich text read-only rendering`。本轮确认当前项目已经处于 RC1 / 家庭局域网试运行准备阶段：核心记录、搜索、分类、成员、备份、导出、真实 Note Station 导入结果查看、基础附件上传、富文本安全只读渲染、Docker/NAS 基础部署文件均已具备。

本轮统一了旧文档里的冲突状态：

- 默认成员只保留 `我 / 爱人`；支持切换和资料编辑，但不支持新增成员。
- Note Station 当前真实样例已经完成正式导入，未知 `.nsx` 仍必须先 dry-run。
- JSON 导出和 Markdown 导出均已实现。
- 基础附件上传已实现，附件管理增强仍是后续功能。
- 富文本第一阶段已完成安全只读渲染，完整编辑器未实现。
- 当前阶段建议冻结 RC1，先做真实手机与 NAS/Docker 试运行，再决定 P1/P2。

新增/更新文档：

- `docs/PROJECT_STATUS.md`
- `docs/DOCS_SYNC_AUDIT.md`
- `docs/ROADMAP_RELEASE_PLAN.md`
- `README.md`
- `docs/NEXT_STEPS.md`
- `docs/RUN_RESULT_HANDOFF.md`
- `docs/QA_REPORT_CURRENT.md`

数据安全状态：Git 只跟踪 `data/` 下 `.gitkeep` 占位文件；真实数据库、备份、导出、附件、`.nsx`、dry-run JSON、日志和隐私内容不得提交。

本轮验证结果：`npm.cmd run check` 通过，SQLite `integrityCheck=ok`，`noteCount=113`，`categoryCount=11`；`npm.cmd run test` 通过 11 suites / 36 tests；`npm.cmd run build` 通过。

## 2026-07-03 - 开发路线调整：暂停 RC 流程，富文本编辑优先

用户明确调整项目方向：note 是个人和家庭自用工具，不继续按复杂 RC1 / RC2 或商业发布流程推进。之前围绕 RC1 试运行、发布清单、复杂验收和 Gate 的流程暂停，不再作为当前主线任务。

新的开发顺序：

1. 富文本编辑能力：新建、编辑、详情展示，兼容纯文本和 Note Station 导入 HTML，不破坏搜索、分类、标签、成员、备份、JSON / Markdown 导出和附件。
2. 富文本相关页面收口：新建记录页、编辑记录页、详情页，保持当前移动端风格，不重做整套 UI。
3. Product Design 7 张最终图视觉还原：仍然是 Android 前必做项，但不阻塞富文本开发；后续必须按 Figma 实现规格逐页还原，不凭感觉微调。
4. Android 封装：继续排最后，当前不创建 Android 工程、不生成 APK。

本轮只更新路线文档，不开发富文本，不改业务代码，不改数据库，不改 UI。

已更新：

- `docs/NEXT_STEPS.md`
- `docs/ROADMAP_RELEASE_PLAN.md`
- `docs/CODEX_CONTINUOUS_DEVELOPMENT_PLAN.md`
- `docs/ANDROID_WRAPPER_PLAN.md`
- `docs/PROJECT_MEMORY.md`

本轮路线调整验证结果：`npm.cmd run check` 通过，SQLite `integrityCheck=ok`，`noteCount=113`，`categoryCount=11`；`npm.cmd run test` 通过 11 suites / 36 tests；`npm.cmd run build` 通过。

## 2026-07-03 - 富文本编辑功能补齐

- 用户确认富文本实施方案后，本轮开始实现日常可用的富文本编辑能力，不做 Android、不重做 UI、不调用 Figma / Product Design、不生成新图片。
- 数据结构新增 `notes.content_html TEXT` 可空字段；`notes.content` 继续作为纯文本核心字段，用于搜索、摘要、旧记录 fallback、JSON / Markdown 导出兼容。
- 新建记录和编辑记录页已接入轻量 `contenteditable` 编辑器，支持段落、换行、粗体、斜体、H2 / H3 标题、有序 / 无序列表、引用、链接、分隔线，以及浏览器原生撤销 / 重做。
- 服务端统一清理 `contentHtml`，禁止 `script`、`iframe`、事件属性和危险链接；正文中的图片暂不直接渲染，降级为附件占位提示。
- 详情页现在优先展示用户编辑后的 `content_html`；没有用户富文本时继续展示 Note Station 导入元数据中的安全 HTML；再没有则回退到 `notes.content` 纯文本。
- 旧纯文本记录未编辑前保持原样；进入编辑页会转换成基础段落 HTML，保存后写入 `content_html`，不会破坏纯文本搜索。
- JSON 导出继续包含纯文本字段；有用户富文本时额外包含清理后的 `contentHtml`。Markdown 导出优先把 `contentHtml` 转成基础 Markdown，无富文本则继续使用纯文本。
- 新增测试覆盖：富文本创建、编辑、安全清理、危险链接处理、搜索仍基于纯文本、JSON 导出、Markdown 导出、旧纯文本转编辑器 HTML、用户富文本优先于 Note Station 原始 HTML。
- 验证结果：`npm.cmd run check` 通过，SQLite `integrityCheck=ok`、`noteCount=113`；`npm.cmd run test` 通过 11 个测试套件 / 40 项测试；`npm.cmd run build` 通过。
- 本轮不提交 `data/`、数据库、备份、导出、附件、`.nsx`、日志或真实隐私数据。

## 2026-07-03 - 新版 Figma Make 视觉基准接入第一轮

- Figma / UI 线程同步确认：后续前端视觉基准切换为 GitHub 仓库 `ddrcpddr/figma` 中 `家事记-UI设计规范.md` 对应的 Figma Make 版本，来源提交 `75a42cde764f6d024804b23f099e8ef04e641823`。
- 项目内实现入口为 `docs/FIGMA_IMPLEMENTATION_SPECS.md`；旧的 430px / 大字号 / 偏 Product Design 早期稿的实现不再作为标准。
- 本轮前端已按新版基准做第一批视觉层调整：页面壳收敛到 `390px` 基准、背景切换为 `#F4F5F7`、主色切换为 `#3DAA6C`、卡片统一 `16px` 圆角和轻阴影、底部导航改为约 `58px`、FAB 改为首页 `56px` / 分类页 `66px`。
- 首页、搜索、新建、分类、记录卡片、底部导航、富文本显示密度等共享视觉已先收拢到新版字号层级；未新增功能、不改数据库、不改真实 Note Station 数据。
- 图标继续优先使用 `design/image-assets/v1/runtime/` 中已有 runtime 素材：默认成员只保留 `我 / 爱人`，分类图标继续使用 11 个已生成分类图标，不重新自由设计图标。
- Playwright 验收使用临时本地端口 `3312`：首页和分类页生成 390px / 430px 截图；分类页 11 个分类完整存在，无页面横向溢出，无分类标题省略号、溢出或异常竖排；分类卡实测约 `173 x 70`，符合新版两列紧凑卡片方向。
- 验证结果：`npm.cmd run check` 通过，SQLite `integrityCheck=ok`、`noteCount=114`；`npm.cmd run test` 通过 11 个测试套件 / 40 项测试；`npm.cmd run build` 通过。
- 本轮只提交代码和文档，不提交 `data/`、数据库、备份、导出、附件、`.nsx`、日志或临时截图。

## 2026-07-03 - 修复设置页与导入页新版 Figma Make 漏调

- 用户在 Docker 3300 页面截图指出：设置页没有真正调整，备份卡仍把 上次备份 文案挤成竖排；导入 Note Station 页也仍有旧版文件卡和标题截断。
- 本轮使用项目 mvp-bugfix-qa 流程做小步修复，只改设置页和导入页视觉层，不改业务逻辑、不改数据库、不改真实 Note Station 数据。
- 设置页已收敛为新版 390 x 844 密度：20px 标题、紧凑右侧装饰、42px 备份状态图标、13px 状态文字、84px 立即备份 按钮，导出/目录/成员区也同步缩小，避免竖排和挤压。
- 导入页已收敛步骤条和文件卡：步骤圆点 36px，文件卡标题 16px，待选择状态显示 等待选择 .nsx 文件，移除 	runcate，底部操作栏高度缩小。
- 验证结果：
pm.cmd run check 通过，integrityCheck=ok、
oteCount=114；
pm.cmd run test 通过 11 suites / 40 tests；
pm.cmd run build 通过；docker compose up -d --build 后 
pm.cmd run smoke -- --base-url http://127.0.0.1:3300 通过。
- Playwright 390px / 430px 验证：设置页和导入页均无页面级横向溢出；设置页 上次备份 文案高度 18px，不再竖排；导入页 .nsx 标题完整显示且不再使用 	runcate。
- 临时截图和测试文件已从 output/playwright/ 删除；Docker smoke 生成的备份/导出文件仍位于 data/ 下并被 .gitignore 忽略。

## 2026-07-03 - 富文本开发前提更新：允许重建测试数据，面向重新导入 NSX

用户明确更新富文本开发前提：当前项目仍处于测试阶段，现有数据库、测试记录、测试附件、已导入测试数据都可以丢失；产品功能完善后会重新导入 Synology Note Station `.nsx` 文件。

新的原则：可以调整数据库结构、做破坏性迁移、清空测试数据库、重建测试附件目录、重新设计 notes 正文字段、重新实现 Note Station 导入后的富文本存储方式；但不要删除原始 `.nsx` 文件，不提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。

富文本目标改为“面向重新导入 Note Station 数据的最终富文本能力补齐”。推荐采用 Tiptap / ProseMirror，不再继续扩展轻量 `contenteditable`。建议长期字段为 `notes.content_text`、`notes.content_html`、`notes.content_json`、`notes.source_html`，并由 `attachments` 统一管理图片和附件。

本轮仅更新方案文档，不开发代码、不改数据库、不清空数据。已更新：`docs/RICH_TEXT_IMPLEMENTATION_PLAN.md`、`docs/RICH_TEXT_FEATURE_PARITY.md`、`docs/NOTESTATION_IMPORT.md`、`docs/NEXT_STEPS.md` 和 `docs/PROJECT_MEMORY.md`。

## 2026-07-03 - Note Station 兼容富文本编辑第一轮实现

用户确认当前测试数据可以丢，允许调整数据库结构和重新导入 `.nsx`，但不能删除原始 `.nsx`，不能提交 `data/` 运行数据。

本轮已实现面向重新导入 Note Station 的富文本第一轮能力：

- 引入 Tiptap / ProseMirror 与 `sanitize-html`，替换旧的轻量 `contenteditable` 主编辑器。
- `notes` 新增长期富文本字段：`content_text`、`content_html`、`content_json`、`source_html`、`content_format`、`content_version`；旧 `content` 继续作为 legacy 纯文本 fallback。
- `attachments` 新增 `kind`、`content_ref_id`、`source_attachment_id`、`source_path`、`width`、`height`、`sort_order`、`is_inline`，用于统一管理正文图片和附件引用。
- 新建 / 编辑记录页支持段落、标题、粗体、斜体、下划线、删除线、列表、待办、引用、链接、代码块、表格、对齐、文字颜色、背景高亮、清除格式、撤销/重做。
- 图片上传和粘贴会写入本地附件系统并插入正文；附件可插入正文引用；详情页附件列表可打开 / 下载。
- 服务端富文本清理禁止 script、iframe、事件属性、危险链接；允许基础文本格式、表格、待办 checkbox、安全图片和附件 URL。
- JSON / Markdown 导出适配富文本：JSON 包含富文本字段，Markdown 尽量从 HTML 转换，保留待办和表格基础结构。
- Note Station sample、sandbox、formal import 均已调整为写入新富文本字段；重新导入 `.nsx` 时会将原始 HTML 保留到 `source_html`，安全展示 HTML 写入 `content_html`，纯文本写入 `content_text`。
- 未执行测试数据库清空；当前仅通过迁移方式升级结构。原始 `.nsx` 未删除，`data/` 仍不提交。

当前仍需后续验证：重新用真实 `.nsx` dry-run / 导入，检查 Note Station 表格、待办、图片、附件和链接在真实数据中的恢复效果；复杂 HTML -> Tiptap JSON 转换仍需按真实样例渐进增强。

## 2026-07-03 - 修复富文本移动端工具栏可用性

用户反馈富文本控件“没法用”，并提供 DS note 安卓版视频作为交互参考。本轮按 `mvp-bugfix-qa` 和系统化调试流程先复现：Tiptap 底层命令可以执行，例如加粗会生成 `<strong>`、待办会生成 `taskList`、表格会插入 table；真正根因是移动端工具栏把 23 个 icon-only 按钮平铺在约 294px 宽的横向滚动条里，实际滚动宽度约 1012px，用户很难发现和使用控件。

修复方式：不改数据库、不改导入逻辑、不重做 UI，只把富文本工具栏改为分组面板：`常用`、`列表`、`插入`、`更多`。每组按钮显示图标和短文字，默认显示常用组；插入组显示链接、图片、附件、表格；更多组显示对齐、文字色、高亮、清格式。新增前端静态回归测试，防止工具栏退回一条长横向图标条。

验证结果：Playwright 390px 复测分组按钮可见、插入/更多组可切换、页面无横向溢出；输入文字后选中并点击“加粗”，HTML 为 `<p><strong>工具栏分组测试</strong></p>`。`npm.cmd run check` 通过，`npm.cmd run test` 通过 42 项，`npm.cmd run build` 通过。临时截图和视频抽帧已删除，不提交 `data/` 或真实隐私内容。

## 2026-07-03 - 修复富文本斜体可见性与工具栏即时反馈

用户反馈富文本中斜体不生效，并且很多控件点击后不会立即显示选中态，要继续输入文字后才出现反馈。本轮按 bugfix 流程复现：斜体底层实际会生成 `<em>`，但默认中文 italic 视觉不明显；工具栏按钮直接读取 `editor.isActive()`，却没有订阅 Tiptap transaction / selection / focus 状态，导致点击后 React 不立即重渲染。

修复内容：富文本编辑器新增 `toolbarRevision` 状态，并在 `onUpdate`、`onSelectionUpdate`、`onTransaction`、`onFocus`、`onBlur` 刷新工具栏；工具按钮使用 `onMouseDown.preventDefault` 保持编辑器焦点和选择；补齐表格、对齐、文字色、高亮的 active 判断；编辑区和详情区的 `em/i` 统一使用 `oblique 12deg`，让中文斜体更明显。新增前端静态回归测试防止状态刷新和斜体样式回退。

验证结果：`node --test tests/frontend-ui.test.js` 通过；`npm.cmd run check` 通过，SQLite `integrityCheck=ok`、`noteCount=114`；`npm.cmd run test` 通过 11 suites / 44 tests；`npm.cmd run build` 通过；Docker 3300 重建后 healthy，HTTP smoke 通过。Playwright 复测确认点击“斜体”后无需输入就立即选中，输入后 HTML 为 `<p><em>斜体测试abc</em></p>`，computed style 为 `oblique 12deg`；“高亮”按钮也能立即显示选中态。本轮不提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。

## 2026-07-03 - 修复富文本斜体真实可见性与文字色取消

用户继续反馈：斜体按钮能选中，但下方文字看起来没有变斜；“更多”里的文字色一旦选中就不能再次点击取消。

本轮复现确认：斜体命令已经生成 `<em>`，但仅依赖 `font-style: oblique 12deg` 对中文字体视觉反馈不足；文字色按钮只有单向 `setColor('#0F766E')`，没有 active 时 `unsetColor()` 的 toggle 分支。

修复内容：富文本编辑区和详情区的 `em/i` 改为 `display: inline-block` + `transform: skewX(-10deg)`，让中文斜体真实可见；新增 `toggleTextColor()`，当前选区已有固定文字色时再次点击会 `unsetColor()`。新增前端静态回归测试覆盖文字色可取消和斜体 transform。

验证结果：`node --test tests/frontend-ui.test.js` 通过 5 项；`npm.cmd run check` 通过，SQLite `integrityCheck=ok`、`noteCount=114`；`npm.cmd run test` 通过 11 suites / 45 tests；`npm.cmd run build` 通过；Docker 3300 重建后 healthy，HTTP smoke 通过。Playwright 复测确认斜体元素 transform 为 `matrix(1, 0, -0.176327, 1, 0, 0)`；文字色第一次点击生成 color span，第二次点击移除 color span 并取消按钮选中。本轮不提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。
## 2026-07-03 - 收口附件入口与 Note Station `.nsx` 文件选择

用户确认富文本编辑器已经基本满足日常使用，因此旧的新建 / 编辑页独立附件上传渠道不再需要。后续图片和附件都应从富文本编辑器的“插入 -> 图片 / 附件”进入，正文和附件不再分成两套编辑入口。

本轮修复：

- 移除新建 / 编辑记录页旧的独立“附件”上传区、隐藏 input 和底部“保留原附件 / 存为模板”类辅助入口。
- 保留富文本编辑器内部图片上传、粘贴图片和附件插入能力。
- 新建记录不再自动写入假附件；只有用户通过富文本编辑器插入的图片 / 附件才会进入保存 payload。
- 导入 Note Station 页面接入真实 `.nsx` 文件选择 input，点击页面按钮或底部主按钮会打开文件选择器，选择后显示文件名和大小。
- 当前网页端 `.nsx` 选择后只进入安全预检 / dry-run 占位，不写正式数据库；完整网页上传解析仍需后续把现有 NSX 解析器接到页面。
- 后续真实 `.nsx` 导入必须把 HTML、图片、附件引用尽量恢复到富文本正文，附件列表只作为下载和兼容展示，不再作为主要编辑入口。

安全约束不变：不提交 `data/`、数据库、附件、备份、导出、`.nsx`、dry-run JSON、日志或真实隐私内容。

## 2026-07-03 - 清理历史测试附件并接通网页端真实 `.nsx` 解析

用户截图反馈：新建 / 编辑页已经只剩富文本编辑器内的附件入口，但首页和详情页仍有历史测试记录显示旧附件；导入页已经能弹出 `.nsx` 文件选择器，但选择真实文件后只显示 0 条记录 / 1 个失败项。

本轮确认两个根因：

- 旧附件来自历史测试数据库和旧 seed/mock 数据，并不是新建页仍有独立附件上传入口。
- 网页端 `.nsx` 选择此前只上传文件名和大小，后端没有接收真实文件内容，因此无法解析真实 Note Station 导出。

处理结果：

- 停止 Docker 服务后清理当前测试数据库和测试附件目录，保留原始 `data/imports/notestation/*.nsx` 文件。
- 移除 seed/mock 中的假附件，清理后默认测试库为 0 条记录、11 个分类、2 个默认成员，不再显示旧测试附件。
- 网页端导入页现在会以 `application/octet-stream` 上传真实 `.nsx` 文件内容，后端保存到被 Git 忽略的 `data/imports/notestation/` 后复用现有 NSX dry-run 解析器。
- 网页端确认导入现在会复用正式导入链路：导入前自动备份数据库，写入富文本字段，复制附件到 `data/attachments/`，失败项写入 `import_failures`，不静默丢弃。
- 用本地真实样例 `example-notestation-export.nsx` 对 Docker 3300 服务做 dry-run，仅预览不确认导入：识别 93 条记录、93 条成功、0 条失败、20 个附件、4 个原始分类。

验证结果：

- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=3`。
- `npm.cmd run test`：通过，11 suites / 48 tests / 48 pass。
- `npm.cmd run build`：通过，仍有 Tiptap bundle size warning。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过，Docker 服务 healthy，API / 首页壳 / 备份 / JSON 导出正常。
- 安全检查：`data/`、`.nsx`、数据库、备份、导出、附件继续被忽略，不提交真实隐私数据。

## 2026-07-03 - 修复 Note Station 导入图片内联展示

用户指出：群晖导入后的记录仍像旧格式一样“正文 + 附件列表”，希望能直接用富文本查看，而不是图片都落在下面的附件列表。

本轮复现和定位：

- 当前导入记录的 `source_html` 中有 `<img>`，但 `content_html` 中没有 `<img>` 或 `/api/attachments/.../file`。
- Note Station 图片标签使用 `src="webman/3rdparty/NoteStation/images/transparent.gif"`，真实图片线索在 `ref` 属性中，`ref` 是 base64 编码后的图片文件名信息。
- 旧导入链路复制了附件，却没有把 `ref` 映射成本地附件 URL，因此 sanitizer 移除了无法安全展示的图片。

修复结果：

- 正式导入 / 网页端确认导入时，先准备附件 ID，再将 NSX HTML 里的图片 `ref` 替换为 `/api/attachments/{id}/file`，并保存到 `content_html`。
- 被富文本正文引用的图片附件标记为 `is_inline=1`。
- 对已经导入过的测试数据增加读取时兼容：如果 `source_html` 里仍有 Note Station 图片 ref，会用附件元数据动态回填富文本图片。
- 详情页附件列表过滤正文内联附件，避免图片在正文显示后仍在下方附件列表重复出现。
- 非图片附件仍保留在附件列表，作为下载和兼容展示。

验证结果：

- `npm.cmd run check` 通过，`integrityCheck=ok`，`noteCount=96`。
- `npm.cmd run test` 通过，11 suites / 50 tests。
- `npm.cmd run build` 通过。
- Docker 3300 重建并 smoke 通过，当前导入记录数 93。
- 当前 Docker 数据中一条带 8 个图片附件的导入记录已验证：8 个附件全部作为正文内联图片返回，富文本 HTML 含本地附件图片地址，正文外可见附件数为 0。

安全说明：本轮不提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。


## 2026-07-03 - 清空测试数据并移除假关联记录

用户反馈截图中的 Note Station 导入记录仍显示历史附件，且详情页还有“关联记录”数据。确认后发现当前不是只残留某一条记录，而是运行数据库、附件目录、备份/导出目录仍有历史测试产物，同时详情页存在硬编码的“关联记录”假数据。

本轮处理：

- 停止 Docker 容器，清空 `data/database/`、`data/attachments/`、`data/backups/`、`data/exports/` 下的运行产物，仅保留 `.gitkeep`。
- 清理 `data/imports/notestation/` 中的 dry-run JSON / sandbox 等运行产物，但保留所有 `.nsx` 文件，避免删除用户原始群晖导出包。
- 默认 `seedNotes` 改为空数组，前端 `initialNotes` 改为空数组，避免清库后自动出现历史示例记录。
- 详情页移除写死的“关联记录：去年卫生间防水维修 / 物业维修电话”，避免无数据时仍显示假数据。
- HTTP smoke 和相关测试改为支持干净空库：`noteCount=0` 时跳过详情项检查，但继续验证 health、app-data、搜索、分类、成员、备份、JSON 导出和前端壳。

验证结果：`npm.cmd run check` 通过，`integrityCheck=ok`、`categoryCount=11`、`noteCount=0`；`npm.cmd run test` 通过，11 suites / 51 tests；`npm.cmd run build` 通过。接下来重新启动 Docker 后，用户可以从空库重新上传并测试 `.nsx` 导入。

安全说明：本轮不提交 `data/`、数据库、附件、备份、导出、`.nsx`、dry-run JSON、日志或真实隐私内容。

## 2026-07-03 - 修复 Note Station 图片附件通用富文本内联

用户重新导入 `.nsx` 后确认：部分群晖记录仍然表现为“正文 + 附件列表”，不是所有图片都进入富文本正文。进一步复现发现，旧修复只覆盖了 HTML 中存在可匹配 `<img ref="...">` 的图片；真实 NSX 中还有一类图片附件已经存在于记录附件列表，但正文 HTML 没有能匹配的 `ref`，因此这些图片仍掉到详情页独立附件区。

本轮修复是应用级通用逻辑，不是逐条记录补丁：

- 网页端 Note Station 确认导入时，所有成功复制的图片附件都会进入富文本正文：能匹配 `ref` 的图片替换原 `<img>`，不能匹配的图片以 `figure/img/figcaption` 追加到正文末尾。
- CLI 正式导入脚本同步同一逻辑，避免以后命令行导入再次回到旧格式。
- 已导入测试数据读取时也会动态回填未匹配图片附件，因此当前库无需逐条手工处理。
- 富文本 sanitizer 增加 `div`、`figure`、`figcaption` 支持，并保留 Note Station 自动内联图片容器标记。
- 纯文本字段继续使用 NSX 解析出的正文，不从带图片的 HTML 反推，避免搜索和摘要被图片文件名污染。
- 详情页正文增强 h1/h4/div/figure/figcaption 样式，让 Note Station HTML 不再退化成一大段无格式纯文本。

验证结果：

- `npm.cmd run check`：通过，当前测试库 `noteCount=93`。
- `npm.cmd run test`：通过，11 suites / 52 tests / 52 pass。
- `npm.cmd run build`：通过，仍只有 Tiptap bundle size warning。
- `docker compose up -d --build`：通过，3300 容器已重建。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过，Docker API / 前端壳 / 备份 / JSON 导出正常。
- Docker 3300 API 实测：93 条 Note Station 记录，20 个图片附件，20 个都能在富文本 HTML 中找到，漏掉 0 个。

安全说明：本轮未提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。`data/` 下 Git 仍只跟踪 `.gitkeep`。

## 2026-07-03 - 修正详情页仍显示 Note Station 图片附件区

用户截图确认：虽然上一轮已把 Note Station 图片写入 `richContent.html`，详情页仍会显示“附件（4）”独立区块，实际体验仍像“文本是文本、附件是附件”。

根因：

- 详情页使用的是首页 / 搜索列表中的 `notesData` 选中项，不一定是 `/api/notes?id=...` 返回的完整详情对象。
- 列表态记录可能保留了旧附件数组，导致 `visibleAttachments` 过滤没有基于完整 `richContent` 和 `isInline` 状态执行。
- 上一轮验证偏向 API 数据，没有覆盖详情页打开时的前端状态刷新。

本轮修复：

- `openDetail(id)` 改为异步：进入详情后会请求 `/api/notes?id={id}`，用完整详情刷新 `notesData` 中对应记录。
- 详情页附件过滤增加 Note Station 图片附件兜底：只要是 `notestation_import` 且存在富文本内容，图片附件不再渲染为外部附件卡片。
- 新增前端回归测试，防止详情页再次只使用列表态旧附件。

验证结果：

- `node --test tests/frontend-ui.test.js`：通过，10 tests。
- `npm.cmd run check`：通过，`noteCount=93`。
- `npm.cmd run test`：通过，11 suites / 53 tests / 53 pass。
- `npm.cmd run build`：通过，新前端产物为 `index-DBQZCcv9.js`。
- `docker compose up -d --build`：通过，3300 已重建。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过。
- 3300 首页 HTML 已确认引用新 JS：`index-DBQZCcv9.js`。

安全说明：本轮未提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。

## 2026-07-03 - 修复 Tiptap 重复扩展控制台警告

用户截图反馈浏览器控制台出现：`[tiptap warn]: Duplicate extension names found: ['link', 'underline']`。

根因：Tiptap v3 的 `StarterKit` 已包含 `link` 和 `underline` 扩展，当前编辑器又单独注册了 `LinkExtension` 与 `UnderlineExtension`，导致重复扩展名警告。

修复：

- `StarterKit.configure()` 中显式设置 `link: false`、`underline: false`。
- 保留单独的 `LinkExtension.configure({ openOnClick: false, autolink: true, linkOnPaste: true })` 和 `UnderlineExtension`，不改变工具栏行为。
- 新增前端静态测试，防止重复扩展配置回归。

验证结果：

- `node --test tests/frontend-ui.test.js`：通过，11 tests。
- `npm.cmd run check`：通过，当前测试库 `noteCount=186`。
- `npm.cmd run test`：通过，11 suites / 54 tests / 54 pass。
- `npm.cmd run build`：通过，新前端产物为 `index-WZcMH9Av.js`。
- `docker compose up -d --build`：通过，3300 已重建。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过。

说明：控制台里的 Microsoft 图片 lazy-load Intervention 是浏览器提示，不是应用代码错误。本轮只修复 Tiptap duplicate extension warning。

## 2026-07-03 - 收敛成员管理页移动端 UI

用户截图反馈“成员管理”页面仍像旧版大字号卡片，和当前新版移动端视觉不统一。

本轮只修成员管理页视觉层，不改成员逻辑、数据库、导入、富文本或其他页面：

- 将顶部说明卡从大标题 hero 风格收敛为紧凑信息卡，标题改为 18px 级别，说明文案更短。
- 当前成员卡片和成员列表卡片统一为 12px 头像、17-18px 标题、紧凑说明文字。
- 改名 / 头像 / 颜色按钮统一为 36px 高的轻量胶囊按钮，避免移动端按钮过大。
- 成员切换图标按钮统一尺寸，减少右侧视觉突兀。
- 新增前端静态回归测试，防止成员管理页回到 26px 大标题、64px 大头像的旧样式。

验证结果：

- `node --test tests/frontend-ui.test.js`：通过，12 tests。
- `npm.cmd run check`：通过，当前测试库 `noteCount=186`。
- `npm.cmd run test`：通过，11 suites / 55 tests / 55 pass。
- `npm.cmd run build`：通过，新前端产物为 `index-DmpFVVzJ.js` / `index-CZcawJYy.css`。
- `docker compose ps`：`note` 容器 healthy，3300 端口正常。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过，health、app-data、列表、详情、搜索、分类、成员筛选、备份、JSON 导出和前端壳均正常。

安全说明：本轮不提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。


## 2026-07-04 - 自定义分类第一阶段完成

当前主线已从 Android 暂停，先补 Web 端基础功能。第一目标为自定义分类，第二目标为离线后可继续记录、恢复联网后同步。

本轮完成：

- 后端新增分类 API：`POST /api/categories` 可创建分类，`PATCH /api/categories/:id` 可改名、改颜色、改图标。
- 分类列表仍从 `/api/app-data` 和 `/api/categories` 读取，并带记录数量。
- 前端不再只依赖硬编码分类数组：默认分类只作为 fallback，页面优先使用后端分类。
- 分类页新增“新分类”和编辑入口，可轻量设置名称、颜色、图标。
- 新建 / 编辑记录页新增分类选择 chip，保存时写入选中分类 ID。
- 首页更多筛选和搜索页分类筛选改为动态分类。
- API 与前端静态测试已覆盖自定义分类创建、编辑、筛选和页面接线。

验证：

- `node --test tests/frontend-ui.test.js`：通过，13 tests。
- `node --test tests/mvp-api.test.js`：通过，22 tests。
- `npm.cmd run check`：通过，integrityCheck ok，当前测试库 noteCount=0。
- `npm.cmd run test`：通过，11 suites / 57 tests。
- `npm.cmd run build`：通过。

安全说明：本轮只改代码和文档，不提交 `data/`、数据库、附件、备份、导出、`.nsx` 或日志。

下一阶段：在自定义分类提交并 Docker 验证后，进入“离线可记录、恢复联网后同步”专项。该阶段需要明确本地 IndexedDB / localStorage 队列、临时 ID、同步状态、冲突策略和失败重试，不应混入分类功能小改中。


## 2026-07-04 - 自定义分类 Docker 验证补充

- `docker compose up -d --build`：通过，`note` 容器 healthy，3300 端口已启动。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过。
- 当前 Docker 数据库为干净测试状态：2 个成员、11 个分类、0 条记录。
- 首页、API 壳、分类 API、备份和 JSON 导出 smoke 正常。
- 用户可在 `http://127.0.0.1:3300` 测试新增分类、编辑分类、新建记录选择分类，再重新上传 `.nsx` 测试导入。


## 2026-07-04 - 离线新建记录与恢复同步第一版

第二目标开始推进：离线以后可继续使用，恢复以后可同步。本轮先做最关键的新建记录离线队列，不做复杂编辑/删除冲突。

- 新增浏览器本地队列 home-notes-offline-create-queue-v1。
- 新建记录在 /api/notes 不可用或 app-data 加载失败时，会保存到本地队列并展示为“待同步到 NAS”。
- 队列 payload 保留纯文本、富文本 HTML/JSON、分类、成员、标签、图片和附件草稿。
- 服务恢复为 sqlite 模式后自动逐条同步，成功后替换本地临时记录并清理队列。
- 首页增加轻量提示：有多少条本机记录待同步 / 正在同步。
- 新增 docs/OFFLINE_SYNC_PLAN.md 记录边界：第一版只做离线新建，不做离线编辑、删除、跨设备冲突合并。


## 2026-07-04 - 离线同步 Docker 验证补充

- `docker compose up -d --build`：通过，最新前端产物已进入 3300 容器。
- `docker compose ps`：`note` 容器 healthy。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过。
- 当前 Docker 测试库仍为干净状态：2 个成员、11 个分类、0 条记录。
- 明早人工测试重点：新增分类、新建记录选择分类、停 Docker 后新建离线记录、恢复 Docker 后确认自动同步。


## 2026-07-04 - PWA 离线前端壳补充

- 新增 public/sw.js，并在前端注册 /sw.js。
- Service Worker 缓存前端 app shell、manifest、图标和构建后的静态资源。
- Service Worker 明确跳过 /api/，避免离线时使用过期 API 数据。
- 这使得用户已访问过页面或添加到桌面后，在 Docker/NAS 短暂不可用时仍能打开前端壳并写入本地待同步队列。
- 冷启动前提：浏览器至少需要在在线状态成功访问过一次页面，让 Service Worker 完成安装和缓存。
- 验证：npm.cmd run check 通过；npm.cmd run test 通过，59 tests；npm.cmd run build 通过。


## 2026-07-04 - PWA 离线壳 Docker smoke 验证

- Docker 容器 note 已重新构建并启动，状态为 healthy，端口映射为 3300。
- HTTP smoke 通过：health、app-data、notes-list、search、category-filter、member-filter、categories-api、storage-probe、manual-backup、json-export、frontend-shell 均为 ok；干净测试库 noteCount=0，members=2，categories=11。
- /sw.js 可从 Docker 服务访问，状态 200；内容包含 home-notes-app-shell-v1 缓存名，并包含 /api/ 绕过逻辑，确认不会缓存 API 数据。
- 当前 main 与 origin/main 对齐，阶段提交已推送。


## 2026-07-04 - 离线 app-data 快照缓存

- 在离线新建队列和 PWA 前端壳基础上，新增浏览器本地 app-data 快照缓存。
- 在线成功加载 /api/app-data 后，前端会缓存最近 100 条非离线临时记录、当前分类、默认成员和当前成员。
- Docker/NAS/API 不可用时，如果本机已有快照，页面进入 offline-cache 模式，继续展示上次成功加载的记录，同时仍允许新建记录进入待同步队列。
- 缓存只作为离线兜底，不缓存 /api/ HTTP 响应，不替代服务端数据库；大规模长期离线和冲突合并后续再考虑 IndexedDB。

- Docker 复验：docker compose up -d --build 通过；3300 HTTP smoke ok=true；/sw.js HTTP 200，确认仍包含 app-shell 缓存和 /api/ 绕过逻辑。


## 2026-07-04 - Android WebView 第一版打包

- 已创建 android/ 原生 WebView 壳，包名 com.homeoldnote.app，App 名称 家事记。
- 首次启动显示服务器地址设置页，用户可自行填写家庭 NAS / Docker 地址；地址只保存在手机本地 SharedPreferences，不写死真实 NAS 地址。
- WebView 开启 JavaScript、DOM Storage 和数据库能力；连接失败时显示错误页，可重新连接或修改服务器地址。
- 本机只有 JDK 25，Gradle/Kotlin DSL 不兼容，因此新增 scripts/build-android-debug.js，直接调用 Android SDK 的 aapt2、javac、d8、zipalign、apksigner 生成 debug APK。
- 为避开 Android SDK 工具对中文路径处理不稳定，脚本会复制源码到 C:/tmp 或系统临时目录的 ASCII 路径构建，再输出 APK 到 android/app/build/outputs/apk/debug/app-debug.apk。
- APK、keystore 和 Android build 目录已加入 .gitignore，不提交 Git。

## 2026-07-04 - 本地优先长期离线第一版

用户明确要求 Android 不能只是连接 NAS/Docker 才能使用，需要长期离线可记录、恢复联网后同步。本轮开始从短期 localStorage 队列升级到 IndexedDB 本地优先方案。

已新增：

- `src/client/offlineStore.js`，使用 IndexedDB `home-notes-offline-first-v1`。
- stores：notes、attachments、categories、members、tags、syncQueue、meta。
- 前端加载失败时优先读取 IndexedDB 快照，进入 `offline-first` 模式。
- 新建记录先写 IndexedDB，状态 `local-only`，随后尝试同步 NAS。
- 编辑记录先写 IndexedDB，状态 `dirty`，随后尝试同步 NAS。
- 在线读取 `/api/app-data` 成功后会保存本地快照。
- 新增 `tests/offline-store-static.test.js`，先 RED 后 GREEN，覆盖本地优先模块和前端接入点。

边界：

- 旧 localStorage 队列暂时保留为迁移兜底，不再作为长期离线主方案。
- 大附件 Blob、后台同步、多设备冲突合并和 Android 原生数据库不是本轮完成项。
- 仍禁止提交 data/、数据库、备份、导出、附件、.nsx、APK、日志和真实 NAS 地址。

## 2026-07-04 - NAS 快速部署文件

新增 NAS 专用部署文件和教程：

- `docker-compose.nas.yml`
- `docs/NAS_QUICK_DEPLOY.md`

NAS compose 使用容器内 `/data` 作为统一数据目录，默认示例挂载到 `/volume1/docker/home-note/data:/data`，真实部署时只需要修改冒号左边的 NAS 本地路径。文档明确不要提交 `.env`、`data/`、数据库、附件、备份、导出、`.nsx`、日志、真实 NAS 地址、账号、密码或 token。

## 2026-07-04 - GHCR 通用 NAS 镜像部署

用户确认需要把项目自动构建成 Docker 镜像推到 GitHub Container Registry，并且该方案同时适合 QNAP 和群晖 NAS。

新增：

- `.github/workflows/docker-ghcr.yml`：main 分支 push 和手动 workflow_dispatch 会构建并推送 `ghcr.io/ddrcpddr/note:latest` 与 `ghcr.io/ddrcpddr/note:${github.sha}`。
- `docker-compose.image.yml`：NAS 图形界面或 compose 可直接使用 GHCR 镜像，不再需要在 NAS 上 build。
- `docs/NAS_IMAGE_DEPLOYMENT.md`：群晖 Container Manager 与 QNAP Container Station 通用部署说明。
- `tests/ghcr-deployment.test.js`：静态测试覆盖 workflow、image compose 和部署文档。

注意：首次 GHCR package 生成后，用户需要在 GitHub Packages 页面把镜像设为 public，或者在 NAS 上配置 GHCR 登录。推荐 public，因为镜像不包含 data/、数据库、附件、备份、导出、.nsx、.env、真实 NAS 地址或密码。

## 2026-07-04 - GHCR 镜像与 APK 文件选择器补救

用户反馈 NAS/发布镜像与基础 APK 出现关键功能不一致：APK 无法选择 .nsx，并担心 GHCR 镜像不能保存新笔记或导入 .nsx。

本轮先停止猜测，直接验证发布镜像：

- 本机拉取并运行 ghcr.io/ddrcpddr/note:latest，digest 为 sha256:323fb57d799d083c4034eec37e8af36a077f32fd9535d7c79276c6bd5a4adcaa。
- 临时容器 
ote-ghcr-check 使用空 /data 在 127.0.0.1:3311 启动。
- 直接 HTTP 验证通过：/api/health、新建富文本记录保存、详情读取、.nsx dry-run、.nsx commit、Note Station 图片附件内联到富文本 HTML。
- 结论：GHCR 当前 latest 在新容器中功能可用；NAS 上如果仍失败，优先检查是否拉到旧镜像、容器未重建、浏览器/Service Worker 缓存旧前端，或挂载目录权限/旧数据状态。

已补强防回归：

- Android WebView 新增 WebChromeClient.onShowFileChooser，支持 .nsx/附件/图片文件选择，解决 APK 内 <input type=file> 不弹出选择器的问题。
- /api/health 新增 build 信息：NOTE_BUILD_COMMIT、NOTE_BUILD_TIME。
- GHCR workflow 向 Docker build 注入 GIT_COMMIT 和 BUILD_TIME，后续可用 health 接口确认 NAS 跑的镜像版本。
- 
pm.cmd run smoke 增加真实写入检查：创建新笔记、读取新笔记详情、上传 .nsx fixture、dry-run、commit、确认导入图片附件进入富文本。
- 新增/更新测试覆盖 Android 文件选择器、GHCR build args、增强 HTTP smoke。

重要经验：以后交付 Docker 镜像或 APK 前，不能只看 build/health/list；必须跑“保存新笔记 + .nsx 导入 + 富文本附件内联 + APK 文件选择器”的端到端检查。

## 2026-07-04 19:20:59 +08:00 - Docker UI regression lesson

- A GHCR Docker image can pass API smoke while the browser UI still fails. The concrete failure was quick-note save aborting because IndexedDB tried to store lucide/React icon component values from normalized category/note data.
- Best practice now: before claiming Docker/APK delivery works, run the actual built image locally and use Playwright/Chromium to click the UI flows, especially new note save and Note Station .nsx web import.
- Fixed by sanitizing all IndexedDB writes through 	oIndexedDbSafeValue() in src/client/offlineStore.js; it strips functions, symbols, undefined values, and circular references before put().
- Verified local fixed Docker on http://127.0.0.1:3315: UI quick-save persisted, UI NSX import parsed/committed, imported rich text contained inline attachment refs, and full HTTP smoke passed.

## 2026-07-04 19:30:53 +08:00 - Published GHCR image verified after UI-save fix

- Pushed Fix: serialize offline cache data for UI saves and GitHub Actions built GHCR image from commit cb67794f68853b65c6dc63b2fe20d72ce96d2ebc.
- Pulled that published image back locally and tested the real browser UI on http://127.0.0.1:3316.
- Confirmed quick note save works, Note Station .nsx file selection/import works, and imported NSX rich text contains inline attachment refs instead of only separate attachments.
- Full HTTP smoke also passed against the published GHCR image.

## 2026-07-04 - Huawei P30 Pro / HarmonyOS APK 富文本编辑白屏防护

用户反馈同一服务在浏览器可用、vivo X300 Pro APK 可用，但 Huawei P30 Pro（基于安卓的鸿蒙系统）在 APK 内点击编辑会白屏。以后处理 APK 问题不能用 Chrome 浏览器结果替代 WebView 结果，也不能只测一台新 Android 机型。

本轮处理：

- Vite 生产构建目标降到 chrome80 / safari13，减少老 WebView 现代 JS 兼容风险。
- 富文本编辑器新增 ErrorBoundary 和纯文本 fallback，Tiptap 在旧 WebView 崩溃时避免整页白屏。
- Android WebView 新增 console/error/unhandledrejection 捕获，通过 Toast 显示页面脚本异常。
- Android WebView 新增 renderer gone 恢复处理、textZoom=100、file/content access、mixed content compatibility。
- npm.cmd run check / test / build / android:build 均通过；debug APK 重新生成。

重要经验：APK 交付前至少要覆盖“服务器地址设置、打开首页、打开详情、进入编辑、保存富文本、选择 .nsx、导入预览/提交”。遇到 Huawei/HarmonyOS 这类 WebView 差异时，先加错误上报和降级路径，再让用户真机复验。

## 2026-07-04 - Huawei P30 Pro WebView findLast 兼容修复

用户在 Huawei P30 Pro / HarmonyOS APK 内看到 Toast：TypeError: n.findLast is not a function。根因不是业务 API，也不是 Docker 数据问题，而是 Tiptap 打包产物使用 Array.prototype.findLast，旧 Android WebView 缺这个现代内置 API。Vite target 不会自动 polyfill 内置 API。

本轮修复：

- 新增 src/client/webviewCompat.js，为旧 WebView 补 Array.prototype.findLast 和 Array.prototype.findLastIndex。
- src/client/main.jsx 首行引入兼容文件，确保 Tiptap 编辑器运行前 polyfill 已注册。
- 新增前端静态回归测试，避免入口被移除。
- 
pm.cmd run check / 
pm.cmd run test / 
pm.cmd run build / 
pm.cmd run android:build 均通过。
- 本地 Docker 镜像 
ote:findlast-polyfill-test 构建通过；临时容器 HTTP smoke 通过；实际返回的 JS bundle 确认 polyfill 位于 .findLast( 使用之前。

重要经验：APK WebView 白屏时要看 Toast/console 里的具体 JS API；对旧 Android/HarmonyOS，不能只靠 Vite target，要检查最终 bundle 是否包含必要 polyfill。由于 APK 加载 NAS/Docker 提供的前端 bundle，所以修复前端兼容问题后必须同时更新 Docker/GHCR 镜像，单独换 APK 不够。

补充验证：提交 574e4f5 推送后，GitHub Actions 28709499108 成功发布 GHCR latest。已拉取 ghcr.io/ddrcpddr/note:latest，health commit 为 574e4f5c8f2309d9e88d2e6b0d72dd8f49ee1678，临时容器 HTTP smoke 通过，并确认发布镜像实际返回的 JS bundle 包含 indLast/findLastIndex polyfill 且位于 Tiptap .findLast( 使用之前。

## 2026-07-05 - APK 图标与 Docker 时区修复

用户反馈 Android APK 没有应用图标，Docker 容器时间比北京时间少 8 小时。根因是 AndroidManifest 未声明 launcher icon，Android 资源目录也没有应用图标；Dockerfile 和 compose 未设置 `TZ`，容器默认使用 UTC。

本轮处理：

- 复用已有 `design/image-assets/v1/runtime/pwa/app-icon-192.png`，作为 Android `drawable/app_icon.png`。
- `AndroidManifest.xml` 增加 `android:icon="@drawable/app_icon"`。
- Dockerfile 默认设置 `TZ=Asia/Shanghai`。
- `docker-compose.yml`、`docker-compose.image.yml`、`docker-compose.nas.yml` 增加 `TZ: "${TZ:-Asia/Shanghai}"`，NAS 部署时仍可覆盖。
- NAS 部署文档补充 `TZ=Asia/Shanghai`。
- 新增 Android 图标和 Docker 时区配置回归测试。

验证：

- `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`、`npm.cmd run android:build` 均通过。
- APK 包内确认存在 `res/drawable/app_icon.png`。
- 本地 Docker 镜像中 `2026-07-05T01:00:00Z` 显示为 `09:00 GMT+0800`。
- 临时 Docker 容器 HTTP smoke 通过，新建、NSX import、备份、JSON 导出均 ok。

经验：APK 交付要检查最终 APK 包内容；Docker 时间问题要在镜像内直接验证 `new Date()`，不能只看宿主机时间。

补充验证：提交 bbf865e 推送后，GitHub Actions 28733171626 成功发布 GHCR latest。已拉取 `ghcr.io/ddrcpddr/note:latest`，health commit 为 `bbf865e7999d1e4a3205651e8c0be074613405b2`，镜像 digest 为 `sha256:b3726bd0379748acb7b79ddb4befb4fedf396dd9be018340ad9edd1c6fa2b8a9`。临时容器中 `TZ=Asia/Shanghai`，UTC 01:00 显示为北京时间 09:00；HTTP smoke 通过，新建、NSX import、备份、JSON 导出均 ok。

## 2026-07-05 - 新建记录时间偏移修复

用户反馈使用新 GHCR 镜像和 APK 新建记录时，页面显示时间比预期多 8 小时。复现后确认：上一轮只验证了容器 `TZ`，没有验证“新建记录 -> SQLite -> API -> 前端格式化”的完整链路。

根因：`notes` 新建和更新仍依赖 SQLite `CURRENT_TIMESTAMP`，该值是 UTC 裸字符串，例如 `2026-07-05 09:34:48`，没有 `Z` 或时区偏移。不同浏览器/WebView 对这种字符串解析不一致，可能把它当 UTC 再转本地，导致显示加 8 小时。

本轮修复：

- 新建记录时由服务端写入 `new Date().toISOString()` 到 `occurred_at`、`created_at`、`updated_at`。
- 编辑、归档、删除、批量分类时的 `updated_at` 也改为服务端 ISO 时间。
- 前端新增 `parseAppDate()`，把旧 SQLite 裸时间统一按 UTC 归一化，避免 WebView 自行猜时区。
- 新增 API 和前端静态回归测试。

验证：`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`、`npm.cmd run android:build` 均通过。本地 Docker 镜像 `note:time-fix-test` 实测：主机/容器北京时间 `17:50`，新建记录 API 返回 `2026-07-05T09:50:24.195Z`，前端按本地时间格式化为 `2026-07-05 17:50`，HTTP smoke 通过。

重要经验：时间问题不能只验证 Docker `date` 或 `TZ`；必须实际新建记录，并同时检查 API 原始 `createdAt` 与前端本地显示结果。

补充验证：提交 54e331d 推送后，GitHub Actions 28736853899 成功发布 GHCR latest。已拉取 `ghcr.io/ddrcpddr/note:latest`，health commit 为 `54e331db08353bfeca0d53630d4bb2e5c3f2c0a6`，镜像 digest 为 `sha256:248d9d1ce43ae3b5ce54e94f677534847d7a2f0373863372c214903efde8db99`。发布镜像实际新建记录验证：本机北京时间 `17:55`，API `createdAt=2026-07-05T09:55:15.346Z`，前端本地格式化为 `2026-07-05 17:55`；HTTP smoke 通过。

## 2026-07-06 - Android 正式离线 APK 壳

用户明确要求：手机端不能因为 Docker/NAS 服务不可达就完全不能用；家里目标设备包括较旧的 Huawei P30 Pro / HarmonyOS 安卓兼容环境，以及较新的 vivo X300 Pro。以后 APK 交付必须同时考虑旧 WebView 兼容和新 Android 体验。

本轮完成：

- Android APK 不再只是远程 WebView 壳，打包脚本每次都会先运行前端构建，并把 `dist/` 放进 APK `assets/www/`。
- Android WebView 增加本地入口 `file:///android_asset/www/index.html`，服务器不可达时自动进入离线模式。
- 首次没有配置服务器地址时，设置页新增“离线使用”，可先进入本地页面记事。
- 前端新增 `apiUrl()` 和 Android bridge 读取服务器地址；在 `file://` APK 本地壳下，API 调用会指向用户配置的 Docker/NAS 地址。
- Vite 改为相对资源路径 `base: './'`，确保 APK 内置 HTML 能加载 JS/CSS/图片。
- file:// 本地壳跳过 Service Worker 注册，避免旧 WebView / 本地协议异常；浏览器/PWA 仍正常注册 `/sw.js`。
- Android WebView 保留 Huawei/HarmonyOS 兼容防护：findLast polyfill、编辑器 fallback、脚本异常 Toast、renderer gone 恢复、文件选择器。

验证：

- `node --test tests/android-wrapper.test.js tests/frontend-ui.test.js tests/pwa-config.test.js`：通过，24 tests。
- `npm.cmd run check`：通过，SQLite integrity ok。
- `npm.cmd run test`：通过，73 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 已生成并签名。
- APK 包内容确认包含 `assets/www/index.html`、前端 JS/CSS、runtime 插画、PWA 图标和 `classes.dex`。

边界：

- 当前离线 APK 使用 WebView IndexedDB 本地优先能力，不引入 Android 原生 SQLite / Room。
- 首次完全离线时只能使用本地默认分类、成员和本机新建记录；已有 NAS 记录需要至少在线同步过一次后才会成为本机快照。
- 图片/大附件长期离线 Blob 持久化和复杂冲突合并仍是后续增强，不在本轮完成。

## 2026-07-06 11:11:44 +08:00 - Android 离线 APK assets 路径修复

用户在 vivo X300 Pro 上反馈“离线使用”无法进入。复查 APK 包内容后确认上一轮验收只检查了 assets 文件存在，没有检查 Android WebView 实际可读的 zip entry 路径。

根因：`scripts/build-android-debug.js` 使用 `aapt2 link -A <assets>` 在 Windows 上把前端资源打成 `assets/www\index.html`、`assets/www\assets\*.js` 这种反斜杠路径；Android `file:///android_asset/www/index.html` 需要的是 `assets/www/index.html`。这会导致部分设备离线入口打不开。

修复：打包脚本不再用 `aapt2 -A` 添加前端 assets，改为先 `aapt2 link` 生成 APK，再用 JDK `jar uf -C <staged main> assets` 追加 assets。脚本新增 `assertAndroidAssets()`，构建时强制检查 APK 内存在 `assets/www/index.html`，且任何 `assets/` 条目都不能包含 Windows 反斜杠。以后 APK 验收不能只看“包含文件”，必须检查 zip entry 路径格式。

验证：`node --test tests/android-wrapper.test.js`、`npm.cmd run android:build`、`jar tf android/app/build/outputs/apk/debug/app-debug.apk`、`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 均通过。最终 APK 包内已确认是 `assets/www/index.html` 和 `assets/www/assets/...` 正斜杠路径，且无反斜杠 asset 条目。

## 2026-07-06 Gate 1：离线 Android 启动修复

- 当前开发方式收敛为家庭自用小阶段推进，不再按 RC / 大项目发布流程绕圈。
- 本轮目标是先修复离线 APK 未配置服务器时的脚本异常：`Fetch API cannot load file:///api/access/status`。
- 根因确认：`file://` WebView 页面没有服务器地址时仍用 `/api/...` 发请求，Android 会解析成 `file:///api/...`。
- 已新增 `canUseRemoteApi()` 和 `fetchApi()`，纯离线 Android 模式下不再发起远程 API 请求，而是进入本地 IndexedDB 快照 / 本地空库逻辑。
- 已把前端业务 API 调用统一改成 `fetchApi(...)`，并新增静态回归测试防止旧写法回归。
- 已验证：定向测试 25 项通过，`npm.cmd run check` 通过，`npm.cmd run test` 74 项通过，`npm.cmd run build` 通过，`npm.cmd run android:build` 通过。
- 生产构建检查确认：`dist/assets/index-n4InEOVD.js` 包含离线 guard，不包含 `file:///api`，不包含旧的 `fetch(apiUrl('/api/access/status'))`。
- 新 APK 输出路径：`android/app/build/outputs/apk/debug/app-debug.apk`。仍需在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上人工安装确认。
- 下一阶段 Gate 2：离线日常记录完整性，重点是新建、编辑、富文本、分类、标签、图片/附件在本机长期保存；Gate 3 再处理恢复联网同步到 Docker/NAS。

## 2026-07-06 Gate 2 第一刀：离线队列改为 IndexedDB

- 已继续按家庭自用小 Gate 推进，不引入大项目流程。
- 发现并修正一个长期离线风险：前端仍保留旧 `localStorage` 创建队列，富文本图片 / 附件长期离线时容易超容量，也和 IndexedDB syncQueue 形成两套队列。
- 已移除旧 localStorage 创建队列路径：`OFFLINE_CREATE_QUEUE_KEY`、`readOfflineCreateQueue()`、`writeOfflineCreateQueue()`、`syncOfflineCreateQueue()`、`enqueueOfflineCreate()`。
- 新建和编辑统一通过 `saveLocalFirstDraft()` 写入 IndexedDB notes，并写入 IndexedDB syncQueue；恢复在线后通过 `readPendingMutations()` 同步到 Docker/NAS。
- 本轮曾误删 `saveLocalFirstDraft()`，被定向测试挡住并已恢复。以后改离线逻辑时必须先跑 `node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js`，不要跳过。
- 已验证：定向测试 25 项通过，`npm.cmd run check` 通过，`npm.cmd run test` 74 项通过，`npm.cmd run build` 通过，`npm.cmd run android:build` 通过。
- 新 APK 输出路径仍是：`android/app/build/outputs/apk/debug/app-debug.apk`。
- 下一步继续 Gate 2：真机验证离线富文本、图片、附件、编辑和 App 重启持久化；再进入 Gate 3 恢复联网同步。

## 2026-07-06 Gate 2 第二刀：离线快照持久化

- 已将本地快照保存从“在线 sqlite 模式才写”调整为“除访问口令锁定外都写 IndexedDB snapshot”。
- 这样离线模式下的新建 / 编辑记录、分类和成员状态会进入本地快照，减少重启 APK 后丢本地状态的风险。
- 在线模式仍保留 localStorage app-data cache 作为旧兼容 fallback，但真正的长期离线主路径是 IndexedDB。
- 已验证：定向测试 25 项通过，`npm.cmd run check` 通过，`npm.cmd run test` 74 项通过，`npm.cmd run build` 通过，`npm.cmd run android:build` 通过。
- 新 APK 输出路径：`android/app/build/outputs/apk/debug/app-debug.apk`。
- 下一步：真机安装验证 Gate 2，包括离线新建、离线编辑、富文本、小图片/小附件、重启 App 后仍可查看；之后再做 Gate 3 恢复联网同步。


## 2026-07-06 Gate 3 第一刀：恢复联网同步触发与队列压缩

用户再次强调：这是家庭自用工具，不要按大项目流程推进，最终要交付经过测试、少量 bug 或无关键 bug、可离线使用的 Android App。本轮继续按小 Gate 推进离线 APK。

已完成：

- 修复离线新建后又离线编辑的同步队列风险：如果 syncQueue 中已经有同一条 local-* 记录的 pending create，后续 update 会合并回这条 create，只保留最新 payload，避免恢复联网时用 local-* ID PATCH 服务端。
- 首页“本机记录待同步”提示新增“尝试同步”按钮，恢复 Docker/NAS 后用户可以直接手动触发重新连接和同步。
- WebView / 浏览器 online 事件触发时，如果存在待同步记录，也会尝试重新连接。
- 新增静态回归测试，避免队列压缩和手动同步入口被误删。

验证：

- node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js：通过，26 tests。
- npm.cmd run check：通过，integrityCheck=ok，categoryCount=11，noteCount=188。
- npm.cmd run test：通过，75 tests。
- npm.cmd run build：通过。
- npm.cmd run android:build：通过，APK 输出 android/app/build/outputs/apk/debug/app-debug.apk。

经验：恢复联网同步不能只测“新建后立刻同步”，还要测“离线新建 -> 离线编辑 -> 重启 -> 恢复联网 -> 只同步最后版本”。以后交付 APK 前必须把这个流程列入真机验收。

## 2026-07-06 Gate 4 第一刀：同步失败状态和真正重试

继续按家庭自用小 Gate 推进离线 Android。复查上一轮发现一个重要细节：如果 App 已经处于在线 sqlite 模式，但 syncQueue 中有 failed mutation，首页“尝试同步”按钮不应只刷新服务端数据，而必须直接重跑本机待同步队列。

本轮完成：

- `retryRemoteConnection()` 在线模式下检测到待同步记录时，直接调用 `syncPendingLocalMutations()`。
- 首页待同步提示区分失败状态：有 failed mutation 时显示“有 X 条同步失败，可重试”，按钮显示“重试同步”。
- 同步失败会 toast 提示“同步暂时失败，可稍后重试”；部分成功则提示还有记录待重试。
- 前端静态测试覆盖：直接重跑 sync、failed 计数、失败文案和重试按钮。

验证：

- node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js：通过，26 tests。
- npm.cmd run check：通过，integrityCheck=ok，categoryCount=11，noteCount=188。
- npm.cmd run test：通过，75 tests。
- npm.cmd run build：通过。
- npm.cmd run android:build：通过，APK 输出 android/app/build/outputs/apk/debug/app-debug.apk。

经验：同步按钮必须证明“会触发同步函数”，不能只证明“按钮存在”。以后处理 APK / Docker 交付，凡是用户可点击的修复点都要验证点击后的真实动作。

## 2026-07-06 Gate 5 第一刀：离线编辑冲突保护

继续按家庭自用小 Gate 推进离线 Android。本轮只处理一个风险：手机离线编辑一条已经存在于 Docker/NAS 的记录，恢复联网时如果服务端记录已经被其他设备改过，不能静默覆盖。

已完成：

- 前端编辑已有服务端记录时，会把编辑前的 `updatedAt` 作为 `baseUpdatedAt` 放入 IndexedDB 同步队列。
- 服务端 `PATCH /api/notes/:id` 收到 `baseUpdatedAt` 后，如果当前记录 `updatedAt` 已变化，返回 `409` 和 `note_conflict`，保留服务端现有记录。
- 前端同步失败时会记录失败原因，继续保留本机待同步项，用户可以看到失败状态并重试。
- 新增 API 回归测试，覆盖“服务端先更新 -> 离线旧版本再同步 -> 返回冲突，不覆盖服务端内容”。
- 新增前端静态测试，确认离线编辑队列包含 `baseUpdatedAt` / `updatedAtRaw`。

验证：

- `node --test tests/mvp-api.test.js tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js`：通过，49 tests。
- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=188`。
- `npm.cmd run test`：通过，76 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 输出 `android/app/build/outputs/apk/debug/app-debug.apk`。

仍需注意：

- 当前是基础冲突保护，不是完整的“自动合并”。发生冲突时先防止覆盖，后续再做更友好的冲突查看 / 选择保留哪版。
- 仍需在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上做真机验收。

## 2026-07-06 Gate 6 第一刀：离线富文本图片 / 附件边界保护

继续按家庭自用小 Gate 推进离线 Android。本轮只处理富文本编辑器里的图片和附件离线边界，避免出现“看起来插入成功，但恢复联网同步时因为文件太大失败”的假成功。

已完成：

- 富文本图片插入前会尝试压缩：目标最大边约 1600px，JPEG 质量 0.82。
- 原始图片超过 12MB 会直接提示，不进入正文。
- 压缩后仍超过离线同步安全大小，或压缩失败且原图过大，会提示用户换较小图片。
- 普通附件单个超过 8MB 会提示，不进入正文。
- 编辑器内新增轻量提示区域，文件处理失败时直接告诉用户原因。
- 新增前端静态回归测试，锁定图片压缩、附件大小限制和编辑器提示入口。

验证：

- `node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js`：通过，27 tests。
- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=188`。
- `npm.cmd run test`：通过，77 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 输出 `android/app/build/outputs/apk/debug/app-debug.apk`。

仍需注意：

- 当前目标是让家庭日常小图片 / 小附件离线可用；超大附件 Blob 完整长期离线同步仍未完成。
- 真机上需要重点验收：插入手机照片、插入小附件、重启 App 后仍可查看、恢复联网后能同步到 Docker/NAS。

## 2026-07-06 Gate 7 第一刀：本机 HTTP 真实烟测

继续按家庭自用小 Gate 推进。本轮不新增功能，目标是验证构建产物启动后的真实 HTTP 服务仍然可用，避免只通过单元测试却交付一个 API 不通的版本。

执行方式：

- 使用 `PORT=3400 npm.cmd run server` 启动本机 Express 服务，避免占用用户正在测试的 3300。
- 执行 `npm.cmd run smoke -- --base-url http://127.0.0.1:3400`。
- 烟测结束后关闭 3400 临时服务。

烟测结果：

- `/api/health` 通过。
- `/api/app-data` 通过，成员 2 个、分类 11 个。
- 笔记列表、详情、搜索、分类筛选、成员筛选通过。
- 新建记录和详情读取通过。
- 网页端 Note Station `.nsx` 上传预览/确认导入通过，并验证富文本内联附件引用数为 2。
- 存储目录探测、手动备份、JSON 导出通过。
- 前端 shell 返回 200。

注意：

- 烟测会在本地 `data/` 下生成测试记录、备份和导出文件，这些都是 ignored 运行数据，不提交。
- Gate 7 证明的是 Docker/NAS 服务端 HTTP 主流程可用；离线 APK 真机同步仍需要用户在两台手机上继续人工验证。

## 2026-07-06 Gate 8：Android APK 交付说明收口

已新增 `docs/ANDROID_APK_HANDOFF.md`，把当前 APK 的路径、已验证命令、已具备能力、真机验收流程和当前不承诺的边界集中到一个文档。

本轮不新增功能，目的是避免以后再把“没测过的半成品”当成可交付 APK。后续每次给用户 APK 前，都应同步更新该文档，并明确真机是否已经测过。

## 2026-07-06 Gate 9：APK 离线 bundle 验证命令

继续收紧“交付前必须自己先测”的规则。本轮新增：

- `scripts/verify-android-debug-apk.js`
- `npm.cmd run android:verify`

该命令直接检查已构建 APK，而不是只检查源码：

- APK 内必须有 `assets/www/index.html`、manifest、PWA 图标、`classes.dex`。
- APK asset 条目不能出现 Windows 反斜杠。
- `index.html` 必须使用 `./assets/...` 相对路径。
- 构建后 JS 不能含 `file:///api`、旧 access/status fetch 或裸 `/api` fetch。
- 构建后 JS 必须含 Android bridge、IndexedDB 离线库、待同步状态、冲突基线等标记。

验证：

- `npm.cmd run android:verify`：通过。
- `node --test tests/android-wrapper.test.js tests/frontend-ui.test.js tests/offline-store-static.test.js`：通过，28 tests。
- `npm.cmd run check`：通过，`integrityCheck=ok`。
- `npm.cmd run test`：通过，78 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。

以后给 APK 前必须包含 `android:verify`，不能只说“build 过了”。

## 2026-07-06 Gate 10：离线 IndexedDB 行为回归测试

继续按家庭自用小 Gate 推进。本轮不新增功能，重点是把离线 APK 最核心的本地数据链路纳入自动化测试，避免以后只靠字符串检查或 APK 包结构检查。

新增：

- `tests/offline-store-behavior.test.js`
- 一个轻量内存版 IndexedDB fake，不引入新依赖。

覆盖的真实行为：

- `saveLocalSnapshot()` / `readLocalSnapshot()` 可以保存并恢复离线记录、分类、成员、标签和当前成员。
- 离线新建 `local-*` 记录后继续离线编辑，会把 update 合并回同一条 pending create，只同步最终版本。
- 同步失败项会保留为 `failed`，可继续显示给用户重试；同步成功后会从队列删除。
- 写入 IndexedDB 前会清理函数、循环引用等不可结构化克隆的值，降低旧 WebView / IndexedDB 写入失败风险。

经验：

- 离线能力不能只用静态搜索证明；至少要有函数级行为测试覆盖本地快照、队列压缩、失败重试和写入安全。
- 该测试不能替代 vivo X300 Pro / Huawei P30 Pro 真机测试，但能防止核心 IndexedDB 逻辑在源码层面回归。

## 2026-07-06 Gate 11：Android 交付一键自检

继续收紧“给 APK 前自己先测”的规则。本轮新增：

- `scripts/android-delivery-check.js`
- `npm.cmd run android:delivery-check`

该命令会一次性执行：

- `npm.cmd run check`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run android:build`
- `npm.cmd run android:verify`
- 启动临时 `http://127.0.0.1:3400` 服务并执行 `npm.cmd run smoke -- --base-url http://127.0.0.1:3400`

实现细节：

- 临时服务直接用 `node src/server/index.js` 启动，避免通过 `npm run server` 包一层后 Windows 上退出不干净。
- 自检输出 APK 路径、APK 大小、smoke 地址和每一步结果。
- 当前验证通过，测试总数为 83，APK 大小约 518079 bytes。

经验：

- 以后交付 APK 前优先跑 `npm.cmd run android:delivery-check`，不要零散手动跑几条命令后凭印象判断。
- 该命令仍不能替代两台真实手机验收；它证明的是本机代码、服务端 HTTP 主流程、APK 打包内容和离线运行时标记没有明显回归。

## 2026-07-06 Gate 12：Android 真机日志烟测命令

继续补交付前检查，新增：

- `scripts/android-device-smoke.js`
- `npm.cmd run android:device-smoke`

用途：

- 用 ADB 安装当前 debug APK 到一台真实手机。
- 启动 `com.homeoldnote.app/.MainActivity`。
- 抓取 `logcat`，筛选 WebView / AndroidRuntime / HomeNoteAndroid 相关日志。
- 如果出现 `FATAL EXCEPTION`、`页面脚本异常`、`TypeError`、`ReferenceError`、`Uncaught` 等关键错误，命令失败。

安全：

- 真机日志写入 `output/android-device-smoke/`。
- `.gitignore` 已忽略 `output/`，避免日志进入 Git。

经验：

- `android:delivery-check` 证明本机自动化和 APK 包结构；`android:device-smoke` 才能发现一部分真实手机 WebView 启动 / 脚本错误。
- 这仍不能替代用户在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上人工走完整流程。
