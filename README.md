# note

家庭生活记录工具，用来替代 Synology Note Station 的本地 / NAS 部署版本。

它是一个移动端优先的家庭生活记录系统：家人可以通过手机浏览器或 PWA 访问，快速记录家庭事务、维修、购物、账号资料、老人健康、孩子教育、宠物事项和临时备忘。所有数据集中保存在本地 `data/` 目录，后续可整体放到家庭 NAS 上备份和长期保存。

## 当前状态

当前已经是可运行 MVP：

- React + Vite 移动端前端
- Express API
- SQLite 本地数据库
- 默认成员、分类、标签和示例记录初始化
- 首页、详情、新建、搜索、分类、导入、设置页面
- Note Station 样例导入流程
- 本地模拟 NAS 存储、数据库备份、JSON 导出
- 家庭成员切换

当前仍未实现：

- 真实登录
- 复杂权限隔离
- 真实 NAS 连接
- 真实附件上传
- 真实 Synology Note Station 导出文件解析

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

## 构建

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

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

- 家庭成员：爸爸、妈妈、孩子、老人、历史导入
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

当前导入页使用内置样例数据演示流程：

1. 选择样例文件
2. 解析预览
3. 确认导入
4. 导入完成

导入记录会标记为 `notestation_import`，失败项会进入失败列表。

真实 Note Station 导出文件解析需要你后续提供样例文件后再适配。

## 当前可演示流程

1. 切换当前家庭成员
2. 新建记录
3. 查看详情
4. 按分类、成员、标签、关键词搜索
5. 使用 Note Station 样例数据导入历史记录
6. 手动备份数据库
7. 导出 JSON

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

## 后续待办

- 根据真实 Note Station 导出样例实现解析器。
- 实现真实附件上传和附件目录管理。
- 增加 PWA manifest 和离线提示。
- 补充 Docker / NAS 部署脚本。
- 增加更多自动化测试。
