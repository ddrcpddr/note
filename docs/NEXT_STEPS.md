# 下一步

更新时间：2026-07-03

当前建议：冻结 RC1 / 家庭局域网试运行版，先跑真实手机和 NAS/Docker 试运行，再根据真实反馈决定下一轮大功能。

## 当前不要继续做的事

- 不继续盲目新增功能。
- 不继续凭感觉微调 UI。
- 不进入 Android 原生封装。
- 不进入完整富文本编辑器。
- 不修改真实 Note Station 导入数据。
- 不改数据库结构。
- 不新增成员/账号/权限体系。

## RC1 试运行前检查

1. 确认 `npm.cmd run check` 通过。
2. 确认 `npm.cmd run test` 通过。
3. 确认 `npm.cmd run build` 通过。
4. 确认 Docker / NAS 能启动。
5. 确认 `/api/health` 正常。
6. 确认真实正式库 integrity check 正常。
7. 确认 `data/`、数据库、附件、备份、导出、`.nsx` 没有被 Git 跟踪。
8. 试运行前手动备份 `data/database/app.db` 和 `data/attachments/`。

## 家庭手机试运行重点

1. 手机浏览器打开局域网地址。
2. 首页查看真实导入记录。
3. 新建一条家庭记录并刷新确认不丢失。
4. 搜索刚才新建的记录。
5. 查看一条 Note Station 导入记录详情，确认纯文本和原始格式展示可用。
6. 分类筛选和成员筛选 `全部 / 我 / 爱人`。
7. 设置页手动备份。
8. JSON / Markdown 导出。
9. 容器重启后确认数据仍在。
10. 记录家人反馈：哪些文字不懂、哪些入口不好找、手机上哪里遮挡或拥挤。

## 后续大功能路线

### P1：NAS 运维增强

- 完善 NAS 部署和恢复手册。
- 固化健康检查、smoke、备份计划。
- 增加故障排查和日志说明。

### P1：导入后整理增强

- 批量整理导入记录的分类和标签。
- 更清晰展示原始 Note Station 路径、原始分类路径和失败项。
- 未知 `.nsx` 样例继续 dry-run 优先。

### P1：附件管理增强

- 附件删除、替换、预览、下载。
- 附件备份和恢复一致性检查。
- 大文件上传提示和移动端体验。

### P1/P2：富文本编辑

- 当前只完成安全只读渲染。
- 编辑器阶段必须先确认依赖、数据库兼容、导出策略和回滚方案。

### P2：Android 封装

- 先验证 PWA 是否够用。
- 再决定 WebView / TWA、签名、图标、安装分发方式。

### P2：访问保护增强

- 当前 `NOTE_ACCESS_PIN` 是简单访问口令。
- 是否做账号、HTTPS、反向代理或家庭成员权限，需要试运行后再决定。

## 文档入口

- 当前状态：`docs/PROJECT_STATUS.md`
- 发布路线：`docs/ROADMAP_RELEASE_PLAN.md`
- 交接说明：`docs/RUN_RESULT_HANDOFF.md`
- QA 结果：`docs/QA_REPORT_CURRENT.md`
- 手机试运行：`docs/MOBILE_TRIAL_CHECKLIST.md`
- 备份恢复：`docs/BACKUP_RESTORE_DRILL.md`
