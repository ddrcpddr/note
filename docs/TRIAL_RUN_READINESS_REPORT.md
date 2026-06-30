# 真实手机与 NAS / Docker 试运行准备报告

## 1. 当前 commit

- 当前最新提交：`4aa5cd8 Document Android wrapper decisions`
- 当前分支：`main`
- 当前本地状态：`main...origin/main [ahead 11]`
- 说明：本地已有 11 个提交尚未 push；等待用户明确批准后再推送 GitHub。

## 2. 当前阶段结论

当前 Web / PWA / Docker 代码和镜像可以运行，但本地正式数据库 `data/database/app.db` 已确认损坏，Docker 业务 API 暂不可用于试运行。需要先按 `docs/DATABASE_INTEGRITY_RECOVERY.md` 恢复到最近健康备份，再进入真实手机和家庭局域网试运行。Android 原生 App 封装仍排最后；在创建 Android 工程前，需要先按 `docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md` 确认包名、封装路线、最低 Android 版本、NAS 地址配置策略和签名方式。

## 3. check / test / build 结果

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 `categoryCount=11`，`noteCount=112` |
| `npm.cmd run test` | 通过，26 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |

## 4. 当前 Docker 试运行状态

| 项目 | 结果 |
| --- | --- |
| `Dockerfile` | 存在，Node 22，构建前端并运行 Express 服务 |
| `docker-compose.yml` | 存在，端口 `3300:3300`，`NOTE_DATA_DIR=/data`，`./data:/data` |
| `.dockerignore` | 已排除 `data/`、`*.nsx`、数据库、备份、导出、附件、日志和 `output/` |
| 当前容器 | `note` |
| 当前状态 | 已停止；此前容器 healthcheck healthy，但业务 API 因数据库损坏返回 500 |
| 当前端口 | `0.0.0.0:3300->3300/tcp` |
| 健康接口 | 此前返回 200；该接口不验证业务查询或数据库完整性 |
| 前端访问 | 此前 SPA 页面可打开；业务 API 暂不可用 |
| 容器数据目录 | `/data/database/app.db`，确认 `NOTE_DATA_DIR=/data` 生效 |

恢复数据库并重新启动 Docker 后，本机测试地址：

```text
http://127.0.0.1:3300/
```

恢复数据库并重新启动 Docker 后，手机同局域网测试地址：

```text
http://<这台电脑或 NAS 的局域网 IP>:3300/
```

不要把真实 NAS IP、域名、账号、密码或 token 写入仓库。

## 5. 当前真实可用功能

- 首页记录列表、详情、新建、编辑、搜索、分类、设置、导入、成员管理。
- 默认成员只保留“我 / 爱人”。
- 成员切换、改名、头像字和颜色编辑。
- 记录归档和软删除。
- 真实附件上传：文件保存到 `data/attachments/`，数据库只保存元数据和相对路径。
- Note Station 真实 `.nsx` 结构分析、dry-run、sandbox、正式导入和导入后未分类整理。
- 搜索、分类、标签、成员、来源筛选。
- 手动数据库备份。
- 可选定时自动备份。
- JSON 全量导出。
- Markdown 全量导出。
- 可选 `NOTE_ACCESS_PIN` 访问口令。
- NAS / Docker 数据目录读写探测。
- PWA manifest、runtime 图标和添加到桌面基础能力。
- Docker / NAS 数据目录统一到 `/data`。

## 6. 当前仍待确认或暂不实现

- 真实 Android 原生 App 工程尚未创建；等待用户确认 Android 决策清单。
- 新增家庭成员暂不开放；当前只保留“我 / 爱人”。
- 附件删除、附件替换和更大文件上传体验仍待后续试运行反馈后决定。
- 复杂权限系统、真实账号系统、外网访问、反向代理、内网穿透不在当前 MVP 范围。
- 复杂离线同步 / 手机本地数据库不建议现在做。
- 其他 Synology Note Station 导出变体仍需先 dry-run，不硬猜格式。

