# MVP 试运行版本冻结说明

## 1. 版本定位

本版本是家庭生活记录工具 `note` 的 MVP 试运行冻结版本，用于在家庭局域网 / NAS / Docker 环境中给家人真实试用。

它的目标是：

- 替代 Synology Note Station 的家庭日常记录入口。
- 让手机浏览器 / PWA 可以快速新建和查看家庭记录。
- 将记录、附件、备份、导出集中保存在本机或 NAS 的 `data/` 目录。
- 保留已完成的 Note Station `.nsx` 真实导入结果。
- 在继续新增功能前，先收集真实手机 / NAS 试运行反馈。

它不是：

- 企业协同系统。
- 复杂权限系统。
- 云端笔记服务。
- 原生 Android App 优先项目。
- 外网访问或账号体系方案。

## 2. 当前版本能做什么

- 首页 / 生活时间线查看记录。
- 新建记录。
- 编辑记录。
- 详情页查看标题、正文、分类、标签、成员、来源、时间和附件元数据。
- 搜索关键词。
- 分类筛选。
- 标签筛选。
- 成员筛选：默认只保留 `我 / 爱人`。
- 来源筛选：手动创建 / Note Station 导入。
- 归档和软删除记录。
- 真实附件上传：附件文件落到 `data/attachments/`，数据库只保存元数据和相对路径。
- Note Station `.nsx` dry-run、sandbox、正式导入和导入后未分类整理。
- 手动数据库备份。
- 可选定时自动备份。
- JSON 全量导出。
- Markdown 全量导出。
- 设置页数据目录读写探测。
- 可选 `NOTE_ACCESS_PIN` 轻量访问口令。
- PWA manifest 和 runtime 图标，可添加到手机桌面。
- Docker / NAS 部署，容器内统一使用 `/data`。

## 3. 当前不能做什么

- 不支持真实账号登录。
- 不支持复杂权限隔离。
- 不支持新增家庭成员；默认成员冻结为 `我 / 爱人`。
- 不支持附件删除、附件替换和大文件上传优化。
- 不支持手机本地数据库和离线双向同步。
- 不支持真实 NAS 账号连接或外网访问方案。
- 不支持其他 Synology Note Station 导出变体的自动适配；新样例必须先 dry-run。
- 不创建 Android 原生工程；Android WebView / TWA 需用户另行确认决策清单。

## 4. 运行方式

### 开发模式

```bash
npm.cmd run dev
```

默认地址：

```text
http://localhost:5173
http://localhost:3300/api/health
```

### 生产构建 + Node 服务

```bash
npm.cmd run build
npm.cmd run server
```

默认访问：

```text
http://localhost:3300/
```

## 5. Docker / NAS 部署方式

本地 Docker：

```bash
docker compose up -d --build
```

默认访问：

```text
http://127.0.0.1:3300/
```

容器内数据目录：

```text
/data/database/app.db
/data/attachments/
/data/backups/
/data/imports/notestation/
/data/exports/
```

默认 compose 挂载：

```yaml
volumes:
  - ./data:/data
```

部署到 NAS 时，将 `./data:/data` 改为 NAS 上自己的数据目录，例如：

```yaml
volumes:
  - /your/nas/path/note-data:/data
```

不要把真实 NAS 地址、账号、密码、token 或签名密钥提交到 Git。

## 6. 备份与恢复方式

试运行前必须备份：

- `data/database/app.db`
- `data/attachments/`
- 当前 Git commit
- NAS 数据目录快照

恢复前必须停止 Node / Docker：

```bash
docker compose down
```

恢复前先 dry-run：

```bash
npm.cmd run restore-db -- --backup data/backups/your-healthy-backup.db
```

确认 `ok=true` 后才允许执行：

```bash
npm.cmd run restore-db -- --backup data/backups/your-healthy-backup.db --confirm
```

恢复后必须运行：

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

Docker / NAS 场景还需运行：

```bash
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

详细流程见 `docs/BACKUP_RESTORE_DRILL.md`。

## 7. 手机试运行方式

1. 确认电脑 / NAS 服务已经启动。
2. 确认手机与服务在同一局域网。
3. 手机浏览器访问：

```text
http://<电脑或NAS局域网IP>:3300/
```

4. 浏览器菜单选择“添加到主屏幕”或“安装应用”。
5. 按 `docs/MOBILE_TRIAL_CHECKLIST.md` 完成人工验收。

真实局域网 IP 只在当前设备或 NAS 配置中使用，不写入仓库文档。

## 8. 已知问题和风险

- SQLite 试运行中不要让多个服务长期同时写同一个 `app.db`。
- 项目曾发生过 `database disk image is malformed`，因此 `npm.cmd run check` 现在会执行 `PRAGMA integrity_check`。
- 最近一次正式恢复使用健康备份 `data/backups/app-2026-06-29T05-40-32-597Z.db`；损坏库中可能存在额外 1 条不可直接信任的记录。
- 如果未来确实要找回损坏库中的记录，必须先做只读 salvage 评估并征得用户确认。
- 重复导入 Note Station 前必须先备份或恢复到导入前快照。
- `NOTE_ACCESS_PIN` 只是家庭局域网轻量访问口令，不是账号 / 权限系统。
- 真实 NAS Container Manager / 权限 / 防火墙仍需用户环境实机确认。

## 9. 后续路线

试运行期间只处理真实反馈：

- P0 / P1：使用 `mvp-bugfix-qa` 流程小步修复，一个 bug 一个 `Fix:` commit。
- P2：先写小方案，用户确认后再开发。
- UI：只按 V1 / Product Design 7 张图做小步还原，不重做风格。
- Android：继续排最后，先完成 Web / PWA 试运行，再确认 `docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md`。

冻结后优先收集这些反馈：

1. 手机首页、搜索、分类、详情是否稳定。
2. 新建记录刷新后是否不丢。
3. 附件上传在手机上是否顺手。
4. 设置页备份、JSON / Markdown 导出是否落到预期目录。
5. Note Station 导入记录能否被家人找到和整理。
6. 长标题、长正文、长链接是否溢出。
7. PWA 添加到桌面后的启动体验是否可接受。

## 10. 发布安全边界

本版本只提交代码和文档。禁止提交：

- `data/`
- `.nsx`
- 正式数据库
- sandbox 数据库
- dry-run JSON
- 备份数据库
- 导出文件
- 附件文件
- 日志文件
- 真实 NAS 地址
- 账号、密码、token、签名密钥
- 真实 Note Station 原文内容