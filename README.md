# note

家庭生活记录工具，用来替代 Synology Note Station 的本地 / NAS 部署版本。

它是一个移动端优先的家庭生活记录系统：家人可以通过手机浏览器或 PWA 访问，快速记录家庭事务、维修、购物、账号资料、老人健康、孩子教育、宠物事项和临时备忘。所有数据集中保存在本地 `data/` 目录，后续可整体放到家庭 NAS 上备份和长期保存。

## 当前状态

当前已经是可运行 MVP：

- React + Vite 移动端前端
- Express API
- SQLite 本地数据库
- 默认成员、分类、标签和示例记录初始化
- 首页、详情、新建、编辑、删除 / 归档、搜索、分类、导入、设置页面
- Note Station 真实 `.nsx` dry-run、sandbox、正式导入和导入后未分类整理流程
- 本地模拟 NAS 存储、真实附件上传、可选访问口令、数据库备份、JSON 导出
- 家庭成员切换

当前仍未实现：

- 真实登录
- 复杂权限隔离
- 真实 NAS 连接
- 真实附件上传
- 其他 Synology Note Station 导出变体自动适配

## 安装

```bash
npm install
```

Windows PowerShell 如果遇到执行策略问题，可以使用：

```bash
npm.cmd install
```

## 运行

开发模式：

```bash
npm run dev
```

默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:3300
- 健康检查：http://localhost:3300/api/health

Windows 可使用：

```bash
npm.cmd run dev
```

## 手机添加到桌面

项目已包含基础 PWA 配置和 runtime 图标。部署或本地启动后，在同一局域网手机浏览器中访问前端地址，然后使用浏览器菜单里的“添加到主屏幕”或“安装应用”。

MVP 阶段暂不启用 service worker 或复杂离线同步；手机需要能访问家庭 NAS / 局域网服务才能正常读取和保存数据。

## 构建

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

## 测试

运行 MVP 自动化测试：

```bash
npm run test
```

Windows PowerShell 可使用：

```bash
npm.cmd run test
```

当前测试会临时启动一个独立 Express 服务，并使用临时 `NOTE_DATA_DIR`，不会污染项目下的正式 `data/` 目录。覆盖范围包括读取记录列表、新建记录、读取详情、关键词搜索、分类筛选、成员筛选、标签筛选、成员切换、数据库备份、NAS 离线备份失败、JSON 全量导出、Note Station 样例导入和真实导入 dry-run。

## 初始化数据

第一次启动后端或运行检查脚本时，会自动创建数据库和默认数据。

```bash
npm run check
```

默认数据库：

```text
data/database/app.db
```

默认会初始化：

- 默认家庭成员：我、爱人；当前版本只支持在这两个成员之间切换，改名和新增成员以后再做
- 分类：家庭事务、房屋 / 设备、维修 / 售后、购物 / 消费、证件 / 账号、孩子 / 教育、老人 / 健康、宠物、工作 / 杂事、临时记录、未分类
- 常用标签：待办、重要、维修、购物、账单、发票、保修、NAS、物业、医院
- 3 条示例记录

## 数据目录

默认数据目录：

```text
data/
  database/
    app.db
  attachments/
  backups/
  imports/
    notestation/
  exports/
```

可以通过环境变量修改数据根目录：

```bash
NOTE_DATA_DIR=/your/nas/path/note-data npm run server
```

Windows PowerShell 示例：

```powershell
$env:NOTE_DATA_DIR="X:\note-data"
npm.cmd run server
```

## Docker / NAS 部署准备

项目已提供基础容器配置：

```bash
docker compose up -d --build
```

默认容器端口：

```text
http://localhost:3300
```

`docker-compose.yml` 会把项目下的 `data/` 挂载到容器内 `/data`，并通过 `NOTE_DATA_DIR=/data` 让数据库、附件、备份、导入和导出都集中写入该目录。部署到 NAS 时，把 compose 里的 `./data:/data` 改成 NAS 上的实际目录即可；文档只使用 `/your/nas/path/note-data:/data` 这类占位示例，不写入真实 NAS 地址。

## 备份

设置页可以点击“立即备份”，会把 SQLite 数据库复制到：

```text
data/backups/
```

也可以直接调用 API：

```http
POST /api/storage/backup
```

请求体：

```json
{
  "nasOnline": true
}
```

当 `nasOnline` 为 `false` 时，会模拟 NAS 离线并返回失败提示。

## 导出 JSON

设置页可以点击“导出 JSON”，导出文件会保存到：

```text
data/exports/
```

API：

```http
POST /api/storage/export-json
```

## Note Station 导入

当前真实 `.nsx` 样例已经完成结构分析、dry-run、sandbox 导入和正式导入。导入记录会标记为 `notestation_import`，并在详情页保留来源、原始分类 / 笔记本路径、原始路径和附件元数据。

