# 真实手机与 NAS / Docker 试运行准备报告

## 1. 当前状态

- 当前阶段：Gate 0-4 已完成，等待真实手机 / NAS 人工试运行反馈。
- 当前分支：`main`
- 当前最新提交：以 `git log --oneline -1` 为准；本报告刷新前基线为 `bb75fc7 Strengthen backup restore drill`。
- 当前工作原则：不继续新增大功能，不重做 UI，不调用 Product Design，不生成新图片，不修改真实 Note Station 导入数据。

## 2. 阶段结论

当前项目可以进入真实家庭局域网 / NAS 试运行。

已完成的关键前置条件：

- 正式 SQLite 数据库已从健康备份恢复。
- `npm.cmd run check` 已验证正式库 `integrityCheck: "ok"`。
- Docker 使用真实 `./data:/data` 挂载后已通过 HTTP smoke。
- 手机局域网试运行清单已准备。
- 试运行反馈模板和日志已准备。
- 备份 / 恢复演练已强化，恢复流程要求先 dry-run 再 `--confirm`。

## 3. 最新验证结果

最近一次 Gate 4 验证：

| 命令 / 检查 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过，正式库 `integrityCheck=ok`、`noteCount=113` |
| `npm.cmd run test` | 通过，33 项测试全部通过 |
| `npm.cmd run build` | 通过，Vite 生产构建成功 |
| `git ls-files data` | 只跟踪 5 个 `.gitkeep` 占位文件 |
| 敏感运行数据 | 正式数据库、备份、导出、附件、sandbox DB、真实导入目录均未被 Git 跟踪 |

最近一次 Docker 真实 data 验证：

| 检查项 | 结果 |
| --- | --- |
| `docker compose build` | 通过 |
| `docker compose up -d` | 通过，容器 `note` healthy |
| `NOTE_DATA_DIR` | 容器内指向 `/data` |
| `/api/health` | 200 |
| `/api/app-data` | 200 |
| `/api/notes?limit=3` | 200 |
| `/api/categories` | 200 |
| `npm.cmd run smoke -- --base-url http://127.0.0.1:3300` | 通过 |

## 4. 数据库恢复状态

恢复前问题：

- `data/database/app.db` 曾出现 SQLite `database disk image is malformed`。
- Docker healthcheck 曾显示 healthy，但业务 API 返回 500。
- 旧的健康接口不足以证明数据库可用，因此后来新增了 `PRAGMA integrity_check`。

已执行恢复：

- 使用健康备份：`data/backups/app-2026-06-29T05-40-32-597Z.db`。
- 损坏库副本：`data/backups/app-before-restore-2026-06-30T08-31-44-809Z.db`。
- 恢复后 `integrityCheck=ok`。
- 恢复后没有从损坏库硬读或 salvage 数据。

数据风险说明：

- 恢复到健康备份时，损坏库中可能存在额外 1 条不可直接信任的记录。
- 如未来必须找回该记录，只能在用户确认后做只读 salvage 评估。
- 当前不要为了补记录去读取损坏库写回正式库。

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

- 新增家庭成员暂不开放；当前只保留“我 / 爱人”。
- 附件删除、附件替换和更大文件上传体验等待试运行反馈后决定。
- 复杂权限系统、真实账号系统、外网访问、反向代理、内网穿透不在当前 MVP 范围。
- 复杂离线同步 / 手机本地数据库不建议现在做。
- 其他 Synology Note Station 导出变体仍需先 dry-run，不硬猜格式。
- Android 原生 App 工程尚未创建；必须先完成真实 Android Web / PWA 试运行并确认 `docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md`。

## 7. 当前已知风险

- Docker compose 默认把本地 `./data` 挂载到容器 `/data`；NAS 实机部署前必须确认 NAS 挂载目录可写。
- SQLite 试运行中应避免多个服务长期同时写同一个 `app.db`。
- 正式 Note Station 数据已经导入；重复导入前必须先备份或恢复导入前快照。
- `NOTE_ACCESS_PIN` 只是家庭局域网轻量入口保护，不是账号 / 权限系统。
- Android WebView / TWA 工程启动前必须确认包名、签名和地址配置策略。

## 8. 手机端待人工验收

详见：`docs/MOBILE_TRIAL_CHECKLIST.md`。

优先验收：

1. 手机浏览器打开局域网地址。
2. 添加到桌面 / PWA。
3. 首页查看真实导入记录。
4. 新建记录后刷新不丢。
5. 手机端真实附件上传。
6. 搜索、分类、成员、来源筛选。
7. 查看一条 Note Station 导入记录详情。
8. 设置页备份、JSON 导出、Markdown 导出。
9. 设置页“检查当前数据目录”。
10. `NOTE_ACCESS_PIN` 开启时的手机端解锁流程。
11. 长标题、长正文、长链接是否横向溢出。
12. 底部导航是否遮挡内容。

## 9. NAS / Docker 试运行顺序

1. 试运行前按 `docs/BACKUP_RESTORE_DRILL.md` 备份 `app.db` 和 `attachments/`。
2. 在 NAS 或 Docker 主机准备数据目录，并挂载到容器 `/data`。
3. 启动服务：

```bash
docker compose up -d --build
```

4. 打开健康接口，确认 `dataPaths` 指向 `/data/...`。
5. 运行 HTTP smoke：

```bash
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

6. 手机在同一局域网访问：

```text
http://<电脑或NAS局域网IP>:3300/
```

真实 IP 只在本机或 NAS 配置中使用，不写入仓库。

## 10. Android 封装前置状态

- 已创建：`docs/ANDROID_WRAPPER_PLAN.md`
- 已创建：`docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md`
- 推荐路线：先 PWA 试运行，再做 Android WebView 壳。
- 当前暂停点：用户确认包名、App 名、最低 Android 版本、地址策略、签名方式和依赖授权前，不创建 Android 工程、不安装 Android 依赖、不生成 keystore。

## 11. 是否建议进入家庭局域网试运行

建议进入真实家庭局域网 / NAS 试运行，但只做人工验收和小 bug 修复。

进入试运行前请先完成：

- 备份 `data/database/app.db`。
- 备份 `data/attachments/`。
- NAS 上保留数据目录快照。
- 确认当前代码是最新 `main`。

试运行期间如果出现 P0 / P1 问题，按 `mvp-bugfix-qa` 流程处理：复现、定位、小修、check/test/build、更新 QA 和项目记忆、一个 bug 一个 `Fix:` commit。