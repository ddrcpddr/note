# 下一步建议

## 最建议先做的 5 件事

1. 用手机在同一局域网内完整试用首页、新建、搜索、导入和设置页。
2. 提供一份脱敏后的 Synology Note Station 导出样例，用于实现真实导入解析器。
3. 确认 NAS 部署方式：Docker Compose、群晖 Container Manager，还是普通 Node 服务。
4. 确认家庭成员名单，以及是否需要一个简单访问口令。
5. 实现真实附件上传，把附件保存到 `data/attachments/` 并在数据库中保存元数据。

## 当前不建议马上做

- 不建议先做复杂权限系统。
- 不建议先做手机本地数据库双向同步。
- 不建议在没有真实样例前硬猜 Note Station 格式。
- 不建议接真实外网访问，除非先确认 NAS 网络和访问安全策略。

## 下次开发优先级

| 优先级 | 任务 | 原因 |
| --- | --- | --- |
| P0 | 真实手机 / NAS 环境试用 | 当前本地 MVP 已通过自动化验证，需要确认家庭局域网实际访问体验 |
| P0 | 真实 Note Station 样例分析 | 这是替代旧系统的关键入口 |
| P0 | NAS 上跑通 Docker / Node 部署 | 让家人可以真实试用 |
| P1 | 附件真实上传 | 家庭维修、发票、保修记录会大量依赖附件 |
| P1 | 简单访问口令 | 局域网内多成员使用时需要基础保护 |
| P2 | Markdown 导出 | 方便长期归档，但不是试用首要条件 |

## 最近验证记录

最近一次自动化验证结果：

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过 |
| `npm.cmd run test` | 通过，9 项 API 集成测试通过 |
| `npm.cmd run build` | 通过 |
| `git status --short --branch` | 本轮文档更新前，功能提交为 `ca08d70 Strengthen-MVP-API-coverage` |

本轮新增重点：

- 新增 `docs/AGENT_WORKPLAN.md`，明确 Lead / Dev / QA / Docs / Import / UI Polish 的职责边界。
- 修复 JSON 导出只导出 200 条列表窗口的问题。
- 修复最近备份状态在同秒写入时可能取错记录的问题。
- 修复 Note Station 样例导入确认响应在大量记录后可能返回空 `notes` 的问题。
- 自动化测试扩展到成员切换、NAS 离线备份失败、JSON 全量导出和样例导入闭环。

最近提交：

```text
ca08d70 Strengthen-MVP-API-coverage
8916685 Document-agent-workplan
4add048 Record final validation results
325e66b Document sample data
adef873 Improve user-facing status messages
59d3916 Add known bug list
8912a2c Add developer handover notes
2eb30f3 Add MVP user manual
```
