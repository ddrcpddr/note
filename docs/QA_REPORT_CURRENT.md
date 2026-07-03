测试时间：2026-07-03

当前目标：收口富文本之后遗留的旧附件上传入口，并修复导入 Note Station 页无法点击选择 `.nsx` 文件的问题。本轮不改数据库结构、不修改真实 Note Station 导入数据、不提交任何运行数据。

## 复现步骤

1. 打开新建 / 编辑记录页。
2. 检查正文下方是否仍有独立“附件 / 添加照片 / 文件”上传区。
3. 打开导入 Note Station 页面。
4. 点击文件卡和底部主按钮，检查是否存在真实 `.nsx` file input 绑定。

## 问题原因

- 富文本编辑器已经有图片上传、粘贴图片和附件插入能力，但新建 / 编辑页仍保留了旧的独立附件 input，造成两套入口并存。
- 导入页此前主要是静态视觉按钮，没有把页面按钮和 `.nsx` 文件选择 input 绑定起来。

## 修复内容

- 移除新建 / 编辑页旧的独立附件上传区，保留富文本编辑器内部图片 / 附件插入。
- 新建记录不再自动生成假附件，保存时只提交富文本编辑器产生的 inline attachments。
- 导入页新增隐藏 `.nsx` 文件 input，文件卡按钮和底部主按钮都能触发选择文件。
- 选择文件后显示文件名和文件大小；当前网页端完整 NSX 上传解析尚未接入时，只进入安全预检，不写正式数据库。
- 更新 Note Station 导入文档：后续真实导入必须把 HTML、图片和附件引用恢复到富文本正文中，不再恢复独立附件上传入口。

## 运行命令

```bash
node --test tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- `node --test tests/frontend-ui.test.js`：通过，7 项测试通过。
- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=115`。
- `npm.cmd run test`：通过，11 suites / 47 tests / 47 pass。
- `npm.cmd run build`：通过，仍有已知 Tiptap bundle size warning。
- `docker compose up -d --build`：通过，3300 容器 healthy。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过，health、app-data、notes-list、note-detail、search、category-filter、member-filter、backup、JSON export、frontend shell 均为 ok。

## 仍然存在的问题

- 网页端 `.nsx` 完整上传解析还没有接入；现有真实解析能力仍主要在服务端脚本链路中。
- 真实 `.nsx` 重新导入后，图片、附件和富文本正文的一体化恢复仍需下一阶段专项实现和人工验收。

## 下一步建议

- 用户可先验证：新建 / 编辑页是否只剩富文本编辑器里的图片 / 附件入口；导入页点击“选择 .nsx 文件”是否能打开文件选择器。
- 下一阶段如继续导入功能，应接入网页端 `.nsx` 上传到 `data/imports/notestation/`，并复用现有 NSX dry-run / formal import 解析器。

---
测试时间：2026-07-03

当前目标：继续修复富文本编辑器两个真实反馈：斜体选中后文字视觉上不明显；“更多”里的文字色按钮无法再次点击取消。本轮不改数据库结构、不改导入逻辑、不新增功能，只修富文本编辑交互。

## 复现步骤

1. 打开 Docker 服务 `http://127.0.0.1:3300/`。
2. 进入新建记录页，输入临时文字并全选。
3. 点击“斜体”，检查 HTML、computed style 和实际 transform。
4. 切到“更多”，全选文字，点击“文字色”两次。

## 复现结果

- 斜体：修复前 HTML 会变成 `<em>... </em>`，但 computed style 只是 `oblique 12deg`，中文字体视觉上仍不够明显。
- 文字色：修复前第一次点击生成 `<span style="color: rgb(15, 118, 110);">`，第二次点击仍保持同样 HTML 和按钮选中态，无法取消。

## 问题原因

- 中文字体的浏览器合成斜体不稳定，单纯依赖 `font-style: oblique` 不足以提供清晰可见的斜体反馈。
- 文字色按钮的 action 只有单向 `setColor('#0F766E')`，没有判断 active 后调用 `unsetColor()`，所以它不是 toggle。

## 修复内容

- 富文本编辑区和详情区的 `em/i` 改为实际 `skewX(-10deg)`，让中文斜体肉眼可见。
- 新增 `toggleTextColor()`：当前选区已有固定文字色时再次点击执行 `unsetColor()`，否则设置 `#0F766E`。
- 更新前端静态回归测试，覆盖文字色可取消和斜体使用 transform。

