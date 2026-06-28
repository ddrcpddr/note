# note

本地自用的家庭生活记录工具，目标是替代 Synology Note Station，重点服务手机端快速记录、后期检索、分类整理、历史数据导入和本地备份。

## 技术栈

- 前端：React + Vite
- 后端：Express
- 数据库：SQLite，数据库文件固定放在 `data/app.db`
- 附件：本地文件夹，默认放在 `data/attachments/`
- 导入文件：默认放在 `data/imports/`
- 备份文件：默认放在 `data/backups/`

## 本地运行

```bash
npm install
npm run dev
```

默认地址：

- 前端：http://localhost:5173
- 后端健康检查：http://localhost:3300/api/health

如果在 Windows PowerShell 里遇到 `npm.ps1` 执行策略提示，可以使用：

```bash
npm.cmd install
npm.cmd run dev
```

## 数据备份

MVP 阶段的数据会集中放在 `data/` 目录下：

```text
data/
  app.db
  attachments/
  imports/
  backups/
```

备份时优先整体复制 `data/` 目录。后续会增加 JSON 导出和 Markdown 导出。

## 文档

- [产品需求文档](docs/PRD.md)
- [项目聊天记忆](docs/PROJECT_MEMORY.md)
