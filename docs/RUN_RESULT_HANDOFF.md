# 运行结果交接

更新时间：2026-07-03

## 1. 当前分支

`main`

## 2. 当前基线 commit

`5fff73d Add safe rich text read-only rendering`

本轮文档同步提交完成后，最新 commit 应为：`Sync project status and release roadmap`。

## 3. 当前阶段

RC1 / 家庭局域网试运行版。

当前不继续新增功能，不做 UI 重建、不做 Android、不做完整富文本编辑器。下一步重点是家庭手机和 NAS/Docker 真实试运行。

## 4. 当前真实可用功能

- 首页记录列表和筛选。
- 新建、编辑、详情、归档、删除记录。
- 搜索、分类筛选、标签筛选、成员筛选、来源筛选。
- 默认成员 `我 / 爱人` 的切换和资料编辑。
- 11 个默认分类，未分类展示为 `未分类 / 待整理`。
- 标签可为空，可选择预置标签和新增自定义标签。
- 基础附件上传和附件元数据展示。
- Note Station 当前真实 `.nsx` 样例导入已经完成，导入记录可查看、搜索、分类、整理。
- Note Station 原始 HTML / 富文本可安全只读渲染，纯文本继续作为 fallback 和搜索来源。
- 设置页手动备份、JSON 导出、Markdown 导出。
- 数据库恢复工具 `npm.cmd run restore-db`。
- Docker / NAS 基础部署文件。
- 可选 `NOTE_ACCESS_PIN` 简单访问口令。

## 5. 当前仍然模拟或待开发

- 新增成员功能未实现，当前只保留 `我 / 爱人`。
- 没有账号、权限、私密记录。
- 没有完整富文本编辑器。
- 没有 Android 原生应用。
- 没有复杂离线同步。
- 附件管理增强未完成，包括删除、替换、下载、预览和批量管理。
- NAS 运维增强仍待真实试运行反馈完善。
- 未知 Note Station 导出格式仍需先 dry-run。
- 高保真视觉还原若继续，需要按 Figma 规格逐页重建。

## 6. 如何启动前端和后端

开发模式：

```bash
npm run dev
```

分别启动：

```bash
npm run server
npm run web
```

构建后以 Express 提供前端和 API：

```bash
npm run build
npm run server
```

默认访问：

```text
http://127.0.0.1:3300
```

健康接口：

```text
http://127.0.0.1:3300/api/health
```

## 7. 如何运行测试

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

HTTP smoke：

```bash
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 8. 数据目录

默认数据目录：

```text
data/
```

数据库：

```text
data/database/app.db
```

附件：

```text
data/attachments/
```

备份：

```text
data/backups/
```

导出：

```text
data/exports/
```

Note Station 导入文件：

```text
data/imports/notestation/
```

这些运行数据不应进入 Git。仓库只跟踪 `.gitkeep`。

## 9. Docker / NAS

构建并启动：

```bash
docker compose build
docker compose up -d
```

验证：

```bash
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

部署前请确认 NAS 上的持久化目录映射到 `/data`，并保留：

```text
/data/database
/data/attachments
/data/backups
/data/exports
/data/imports/notestation
```

不要在仓库中写入真实 NAS 地址、账号、密码或 token。

## 10. 如何验证 Note Station 导入结果

1. 首页查看导入记录。
2. 搜索导入记录标题或纯文本内容。
3. 分类页查看 `未分类 / 待整理` 或整理后的分类。
4. 详情页查看来源、创建时间、更新时间、原始路径、附件元数据。
5. 详情页切换原始格式 / 纯文本，确认富文本只读展示和 fallback 正常。
6. 设置页执行备份和 JSON / Markdown 导出。

## 11. 本轮验证结果

- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=113`。
- `npm.cmd run test`：通过，11 个 suite，36 个 test，0 fail。
- `npm.cmd run build`：通过。

## 12. 已知风险

- 真实 NAS 环境仍需要用户本机人工试运行。
- 富文本只读已经完成，但完整编辑器属于后续高风险功能。
- 附件上传可用，但附件管理体验仍是 P1/P2。
- 未知 `.nsx` 变体不可直接正式导入，必须先 dry-run。
- 如果继续做视觉还原，必须逐页按 Product Design / Figma 规格重建，不再全站微调。

## 13. 建议人工验收的 5 个流程

1. 手机打开局域网地址，新建一条记录，刷新后确认不丢失。
2. 搜索刚才新建的记录，并用成员筛选 `我 / 爱人` 验证。
3. 打开一条 Note Station 导入详情，检查纯文本和原始格式展示。
4. 在设置页执行手动备份，并确认备份文件生成在 `data/backups/`。
5. 执行 JSON / Markdown 导出，确认导出文件在 `data/exports/` 且 Git 不跟踪。

## 14. 下一步需要用户提供

- 真实 NAS / Docker 试运行结果。
- 手机端实际使用反馈。
- 是否优先做 NAS 运维增强、导入后整理、附件管理、富文本编辑或 Android。
- 如果涉及 NAS 地址、账号、密码、token，需要用户手动配置，不写入仓库。
