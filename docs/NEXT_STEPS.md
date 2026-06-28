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
| P0 | 真实 Note Station 样例分析 | 这是替代旧系统的关键入口 |
| P0 | NAS 上跑通 Docker / Node 部署 | 让家人可以真实试用 |
| P1 | 附件真实上传 | 家庭维修、发票、保修记录会大量依赖附件 |
| P1 | 简单访问口令 | 局域网内多成员使用时需要基础保护 |
| P2 | Markdown 导出 | 方便长期归档，但不是试用首要条件 |

## 最后总验收记录

最近一次总验收结果：

| 检查项 | 结果 |
| --- | --- |
| `npm.cmd run check` | 通过 |
| `npm.cmd run test` | 通过，5 项测试通过 |
| `npm.cmd run build` | 通过 |
| `git status --short --branch` | `main...origin/main`，工作区干净 |

当前最新提交：

```text
325e66b Document sample data
```

最近提交：

```text
325e66b Document sample data
adef873 Improve user-facing status messages
59d3916 Add known bug list
8912a2c Add developer handover notes
2eb30f3 Add MVP user manual
8b3caba Clarify current QA report
27ee531 Harden README guidance
ff26b42 Finalize MVP documentation
940c2e4 Prepare real Note Station import workflow
e550d00 Prepare Docker NAS deployment
```