## 运行命令

```bash
node --test tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- `node --test tests/frontend-ui.test.js`：通过，5 项测试通过。
- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=114`。
- `npm.cmd run test`：通过，11 suites / 45 tests / 45 pass。
- `npm.cmd run build`：通过，仍有已知 Tiptap bundle size warning。
- Docker 3300：容器 healthy，`/api/health` 返回 `ok=true`。
- Docker smoke：通过，health、app-data、notes-list、note-detail、search、category-filter、member-filter、backup、JSON export、frontend shell 均为 ok。Smoke 会生成测试记录、备份和导出，均位于 `data/` ignored 目录。
- Playwright 复测：选中文字点击“斜体”后 HTML 为 `<p><em>斜体文字测试</em></p>`，computed transform 为 `matrix(1, 0, -0.176327, 1, 0, 0)`，display 为 `inline-block`。文字色第一次点击后生成 color span 且按钮选中，第二次点击后 HTML 恢复为 `<p><em>斜体文字测试</em></p>`，按钮取消选中。

## 仍然存在的问题

- 文字色目前仍是固定绿色，没有颜色面板。
- 高亮目前仍是固定浅黄色，没有多色选择。
- 表格复杂编辑、图片尺寸调整等仍是后续增强。

## 下一步建议

- 用户在 `http://127.0.0.1:3300/` 强制刷新后，重点测试：斜体是否肉眼可见、文字色是否能第二次点击取消。

---

测试时间：2026-07-03

当前目标：修复富文本编辑器中“斜体不明显 / 多个控件点击后不立即显示选中态”的真实使用问题。本轮不改数据库、不改导入数据、不新增功能，只修富文本编辑器状态反馈和斜体显示。

## 复现步骤

1. 打开 Docker 服务 `http://127.0.0.1:3300/`。
2. 进入新建记录页，聚焦富文本编辑器。
3. 点击“斜体”，观察按钮是否立即变为选中态。
4. 输入临时文本，检查编辑器 HTML 和 computed style。
5. 切换到“更多”，点击“高亮”，检查是否立即显示选中态。

## 复现结果

- 修复前：点击“斜体”后，按钮 class 仍是未选中态；只有继续输入后，按钮才变为选中态。
- 修复前：斜体底层实际会生成 `<em>`，但中文字体默认 `italic` 的视觉倾斜不明显，用户容易判断为“不生效”。

## 问题原因

- 工具栏按钮直接读取 `editor.isActive()`，但组件没有订阅 Tiptap 的 transaction / selection / focus 状态变化；点击工具按钮后编辑器状态变了，React 没有立即重渲染，所以按钮反馈滞后到下一次输入。
- 富文本编辑区没有和详情展示一起定义更明确的 `em/i` 样式，依赖浏览器默认中文 italic，视觉反馈偏弱。

## 修复内容

- 给富文本编辑器增加 `toolbarRevision` 状态，并在 `onUpdate`、`onSelectionUpdate`、`onTransaction`、`onFocus`、`onBlur` 中刷新工具栏。
- 工具按钮增加 `onMouseDown.preventDefault`，避免点击按钮时破坏编辑器焦点和当前选择。
- 为表格、对齐、文字色、高亮补齐 active 判断，点击后能显示当前状态。
- 编辑区和详情区的 `em/i` 统一使用 `oblique 12deg`，让中文斜体更明显。
- 新增静态回归测试，覆盖工具栏状态刷新和斜体样式。

## 运行命令

```bash
node --test tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
```

## 测试结果

- `node --test tests/frontend-ui.test.js`：通过，4 项测试通过。
- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=114`。
- `npm.cmd run test`：通过，11 suites / 44 tests / 44 pass。
- `npm.cmd run build`：通过，仍有已知 Tiptap bundle size warning。
- Docker 3300：容器 healthy，`/api/health` 返回 `ok=true`；`npm.cmd run smoke -- --base-url http://127.0.0.1:3300` 通过，health、app-data、notes-list、note-detail、search、category-filter、member-filter、backup、JSON export、frontend shell 均为 ok。
- Playwright 复测：点击“斜体”后不输入文字也立即选中；输入后 HTML 为 `<p><em>斜体测试abc</em></p>`，computed style 为 `oblique 12deg`；“高亮”点击后也立即显示选中态。

