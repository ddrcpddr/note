# 当前 QA 报告

测试时间：2026-07-03 12:06:51 +08:00

当前目标：修复新版 Figma Make 视觉接入后遗漏的设置页与导入 Note Station 页移动端布局问题。此轮不新增业务功能、不修改数据库结构、不修改真实 Note Station 导入数据。

## 复现问题

- 设置页仍保留旧版大标题、大装饰和大备份卡，上次备份 文案在 390px Docker 页面中被挤压成接近竖排。
- 导入 Note Station 页仍保留旧版文件卡，待选择文件标题使用 	runcate，显示为 等待选择 Note Statio...，不符合新版 390 x 844 规格。

## 问题原因

- 上一轮视觉收敛主要覆盖首页、分类、搜索、新建和共享组件，设置页与导入页仍残留旧版大字号、大图标和宽度不足的横向布局。
- 导入页文件标题显式使用 	runcate，导致 .nsx 状态文案被截断。

## 修复内容

- 设置页：Header 收敛到 20px 标题和紧凑装饰；备份卡改为 42px 图标、13px 状态标题、84px 备份按钮的紧凑网格，避免文字竖排；导出、目录、成员区统一缩小为新版卡片密度。
- 导入页：步骤圆点从 44px 收敛到 36px；文件卡 ZIP 图标和标题缩小；待选择标题改为 等待选择 .nsx 文件，移除 	runcate；底部操作栏高度和按钮字号收敛。
- 只修改前端视觉层和 QA/记忆文档，没有改 API、数据库、导入数据、备份逻辑或附件逻辑。

## 运行命令

`ash
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
`

## 测试结果

- 
pm.cmd run check：通过，integrityCheck=ok，categoryCount=11，
oteCount=114。
- 
pm.cmd run test：通过，11 个 suite，40 个 test，40 个 pass，0 个 fail。
- 
pm.cmd run build：通过。
- Docker 3300 smoke：通过，健康接口、app-data、列表、详情、搜索、分类、成员、备份、JSON 导出、前端 shell 均 ok。

## 移动端 UI 验证

使用 Docker 服务 http://127.0.0.1:3300 进行 Playwright 390px / 430px 验证：

- 设置页：scrollWidth == clientWidth，无页面级横向溢出。
- 设置页：上次备份：7月3日 03:56 文本框实测高度 18px，不再出现竖排挤压。
- 导入页：等待选择 .nsx 文件 完整显示，标题 class 不再包含 	runcate。
- 导入页：390px / 430px 均无页面级横向溢出。

临时截图和测试文件已从 output/playwright/ 删除，不提交 Git。

## 仍然存在的问题

- 这次只修设置页和导入页的明显布局问题；详情页、首页底部浮动按钮等如后续仍有偏差，需要按页面单独验收，不要全站凭感觉微调。
- Docker smoke 会生成新的备份和导出运行文件，但它们均位于 data/ 下并被 .gitignore 忽略，不提交。

## 下一步建议

- 用户在浏览器中对 http://127.0.0.1:3300 执行强制刷新后，优先人工检查设置页备份卡和导入页待选择文件卡。

---

测试时间：2026-07-03

当前目标：按新版 Figma Make 视觉基准进行第一轮前端 UI 收敛。此轮不新增业务功能、不修改数据库结构、不修改真实 Note Station 导入数据。

## 本轮范围

- 读取并采用 `docs/FIGMA_IMPLEMENTATION_SPECS.md` 中的新版视觉规格。
- 全局视觉 token 切换：390px 基准、`#F4F5F7` 背景、`#3DAA6C` 主色、Noto Sans SC 字体栈、卡片轻阴影。
- 调整共享组件：页面壳、卡片、chip、tag、底部导航、FAB、富文本展示密度。
- 调整主要页面视觉密度：首页、搜索页、新建 / 编辑页、分类页、记录卡片。
- 优先使用 `design/image-assets/v1/runtime/` 已有头像、分类、状态插画素材，不新增图标风格。

## Playwright 视觉检查

本轮使用本地服务 `http://127.0.0.1:3312` 做截图和 DOM 检查。

- 首页：生成 390px / 430px 截图。
- 分类页：生成 390px / 430px 截图。
- 分类页检查结果：
  - `scrollWidth == viewportWidth`，无页面级横向溢出。
  - 11 个默认分类均存在。
  - 分类标题无 `...` 省略号。
  - 分类标题无异常竖排或两行挤压。
  - 分类卡片实测约 `173 x 70`，接近新版两列紧凑卡片方向。
  - 底部导航顶部约在 `786px`，最后一行分类卡片底部约在 `613px`，未遮挡主要内容。

截图文件仅作为临时验收产物生成到 `output/playwright/`，本轮提交前已删除，不提交 Git。

## 本轮运行命令

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## 测试结果

- `npm.cmd run check`：通过，`ok=true`，`integrityCheck=ok`，`categoryCount=11`，`noteCount=114`。
- `npm.cmd run test`：通过，11 个 suite，40 个 test，40 个 pass，0 个 fail。
- `npm.cmd run build`：通过，Vite 成功生成 `dist/` 构建产物。

## 当前功能状态

- 富文本编辑、新建 / 编辑、搜索、分类、成员筛选、备份、JSON / Markdown 导出、Note Station 导入相关测试仍通过。
- 默认成员仍只保留 `我 / 爱人`。
- 搜索仍基于纯文本，不受 UI 调整影响。
- 数据库、备份、导出、附件、`.nsx`、日志和真实隐私数据均未纳入提交范围。

## 已知风险和下一步

- 这是新版 Figma Make 视觉接入第一轮，主要完成全局视觉密度和分类页硬问题收敛；设置页、导入页、详情页底部操作等仍建议后续逐页细调。
- 如果用户在 3300 Docker 端口查看不到变化，需要重建 / 重启 Docker 容器，或改用明确的本地服务端口查看最新构建产物。
- 后续 UI 调整必须继续以 `docs/FIGMA_IMPLEMENTATION_SPECS.md` 和新版 Figma 390 x 844 Frame 为准，不再按旧版大字号视觉继续微调。
