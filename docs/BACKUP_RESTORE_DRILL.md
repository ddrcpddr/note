# 备份与回滚演练

本文件用于家庭 NAS / Docker 试运行前后确认“出问题能回退”。当前项目以 SQLite 数据库和附件目录为核心，试运行前必须先备份。

## 1. 如何手动备份 app.db

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

停止服务后复制：

```text
data/database/app.db
```

建议保存为：

```text
data/backups/app-before-trial-YYYYMMDD-HHMMSS.db
```

## 2. 如何确认备份文件存在

检查备份目录是否出现新的 `.db` 文件：

```powershell
Get-ChildItem .\data\backups\*.db | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

在 NAS 上则检查挂载目录对应的 `backups/` 文件夹。

## 3. 如何恢复 app.db

1. 停止服务或容器：

```bash
docker compose down
```

或停止本机 Node 服务。

2. 复制当前数据库作为二次保险：

```powershell
Copy-Item .\data\database\app.db .\data\backups\app-before-restore.db
```

3. 用目标备份覆盖正式数据库：

```powershell
Copy-Item .\data\backups\app-before-trial-YYYYMMDD-HHMMSS.db .\data\database\app.db -Force
```

4. 重新启动服务：

```bash
docker compose up -d
```

5. 打开 `/api/health` 和首页，确认记录数量和内容回到预期状态。

## 4. 如何备份 attachments

附件目录：

```text
data/attachments/
```

试运行前建议整体复制一份：

```powershell
Copy-Item .\data\attachments .\data\backups\attachments-before-trial -Recurse
```

NAS 上建议使用 NAS 自带快照或文件夹复制，保留 `attachments/` 与 `database/app.db` 同一时间点的版本。

## 5. 如何避免重复导入 Note Station

- 正式导入前先确认数据库已备份。
- 不要重复执行正式导入命令，除非已确认恢复到了导入前备份。
- 导入后先在首页、搜索和分类页确认记录是否已存在。
- 如果误重复导入，优先停止服务，恢复导入前 `app.db` 备份，而不是手动删除大量记录。

## 6. 正式试运行前应该保存哪些文件

至少保存：

- `data/database/app.db`
- `data/attachments/`
- `data/backups/` 中最近一次导入前备份
- `data/exports/` 中最近一次 JSON 导出
- 当前 Git commit 号

不要把这些真实数据提交到 GitHub。

## 7. NAS 上应该如何保留快照

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

- 试运行前手动快照一次。
- 每次正式导入或大批量整理前快照一次。
- 至少保留最近 3-5 个快照。
- 确认快照不会公开同步到外网。

## 8. 出问题时如何回退到试运行前状态

1. 停止服务或容器。
2. 恢复试运行前 `app.db`。
3. 恢复试运行前 `attachments/`。
4. 重新启动服务。
5. 打开首页、搜索、设置页确认功能恢复。
6. 如仍异常，保留当前错误现场，不要继续导入或大量编辑，先记录现象再修复。