## 仍然存在的问题

- 富文本颜色目前仍是固定文字色和固定高亮色，还没有做颜色面板。
- 表格行列增删、图片尺寸调整等更完整的 DS note 级体验仍是后续增强，不在本轮修复范围。

## 下一步建议

- 用户在 `http://127.0.0.1:3300/` 强制刷新后，优先测试：斜体、加粗、下划线、高亮、对齐、待办这几类按钮是否点击即有反馈。

---

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

---

测试时间：2026-07-03

当前目标：补齐面向后续重新导入 Synology Note Station 数据的富文本编辑能力。本轮允许调整测试库 schema，但不删除原始 `.nsx`，不提交 `data/` 运行数据。

## 本轮范围

- 新增富文本长期字段：`content_text`、`content_html`、`content_json`、`source_html`、`content_format`、`content_version`。
- 扩展附件元数据：区分图片 / 附件、正文引用、源附件路径、尺寸、排序、是否正文内联。
- 新建 / 编辑页接入 Tiptap 富文本编辑器，支持常用格式、待办列表、表格、链接、图片、附件引用。
- 详情页继续通过安全 HTML 清理后展示富文本；搜索、列表摘要继续基于纯文本。
- JSON / Markdown 导出兼容富文本字段。
- Note Station sandbox / formal 导入写入新的富文本字段和附件元数据，保留原始 HTML 到 `source_html`。

## 本轮运行命令

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## 测试结果

- `npm.cmd run check`：通过，`ok=true`，`integrityCheck=ok`，`categoryCount=11`，`noteCount=114`。
- `npm.cmd run test`：通过，11 个 suite，41 个 test，41 个 pass，0 个 fail。
- `npm.cmd run build`：通过，Vite 成功生成 `dist/` 构建产物。

## 已知问题

- Tiptap 让前端主 bundle 超过 500KB，Vite 输出 chunk size warning；不影响构建成功，后续可按需做动态加载或拆包。
- 当前富文本第一轮偏实用稳定，表格复杂编辑、图片尺寸调整、附件引用体验仍可继续打磨。
- 当前没有提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。

---

测试时间：2026-07-03

当前目标：修复富文本编辑器移动端工具栏“控件没法用”的真实可用性问题。本轮不改数据库、不改导入数据、不重做 UI，只修新建 / 编辑页富文本工具栏交互。

## 复现步骤

1. Docker 服务打开 `http://127.0.0.1:3300/`。
2. 390px 手机宽度进入“新建记录”。
3. 查看富文本工具栏并尝试使用格式、列表、插入、颜色等控件。
4. 使用 Playwright 读取工具栏布局和点击结果。

## 复现结果

- 底层 Tiptap 命令本身能执行：选中文字后点击“加粗”会生成 `<strong>`，点击“待办”会生成 `taskList`，点击“表格”会插入 table。
- 真正问题是移动端工具栏不可用：23 个图标按钮挤在约 294px 宽的横向滚动条里，实际滚动宽度约 1012px；一次只能看到少数图标，且没有文字标签，用户很难发现和使用控件。

## 问题原因

第一轮富文本实现把所有 Tiptap 命令平铺到一条横向 icon-only toolbar 中。功能绑定存在，但移动端交互方式不符合日常记录使用，也不接近 DS note 那种分组工具面板体验。

## 修复内容

- 将富文本工具栏改为分组面板：`常用`、`列表`、`插入`、`更多`。
- 每组按钮显示图标 + 简短文字，不再依赖 1000px 横向滚动查找控件。
- 常用组包含撤销、重做、加粗、斜体、下划线、删除线、标题、小标题。
- 列表组包含无序、有序、待办、引用、代码。
- 插入组包含链接、图片、附件、表格。
- 更多组包含对齐、文字色、高亮、清格式。
- 新增前端静态回归测试，防止工具栏退回一条长横向图标条。

## 验证结果