## 7. 当前阻塞问题

- 正式数据库 `data/database/app.db` 已确认 `PRAGMA integrity_check` 失败。
- Docker 业务 API `/api/app-data`、`/api/notes?limit=3`、`/api/categories` 返回 500。
- 最近健康备份为 `data/backups/app-2026-06-29T05-40-32-597Z.db`，111 条记录。
- 最新备份 `app-2026-06-30T04-06-15-239Z.db` 同样损坏，不建议恢复。
- 当前已停止 Docker 容器，等待用户确认是否恢复数据库。

详见：`docs/DATABASE_INTEGRITY_RECOVERY.md`。

## 8. 当前已知风险

- Docker compose 默认把本地 `./data` 挂载到容器 `/data`；NAS 实机部署前必须确认 NAS 挂载目录可写。
- SQLite 试运行中应避免多个服务长期同时写同一个 `app.db`。
- 正式 Note Station 数据已经导入；重复导入前必须先备份或恢复导入前快照。
- `NOTE_ACCESS_PIN` 只是家庭局域网轻量入口保护，不是账号 / 权限系统。
- Android WebView / TWA 工程启动前必须确认包名、签名和地址配置策略。

## 9. 手机端待人工验收

详见：`docs/MOBILE_TRIAL_CHECKLIST.md`。

优先验收：

1. 手机浏览器打开局域网地址。
2. 添加到桌面 / PWA。
3. 新建记录后刷新不丢。
4. 手机端真实附件上传。
5. 搜索、分类、成员、来源筛选。
6. 查看一条 Note Station 导入记录详情。
7. 设置页备份、JSON 导出、Markdown 导出。
8. 设置页“检查当前数据目录”。
9. `NOTE_ACCESS_PIN` 开启时的手机端解锁流程。
10. 长标题、长正文、长链接是否横向溢出。

## 10. Android 封装前置状态

- 已创建：`docs/ANDROID_WRAPPER_PLAN.md`
- 已创建：`docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md`
- 推荐路线：先 PWA 试运行，再做 Android WebView 壳。
- 当前暂停点：用户确认包名、App 名、最低 Android 版本、地址策略、签名方式和依赖授权前，不创建 Android 工程、不安装 Android 依赖、不生成 keystore。

## 11. 是否建议进入家庭局域网试运行

暂不建议继续用当前正式库进入真实家庭局域网试运行。

理由：

- `check/test/build` 已通过，但不能证明正式数据库完整。
- Docker SPA 页面此前可打开，但业务 API 已因数据库损坏返回 500。
- 当前 Docker 容器已停止，避免继续读写损坏库。
- 必须先恢复或修复 `data/database/app.db`，并重新验证 `/api/app-data`、`/api/notes?limit=3`、`/api/categories` 返回 200。
- 真实运行数据仍被 Git 忽略，没有进入提交。

恢复后，再根据真实手机反馈决定是否进入 Android WebView 工程或继续修小问题。

## 临时 Docker 可测实例（2026-06-30）

在正式数据库尚未恢复前，已先启动一个不污染正式数据的 Docker 临时实例，供本机查看当前页面和基础 API：

| 项目 | 结果 |
| --- | --- |
| 镜像 | `note-trial:current` |
| 容器 | `note-trial` |
| 地址 | `http://127.0.0.1:3310/` |
| 数据卷 | `note-trial-data:/data` |
| 是否挂载正式 `./data` | 否 |
| 健康接口 | 通过 |
| HTTP 烟测 | `npm.cmd run smoke -- --base-url http://127.0.0.1:3310` 通过 |

这个临时实例可用于 UI 和 Docker 运行方式预览，但不代表正式库已恢复。正式家庭局域网试运行仍需先恢复 `data/database/app.db`，再使用默认 compose 或 NAS 挂载目录重新验收。