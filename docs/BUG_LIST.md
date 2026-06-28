# 已知问题列表

## 必须修

当前没有已确认的 P0 / 必须修阻塞项。

## 建议修

| 问题 | 证据 | 影响 | 建议 |
| --- | --- | --- | --- |
| Docker 实际构建未验证 | 本机 Docker CLI 可用，但 Docker Desktop Linux daemon 未运行，`docker build` 无法连接 `dockerDesktopLinuxEngine` | Dockerfile 和 compose 已做静态检查，但还未在真实 daemon 上完成镜像构建 | 在 Docker Desktop 或 NAS Docker 环境可用后运行 `docker compose up -d --build` |
| 附件上传仍是元数据 | 当前新建记录和 API 只保存附件文件名、路径等元数据 | 真实家庭发票、维修照片暂不能上传保存 | 下一阶段实现真实附件上传到 `data/attachments/` |
| Note Station 真实导入未实现 | 尚未提供真实导出样例 | 无法迁移真实历史数据 | 用户提供脱敏样例后实现解析器 |

## 后续增强

| 项目 | 说明 |
| --- | --- |
| 简单访问口令 | 局域网家庭使用建议增加基础保护 |
| 编辑记录体验 | 详情页已有编辑入口预留，后续完善完整编辑流程 |
| Markdown 导出 | 当前为后续功能，适合长期归档 |
| 离线草稿 | 当前不做复杂离线同步，后续可先做离线草稿 |
| 私密记录 | `visibility` 字段已预留，暂不启用复杂权限 |

## 已解决

| 问题 | 处理 |
| --- | --- |
| Windows 测试临时目录删除失败 | 自动化测试等待服务进程退出，并重试清理临时 `NOTE_DATA_DIR` |
| 自动化测试定位文案过旧 | 测试改为 API 集成测试，避免依赖易变的 UI 文案定位 |
