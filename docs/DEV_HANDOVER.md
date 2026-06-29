# 开发交接文档

## 项目定位

`note` 是一个家庭 NAS 上自用的多人家庭生活记录系统，用来替代 Synology Note Station。

重点是：

- 手机端优先
- 家庭生活时间线
- 多成员记录
- SQLite 本地持久化
- NAS 数据目录集中备份
- Note Station 历史记录导入准备

## 视觉约束

V1 是唯一视觉参考。

只参考 `design/home-records-prototype/` 下 7 张页面图：

- `page-1-home-selected.png`
- `page-2-new-record.png`
- `page-3-record-detail.png`
- `page-4-search.png`
- `page-5-categories.png`
- `page-6-import-note-station.png`
- `page-7-settings-backup.png`

不要使用 V2。
不要调用 Product Design。
不要生成新的 PNG。
不要把界面改成后台管理系统。

## 技术栈

- React + Vite
- Tailwind CSS
- Express
- SQLite via Node `node:sqlite`
- Docker / Docker Compose 准备

## 关键目录

```text
src/client/                  前端页面和样式
src/server/                  Express API
src/server/db/               SQLite 初始化和数据目录
src/server/routes/           API 路由
src/server/importers/        Note Station 导入框架
src/shared/                  默认成员、分类、标签和示例记录
tests/                       MVP API 自动化测试
docs/                        产品、部署、QA、交接文档
data/                        本地运行数据，仅保留 .gitkeep
```

## 常用命令

安装：

```bash
npm install
```

Windows PowerShell 可使用：

```powershell
npm.cmd install
```

开发运行：

```bash
npm run dev
```

后端：

```bash
npm run server
```

前端：

```bash
npm run web
```

检查：

```bash
npm run check
```

测试：

```bash
npm run test
```

构建：

```bash
npm run build
```

Docker：

```bash
docker compose up -d --build
```

## 数据目录

默认：

```text
data/
  database/app.db
  attachments/
  backups/
  imports/notestation/
  exports/
```

可通过环境变量修改：

```text
NOTE_DATA_DIR=/your/nas/path/note-data
```

不要提交真实 `data/` 内容。

## 当前真实能力

- SQLite 数据持久化
- 新建记录
- 记录列表和详情
- 搜索与筛选
- 成员切换
- 手动备份数据库
- JSON 全量导出
- Note Station 样例导入
- Note Station 真实 `.nsx` dry-run、sandbox 和正式导入流程
- 导入记录来源信息展示和未分类待整理提示
- PWA manifest 和 runtime 图标
- Docker Compose 配置，容器内数据目录统一为 `/data`

## 当前模拟能力

- NAS 在线 / 离线状态仍是本地模拟
- 新建记录的真实附件上传
- 其他 Note Station 导出变体仍需先 dry-run 验证
- 登录和权限
- 离线同步

## 后续注意事项

- 真实 Note Station 导入必须等用户提供脱敏样例后再实现；当前 `sample-preview/commit` 只代表样例演示流程。
- 不要硬猜导出格式。
- 不要接真实 NAS 地址，除非用户明确提供。
- 不要提交数据库、备份、导出、附件和真实导入文件。
- UI 改动前先确认手机端 390px 左右宽度没有横向溢出。`r`n- 当前自动化测试覆盖成员切换、备份成功/失败、JSON 全量导出、样例导入闭环和真实导入 dry-run。

