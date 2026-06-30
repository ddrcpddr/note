# 真实手机与 NAS / Docker 试运行准备报告

## 1. 当前 commit

- 当前基线 commit：`529c585 Sync project memory`
- 本报告提交后，以最新 `Prepare mobile and NAS trial validation` commit 为准。

## 2. 当前分支

- 分支：`main`
- 远程：`origin/main`
- 本轮开始时：`git pull --ff-only` 显示 `Already up to date.`，本地与远程一致。

## 3. check / test / build 结果

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 `categoryCount=11`，`noteCount=111` |
| `npm.cmd run test` | 通过，16 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## 4. Docker / NAS 检查结果

| 项目 | 结果 |
| --- | --- |
| `Dockerfile` | 存在，Node 22，构建前端并运行 Express 服务 |
| `docker-compose.yml` | 存在，端口 `3300:3300`，`NOTE_DATA_DIR=/data`，`./data:/data` |
| `.dockerignore` | 已排除 `data/`、`*.nsx`、数据库、备份、导出、附件、日志和 `output/` |
| Docker daemon | 当前电脑可用，Docker Desktop 4.73.0，Engine 29.4.3 |
| `docker compose build` | 通过，镜像 `note-note:latest` 构建成功 |
| `docker compose up -d` | 通过，容器 `note` 已启动并显示 healthy |
| 容器健康接口 | 通过，`/api/health` 返回 `dbPath=/data/database/app.db` |
| 前端同端口访问 | 通过，`http://localhost:3300/` 返回前端 HTML |

NAS 部署时只需要把 compose 的 `./data:/data` 换成 NAS 上真实数据目录，真实路径不要提交到 GitHub。

## 5. 本机生产模式启动结果

本轮先运行：

```powershell
$env:PORT='3410'
npm.cmd run server
```

结果：

| 地址 | 结果 |
| --- | --- |
| `http://localhost:3410/api/health` | 200，返回 JSON |
| `http://localhost:3410/api/app-data` | 200，返回 JSON |
| `http://localhost:3410/` | 200，返回前端 HTML |
| `/detail`、`/new`、`/search`、`/categories`、`/settings`、`/import`、`/members` | 200，SPA fallback 返回前端 HTML |

随后已停止该临时 Node 服务，避免与 Docker 容器同时打开正式 SQLite 数据库。

## 6. 手机端待人工验收清单

详见：`docs/MOBILE_TRIAL_CHECKLIST.md`。

优先验收：

1. 手机浏览器打开局域网地址。
2. 添加到桌面 / PWA。
3. 新建记录后刷新不丢。
4. 搜索和分类筛选导入记录。
5. 设置页备份和 JSON 导出。

## 7. 当前真实可用功能

- 首页记录列表、详情、新建、搜索、分类、成员筛选、来源筛选。
- 默认成员只保留“我 / 爱人”。
- SQLite 正式库已有真实 Note Station 导入记录。
- Note Station 导入记录可在详情页查看来源、原始分类、原始路径和附件元数据。
- 手动备份和 JSON 全量导出可用。
- PWA manifest 和 runtime 图标可用于安卓手机添加到桌面。
- Docker / NAS 数据目录已统一到 `/data`。

## 8. 当前仍待完善功能

- 真实附件上传。
- 简单访问口令 / PIN。
- 成员新增、改名、头像和颜色编辑。
- 导入后批量分类整理。
- 安卓原生封装或更复杂 PWA 离线能力。
- 外网访问、反向代理或内网穿透方案。

## 9. 当前已知风险

- 当前 Docker compose 默认把本地 `./data` 挂载到容器 `/data`，NAS 实机部署前需要确认 NAS 目录权限可写。
- NAS 在线 / 离线状态仍是应用内测试状态，不是真实 NAS 探测。
- SQLite 在试运行中要避免多个服务同时写同一个 `app.db`。
- 正式 Note Station 数据已经导入，重复导入前必须先备份或恢复导入前快照。
- 当前没有登录或口令，家庭局域网中能访问地址的人默认都可查看记录。

## 10. 是否建议进入家庭局域网试运行

建议进入真实家庭局域网试运行。

理由：

- 本机 `check/test/build` 已通过。
- Express 生产模式同端口前端 + API 已验证。
- Docker build / up / healthcheck 已验证。
- 数据目录在容器内正确指向 `/data`。
- 敏感运行数据未被 Git 跟踪。

进入试运行后，不建议继续盲目新增功能；先收集真实手机和家人使用反馈，再决定是否优先做附件上传、简单访问口令、成员编辑或安卓封装。
