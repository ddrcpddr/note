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
- `docker-compose.nas.yml`
- `.dockerignore`

如果是在群晖 / NAS 上部署，优先参考：

```text
docs/NAS_QUICK_DEPLOY.md
```

并使用：

```bash
docker compose -f docker-compose.nas.yml up -d --build
```

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
## 实机部署前检查清单

在 Docker Desktop、群晖 Container Manager 或其他 NAS Docker 环境中试运行前，先确认：

- 数据目录挂载到容器内 `/data`。
- `/data/database`、`/data/attachments`、`/data/backups`、`/data/imports/notestation`、`/data/exports` 对容器进程可写。
- 不把真实 NAS 账号、密码、Token、内网穿透密钥写进仓库。
- 首次启动后访问 `/api/health`，确认返回的 `dataPaths` 都指向 `/data/...`。
- 试用前先运行一次“立即备份”和“导出 JSON”，确认文件落在 NAS 挂载目录中。
- 在设置页点击“检查当前数据目录”，确认数据库、附件、备份和导出目录都可写。

当前自动化已覆盖 JSON 全量导出、备份失败提示和存储目录读写探测；真实 NAS 的 Docker daemon 和局域网访问仍需要在用户环境中实机验证。



## 阶段 5：家庭 NAS 试用前收口（2026-06-29）

本阶段的目标是让移动端 MVP 可以被放到家庭 NAS / 局域网服务器上稳定试用，而不是接入真实 NAS 账号或外网访问。

### 当前可直接使用的配置

- 生产服务由 Express 同时提供 API 和 `dist/` 前端静态文件。
- `NOTE_DATA_DIR=/data` 时，数据库、附件、备份、导入和导出都会写入容器内 `/data`。
- `.dockerignore` 已忽略 `data/`、`*.nsx`、数据库、备份、导出、附件、日志和临时 `output/`。
- PWA manifest、192 / 512 / maskable 图标和 favicon 已准备，可用于手机添加到桌面。

### NAS 试用验证顺序

1. 在 NAS / Docker 环境准备一个空的数据目录，并挂载到容器 `/data`。
2. 运行 `docker compose up -d --build` 或在 Container Manager 中使用等价配置。
3. 打开 `/api/health`，确认 `dataPaths` 都指向 `/data/...`。
4. 手机在同一局域网访问应用地址，添加到桌面。
5. 新建一条记录，刷新后确认不丢失。
6. 在设置页执行“检查当前数据目录”，确认数据库、附件、备份和导出目录可写。
7. 在设置页执行“立即备份”和“导出 JSON”，确认文件出现在 NAS 挂载目录下。
8. 抽查一条 Note Station 导入记录详情，确认来源信息和附件元数据可见。

### 仍需实机确认

- 当前机器未在真实 NAS Docker daemon 上完成镜像构建和容器启动验证。
- 设置页“检查当前数据目录”会验证当前 `NOTE_DATA_DIR` 下关键目录可写；它不连接真实 NAS 账号，也不判断外网或 NAS 管理服务在线状态。
- 不要把真实 NAS IP、域名、账号、密码或 token 写入仓库。

### 可选访问口令

默认不启用访问口令，适合只在可信家庭内网临时试用。

如果希望手机打开应用时先输入一个简单家庭口令，可以在部署环境设置：

```yaml
environment:
  NOTE_ACCESS_PIN: "your-local-pin"
```

或在启动前设置环境变量 `NOTE_ACCESS_PIN`。不要把真实口令提交到 GitHub；`docker-compose.yml` 中只保留空占位。启用后，`/api/health` 和解锁接口仍可访问，其余 API 会在未解锁时返回 401。

### 可选定时自动备份

默认不启用定时自动备份，避免本地开发时频繁生成备份文件。

家庭 NAS 试运行时，可以设置：

```yaml
environment:
  NOTE_AUTO_BACKUP_INTERVAL_HOURS: "24"
```

启用后，服务进程会按间隔复制当前 `app.db` 到 `/data/backups/`，并在 `backups` 表记录最新备份状态。测试环境可使用 `NOTE_AUTO_BACKUP_INTERVAL_MS`，生产部署建议使用小时级配置。

### 存储目录读写探测

设置页提供“检查当前数据目录”操作，对应接口：

```text
POST /api/storage/probe
```

该接口会读取当前 `NOTE_DATA_DIR`，并在以下目录分别写入一个临时探测文件、读取确认后立即删除：

- `data/database/`
- `data/attachments/`
- `data/backups/`
- `data/exports/`

如果任何目录不可写，接口会返回 503，并在结果里标出失败目录和错误信息。这个检查只验证应用进程对挂载目录的读写权限，不需要也不会保存真实 NAS 地址、账号、密码或 token。

## GHCR 镜像部署补充

如果 NAS 不方便从源码构建，可以使用 GitHub Container Registry 镜像：

```text
ghcr.io/ddrcpddr/note:latest
```

配套文件：

- `.github/workflows/docker-ghcr.yml`：push 到 main 后自动构建并推送镜像。
- `docker-compose.image.yml`：不使用 `build`，直接拉取镜像。
- `docs/NAS_IMAGE_DEPLOYMENT.md`：群晖和 QNAP 通用图形界面部署教程。