浏览器里的导入页用于展示安全导入流程和导入状态；正式写入数据库前仍应先 dry-run、确认预览并自动备份正式数据库。

其他 Synology Note Station 导出变体不要硬猜格式，后续必须先 dry-run 验证，再考虑导入。

## 当前可演示流程

1. 切换当前家庭成员
2. 新建记录
3. 查看详情
4. 按分类、成员、标签、关键词搜索
5. 查看已导入的 Note Station 历史记录
6. 手动备份数据库
7. 导出 JSON

## 当前真实功能

- Express API 可运行。
- SQLite 数据库可本地持久化。
- 首页、详情、新建、编辑、搜索、分类、导入、设置页面可访问。
- 新建记录会写入 SQLite，刷新后不丢失；已有记录可从详情页进入编辑，也可以从详情页“更多”里归档或软删除。
- 分类、成员、标签和关键词筛选可用。
- 手动备份会复制 SQLite 数据库到备份目录。
- JSON 导出会写入导出目录，并已用超过 200 条记录的自动化测试确认会导出全量记录。
- Docker / NAS 部署配置已准备，容器内数据目录统一使用 `/data`。
- PWA manifest 和 runtime 图标已准备，可添加到手机桌面。
- Note Station 真实 `.nsx` 已完成 dry-run、sandbox 和正式导入流程；导入后可查看来源信息并在未分类中整理。

## 当前模拟功能

- NAS 在线 / 离线状态仍是模拟，不连接真实 NAS。
- 新建记录支持真实附件上传，附件文件保存到 `data/attachments/`，数据库只保存附件元数据和相对路径。
- Note Station 导入已支持当前真实 `.nsx` 样例；其他 Synology Note Station 导出变体仍需要先 dry-run 验证。
- 家庭成员切换不等于真实登录。
- 私密记录 / 权限隔离只预留字段，暂不启用。
- 复杂离线同步暂不实现。

## 后续需要提供

- 目标 NAS 的部署方式，例如 Docker Compose、群晖 Container Manager，还是普通 Node 服务。
- NAS 上用于挂载 `/data` 的实际目录规划。
- 是否需要简单访问口令；默认成员当前只保留“我 / 爱人”。
- 是否需要外网访问，以及计划使用的内网穿透或反向代理方式。

## 常见问题

### 端口被占用怎么办？

开发模式默认使用：

- 前端：`5173`
- 后端：`3300`

如果端口被占用，可以先关闭占用该端口的旧服务，或临时指定后端端口：

```powershell
$env:PORT="3310"
npm.cmd run server
```

如果只改后端端口，开发前端代理也需要同步调整 `vite.config.js`。

### 数据库什么时候初始化？

第一次启动后端或运行检查命令时会自动初始化：

```bash
npm run check
```

初始化会创建默认成员、分类、标签和示例记录。

### 如何确认当前数据目录？

打开健康接口即可看到：

```text
http://localhost:3300/api/health
```

返回内容里会包含数据库、附件、备份、导入和导出目录。

### 如何重置本地测试数据？

停止服务后删除本地数据库文件：

```text
data/database/app.db
```

然后重新运行：

```bash
npm run check
```

注意：这会清空当前本地记录。真实试用或 NAS 部署时，重置前请先备份 `data/`。

### 为什么 Windows PowerShell 要用 `npm.cmd`？

有些 Windows 环境会禁止执行 `npm.ps1`。遇到执行策略提示时，使用：

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## Git 忽略规则

不会提交到 GitHub 的内容：

- `data/database/app.db`
- `data/backups/*`
- `data/exports/*`
- `data/attachments/*`
- `data/imports/*`

目录通过 `.gitkeep` 保留。

## 文档

- [产品需求](docs/PRD.md)
- [数据模型](docs/DATA_MODEL.md)
- [Note Station 导入](docs/NOTESTATION_IMPORT.md)
- [NAS 部署与备份](docs/NAS_DEPLOYMENT.md)
- [V1 风格指南](docs/V1_STYLE_GUIDE.md)
- [产品设计上下文](docs/PRODUCT_DESIGN_CONTEXT.md)
- [项目记忆](docs/PROJECT_MEMORY.md)
- [当前 QA 报告](docs/QA_REPORT_CURRENT.md)
- [下一步建议](docs/NEXT_STEPS.md)
- [真实 Note Station 导入计划](docs/NOTESTATION_REAL_IMPORT_PLAN.md)

## 后续待办

- 针对其他 Note Station 导出变体继续执行 dry-run 验证和解析适配。
- 完善附件删除、附件替换和更大文件上传体验。
- 验证手机端添加到桌面流程，并补充清晰的离线提示。
- 在真实 NAS / Container Manager 环境验证数据目录权限和手机局域网访问。
- 持续补充导入后整理、成员编辑和其他导入变体的自动化测试。
