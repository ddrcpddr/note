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
- 导入记录默认归属到执行导入的成员，或归属到“历史导入”系统成员。

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
  - 首页成员筛选：全部成员、爸爸、妈妈、历史导入。
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
