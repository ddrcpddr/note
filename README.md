# note

家庭自用的 NAS 生活记录工具。它用于替代 Synology Note Station 的家庭记录场景：家人用手机快速记录家里的小事、维修、账单、购物、备忘、导入旧笔记，数据集中保存在自己的设备或 NAS 上。

当前阶段：个人家庭自用测试阶段，主线优先完善富文本编辑和 Note Station 重新导入体验。

最新状态请优先看：

- `docs/PROJECT_STATUS.md`：当前真实功能状态
- `docs/ROADMAP_RELEASE_PLAN.md`：发布路线图
- `docs/RUN_RESULT_HANDOFF.md`：交接和启动方式
- `docs/QA_REPORT_CURRENT.md`：当前 QA 结果
- `docs/MOBILE_TRIAL_CHECKLIST.md`：手机试运行清单
- `docs/BACKUP_RESTORE_DRILL.md`：备份恢复演练
- `docs/RICH_TEXT_PLAN.md`：富文本只读阶段方案

## 当前已实现

- 手机端页面： 首页、分类、搜索、详情、新建/编辑、导入 Note Station、设置、成员管理。
- 记录持久化：SQLite 数据库存储正式记录。
- 记录操作：新建、查看、编辑、归档、删除。
- 搜索筛选：关键词、分类、标签、成员、来源筛选。
- 默认成员：只内置 `我`、`爱人`。
- 成员资料：支持切换当前成员，并对两个默认成员改名、改头像、改颜色。
- 分类：11 个默认分类，未分类记录展示为 `未分类 / 待整理`。
- 标签：支持预置标签和自定义标签，允许记录无标签。
- 附件：通过富文本编辑器插入图片 / 附件，文件保存到 `data/attachments/`，数据库保存附件元数据、相对路径和正文引用。
- Note Station：真实 `.nsx` 已完成分析、dry-run、sandbox、正式导入和导入后查看。
- 富文本：新建、编辑和详情页已接入 Tiptap 富文本，兼容纯文本和 Note Station HTML / 富文本 fallback。
- 备份：设置页手动备份，可配置自动备份。
- 恢复：`npm.cmd run restore-db` 支持 dry-run 和确认恢复。
- 导出：支持 JSON 和 Markdown 导出。
- PWA：基础 manifest 和图标已接入，可用于添加到桌面试运行。
- Docker / NAS：已有 Dockerfile、docker-compose.yml 和 NAS 部署说明。
- 可选访问口令：通过 `NOTE_ACCESS_PIN` 启用简单访问保护。

## 当前未实现或受限

- 不支持新增真实家庭成员，当前只保留 `我 / 爱人`。
- 没有家庭账号、权限、私密记录或复杂登录体系。
- 富文本复杂增强仍待继续打磨，例如更多颜色选择、复杂表格编辑和图片尺寸调整。
- 没有复杂离线同步。
- 没有 Android 原生封装。
- 附件管理仍是基础能力；不再保留正文外独立附件上传入口，后续重点是富文本内附件引用、下载、预览、删除和替换。
- Note Station 其他未知导出变体必须先 dry-run，不能硬猜格式。
- 视觉如需继续高保真还原 Product Design 7 图，必须按 Figma 实现规格逐页重建，不再凭感觉微调。

## 本地启动

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

分别启动前后端：

```bash
npm run server
npm run web
```

构建：

```bash
npm run build
```

生产模式可先构建，再启动 Express 服务：

```bash
npm run build
npm run server
```

默认访问地址通常是：

```text
http://127.0.0.1:3300
```

健康检查：

```text
http://127.0.0.1:3300/api/health
```

## 检查和测试

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

HTTP smoke：

```bash
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 数据目录

默认数据目录：

```text
data/
```

主要子目录：

```text
data/database/
data/attachments/
data/backups/
data/exports/
data/imports/notestation/
```

这些目录用于本机或 NAS 运行数据，不应提交到 Git。仓库只保留 `.gitkeep` 占位文件。

## Docker / NAS

本地 Docker：

```bash
docker compose build
docker compose up -d
```

NAS 部署请看：

- `docs/NAS_DEPLOYMENT.md`
- `docs/TRIAL_RUN_READINESS_REPORT.md`
- `docs/BACKUP_RESTORE_DRILL.md`

不要在代码或文档中写死真实 NAS 地址、账号、密码或 token。

## 安全规则

禁止提交：

- `data/` 运行数据
- SQLite 数据库
- `.nsx` 文件
- dry-run JSON
- 备份文件
- 导出文件
- 附件文件
- 解压后的真实 Note Station 内容
- 日志文件
- 密码、token、真实 NAS 地址、账号信息

## 下一步

当前不走复杂 RC / 发布流程。先围绕家庭自用继续打磨富文本编辑、Note Station 重新导入和日常试用反馈；Android、复杂 NAS 运维增强和最终视觉还原排后。
