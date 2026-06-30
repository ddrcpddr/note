# Codex 持续开发工作计划：家庭生活记录工具

> 文件建议路径：`docs/CODEX_CONTINUOUS_DEVELOPMENT_PLAN.md`
> 执行对象：Codex 主控 Agent / Lead Agent
> 项目：家庭生活记录工具 `note`
> 当前阶段：MVP 已基本完成，进入真实手机 / NAS / Docker 试运行与稳定化阶段

---

## 0. 项目定位

本项目是一个部署在家庭 NAS / 局域网服务器上的多人家庭生活记录工具，用来替代 Synology Note Station。

核心目标：

* 记录家庭日常小事、维修、账单、购物、设备、临时备忘等内容；
* 支持手机浏览器 / PWA 使用；
* 数据保存在用户自己的设备 / NAS 中；
* 支持从 Synology Note Station `.nsx` 导入历史记录；
* 支持搜索、分类、标签、成员、备份、导出；
* 未来可扩展附件管理、成员管理、轻量安全保护和 Android 封装。

产品不是：

* 企业后台；
* 商业协作平台；
* 复杂权限系统；
* 云端笔记服务；
* 原生 Android 优先项目。

---

## 1. 当前已知事实

执行任务前，Codex 必须先读取以下文件确认当前状态：

```text
README.md
docs/PROJECT_MEMORY.md
docs/QA_REPORT_CURRENT.md
docs/RUN_RESULT_HANDOFF.md
docs/TRIAL_RUN_READINESS_REPORT.md
docs/DATABASE_INTEGRITY_RECOVERY.md
docs/NAS_DEPLOYMENT.md
docs/BACKUP_RESTORE_DRILL.md
docs/NEXT_STEPS.md
docs/DEV_HANDOVER.md
docs/V1_STYLE_GUIDE.md
docs/V1_VISUAL_FINAL_AUDIT.md
docs/ANDROID_WRAPPER_PLAN.md
docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md
```

当前项目关键事实：

1. 技术栈：

   * 前端：React + Vite
   * 后端：Express
   * 数据库：SQLite
   * 部署：Docker / NAS / 局域网服务器
   * 访问：手机浏览器 / PWA

2. 已实现核心能力：

   * 首页 / 生活时间线
   * 新建记录
   * 编辑记录
   * 详情页
   * 搜索
   * 分类
   * 标签
   * 成员筛选
   * 默认成员：`我 / 爱人`
   * Note Station `.nsx` 真实导入
   * 备份
   * JSON 导出
   * Markdown 导出
   * 附件上传基础能力
   * PIN / 简单访问口令
   * 定时备份
   * 存储目录读写探测
   * PWA 基础支持
   * Docker / NAS 部署准备

3. 已发生过的重要风险：

   * 正式 SQLite 数据库曾出现 `database disk image is malformed`；
   * 当前必须优先确认数据库已经从健康备份恢复；
   * 数据恢复和 Docker 真实数据 smoke 通过前，不得继续新功能开发。

4. 视觉原则：

   * Product Design 已生成并由用户确认的 7 张页面图是最终视觉基准；
   * 当前代码只是实现结果，不是视觉标准；
   * 不允许 Codex 自行重新设计 UI；
   * 后续 UI 只能做小步对齐。

---

## 2. 绝对禁止事项

任何阶段都必须遵守：

1. 不提交以下内容：

   * `data/`
   * `.nsx`
   * `app.db`
   * sandbox DB
   * dry-run JSON
   * 备份数据库
   * 导出文件
   * 附件文件
   * 日志文件
   * 真实 NAS 地址
   * 账号
   * 密码
   * token
   * 签名密钥
   * 真实 Note Station 原文内容

2. 不允许：

   * 重新设计 UI；
   * 调用 Product Design；
   * 生成新的整页 UI 图片；
   * 大规模重构；
   * 未经确认修改数据库大结构；
   * 未经确认从损坏库抢救数据；
   * 未经确认创建 Android 工程；
   * 未经确认引入大型依赖；
   * 未经确认做复杂权限系统；
   * 未经确认做外网访问方案；
   * 未经确认连续推进多个 P2 功能。

3. 不允许把“优化 UI”理解为重新设计。
   后续只能说“按 Product Design 7 张图还原 / 对齐”。

---

## 3. 每个阶段通用执行规则

每个阶段开始前：

```bash
git status
git log --oneline -10
```

确认：

* 当前分支；
* 是否落后 / 领先远程；
* 是否有未提交文件；
* 是否有敏感文件被跟踪。

每个阶段结束前必须运行：

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

如果阶段涉及 Docker：