- Playwright 390px 复测：分组按钮 `常用 / 列表 / 插入 / 更多` 可见。
- Playwright 390px 复测：插入组显示链接、图片、附件、表格。
- Playwright 390px 复测：更多组显示左对齐、居中、右对齐、文字色、高亮、清格式。
- Playwright 390px 复测：页面无横向溢出。
- Playwright 390px 复测：输入文字后选中并点击“加粗”，编辑器 HTML 为 `<p><strong>工具栏分组测试</strong></p>`。
- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=114`。
- `npm.cmd run test`：通过，11 suites / 42 tests / 42 pass。
- `npm.cmd run build`：通过，仍有 Tiptap bundle size warning。

## 剩余问题

- 这轮解决“控件找不到 / 不好用”的第一层问题；颜色目前仍是固定文字色和固定高亮色，后续可补颜色面板。
- 表格的行列增删、单元格操作还不是 DS note 那种完整体验，后续可在这个分组工具栏基础上继续增强。
- 图片尺寸调整、附件引用样式仍可继续打磨。

## 数据安全

- 本轮生成的 Playwright 截图和 DS note 视频抽帧只作为临时复现产物，已删除，不提交。
- 未提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。

---

测试时间：2026-07-03

当前目标：处理历史测试附件残留和网页端 `.nsx` 选择后无法解析的问题。本轮允许清空测试数据库和测试附件目录，但保留原始 `.nsx` 文件，不提交任何 `data/` 运行数据。

## 复现步骤

1. 打开 Docker 3300 页面，首页可见历史测试记录仍显示附件筛选和附件数量。
2. 打开详情页，部分旧测试记录仍显示正文外附件列表。
3. 打开导入 Note Station 页，选择真实 `.nsx` 文件后，页面显示 0 条记录、1 个失败项。

## 问题原因

- 附件残留来自历史测试数据库和旧 seed/mock 中的假附件；新建 / 编辑页的旧独立附件入口已移除。
- 网页端导入此前只把文件名、大小传给后端做占位 dry-run，没有上传真实 `.nsx` 二进制内容，所以无法调用真实 NSX 解析器。

## 修复内容

- 清理当前测试数据库和测试附件目录，保留 `data/imports/notestation/*.nsx`。
- 移除默认 seed/mock 记录中的假附件，避免重建测试库后继续出现旧附件。
- 导入页 dry-run 请求改为上传真实 `.nsx` 文件内容。
- 后端新增 raw `.nsx` 上传处理：校验 ZIP 文件头、保存到忽略目录、调用真实 NSX dry-run 解析器、写入 preview import 批次。
- 确认导入链路支持网页端上传的 `.nsx`：自动备份数据库、写入富文本字段、复制附件、记录失败项。
- 新增 API 测试覆盖“网页端上传真实形态 NSX -> 预览 -> 确认导入 -> 附件元数据和搜索可用”。

## 运行命令

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=3`。
- `npm.cmd run test`：通过，11 suites / 48 tests / 48 pass。
- `npm.cmd run build`：通过，仍有 Tiptap bundle size warning。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过，Docker 服务 healthy，`/api/health`、`/api/app-data`、notes、categories、backup、JSON export 和 frontend shell 均正常。
- 真实 `.nsx` dry-run 验证：`example-notestation-export.nsx` 解析出 93 条记录、93 条成功、0 条失败、20 个附件、4 个原始分类；本次只预览，未确认写入 notes。

## 仍然存在的问题

- 真实 `.nsx` 正式导入还需要用户在页面手动确认一次，确认前应接受当前测试库会被继续用于试验。
- Note Station 的复杂富文本 HTML 到 Tiptap JSON 的可编辑还原仍需按真实样例继续增强；当前至少保留安全 HTML、纯文本和 source HTML。

## 下一步建议

1. 用户在 3300 页面重新选择真实 `.nsx`，确认预览数量是否与本次 dry-run 一致。
2. 如果预览合理，再点击确认导入，检查首页、搜索、详情页富文本和附件引用。
3. 若导入效果可接受，再决定是否再次清空测试库并做最终重新导入。

---

测试时间：2026-07-03

当前目标：修复 Note Station 导入记录仍按“正文 + 附件列表”旧格式展示的问题，让导入图片尽量在富文本正文中直接显示。

## 复现步骤

1. 打开一条从 Note Station `.nsx` 导入、带图片附件的记录详情。
2. 正文区域只显示文字内容。
3. 图片都落在下方“附件（N）”列表中，表现为旧的正文外附件格式。

## 问题原因

- Note Station 导出的图片不是直接使用真实图片地址，而是 `<img src="webman/3rdparty/NoteStation/images/transparent.gif" ref="...">`。
- `ref` 是 base64 编码后的原始图片文件名线索。
- 旧导入链路只把附件复制到 `data/attachments/` 并写入附件元数据，没有把 `ref` 解码后替换成 `/api/attachments/{id}/file`。
- 富文本 sanitizer 会移除不能安全识别的 `transparent.gif` 图片，因此最终详情页只能看到正文外附件列表。

## 修复内容

- Note Station 确认导入时，先复制附件并生成附件 ID，再把原始 HTML 中的 `<img ref="...">` 替换为本地安全图片地址。
- 被正文引用的图片附件标记为 `is_inline=1`。
- 对已经导入过的测试数据增加读取时兼容：如果 `source_html` 中仍有 Note Station 图片 ref，API 会用附件元数据动态回填富文本图片地址。
- 详情页附件列表过滤正文内联附件，避免图片在正文里显示一次、下方附件列表再显示一次。
- 新增测试覆盖：NSX web import 图片内联、旧导入 source_html 图片回填、详情页隐藏内联附件。

## 运行命令

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=96`。
- `npm.cmd run test`：通过，11 suites / 50 tests / 50 pass。
- `npm.cmd run build`：通过，仍有 Tiptap bundle size warning。
- Docker 3300 重建后启动成功。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过，Docker 服务 healthy，当前导入记录数 93。
- 当前 Docker 数据中一条带 8 个图片附件的 Note Station 导入记录验证结果：`inlineCount=8`、`hasRichImage=true`、正文外可见附件数为 0。

## 仍然存在的问题

- 复杂 Note Station HTML 到 Tiptap JSON 的完全可编辑转换仍需继续增强；当前优先保证安全展示和图片内联查看。
- 非图片附件仍保留在附件列表中，用于下载和兼容展示。

## 下一步建议

1. 用户刷新 3300 页面，打开刚才截图里的 Note Station 导入记录，确认图片是否直接出现在正文里。
2. 如果某些记录仍显示正文外图片附件，记录该条的现象，再继续补对应的 NSX HTML 变体。


---

测试时间：2026-07-03

当前目标：按用户要求清空当前所有测试数据，移除会误导测试的默认示例记录和硬编码关联记录，并重新准备 Docker 空库用于重新上传 `.nsx` 测试。

## 复现步骤

1. 打开历史 Note Station 导入记录详情。
2. 页面仍显示旧图片附件列表。
3. 页面下方仍显示“关联记录：去年卫生间防水维修 / 物业维修电话”。
4. 用户希望当前所有测试数据清空，重新从页面上传 `.nsx` 测试。

## 问题原因

- 历史测试数据库和附件目录仍保留旧导入/旧 QA 数据。
- 默认 `seedNotes` 和前端 `initialNotes` 仍会在空库或 API fallback 时带出示例记录。
- 详情页“关联记录”是前端硬编码的展示，并不是数据库真实数据。

## 修复内容

- 清空运行数据库、附件、备份、导出目录，仅保留 `.gitkeep`。
- 保留 `data/imports/notestation/*.nsx`，删除导入预览 JSON 和 sandbox 运行产物。
- `seedNotes` 和 `initialNotes` 改为空数组。
- 移除详情页硬编码关联记录区块。
- HTTP smoke、check-script、恢复脚本测试和 API 测试同步支持干净空库。
- 新增前端静态回归测试，防止示例记录和硬编码关联记录回归。

## 运行命令

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## 测试结果

- `npm.cmd run check`：通过，`integrityCheck=ok`，`categoryCount=11`，`noteCount=0`。
- `npm.cmd run test`：通过，11 suites / 51 tests / 51 pass。
- `npm.cmd run build`：通过，仍有 Tiptap bundle size warning。

## 仍然存在的问题

- 需要重新启动 Docker 并在页面重新上传真实 `.nsx` 文件，确认网页端导入后的富文本、图片内联和附件引用是否符合预期。
- 复杂 Note Station 富文本到可编辑 Tiptap JSON 的完全还原仍需要继续按真实样例完善。

## 下一步建议

1. 打开新的 Docker 3300 空库页面，确认首页记录数为 0。
2. 在导入页面重新选择真实 `.nsx` 文件，检查 dry-run 数量。
3. 确认导入后打开带图片的记录，检查图片是否在正文富文本中显示。
4. 新建一条带图片/附件的富文本记录，确认新路径不再依赖旧独立附件入口。

---

测试时间：2026-07-03

当前目标：修复 Note Station `.nsx` 重新导入后，部分带图片记录仍以“正文 + 附件列表”旧格式显示的问题。要求后续所有导入记录都通过应用逻辑自动把图片附件放进富文本正文，而不是逐条手工处理。

## 复现步骤

1. 清空测试数据后，从导入页重新选择真实 `.nsx`。
2. 确认导入成功后打开带图片附件的 Note Station 记录。
3. 部分记录正文仍只显示文字，图片出现在下方“附件（N）”列表。
4. 另有部分记录富文本样式较弱，看起来像无格式纯文本。

## 问题原因

- 旧修复只处理了 Note Station HTML 中能通过 `<img ref="...">` 解码并匹配到原始附件名的图片。
- 真实 `.nsx` 中存在另一类记录：图片附件在记录附件列表中，但正文 HTML 没有可匹配的 `ref`，导致这些图片没有被写回 `content_html`。
- 读取层也只回填可匹配 `ref` 的图片，未匹配图片仍会显示为独立附件。
- sanitizer 未保留部分 Note Station 常见块结构和图片容器标签，导致格式表现弱。

## 修复内容

- 网页端 `.nsx` 确认导入：所有图片附件都会进入富文本正文；可匹配 `ref` 的替换原图，不可匹配的以 `figure/img/figcaption` 追加到正文末尾。
- CLI 正式导入脚本同步同一逻辑。
- 读取已导入记录时，如果 `source_html` 和附件元数据能组合出图片，也会动态回填到富文本正文。
- 被内联的图片附件标记为 `is_inline`，详情页独立附件列表不再重复展示这些图片。
- `content/content_text/summary` 继续使用 NSX 解析出的纯文本，避免图片文件名污染搜索和摘要。
- 富文本样式补充 h1/h4/div/figure/figcaption。

## 运行命令

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- `npm.cmd run check`：通过，`integrityCheck=ok`，`noteCount=93`。
- `npm.cmd run test`：通过，11 suites / 52 tests / 52 pass。
- `npm.cmd run build`：通过。
- Docker 3300 重建成功。
- HTTP smoke：通过。
- Docker API 实测：93 条 Note Station 记录，20 个图片附件，20 个均进入富文本 HTML，缺失 0 个。

## 仍然存在的问题

- 非图片附件仍作为附件下载展示，这是预期行为。
- 更复杂的 Note Station 格式到可编辑 Tiptap JSON 的完全还原仍可继续增强，但当前日常查看和图片预览链路已通。

## 下一步建议

1. 用户在 3300 打开刚才截图中的带图片记录，确认图片已经在正文中显示。
2. 再重新导入一次 `.nsx`，抽查 3-5 条带图片记录，验证不再需要逐条处理。
3. 若发现某条记录依然没有格式，记录标题和现象，再针对新的 NSX HTML 变体补解析规则。

---

测试时间：2026-07-03

当前目标：修复 Note Station 图片虽然已经进入富文本 HTML，但详情页仍显示独立“附件（N）”区块的问题。

## 复现步骤

1. 打开 Docker 3300。
2. 首页进入一条带图片的 Note Station 导入记录，例如“新车试驾体验”。
3. 正文区域显示文字和富文本内容，但下方仍出现“附件（4）”独立卡片。

## 问题原因

- API 详情已经返回 `richContent.html` 和 `isInline=true`，但前端详情页从列表态 `notesData` 直接取选中记录。
- 列表态记录可能不是完整详情对象，导致详情页附件区仍使用旧附件状态渲染。
- 详情页缺少针对 Note Station 图片附件的最终兜底过滤。

## 修复内容

- 打开详情时调用 `/api/notes?id=...` 拉取完整详情，并回写到 `notesData`。
- 对 `notestation_import` 的图片附件，只要当前记录有富文本内容，就不再作为外部附件卡片展示。
- 增加前端静态回归测试，覆盖详情刷新和附件过滤逻辑。

## 运行命令

```bash
node --test tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- 前端回归测试：通过，10 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，53 tests。
- `npm.cmd run build`：通过。
- Docker 3300 重建并 smoke 通过。
- 3300 返回的新前端入口引用 `index-DBQZCcv9.js`。

## 仍然存在的问题

- 非图片附件仍可作为下载附件展示；如果用户希望所有非图片附件也在富文本正文中以链接块呈现，需要继续补“文件附件正文引用”规则。
- 如果浏览器仍显示旧附件区，需要强制刷新一次以清掉旧 JS。

## 下一步建议

1. 用户强制刷新 3300 页面后重新打开刚才截图记录。
2. 检查图片是否只在正文富文本中出现，不再出现外部“附件（4）”区块。
3. 若非图片附件也希望完全正文化，再做文件附件的富文本链接块展示。

---

测试时间：2026-07-03

当前目标：修复浏览器控制台中的 Tiptap 重复扩展警告。

## 复现步骤

1. 打开 3300 页面。
2. 打开浏览器 DevTools Console。
3. 看到警告：`[tiptap warn]: Duplicate extension names found: ['link', 'underline']`。

## 问题原因

- `StarterKit` 已注册 `link` 和 `underline`。
- 代码中又单独注册 `LinkExtension` 和 `UnderlineExtension`。
- Tiptap 检测到同名扩展重复，输出警告。

## 修复内容

- 在 `StarterKit.configure()` 中关闭内置 `link` 和 `underline`。
- 保留项目自定义的 Link / Underline 扩展，避免影响链接粘贴、自动链接、下划线按钮等现有功能。
- 增加前端静态测试覆盖该配置。

## 运行命令

```bash
node --test tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- 前端回归测试：通过，11 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，54 tests。
- `npm.cmd run build`：通过。
- Docker 3300 重建并 smoke 通过。
- 3300 当前引用新 JS：`index-WZcMH9Av.js`。

## 仍然存在的问题

- Microsoft 图片 lazy-load Intervention 是浏览器提示，不是应用代码错误。

## 下一步建议

1. 强制刷新 3300 页面。
2. 打开控制台确认 Tiptap duplicate extension warning 不再出现。
3. 简单测试链接、下划线、粘贴链接仍可用。

---

测试时间：2026-07-03

当前目标：修复成员管理页仍使用旧版大字号卡片、视觉不统一的问题。

## 复现步骤

1. 打开 Docker 3300 页面。
2. 进入设置页，再进入成员管理。
3. 页面顶部说明卡、成员卡片和操作按钮明显偏大，和当前新版移动端 UI 不统一。

## 问题原因

- 成员管理页沿用了早期大字号 hero 卡片和大头像布局。
- 新版移动端视觉已经收敛到 390px 基准，但该页面没有同步压缩标题、头像、按钮和说明文字尺度。

## 修复内容

- 仅调整成员管理页视觉层，不改成员数据和业务逻辑。
- 顶部说明卡改为紧凑信息卡，标题降为 18px 级别。
- 当前成员卡和成员列表卡统一头像、标题、说明文字和图标尺寸。
- 改名 / 头像 / 颜色按钮收敛为 36px 高轻量按钮。
- 增加前端静态回归测试，防止页面回到旧的大标题、大头像样式。

## 运行命令

```bash
node --test tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose ps
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
```

## 测试结果

- 前端回归测试：通过，12 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，55 tests。
- `npm.cmd run build`：通过。
- Docker 3300：`note` 容器 healthy。
- 3300 当前引用新前端产物：`index-DmpFVVzJ.js` / `index-CZcawJYy.css`。
- HTTP smoke：通过，health、app-data、列表、详情、搜索、分类、成员筛选、备份、JSON 导出和前端壳均正常。

## 仍然存在的问题

- 本轮只修成员管理页；设置页、导入页等视觉一致性问题不在本轮范围。
- 如果浏览器仍显示旧页面，需要强制刷新一次或清掉缓存。

## 下一步建议

1. 在 3300 页面强制刷新后重新打开成员管理页。
2. 检查顶部说明卡、当前成员卡、成员列表卡是否明显更紧凑。
3. 后续再按单页方式处理设置页或导入页，不要继续全站泛调。


---

测试时间：2026-07-04

当前目标：完成自定义分类第一阶段，确保 Web 端可新增 / 编辑分类，并在新建、编辑、首页筛选和搜索筛选中使用。

## 复现 / 验收步骤

1. 打开分类页，点击“新分类”。
2. 输入分类名，选择颜色和图标后保存。
3. 在新建记录页选择该分类并保存记录。
4. 在首页更多筛选或搜索页分类筛选中选择该分类。
5. 编辑分类名称后，确认相关记录展示新分类名。

## 问题原因

此前项目只有默认分类 seed，前端多处仍使用模块级硬编码分类数组，导致即使后端支持分类数据，页面也无法完整使用用户自定义分类。

## 修复内容

- 新增分类创建和编辑 API。
- 前端引入 `categoriesData`，从 `/api/app-data` 加载分类。
- `normalizeNote`、`filterNotes`、`findCategoryForType` 支持动态分类列表。
- 分类页加入轻量新增 / 编辑表单。
- 新建 / 编辑记录页加入分类选择。
- 搜索页和首页分类筛选改为动态分类。

## 运行命令

```bash
node --test tests/frontend-ui.test.js
node --test tests/mvp-api.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## 测试结果

- 前端测试：通过，13 tests。
- API 测试：通过，22 tests。
- `npm.cmd run check`：通过，integrityCheck ok。
- `npm.cmd run test`：通过，57 tests。
- `npm.cmd run build`：通过。

## 仍然存在的问题

- 暂未做删除分类；家庭自用场景先避免误删。
- 暂未做分类排序拖拽。
- 离线记录与恢复同步尚未开发，是下一阶段目标。

## 下一步建议

1. 本地 Docker 页面测试新增分类、编辑分类、新建记录选择分类。
2. 第一目标确认后进入离线记录与恢复同步专项。


## 2026-07-04 - 自定义分类 Docker 验证补充

- `docker compose up -d --build`：通过，`note` 容器 healthy，3300 端口已启动。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过。
- 当前 Docker 数据库为干净测试状态：2 个成员、11 个分类、0 条记录。
- 首页、API 壳、分类 API、备份和 JSON 导出 smoke 正常。
- 用户可在 `http://127.0.0.1:3300` 测试新增分类、编辑分类、新建记录选择分类，再重新上传 `.nsx` 测试导入。


---

测试时间：2026-07-04

当前目标：离线新建记录与恢复同步第一版。

## 修复 / 新增内容

- 新增浏览器本地待同步队列。
- 新建记录在服务不可用时保存到本机，并显示“待同步到 NAS”。
- 服务恢复后自动 POST 到 /api/notes，成功后替换本地临时记录。
- 首页显示待同步记录数量。
- 新增 docs/OFFLINE_SYNC_PLAN.md。

## 已覆盖测试

- 前端静态测试覆盖队列 key、本地读写、enqueue、自动 sync、待同步状态和首页提示。

## 暂未覆盖 / 待人工验证

- 真实浏览器关闭 Docker 后新建富文本记录、刷新仍保留。
- Docker 恢复后自动同步。
- 大图片 / 多附件超过 localStorage 限制时的提示。

## 当前边界

- 第一版只做离线新建记录。
- 离线编辑、离线删除、跨设备冲突合并后续再做。


## 2026-07-04 - 离线同步 Docker 验证补充

- `docker compose up -d --build`：通过，最新前端产物已进入 3300 容器。
- `docker compose ps`：`note` 容器 healthy。
- `npm.cmd run smoke -- --base-url http://127.0.0.1:3300`：通过。
- 当前 Docker 测试库仍为干净状态：2 个成员、11 个分类、0 条记录。
- 明早人工测试重点：新增分类、新建记录选择分类、停 Docker 后新建离线记录、恢复 Docker 后确认自动同步。


## 2026-07-04 - PWA 离线前端壳补充

- 新增 public/sw.js，并在前端注册 /sw.js。
- Service Worker 缓存前端 app shell、manifest、图标和构建后的静态资源。
- Service Worker 明确跳过 /api/，避免离线时使用过期 API 数据。
- 这使得用户已访问过页面或添加到桌面后，在 Docker/NAS 短暂不可用时仍能打开前端壳并写入本地待同步队列。
- 冷启动前提：浏览器至少需要在在线状态成功访问过一次页面，让 Service Worker 完成安装和缓存。
- 验证：npm.cmd run check 通过；npm.cmd run test 通过，59 tests；npm.cmd run build 通过。


## 2026-07-04 - PWA 离线壳 Docker smoke 验证

- Docker 状态：note 容器 healthy，3300 端口可访问。
- npm.cmd run smoke -- --base-url http://127.0.0.1:3300：通过，ok=true。
- /sw.js 检查：HTTP 200，包含 app-shell 缓存名，并包含 /api/ 绕过逻辑。
- 当前仍需人工验证：手机或浏览器先在线打开一次页面，随后停止 Docker/NAS，新建记录进入本地待同步队列；恢复 Docker/NAS 后自动同步。
