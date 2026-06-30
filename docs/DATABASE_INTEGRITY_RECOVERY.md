# 数据库完整性诊断与恢复建议

## 1. 发现时间

2026-06-30，本地 Docker 试运行烟测阶段。

## 2. 触发症状

Docker 容器 `note` 显示 `healthy`，SPA 页面路径可以返回 HTML，但以下 API 返回 500：

- `/api/app-data`
- `/api/notes?limit=3`
- `/api/categories`

Docker 日志中的关键错误：

```text
Error: database disk image is malformed
```

## 3. 已确认事实

- 损坏文件：`data/database/app.db`
- 主机和 Docker 容器对同一个数据库执行 `PRAGMA integrity_check` 都报告损坏。
- `npm.cmd run check` 只读取分类数和记录数，仍可能通过，因此不能作为数据库完整性的充分证据。
- 当前损坏库能返回 `noteCount=112`，但读取完整 notes 列表会触发 `database disk image is malformed`。
- Docker 健康接口 `/api/health` 只验证服务和路径，不验证业务查询，因此容器 healthy 不代表数据库可用。

## 4. 备份扫描结果

| 备份文件 | 状态 | 记录数 | 说明 |
| --- | --- | --- | --- |
| `app-2026-06-30T04-06-15-239Z.db` | 损坏 | 112 | 可能是在正式库已损坏后生成的备份，不建议恢复 |
| `app-2026-06-29T05-40-32-597Z.db` | 健康 | 111 | 当前找到的最近健康备份，建议作为恢复候选 |
| `app-before-notestation-import-2026-06-29T05-28-49-415Z.db` | 健康 | 18 | 正式导入前备份 |
| `app-before-notestation-import-2026-06-29T05-36-38-145Z.db` | 健康 | 18 | 正式导入前备份 |
| 更早 `app-*.db` | 健康 | 3-17 | 只适合极端回滚 |

## 5. 当前运行状态

发现损坏后，Docker 容器已停止，避免继续在损坏库上读写。未删除、替换或提交任何数据库文件。

## 6. 当前建议

在用户确认前，不自动替换正式数据库。

建议恢复路线：

1. 停止 Docker 容器和任何本地 Node 服务，避免继续读写损坏库。
2. 额外复制一份当前损坏的 `data/database/app.db` 到 `data/backups/`，仅用于事后取证。
3. 将最近健康备份 `data/backups/app-2026-06-29T05-40-32-597Z.db` 复制为新的 `data/database/app.db`。
4. 重新执行 `PRAGMA integrity_check`，确认返回 `ok`。
5. 启动 Docker，验证 `/api/app-data`、`/api/notes?limit=3`、`/api/categories` 返回 200。
6. 人工确认是否缺失最近新增的 1 条记录；如果需要，再尝试从损坏库或导出文件中补录。

## 7. 不建议

- 不建议继续在当前损坏库上新增记录。
- 不建议删除损坏库后直接重建空库。
- 不建议恢复最新的 `app-2026-06-30T04-06-15-239Z.db`，因为它同样损坏。
- 不建议提交任何数据库、备份、导出或附件文件到 Git。

## 8. 需要用户确认

是否允许执行恢复操作：用最近健康备份 `app-2026-06-29T05-40-32-597Z.db` 替换当前 `data/database/app.db`。

确认后再执行；执行前会先保存当前损坏库副本。
## 9. 完整性检查加固

`npm.cmd run check` 已加入 SQLite `PRAGMA integrity_check`。健康数据库会输出 `integrityCheck: "ok"`；当前损坏正式库会让 check 以非零状态退出，避免再次把损坏库误判为可试运行。

恢复数据库后，第一步应重新运行：

```bash
npm.cmd run check
```

只有返回 `ok: true` 且 `integrityCheck: "ok"` 后，才继续 Docker API 和手机试运行验收。