```bash
docker compose build
docker compose up -d
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

每个阶段结束必须更新：

```text
docs/PROJECT_MEMORY.md
docs/QA_REPORT_CURRENT.md
docs/NEXT_STEPS.md
```

如涉及部署 / 数据 / UI / Android，还需更新对应文档。

每个阶段必须单独 commit：

```bash
git add <必要代码和文档>
git commit -m "<清晰的阶段性 commit message>"
git push
```

禁止把多个阶段混成一个大 commit。

---

## 4. Gate -1：数据库恢复记忆同步

### 目标

如果正式数据库已经恢复，但文档还没记录，先同步记忆。

### 进入条件

出现以下任一情况：

* 用户提示“刚才修复了数据库，但可能没更新记忆文件”；
* `docs/PROJECT_MEMORY.md` 没有记录最新恢复结果；
* `docs/DATABASE_INTEGRITY_RECOVERY.md` 没有记录最新恢复结果；
* `docs/TRIAL_RUN_READINESS_REPORT.md` 仍显示旧状态。

### 执行内容

只做文档同步，不开发功能。

必须记录：

* 恢复前问题：

  * `data/database/app.db` 的 SQLite `integrity_check` 失败；
  * Docker 业务 API 曾出现 `database disk image is malformed`；
* 使用的健康备份文件：

  * `data/backups/app-2026-06-29T05-40-32-597Z.db`
* 损坏库副本保存位置：

  * `data/backups/app-before-restore-<timestamp>.db`
* 恢复后记录数：

  * 约 `111` 条；
* 恢复后：

  * `integrityCheck: ok`
* 验证结果：

  * `npm.cmd run check` 通过；
  * `npm.cmd run test` 通过；
  * `npm.cmd run build` 通过；
* Docker 真实 data smoke：

  * `docker compose build` 通过；
  * `docker compose up -d` 后容器 healthy；
  * `/api/health`、`/api/app-data`、`/api/notes?limit=3`、`/api/categories` 均 200；
  * `npm.cmd run smoke -- --base-url http://127.0.0.1:3300` 通过；
* 记录数说明：

  * 之前损坏库曾显示 112 条；
  * 恢复健康备份后为 111 条；
  * 额外 1 条位于损坏库中，不作为可信数据源；
  * 不从损坏库硬读补回。

### 需更新文档

```text
docs/PROJECT_MEMORY.md
docs/DATABASE_INTEGRITY_RECOVERY.md
docs/TRIAL_RUN_READINESS_REPORT.md
docs/QA_REPORT_CURRENT.md
docs/RUN_RESULT_HANDOFF.md
docs/NEXT_STEPS.md
```

### Commit

```text
Sync database recovery memory
```

### 停止条件

完成后停止，等待用户确认是否进入 Gate 0 或 Gate 1。

---

## 5. Gate 0：正式数据库恢复确认

### 目标

确认正式 SQLite 数据库已经恢复，且 `integrity_check` 通过。

### 执行内容

1. 停止所有可能占用数据库的服务：

```bash
docker compose down
```

确认没有本地 Node / Docker 服务占用正式库。

2. dry-run 恢复：

```bash
npm.cmd run restore-db -- --backup data/backups/app-2026-06-29T05-40-32-597Z.db
```

3. 如 dry-run `ok=true`，执行确认恢复：

```bash
npm.cmd run restore-db -- --backup data/backups/app-2026-06-29T05-40-32-597Z.db --confirm
```

4. 恢复后运行：

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

### 验收标准

* `integrityCheck: ok`
* 正式库可读取；
* 记录数约 111；
* `check/test/build` 全部通过。

### Commit

```text
Restore formal database from healthy backup
```

### 注意

如果已经确认完成，不要重复恢复。只更新文档。

---

## 6. Gate 1：Docker 真实 data smoke

### 目标

确认 Docker 容器使用真实 `data/` 时可正常运行。

### 执行内容

```bash
docker compose down
docker compose build
docker compose up -d
```

检查：

```bash
docker ps
```

运行 smoke：

