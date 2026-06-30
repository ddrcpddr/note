# 备份与回滚演练

本文件用于家庭 NAS / Docker 试运行前后确认“出问题能回退”。当前项目以 SQLite 数据库和附件目录为核心；数据库损坏已经真实发生过，因此试运行前必须先备份，恢复时必须先 dry-run。

## 0. 强制原则

- 试运行前必须手动备份 `data/database/app.db`。
- 试运行前必须备份 `data/attachments/`，尤其是已经导入或上传过附件时。
- 恢复前必须停止 Node / Docker，避免同一个 SQLite 文件被继续读写。
- `npm.cmd run restore-db` 默认只做 dry-run，不替换正式数据库。
- 只有追加 `--confirm` 才真正恢复。
- 不恢复 `integrity_check` 未通过的备份。
- Docker / NAS 试运行前后都应保留数据目录快照。
- 不要提交数据库、备份、附件、导出、`.nsx` 或真实导入内容到 GitHub。

## 1. 试运行前手动备份 app.db

### 在应用设置页备份

1. 打开设置页。
2. 点击“立即备份”。
3. 成功后到备份目录确认新文件。

默认备份目录：

```text
data/backups/
```

Docker / NAS 容器内目录：

```text
/data/backups/
```

### 直接复制数据库文件

先停止服务，再复制正式库：

```powershell
Copy-Item .\data\database\app.db .\data\backups\app-before-trial-YYYYMMDD-HHMMSS.db
```

建议同时记下当前 Git commit：

```bash
git rev-parse --short HEAD
```

## 2. 试运行前备份 attachments

附件目录：

```text
data/attachments/
```

试运行前建议整体复制一份：

```powershell
Copy-Item .\data\attachments .\data\backups\attachments-before-trial-YYYYMMDD-HHMMSS -Recurse
```

NAS 上建议使用 NAS 自带快照或文件夹复制，保留 `attachments/` 与 `database/app.db` 同一时间点的版本。

## 3. 如何确认备份文件存在

检查备份目录是否出现新的 `.db` 文件：

```powershell
Get-ChildItem .\data\backups\*.db | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

在 NAS 上则检查挂载目录对应的 `backups/` 文件夹。恢复用备份必须是完整 SQLite 数据库，不要只凭文件名判断。

## 4. 恢复前必须停止服务

Docker 部署：

```bash
docker compose down
```

本机开发模式：

- 停止 `npm.cmd run dev`
- 停止 `npm.cmd run server`
- 确认没有当前项目的 Node 服务继续占用 `data/database/app.db`

不要删除任何数据库文件；恢复工具会在 `--confirm` 时自动保存恢复前副本。

## 5. 使用 restore-db dry-run 预检备份

先 dry-run，确认备份存在且 SQLite `PRAGMA integrity_check` 通过：

```bash
npm.cmd run restore-db -- --backup data/backups/app-before-trial-YYYYMMDD-HHMMSS.db
```

dry-run 预期结果：

- `ok: true`
- `dryRun: true`
- `restored: false`
- 不替换 `data/database/app.db`

如果 dry-run 失败，立即停止。不要追加 `--confirm`，也不要手工覆盖正式数据库。

## 6. 确认恢复 app.db

只有 dry-run `ok=true` 后，才执行确认恢复：

```bash
npm.cmd run restore-db -- --backup data/backups/app-before-trial-YYYYMMDD-HHMMSS.db --confirm
```

确认恢复会自动完成：

1. 再次检查备份 `integrity_check`。
2. 将当前正式库复制到：

```text
data/backups/app-before-restore-<timestamp>.db
```

3. 用指定健康备份替换 `data/database/app.db`。
4. 对恢复后的正式库再执行完整性检查。

这比手工 `Copy-Item -Force` 更安全。除非恢复脚本不可用，否则优先使用 `restore-db`。

## 7. 恢复后确认成功

恢复后必须运行：

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

成功标准：

- `npm.cmd run check` 输出 `integrityCheck: "ok"`。
- 记录数符合所选备份的预期。
- `npm.cmd run test` 通过。
- `npm.cmd run build` 通过。

如果使用 Docker / NAS，还要重新启动并 smoke：

```bash
docker compose build
docker compose up -d
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

关键 API 不能返回 500：

- `/api/health`
- `/api/app-data`
- `/api/notes?limit=3`
- `/api/categories`

## 8. 如何避免重复导入 Note Station

- 正式导入前先备份 `app.db` 和 `attachments/`。
- 不要重复执行正式导入命令，除非已确认恢复到了导入前备份。
- 导入后先在首页、搜索和分类页确认记录是否已存在。
- 如果误重复导入，优先停止服务，恢复导入前 `app.db` 和附件快照，而不是手工删除大量记录。
- 其他 Note Station 导出变体必须先 dry-run，不硬猜格式。

## 9. 正式试运行前应该保存哪些文件

至少保存：

- `data/database/app.db`
- `data/attachments/`
- `data/backups/` 中最近一次健康备份
- `data/exports/` 中最近一次 JSON 或 Markdown 导出
- 当前 Git commit 号

不要把这些真实数据提交到 GitHub。

## 10. NAS 上应该如何保留快照

建议在 NAS 上为数据根目录做快照：

```text
note-data/
  database/
  attachments/
  backups/
  exports/
  imports/
```

推荐策略：

- 真实手机试运行前手动快照一次。
- 每次正式导入或大批量整理前快照一次。
- 每次试运行反馈修复并确认稳定后快照一次。
- 至少保留最近 3-5 个快照。
- 确认快照不会公开同步到外网。

## 11. 出问题时如何回退到试运行前状态

1. 停止服务或容器。
2. 对目标备份执行 `restore-db` dry-run。
3. dry-run 通过后执行 `restore-db --confirm`。
4. 恢复试运行前 `attachments/` 快照。
5. 重新启动服务。
6. 运行 `npm.cmd run check`。
7. Docker / NAS 场景运行 HTTP smoke。
8. 打开首页、搜索、设置页确认功能恢复。
9. 如仍异常，保留当前错误现场，不要继续导入或大量编辑，先记录现象再修复。

## 12. 已有自动化覆盖

`tests/database-restore.test.js` 已覆盖：

- 健康备份 dry-run 不替换当前正式库。
- `--confirm` 才恢复，并保留恢复前数据库副本。
- 非数据库 / 损坏备份会在恢复前被拒绝。

`src/server/scripts/check.js` 已在读取统计前执行 SQLite `PRAGMA integrity_check`，用于防止损坏库被误判为可试运行。
