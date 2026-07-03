# 文档同步审计

更新时间：2026-07-03

本轮审计目标是把项目文档从历史追加状态收口到当前真实开发状态，避免继续按过期文档重复开发或误判功能边界。

## 当前权威来源

- 当前代码和测试结果优先于旧文档。
- `docs/PROJECT_STATUS.md` 作为当前状态快照。
- `docs/ROADMAP_RELEASE_PLAN.md` 作为后续发布路线图。
- `docs/QA_REPORT_CURRENT.md` 只记录当前 QA 状态，不再混合多轮旧日志。
- `docs/PROJECT_MEMORY.md` 保持项目记忆性质，追加重要节点，不作为唯一状态表。

## 本轮发现的过期或冲突内容

| 文档 | 发现的问题 | 本轮处理 |
| --- | --- | --- |
| README.md | 部分功能状态与当前代码不一致，尤其成员编辑、Markdown 导出、富文本只读、Note Station 真实导入 | 已更新为 RC1 当前状态 |
| docs/NEXT_STEPS.md | 仍包含旧测试数量、旧 commit、Figma/image2 已完成事项、过期 Docker 端口和旧 P2 项 | 已重写为当前下一步清单 |
| docs/RUN_RESULT_HANDOFF.md | 多轮历史交接混在一起，出现旧 commit、旧模拟导入、旧附件状态、旧导出状态 | 已重写为当前交接文档 |
| docs/QA_REPORT_CURRENT.md | 历史 QA 记录很长，开头仍是旧 noteCount、旧 test 数量和旧风险 | 已重写为当前 QA 快照 |
| docs/PROJECT_MEMORY.md | 历史准确但需要新增当前收口节点 | 已追加本轮状态同步记录 |
| docs/RELEASE_MVP_TRIAL.md | 仍可作为试运行说明，但部分细节应以 PROJECT_STATUS 为准 | 保留，不作为本轮重写重点 |
| docs/RICH_TEXT_PLAN.md | 当前富文本只读阶段说明有效 | 保留 |
| docs/DATABASE_INTEGRITY_RECOVERY.md | 数据库恢复记录有效 | 保留 |
| docs/BACKUP_RESTORE_DRILL.md | 备份恢复演练说明有效 | 保留 |
| docs/FIGMA_* / PRODUCT_DESIGN_* | 作为视觉实现参考有效，但当前阶段不继续做 UI | 保留 |

## 已统一的关键状态

- 当前默认成员只内置 `我 / 爱人`。
- 这两个默认成员支持改名、改头像、改颜色、切换当前成员。
- 新增成员功能尚未实现。
- JSON 导出和 Markdown 导出均已实现。
- 基础附件上传已实现，附件管理增强尚未实现。
- Note Station 当前真实样例已经完成正式导入。
- 其他未知 `.nsx` 仍必须先 dry-run。
- 富文本第一阶段已经完成安全只读渲染，完整编辑器尚未实现。
- 当前阶段建议进入 RC1 家庭试运行，不继续盲目新增功能。

## 文档维护规则

1. 每完成一个阶段，先更新 `docs/PROJECT_MEMORY.md` 和 `docs/QA_REPORT_CURRENT.md`。
2. 涉及发布计划时同步 `docs/ROADMAP_RELEASE_PLAN.md`。
3. 涉及当前功能事实时同步 `docs/PROJECT_STATUS.md`。
4. 不把真实数据库、导入文件、附件、备份、导出、日志或敏感信息写入文档。
5. 如果旧文档与当前代码冲突，以本轮 `PROJECT_STATUS` 和实际测试结果为准。
