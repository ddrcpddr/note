# NAS 存储与备份

阶段 4 实现的是“本地目录模拟 NAS 存储”。应用不连接真实 NAS，不写死任何真实 NAS 地址。

## 数据目录

默认数据根目录：

```text
data/
```

可以通过环境变量覆盖：

```text
NOTE_DATA_DIR=/your/nas/path/note-data
```

当前目录结构：

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

## Git 提交规则

以下文件不会提交到 GitHub：

- SQLite 数据库文件
- 备份文件
- 导出文件
- 附件文件
- 导入过程中的原始文件

只提交 `.gitkeep` 以保留目录结构。

## API

### 查看存储状态

```http
GET /api/storage/status
```

返回：

- 数据目录
- 数据库位置
- 附件目录
- 备份目录
- 导出目录
- 最近备份记录

### 手动备份

```http
POST /api/storage/backup
```

请求体：

```json
{
  "nasOnline": true
}
```

当 `nasOnline` 为 `false` 时，接口会返回失败，用于模拟 NAS 离线。

### 导出 JSON

```http
POST /api/storage/export-json
```

导出文件会写入：

```text
data/exports/
```

## 设置页能力

设置页现在可以显示：

- 数据库位置
- 附件目录
- 备份目录
- 导出目录
- 最近备份时间
- NAS 在线 / 离线模拟状态

并支持：

- 手动备份 SQLite 数据库
- 导出 JSON
- NAS 离线时显示失败提示

## 当前限制

- 不连接真实 NAS。
- 不做外网访问。
- 不做手机本地数据库同步。
- Markdown 导出仍作为后续功能保留。

## Docker / NAS 部署准备

当前项目已提供：

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

本地模拟 NAS 部署：

```bash
docker compose up -d --build
```

访问地址：

```text
http://localhost:3300
```

容器内使用：

```text
NOTE_DATA_DIR=/data
```

默认挂载：

```yaml
volumes:
  - ./data:/data
```

因此容器内外目录对应关系为：

```text
/data/database/app.db          -> ./data/database/app.db
/data/attachments/             -> ./data/attachments/
/data/backups/                 -> ./data/backups/
/data/imports/notestation/     -> ./data/imports/notestation/
/data/exports/                 -> ./data/exports/
```

部署到家庭 NAS 时，不要在代码里写死真实 NAS 地址。建议只修改 `docker-compose.yml` 的挂载路径，例如：

```yaml
volumes:
  - /your/nas/path/note-data:/data
```

当前 compose 不包含账号、密码、Token 或真实 NAS 地址。