```bash
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

必须验证：

* `/api/health`
* `/api/app-data`
* `/api/notes?limit=3`
* `/api/categories`
* 首页 shell
* 详情
* 搜索
* 分类筛选
* 成员筛选
* 存储探测
* 备份
* JSON 导出

### 验收标准

* 容器 healthy；
* 真实 data smoke 通过；
* 不再出现 `database disk image is malformed`；
* `NOTE_DATA_DIR=/data` 生效；
* 数据库、附件、备份、导出均在 `/data` 下。

### 文档更新

```text
docs/TRIAL_RUN_READINESS_REPORT.md
docs/RUN_RESULT_HANDOFF.md
docs/NAS_DEPLOYMENT.md
docs/PROJECT_MEMORY.md
```

### Commit

```text
Verify Docker with restored formal data
```

---

## 7. Gate 2：真实手机局域网试运行准备

### 目标

准备让用户用 Android 手机真实访问局域网服务。

### 执行内容

1. 查询本机 IPv4 地址，但不要写入仓库：

```bash
ipconfig
```

2. 给用户当前会话输出：

```text
http://<局域网IP>:3300/
```

3. 检查 Windows 防火墙可能问题：

* 端口 3300 是否被拦截；
* 是否需要允许 Docker Desktop / Node / 端口 3300 通过防火墙；
* 只在当前回复说明，不写真实 IP 到仓库。

4. 更新：

```text
docs/MOBILE_TRIAL_CHECKLIST.md
```

### 手机验收流程必须包含

* 手机与电脑同 Wi-Fi；
* 手机浏览器打开局域网地址；
* 添加到桌面 / PWA；
* 首页加载记录；
* 新建一条记录；
* 刷新后记录不丢失；
* 搜索刚才新建的记录；
* 查看一条 Note Station 导入记录详情；
* 分类筛选；
* 成员筛选：全部 / 我 / 爱人；
* 设置页手动备份；
* JSON 导出；
* Markdown 导出；
* 上传一个小附件；
* PIN 开启 / 关闭；
* 存储目录探测；
* 长标题、长 URL 是否溢出；
* 底部导航是否遮挡内容。

### Commit

```text
Prepare real mobile LAN trial
```

---

## 8. Gate 3：试运行反馈模板

### 目标

让用户和家人试用后按结构反馈问题，避免零散描述导致 Codex 乱改。

### 需创建 / 更新

```text
docs/TRIAL_FEEDBACK_TEMPLATE.md
docs/TRIAL_FEEDBACK_LOG.md
```

### 模板字段

* 日期
* 测试人
* 设备型号
* Android 版本
* 浏览器
* 访问方式
* 页面
* 操作步骤
* 预期结果
* 实际结果
* 截图路径
* 是否影响数据
* 严重程度：P0 / P1 / P2 / P3
* 是否已复现
* 是否已修复
* 对应 commit

### Commit

```text
Add trial feedback templates
```

---

## 9. Gate 4：备份 / 恢复演练强化

### 目标

数据库损坏已经真实发生过，备份恢复流程必须成为强约束。

### 执行内容

更新：

```text
docs/BACKUP_RESTORE_DRILL.md
```

必须说明：

* 试运行前必须手动备份 `app.db`；
* 试运行前必须备份 `attachments/`；
* 恢复前必须停止 Node / Docker；
* `restore-db` 默认 dry-run；
* `--confirm` 才真正恢复；
* 不恢复未通过 `integrity_check` 的备份；
* Docker / NAS 试运行前后都应保留快照；
* 如何确认恢复成功；
* 如何避免重复导入 Note Station。

如测试缺失，可补小型测试：

* 坏备份拒绝；
* dry-run 不改库；
* confirm 保留恢复前副本；
* confirm 后 integrity_check ok。

### Commit

```text
Strengthen backup restore drill
```

---

## 10. Gate 5：真实试运行 Bugfix 阶段

### 目标

只修用户真实手机 / Docker / NAS 试运行中发现的问题。

### 执行规则

必须使用项目 skill：

```text
mvp-bugfix-qa
```

流程：

1. 读取项目记忆和 QA 文档；
2. 检查 git 状态；
3. 复现问题；
4. 如果不能复现，停止并说明；
5. 定位最小原因；
6. 最小修复；
7. 运行 check/test/build；
8. 更新 QA 和项目记忆；
9. 一个 bug 一个 commit。

### 允许修复

* 移动端横向溢出；
* 长标题 / 长 URL 折行；
* 按钮遮挡；
* Docker 路径问题；
* PIN 锁屏异常；
* 附件小文件上传异常；
* 备份 / 导出路径错误；
* 分类筛选错误；
* Note Station 导入记录显示错误；
* 真实手机 PWA 添加到桌面异常。

### 禁止

* 大规模 UI 重做；
* 重新设计；
* Android 原生工程；
* 权限系统；
* 外网访问；
* 数据库大结构变更。

---

## 11. Gate 6：Product Design 7 图还原审计

### 目标

如果用户认为当前页面与最终 7 张图差距明显，先审计，不立即改代码。

### 需创建

```text
docs/PRODUCT_DESIGN_RESTORE_AUDIT.md
```

### 审计页面

1. 首页
2. 新建记录
3. 记录详情
4. 搜索
5. 分类
6. 导入 Note Station
7. 设置 / 备份

### 审计维度

* 标题字号
* 副标题字号
* 搜索框高度
* 搜索框圆角
* 筛选胶囊高度
* 筛选胶囊间距
* 卡片宽高
* 卡片阴影
* 图标尺寸
* 底部导航
* 浮动按钮
* 长标题处理
* 页面密度
* 是否有后台感
* 是否与最终图明显偏离

### 差异分级

* P0：影响可用性
* P1：明显视觉偏离
* P2：可接受差异

### 输出

只输出审计报告和修复建议，不改代码。

### Commit

```text
Audit Product Design visual restoration
```

---

## 12. Gate 7：页面级视觉还原修复

### 进入条件

用户确认 Gate 6 审计报告后才能进入。

### 执行原则

* 每次只修 1-2 个页面；
* 不新增功能；
* 不改业务逻辑；
* 不改数据库；
* 不碰真实数据；
* 不生成图片；
* 每批修复后跑 check/test/build；
* 每批用 Playwright 390px / 430px 截图检查。

### 建议顺序

1. 分类页 + 设置页
2. 首页 + 搜索页
3. 新建记录 + 详情页
4. 导入 Note Station + 底部导航统一
5. 最终 390px / 430px 全页验收

### Commit 示例

```text
Align category and settings with Product Design baseline
Align home and search with Product Design baseline
Align new record and detail with Product Design baseline
Align import and navigation with Product Design baseline
Finalize mobile visual baseline verification
```

---

## 13. Gate 8：P2 功能池

必须等真实试运行至少一轮后再做。

每次只能选择一个子项，先写小方案，等用户确认后开发。

### P2-1：附件管理增强

* 查看附件
* 删除附件
* 替换附件
* 压缩大图片
* 附件预览

### P2-2：导入后整理增强

* 按原始笔记本路径聚合
* 批量移动分类更细化
* 重复导入检测
* 导入批次回滚

### P2-3：成员能力增强

* 新增成员
* 成员排序
* 成员禁用
* 不做复杂权限

### P2-4：安全增强

* PIN 设置 UI
* PIN 修改
* 访问口令说明
* 不做账号系统

### P2-5：NAS 运维增强

* 备份保留策略
* 备份数量上限
* 老备份清理
* 容器 healthcheck 增强

### P2-6：Android 封装

* 继续排最后
* 优先 WebView 壳
* 不迁移数据库到手机
* 不创建 Android 工程，直到用户确认：

  * 包名
  * App 名称
  * 最低 Android 版本
  * NAS 地址配置方式
  * 签名方式
  * 是否接受 WebView / TWA 路线

---

## 14. Gate 9：MVP 试运行版本冻结

### 进入条件

* Gate 0-4 通过；
* 用户完成至少一轮真实手机试运行；
* P0 / P1 bug 已清理；
* 用户确认可以冻结。

### 执行内容

更新：

```text
README.md
docs/RUN_RESULT_HANDOFF.md
docs/PROJECT_MEMORY.md
docs/NEXT_STEPS.md
docs/QA_REPORT_CURRENT.md
```

创建：

```text
docs/RELEASE_MVP_TRIAL.md
```

内容包括：

* 当前版本能做什么；
* 不能做什么；
* 运行方式；
* Docker / NAS 部署方式；
* 备份恢复方式；
* 手机试运行方式；
* 已知问题；
* 后续路线。

创建 tag：

```bash
git tag mvp-trial-0.2
git push origin mvp-trial-0.2
```

### Commit

```text
Prepare MVP trial release notes
```

---

## 15. 每次回复用户时必须包含

每个阶段完成后，Codex 必须输出：

1. 当前阶段；
2. 当前分支；
3. 最新 commit；
4. 是否已 push；
5. check/test/build 结果；
6. Docker / smoke 结果，如适用；
7. 是否有数据风险；
8. 是否有未提交文件；
9. 是否需要用户人工确认；
10. 下一步建议；
11. 明确停止点。

---

## 16. 当前下一步判断规则

Codex 每次开始工作时，先判断当前处在哪个 Gate：

1. 如果数据库恢复记忆未同步：先做 Gate -1。
2. 如果正式库仍损坏：只做 Gate 0。
3. 如果正式库已恢复但 Docker 真实 data smoke 未过：做 Gate 1。
4. 如果 Docker smoke 已过但手机试运行文档未准备：做 Gate 2。
5. 如果手机试运行还没进行：停止，等用户人工试用。
6. 如果用户反馈真实 bug：做 Gate 5。
7. 如果用户要求视觉还原：先做 Gate 6，不直接改代码。
8. 如果用户要求新功能：必须确认是否已完成至少一轮真实试运行；否则拒绝继续新功能，建议先试运行。
9. 如果用户要求 Android：检查 `docs/ANDROID_WRAPPER_DECISION_CHECKLIST.md` 是否已确认；未确认则不创建 Android 工程。

---

## 17. 当前推荐停止点

当前最推荐停止点是：

```text
正式数据库恢复完成
真实 data Docker smoke 通过
手机局域网试运行文档完成
等待用户用安卓手机真实试用
```

在用户真实试用前，不建议继续新增功能。
