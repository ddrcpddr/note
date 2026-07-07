测试时间：2026-07-07 / 交付检查补充

本轮在第一阶段提交后继续补充运行总检查，不新增业务功能。

## 运行命令

```bash
npm.cmd run android:device-smoke
npm.cmd run android:delivery-check
```

## 测试结果

- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到 USB 连接且授权的手机；APK 路径为 `android/app/build/outputs/apk/debug/app-debug.apk`。这说明真机飞行模式测试仍需要用户手机实测。
- `npm.cmd run android:delivery-check`：通过。该命令覆盖 `check`、`test`、`build`、`android:build`、`android:verify`，并启动临时 `http://127.0.0.1:3400` 跑 HTTP smoke。
- delivery check 中 `npm.cmd run test`：通过，84 项测试通过。
- delivery check 中 `npm.cmd run android:build`：通过，APK 大小 `25,393,803 bytes`。
- delivery check 中 `npm.cmd run android:verify`：通过，`bundledReact=true`，`nativeShellOnly=false`。
- HTTP smoke：通过，覆盖 health、app-data、notes-list、note-detail、search、category-filter、member-filter、categories-api、create-note、created-note-detail、notestation-web-import、storage-probe、manual-backup、json-export、frontend-shell。

## 结论

- 本机可验证交付链路通过，APK 不是 49KB 壳。
- 仍不能宣称真机离线完全通过；需要在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上安装当前 APK 后测试。

---
测试时间：2026-07-07

当前目标：停止 49KB WebView 壳路线，完成第一阶段真正离线 Android App 基础。范围只覆盖：本地打包前端、Android SQLite 基础层、本地优先 notes 读取 / 新建 / 编辑 / 删除 / 归档链路、APK 构建与结构校验。NAS 同步 push/pull 仍是下一阶段。

## 复现步骤

1. 检查 Android 工程是否仍以远程 NAS URL 作为启动入口。
2. 执行 `npm.cmd run android:build`，确认 Vite build、Capacitor sync 和 Gradle assembleDebug 全流程通过。
3. 执行 `npm.cmd run android:verify`，确认 APK 内含本地 React 资源、Capacitor 配置、classes.dex、图标资源，且 APK 大小不是几十 KB。
4. 运行 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build` 验证现有功能。

## 问题原因

- 旧 APK 仍属于 WebView 壳思路，依赖远程 / Docker 服务，离线不可作为完整 App 使用。
- Android 工程没有 Capacitor 本地资源同步和本地 SQLite 数据层，无法支撑离线长期使用。
- 构建过程中还缺少 AndroidX、minSdk、Capacitor 核心依赖和 APK 校验脚本路径适配。

## 修复内容

- 新增 Capacitor 配置和 Android 插件依赖，前端资源从 `dist` 本地打入 APK。
- Android `MainActivity` 改为 Capacitor `BridgeActivity`。
- 新增 `src/data/local/`：SQLite schema、notes / attachments / sync_queue repositories。
- `offlineStore` 和 `main.jsx` 接入本地优先初始化、读取、写入、归档、删除和待同步队列。
- 修复 Android Gradle 构建配置：AndroidX / Jetifier、minSdk 24、AppCompat、Capacitor core dependency、本机 SDK 路径忽略。
- 更新 APK 构建脚本和校验脚本，APK 小于 1MB 会直接失败。

## 运行命令

```bash
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## 测试结果

- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- APK 大小：`25,393,803 bytes`，不再是 49KB 壳。
- `npm.cmd run android:verify`：通过，`ok=true`，`kind=capacitor-local-first`，`bundledReact=true`，`nativeShellOnly=false`。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，当前本地测试库 `noteCount=236`。
- `npm.cmd run test`：通过，16 suites / 84 tests / 84 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。

## 仍然存在的问题

- 本轮没有连接真实 Android 手机跑飞行模式真机测试；不能把“真机离线已通过”当成已验证事实。
- NAS 手动同步 push/pull、附件本地文件系统持久化和冲突处理还没有完成。
- Android SQLite 已接入基础层，但仍需要在真机上用日志验证 create/edit/delete/archive 全链路。

## 下一步建议

- 先安装当前 debug APK，在 vivo 和 Huawei / HarmonyOS 上测试：飞行模式打开、离线新建、编辑、删除、归档、重启后保留。
- 通过后再做手动同步：本地 pending 队列 push 到 NAS，NAS changes pull 回手机。

---
测试时间：2026-07-06

当前目标：继续按家庭自用小 Gate 推进离线 Android APK。本轮只补“离线进入 App 后还能重新修改 Docker/NAS 服务器地址”的缺口，不改业务逻辑、不改数据库、不碰真实运行数据。

## 复现步骤

1. 安装 Android APK，首次不填写服务器地址，点击“离线使用”。
2. 进入 App 后打开设置页。
3. 检查是否有入口重新打开 Android 原生服务器地址设置。

## 问题原因

- 原生 Android 壳的启动设置页和连接失败页已有“修改服务器地址”。
- 但进入 `file:///android_asset/www/index.html` 离线 App 后，前端设置页没有调用原生设置页的桥接方法。
- 这会导致家庭用户离线记录后，想恢复连接 Docker/NAS 时路径不够直观。

## 修复内容

- Android `HomeNoteAndroid` bridge 增加 `openServerSettings()`。
- 前端新增 `openAndroidServerSettings()`，通过 bridge 打开原生服务器地址设置页。
- 设置页在 APK 环境显示“修改手机端服务器地址”，普通浏览器不显示。
- 更新 Android wrapper 和前端静态测试。

## 运行命令

```bash
node --test tests/android-wrapper.test.js tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- `node --test tests/android-wrapper.test.js tests/frontend-ui.test.js`：通过，26 项测试通过。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，当前测试库 `noteCount=198`。
- `npm.cmd run test`：通过，16 suites / 86 tests / 86 pass。
- `npm.cmd run build`：通过，仍有已知 Tiptap bundle size warning。
- `npm.cmd run android:build`：通过，重新生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，APK 内含 `assets/www/index.html`、最新 JS/CSS 和离线 bundle 标记。
- `npm.cmd run android:delivery-check`：通过，覆盖 `check/test/build/android:build/android:verify`，并在临时 `http://127.0.0.1:3400` 服务上跑 HTTP smoke；新建记录、Note Station web import、备份、JSON 导出和前端 shell 均通过。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到 USB 连接且授权的真实手机；这不是代码构建失败，但真机验收仍未完成。

## 仍然存在的问题

- 本轮还没有完成两台真机验收；`android:device-smoke` 需要连接手机后运行。
- 离线记录恢复联网同步仍需要在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上实测。

## 下一步建议

- 继续运行完整 `npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`、`npm.cmd run android:build`、`npm.cmd run android:verify`、`npm.cmd run android:delivery-check`。
- 真机测试重点：离线新建、离线编辑、重启保留、设置页修改服务器地址、恢复 Docker/NAS 后同步。

---

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

`ash
npm.cmd run check
npm.cmd run test
npm.cmd run build
docker compose up -d --build
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
`

## 测试结果

-
npm.cmd run check：通过，integrityCheck=ok，categoryCount=11，
oteCount=114。
-
npm.cmd run test：通过，11 个 suite，40 个 test，40 个 pass，0 个 fail。
-
npm.cmd run build：通过。
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


## 2026-07-04 - 离线 app-data 快照缓存

- 新增前端静态回归测试断言：offline app-data cache key、读写函数、offline-cache 模式、快照合并、最近 100 条非离线记录缓存。
- 单项验证：node --test tests/frontend-ui.test.js 通过，14 tests。
- 待人工验证：在线打开一次页面后停止 Docker，刷新页面应仍能看到最近一次加载的记录；此时新建记录应进入“待同步到 NAS”，恢复 Docker 后自动同步。

- Docker 复验：docker compose up -d --build 通过；npm.cmd run smoke -- --base-url http://127.0.0.1:3300 通过；/sw.js 检查通过。


## 2026-07-04 - Android WebView 第一版打包验证

- 新增 tests/android-wrapper.test.js，覆盖 Android 壳必须有服务器地址设置、SharedPreferences、WebView、网络错误处理、局域网 HTTP 支持和手工打包脚本。
- node --test tests/android-wrapper.test.js：通过。
- npm.cmd run android:build：通过，生成 android/app/build/outputs/apk/debug/app-debug.apk。
- apksigner verify：通过，v1/v2/v3 签名为 true。
- 待人工验证：安装到安卓手机，输入 Docker/NAS 局域网地址，检查首页、富文本新建/编辑、Note Station 导入、设置页是否可用。

## 2026-07-04 - 本地优先长期离线第一版验证

目标：将 Android / WebView 离线能力从短期兜底升级为 IndexedDB 本地优先第一版。

已执行：

- 新增 `tests/offline-store-static.test.js`，首次运行失败，确认缺少 IndexedDB 本地优先模块和前端接入。
- 新增 `src/client/offlineStore.js` 后，局部测试通过。
- `node --test tests/frontend-ui.test.js` 通过。
- `npm.cmd run build` 通过。

待最终收口时继续运行：

- `npm.cmd run check`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run android:build`

人工建议测试：

1. 在线打开 App，确认记录列表正常。
2. 关闭 Docker/NAS 或填入不可访问地址。
3. 刷新后确认仍能看到 IndexedDB 本地快照。
4. 离线新建富文本记录。
5. 离线编辑一条本地记录。
6. 恢复 Docker/NAS，确认记录同步到服务端。

### 最终验证补充

- `npm.cmd run check` 通过，SQLite integrity_check 为 ok。
- `npm.cmd run test` 通过，62 个测试全部通过。
- `npm.cmd run build` 通过，只有 Vite chunk-size warning。
- `npm.cmd run android:build` 通过，APK 签名校验通过。

## 2026-07-04 - 发布镜像 / APK 关键入口补救验收

测试时间：2026-07-04 17:49:57

### 用户反馈

- 本地 Docker http://192.168.110.98:3300/ 功能正常。
- 用户部署/使用发布到 GitHub 的 Docker 镜像时，浏览器端不能正常导入 .nsx，并反馈新建笔记不能保存。
- 基础 Android APK 中无法选择 .nsx 文件。

### 复现与定位

- 本地工作区 main...origin/main 干净，当前最新提交为 ca5e1b4 Add GHCR image deployment for NAS。
- 拉取并运行 ghcr.io/ddrcpddr/note:latest 临时容器，digest：sha256:323fb57d799d083c4034eec37e8af36a077f32fd9535d7c79276c6bd5a4adcaa。
- 临时容器 127.0.0.1:3311 上手工 HTTP 验证：
  - health 通过；
  - 新建富文本记录保存成功；
  - 详情读取成功；
  - .nsx dry-run 解析成功；
  - .nsx commit 成功；
  - 导入记录富文本 HTML 中出现 2 个 /api/attachments/ 内联引用。
- Android 源码确认未实现 WebChromeClient.onShowFileChooser，这是 APK 无法选择 .nsx 的直接原因。

### 修复内容

- Android WebView 接入文件选择器：ACTION_OPEN_DOCUMENT、onShowFileChooser、onActivityResult。
- health 接口增加 build 信息，便于确认 NAS 上实际运行版本。
- Dockerfile / GHCR workflow 增加 build args：commit 和 build time。
- HTTP smoke 增加真实写入与 Note Station web import 检查，不再只测 health/list/export。

### 已运行命令

-
npm.cmd run test -- tests/android-wrapper.test.js
-
npm.cmd run test -- tests/http-smoke.test.js tests/ghcr-deployment.test.js
- 手工 GHCR 临时容器 HTTP 验证脚本：保存新笔记 + .nsx dry-run + commit + 富文本内联附件检查。

### 结果

- Android wrapper 测试通过。
- HTTP smoke / GHCR 相关测试通过。
- GHCR latest 在本机全新容器下保存和导入均通过。

### 仍需人工确认

- NAS 上是否已经重新拉取最新 GHCR 镜像并重建容器。
- 浏览器或 APK 是否仍缓存旧前端；必要时清站点数据或卸载重装 APK。
- 新 APK 重新打包后，在手机端实际选择 .nsx 文件。

## 2026-07-04 19:20:59 +08:00 - GHCR Docker UI save/import regression

### Reproduction
- Pulled and ran the GitHub Container Registry image locally as ghcr.io/ddrcpddr/note:latest on port 3314.
- Real Chromium UI click flow reproduced the user-visible bug: quick note creation failed to persist.
- Browser error: Failed to execute 'put' on 'IDBObjectStore': Symbol(react.forward_ref) could not be cloned.

### Root Cause
- The React app normalized categories with lucide React component values in category.icon /
ote.icon.
- saveLocalSnapshot() wrote those UI-only values directly into IndexedDB.
- IndexedDB structured clone rejected React component symbols, aborting the UI save flow before the note became searchable.

### Fix
- Added 	oIndexedDbSafeValue() in src/client/offlineStore.js.
- All IndexedDB writes now strip functions, symbols, undefined values, and circular references while preserving plain data and cloneable binary values.
- Added regression coverage in 	ests/offline-store-static.test.js.

### Verification
-
npm.cmd run check: passed, SQLite integrity ok.
-
npm.cmd run test: passed, 66 tests.
-
npm.cmd run build: passed.
- Built local Docker image
ote:ui-fixed-test and ran it on http://127.0.0.1:3315.
- Playwright UI save regression: passed, created note was searchable and no IndexedDB clone error appeared.
- Playwright UI NSX import regression: passed, selected .nsx, previewed, committed, and imported rich text included 2 inline /api/attachments/ refs.
-
npm.cmd run smoke -- --base-url http://127.0.0.1:3315: passed.

### Delivery Rule Added
- API-only smoke is not enough for Docker delivery. Before publishing a Docker image, run the built image locally and test critical flows through a real browser UI.

## 2026-07-04 19:30:53 +08:00 - Published GHCR image verification

- Pulled ghcr.io/ddrcpddr/note:latest after GitHub Actions run 28704706778 completed successfully.
- Verified health build commit: cb67794f68853b65c6dc63b2fe20d72ce96d2ebc.
- Real browser UI quick-save test against http://127.0.0.1:3316: passed; note became searchable and browser reported no IndexedDB clone error.
- Real browser UI NSX import test against http://127.0.0.1:3316: passed; .nsx file could be selected, previewed and committed; imported rich text had 2 inline /api/attachments/ refs.
-
npm.cmd run smoke -- --base-url http://127.0.0.1:3316: passed against the published GHCR image.

## 2026-07-04 21:36:17 +08:00 - Huawei P30 Pro / HarmonyOS APK edit white-screen guard

### 复现信息

- 用户设备：Huawei P30 Pro，基于安卓的鸿蒙系统。
- 对照设备：vivo X300 Pro 当前可用。
- 对照环境：同一 Docker 服务在手机浏览器中可用。
- 现象：APK 内点击编辑进入富文本编辑时白屏。

### 判断

- 服务端 / Docker 不是直接原因；浏览器可用、另一台 Android 设备可用，问题集中在 APK WebView 运行时与富文本编辑器兼容性。
- 当前机器无法直接安装到 Huawei P30 Pro 物理复现，所以本轮不声称已在该机实测通过；改为加入 WebView 兼容防护、错误上报和可降级编辑路径。

### 修复内容

- Vite 生产构建目标下调到 chrome80 / safari13，减少旧 WebView 解析现代语法的风险。
- 富文本编辑器外层新增 ErrorBoundary；如果旧 WebView 渲染 Tiptap 失败，自动切换为纯文本编辑 fallback，避免整页白屏。
- Android WebView 增加 JS console error / window error / unhandledrejection 捕获，通过 Toast 暴露页面脚本异常。
- Android WebView 增加 renderer gone 恢复处理，渲染进程崩溃时尝试重新加载服务地址。
- Android WebView 固定 textZoom=100，并允许 file/content access 与 mixed content compatibility，降低 HarmonyOS / 老 WebView 行为差异。

### 运行命令

- node --test tests/android-wrapper.test.js tests/frontend-ui.test.js：通过。
- npm.cmd run check：通过，integrityCheck ok，noteCount 188。
- npm.cmd run test：通过，68 tests。
- npm.cmd run build：通过。
- npm.cmd run android:build：通过，APK 已生成并通过 apksigner verify。

### 测试结果

- Android wrapper 新增兼容防护测试通过。
- 前端富文本 fallback 防白屏测试通过。
- 完整 check / test / build 通过。
- Debug APK 输出：android/app/build/outputs/apk/debug/app-debug.apk。

### 仍然存在的问题

- 尚未在用户的 Huawei P30 Pro 真机上验证；如果再次白屏，应观察是否出现“页面脚本异常”Toast，并用该错误继续定位。
- fallback 是保命路径：旧 WebView 如果无法运行富文本编辑器，会退回纯文本编辑，避免无法保存。

### 下一步建议

- 安装本轮新 APK 到 Huawei P30 Pro，先测试“打开详情 -> 编辑 -> 输入/保存”。
- 如果仍然异常，优先收集 Toast 文案、Android 系统 WebView 版本、HarmonyOS 版本。

## 2026-07-04 22:34:37 +08:00 - Huawei P30 Pro WebView findLast crash

### 复现步骤

- 用户在 Huawei P30 Pro / HarmonyOS APK 内打开编辑页。
- APK Toast 显示：页面脚本异常： JS console: TypeError: n.findLast is not a function。
- vivo X300 Pro 和浏览器端可用，说明服务端 API 不是直接原因。

### 问题原因

- Tiptap 打包后的前端 bundle 中使用了 Array.prototype.findLast。
- Huawei P30 Pro 上的旧 Android WebView 不支持该现代 Array API。
- Vite uild.target 只负责语法降级，不会自动补齐内置 API polyfill，所以页面进入编辑器时仍会脚本异常。

### 修复内容

- 新增 src/client/webviewCompat.js，补齐 Array.prototype.findLast 和 Array.prototype.findLastIndex。
- 在 src/client/main.jsx 首行引入兼容文件，确保进入 React / Tiptap 编辑器前已注册 polyfill。
- 新增前端回归测试，确认 polyfill 入口存在。

### 运行命令

-
ode --test tests/frontend-ui.test.js tests/android-wrapper.test.js：通过，18 tests。
-
npm.cmd run check：通过，integrityCheck ok，noteCount 188。
-
npm.cmd run test：通过，69 tests。
-
npm.cmd run build：通过。
- 构建产物检查：index-BNB4ADOV.js 中 polyfill 位于 .findLast( 使用之前。
-
npm.cmd run android:build：通过，APK 已重新生成。
- docker build -t note:findlast-polyfill-test .：通过。
- 临时 Docker http://127.0.0.1:3319 跑
npm.cmd run smoke：通过，新建、NSX import、备份、JSON 导出均 ok。
- 临时 Docker 实际 JS bundle 检查：hasFindLastPolyfill=true，polyfillBeforeUsage=true。

### 测试结果

- 旧 WebView 缺少 indLast/findLastIndex 的根因已在 bundle 层修复。
- Docker 镜像构建与 smoke 通过。
- APK 重新打包通过。

### 仍然存在的问题

- 仍需在 Huawei P30 Pro 真机安装新 APK，并连接更新后的 Docker/GHCR 镜像复测。
- 注意：APK 加载的是服务端前端 bundle，所以只更新 APK 不够；NAS/Docker 镜像也必须更新到包含该 polyfill 的版本。

### 下一步建议

- 推送后等待 GitHub Actions 生成新的 GHCR 镜像。
- NAS 上重新拉取 ghcr.io/ddrcpddr/note:latest 并重建容器。
- 华为手机卸载旧 APK 或清数据后安装新 APK，再测试进入编辑页。

### GHCR 发布镜像补充验证

- GitHub Actions workflow Build Docker image run 28709499108：completed / success。
- 已拉取 ghcr.io/ddrcpddr/note:latest，digest sha256:04d99ce047e961f73b68a95dff668fe0352966bf6156817680ddd18301df52ac。
- 发布镜像 health build commit：574e4f5c8f2309d9e88d2e6b0d72dd8f49ee1678。
- 发布镜像临时容器 http://127.0.0.1:3320 HTTP smoke：通过，新建、NSX import、备份、JSON 导出均 ok。
- 发布镜像实际 JS bundle：/assets/index-BNB4ADOV.js，确认 indLast polyfill 存在且位于 .findLast( 使用之前。

## 2026-07-05 15:06 +08:00 - Android APK icon and Docker timezone

### 复现步骤

1. 安装 Android debug APK 后，系统桌面没有显示项目图标。
2. 在 Docker 容器中读取本地时间，发现比北京时间少 8 小时，例如 UTC 01:00 对应实际北京时间 09:00。

### 问题原因

- AndroidManifest.xml 未声明 `android:icon`，Android 资源目录也没有 launcher icon 文件。
- Dockerfile 和 compose 文件未设置 `TZ`，Node 容器默认使用 UTC。

### 修复内容

- 复用已有 runtime PWA 图标，新增 Android `drawable/app_icon.png`。
- AndroidManifest.xml 增加 `android:icon="@drawable/app_icon"`。
- Dockerfile 增加 `ENV TZ=Asia/Shanghai`。
- `docker-compose.yml`、`docker-compose.image.yml`、`docker-compose.nas.yml` 增加 `TZ: "${TZ:-Asia/Shanghai}"`。
- NAS 部署文档补充 Docker 时区配置。
- 新增 Android 图标和 Docker 时区配置测试。

### 运行命令

```bash
node --test tests/android-wrapper.test.js tests/ghcr-deployment.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
docker build -t note:tz-icon-test .
npm.cmd run smoke -- --base-url http://127.0.0.1:3322
```

### 测试结果

- 针对性测试通过，7 tests。
- `npm.cmd run check` 通过，integrityCheck ok，noteCount 188。
- `npm.cmd run test` 通过，71 tests。
- `npm.cmd run build` 通过。
- `npm.cmd run android:build` 通过，APK 包内包含 `res/drawable/app_icon.png`。
- Docker 镜像时区检查通过，`2026-07-05T01:00:00Z` 在容器内显示为 `09:00 GMT+0800`。
- 临时 Docker 容器 HTTP smoke 通过，新建、NSX import、备份、JSON 导出均 ok。

### 仍然存在的问题

- 需要用户在真机安装新 APK，确认桌面图标显示正常。
- NAS 上旧容器不会自动变更时区，需要重新拉取/重建镜像并确认环境变量。

### 下一步建议

1. 推送后等待 GitHub Actions 重新构建 GHCR 镜像。
2. NAS 重新拉取 `ghcr.io/ddrcpddr/note:latest` 并重建容器。
3. 手机卸载旧 APK 或覆盖安装新 APK，检查桌面图标与应用功能。

### GHCR 发布镜像补充验证

- GitHub Actions workflow Build Docker image run 28733171626：completed / success。
- 已拉取 `ghcr.io/ddrcpddr/note:latest`，digest `sha256:b3726bd0379748acb7b79ddb4befb4fedf396dd9be018340ad9edd1c6fa2b8a9`。
- 发布镜像 health build commit：`bbf865e7999d1e4a3205651e8c0be074613405b2`。
- 发布镜像容器内 `TZ=Asia/Shanghai`，`2026-07-05T01:00:00Z` 显示为 `09:00 GMT+0800`。
- 发布镜像临时容器 `http://127.0.0.1:3323` HTTP smoke：通过，新建、NSX import、备份、JSON 导出均 ok。

## 2026-07-05 17:50 +08:00 - New note timestamp offset

### 复现步骤

1. 使用最新 GHCR 镜像启动 Docker 服务。
2. 新建一条记录。
3. 对比手机/北京时间和页面显示的新建记录时间。
4. 用户反馈页面显示比预期多 8 小时。

### 问题原因

- 上一轮只验证了容器 `TZ=Asia/Shanghai` 和 `new Date()`，没有验证新建记录写入链路。
- `notes` 表新建记录仍由 SQLite `CURRENT_TIMESTAMP` 生成 `created_at/updated_at/occurred_at`。
- SQLite `CURRENT_TIMESTAMP` 是 UTC 裸字符串，例如 `2026-07-05 09:34:48`，不带时区。
- 前端 `new Date(value)` 遇到这种无时区字符串时，不同浏览器/WebView 行为可能不一致，导致时间被再次偏移。

### 修复内容

- 服务端新建记录时写入 ISO UTC 时间：`new Date().toISOString()`。
- 服务端编辑、归档、删除、批量分类时的 `updated_at` 也改为 ISO 时间。
- 前端新增 `parseAppDate()`，对旧 SQLite `YYYY-MM-DD HH:mm:ss` 时间按 UTC 归一化，再格式化到手机本地时间。
- `tests/mvp-api.test.js` 增加新建记录时间字段必须为 ISO UTC 的断言。
- `tests/frontend-ui.test.js` 增加前端旧 SQLite 时间归一化静态检查。

### 运行命令

```bash
node --test tests/mvp-api.test.js tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
docker build -t note:time-fix-test .
npm.cmd run smoke -- --base-url http://127.0.0.1:3326
```

### 测试结果

- 针对性测试通过，39 tests。
- `npm.cmd run check` 通过，integrityCheck ok，noteCount 188。
- `npm.cmd run test` 通过，72 tests。
- `npm.cmd run build` 通过。
- `npm.cmd run android:build` 通过。
- 本地 Docker 镜像 `note:time-fix-test` 构建通过。
- 实际新建记录链路验证：主机/容器北京时间 `17:50`，API `createdAt=2026-07-05T09:50:24.195Z`，前端本地格式化结果 `2026-07-05 17:50`。
- 临时 Docker HTTP smoke 通过，新建、NSX import、备份、JSON 导出均 ok。

### 仍然存在的问题

- 需要推送后等待 GHCR 重新构建，再拉取发布镜像复测同一条新建记录链路。
- 需要用户在手机 APK 上连接更新后的 Docker 镜像复测。

### 下一步建议

1. 推送代码并等待 GHCR latest 构建完成。
2. 拉取 GHCR latest 本机复测新建记录时间。
3. NAS 重新拉取镜像并重建容器后，手机 APK 新建一条记录核对手机当前时间。

### GHCR 发布镜像补充验证

- GitHub Actions workflow Build Docker image run 28736853899：completed / success。
- 已拉取 `ghcr.io/ddrcpddr/note:latest`，digest `sha256:248d9d1ce43ae3b5ce54e94f677534847d7a2f0373863372c214903efde8db99`。
- 发布镜像 health build commit：`54e331db08353bfeca0d53630d4bb2e5c3f2c0a6`。
- 发布镜像实际新建记录链路验证：本机北京时间 `17:55`，API `createdAt=2026-07-05T09:55:15.346Z`，前端本地格式化结果 `2026-07-05 17:55`。
- 发布镜像临时容器 `http://127.0.0.1:3328` HTTP smoke：通过，新建、NSX import、备份、JSON 导出均 ok。

---

测试时间：2026-07-06

当前目标：修复 Android APK 必须连接 Docker/NAS 才能使用的问题，改为正式离线 APK 壳。兼容目标设备包括 Huawei P30 Pro / HarmonyOS 旧 WebView 和 vivo X300 Pro 新 Android。

## 复现问题

- 旧 APK 只加载用户配置的服务器 URL；Docker/NAS 不可达时只能显示连接失败页，无法进入前端，也无法离线记事。
- APK 打包脚本没有把前端 `dist/` 放进 APK，因此冷启动离线没有本地页面。
- 前端 API 调用写死 `/api/...`，即使放进 `file:///android_asset`，也无法知道 Docker/NAS 服务地址。

## 问题原因

- Android 壳缺少 `file:///android_asset/www/index.html` 本地入口。
- Vite 构建资源路径此前不适合 file:// 直接加载。
- 前端缺少 Android bridge API 基址解析。
- 打包脚本可能复用旧 `dist/`，存在 APK 内置前端不是当前代码的风险。

## 修复内容

- Android 增加 `LOCAL_APP_URL`、`loadLocalApp()`、离线使用按钮和服务器不可达自动离线 fallback。
- Android bridge 增加 `getServerUrl()`，前端在 file:// 下通过它拼接 API 地址。
- WebView 允许 file URL 访问和 file URL 到网络请求，保留旧 WebView 兼容防护。
- Vite 增加 `base: './'`，前端资源可从 APK assets 相对加载。
- `scripts/build-android-debug.js` 每次先构建前端，再把 `dist/` 复制到 APK `assets/www/`，并用 aapt `-A` 打入 APK。
- Service Worker 在 file:// APK 壳下不注册，避免本地协议和旧 WebView 兼容问题。

## 运行命令

```bash
node --test tests/android-wrapper.test.js tests/frontend-ui.test.js tests/pwa-config.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- Android / 前端 / PWA 目标测试通过：24 tests。
- `npm.cmd run check`：通过，integrityCheck ok，noteCount=188。
- `npm.cmd run test`：通过，73 tests。
- `npm.cmd run build`：通过，仅保留已知 Tiptap bundle size warning。
- `npm.cmd run android:build`：通过，APK 签名校验通过。
- APK 包内容检查：包含 `assets/www/index.html`、`assets/www/assets/*.js/css/webp`、`assets/www/icons/*`、`classes.dex` 和 `res/drawable/app_icon.png`。

## 仍然存在的问题

- 需要在 Huawei P30 Pro / HarmonyOS 和 vivo X300 Pro 两台真机安装新 APK 人工验收。
- 当前离线能力基于 WebView IndexedDB；大附件 Blob 离线持久化、复杂冲突合并、后台同步不是本轮范围。
- 完全首次离线没有 NAS 历史数据快照，只能新建本机记录；在线成功加载后才有本机快照。

## 下一步建议

1. 安装新 APK，不配置服务器地址，点“离线使用”，新建一条记录，关闭重开确认还在。
2. 配置一个不可达服务器地址，确认自动进入离线模式。
3. 启动 Docker/NAS 后配置正确地址，确认本机待同步记录能同步。
4. 在 Huawei P30 Pro 上进入编辑页，若出现 Toast，记录完整错误文案。

---

测试时间：2026-07-06 11:11:44 +08:00

当前目标：修复 Android 离线 APK 在 vivo X300 Pro 上点击“离线使用”无法进入的问题。

## 复现步骤

1. 检查上一版 `android/app/build/outputs/apk/debug/app-debug.apk` 包内容。
2. 使用 `jar tf` 查看 APK 内 `assets/www` 条目。
3. 发现条目为 `assets/www\index.html`、`assets/www\assets\index-*.js`，不是 Android `file:///android_asset/www/index.html` 能稳定读取的正斜杠路径。

## 问题原因

- Android 打包脚本使用 `aapt2 link -A <assets>` 添加前端静态资源。
- 在 Windows 环境中该方式写入了反斜杠 zip entry。
- 上一轮验收只确认 APK 包内有 assets 文件，没有验证 zip entry 是否为 Android asset URL 需要的 `assets/www/index.html`。

## 修复内容

- `scripts/build-android-debug.js` 不再用 `aapt2 -A` 打入前端 assets。
- 改为 `aapt2 link` 生成 unsigned APK 后，用 JDK `jar uf -C <staged main> assets` 追加前端静态资源。
- 新增 `assertAndroidAssets()`：构建中检查 `assets/www/index.html` 必须存在，且 `assets/` 条目不得包含 Windows 反斜杠。
- `tests/android-wrapper.test.js` 增加对新打包策略和路径校验的断言。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run android:build
jar tf android/app/build/outputs/apk/debug/app-debug.apk
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

## 测试结果

- Android wrapper 定向测试：通过，3 tests。
- `npm.cmd run android:build`：通过，APK 签名校验通过。
- APK 包内容：确认包含 `assets/www/index.html`、`assets/www/assets/index-*.js`、`assets/www/assets/index-*.css`，均为正斜杠路径。
- 反斜杠检查：通过，`assets/` 条目无 `\`。
- `npm.cmd run check`：通过，integrityCheck ok，noteCount=188。
- `npm.cmd run test`：通过，73 tests。
- `npm.cmd run build`：通过，仅保留已知 bundle size warning。

## 仍然存在的问题

- 仍需用户在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 真机安装新 APK，确认点击“离线使用”可以进入本地页面并新建记录。
- 本次修复是 APK 打包路径问题，不改变离线同步策略本身。

## 下一步建议

1. 安装本次重新生成的 `android/app/build/outputs/apk/debug/app-debug.apk`。
2. 不配置服务器地址，直接点“离线使用”。
3. 新建一条离线记录，关闭 App 后重新打开确认记录仍在。
4. 再配置 Docker/NAS 地址，检查恢复联网后的同步。

---
测试时间：2026-07-06

当前目标：Gate 1，修复离线 Android APK 在未配置服务器时仍请求 `file:///api/access/status` 的脚本异常。本轮只修离线启动 API 防护，不改数据库、不改业务数据、不提交 `data/` 运行内容。

## 复现步骤

1. 安装离线 APK。
2. 不填写 Docker / NAS 服务器地址，点击“离线使用”。
3. 进入首页后观察 WebView toast / 控制台报错。

## 问题原因

`apiUrl('/api/access/status')` 在 `file://` 页面且没有保存服务器地址时仍返回 `/api/access/status`，Android WebView 会把它解析为 `file:///api/access/status`。这不是服务端问题，而是离线壳启动阶段不应该发起远程 API 请求。

## 修复内容

- 新增 `canUseRemoteApi()` 判断：只有非 `file://` 页面，或 Android 已配置服务器地址时，才允许访问远程 API。
- 新增 `fetchApi()` 包装，纯离线 Android 模式下直接抛出可控错误，让页面进入 IndexedDB 本地快照 / 本地空库逻辑，不再触发浏览器级 `file:///api/...` 请求。
- 将前端所有业务 `fetch(apiUrl(...))` 调整为 `fetchApi(...)`。
- 增加前端静态回归测试，覆盖纯离线 Android 不请求 file API URL。

## 运行命令

```bash
node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- 定向测试：通过，25 tests pass。
- `npm.cmd run check`：通过，SQLite integrityCheck ok。
- `npm.cmd run test`：通过，74 tests pass。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 已重新生成并签名校验通过。
- 生产构建检查：`dist/assets/index-n4InEOVD.js` 含离线 guard，未包含 `file:///api`，未包含旧 `fetch(apiUrl('/api/access/status'))`。

## 仍然存在的问题

- 仍需用户在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上安装新 APK 做真机确认。
- Gate 1 只解决“纯离线启动不请求 file:///api”的报错；长期离线完整附件、图片 Blob 和恢复联网同步仍属于 Gate 2 / Gate 3。

## 下一步建议

- 安装本轮新 APK，先不填服务器地址，点击“离线使用”，确认不再出现 `Fetch API cannot load file:///api/access/status`。
- 若 Gate 1 真机通过，继续 Gate 2：离线新建、编辑、富文本、分类、标签、图片/附件在本机长期保存。

---
测试时间：2026-07-06

当前目标：Gate 2 第一刀，收敛离线记录队列到 IndexedDB，避免长期离线和富文本附件继续依赖 localStorage。本轮不改服务端数据库结构、不提交运行数据。

## 复现 / 风险来源

旧实现中仍保留 `OFFLINE_CREATE_QUEUE_KEY` 的 localStorage 创建队列。短文本可能能用，但富文本图片 / 附件会携带 base64 或较大元数据，长期离线时 localStorage 容量风险高，也会和 IndexedDB syncQueue 形成两套离线队列。

## 问题原因

- 项目已经有 IndexedDB `notes` 和 `syncQueue`，但前端加载和同步路径仍混用旧 localStorage create queue。
- 旧队列只覆盖 create，不能自然表达编辑、附件和后续同步状态。

## 修复内容

- 移除旧 localStorage 创建队列引用：`OFFLINE_CREATE_QUEUE_KEY`、`readOfflineCreateQueue()`、`writeOfflineCreateQueue()`、`syncOfflineCreateQueue()`、`enqueueOfflineCreate()`。
- 新建 / 编辑统一通过 `saveLocalFirstDraft()` 写入 IndexedDB notes，并写入 IndexedDB syncQueue。
- 离线启动时从 IndexedDB snapshot 读取本地待同步记录。
- 恢复在线后通过 `readPendingMutations()` 同步到 Docker/NAS。
- 更新测试，明确禁止旧 localStorage 队列回归。

## 运行命令

```bash
node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- 定向测试：通过，25 tests pass。
- `npm.cmd run check`：通过，SQLite integrityCheck ok。
- `npm.cmd run test`：通过，74 tests pass。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 已重新生成并签名校验通过。

## 仍然存在的问题

- Gate 2 还没完成全部真机流程：仍需在 Android 离线状态下人工测试富文本、图片、附件、编辑后重启 App 是否仍保存。
- 大附件 Blob 的长期离线和恢复联网同步仍需要继续专项验证。

## 下一步建议

- 在新 APK 上不填服务器地址，离线新建 / 编辑一条带富文本和小图片的记录，重启 App 后确认记录仍在。
- 下一步继续补 Gate 2 的附件 / 图片离线持久化和同步验收。

---
测试时间：2026-07-06

当前目标：Gate 2 第二刀，让离线模式下的记录、分类、成员快照也写入 IndexedDB，避免离线修改后重启 App 丢状态。

## 问题原因

此前 `saveLocalSnapshot()` 主要在 `dataMode === 'sqlite'` 在线模式下写入。离线模式虽然能在当前页面保存记录，但分类、成员和本地记录列表的快照保存不够明确，存在重启后依赖旧快照或空快照的风险。

## 修复内容

- 快照保存改为：只要不是访问口令锁定状态，就把当前 `notesData`、`categoriesData`、`members`、`currentMemberId` 写入 IndexedDB snapshot。
- 在线模式仍额外保留 localStorage 的轻量 app-data cache 作为旧兼容 fallback。
- 新增测试断言，确保离线快照不再被 `dataMode !== 'sqlite'` 提前挡掉。

## 运行命令

```bash
node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- 定向测试：通过，25 tests pass。
- `npm.cmd run check`：通过，SQLite integrityCheck ok。
- `npm.cmd run test`：通过，74 tests pass。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 已重新生成并签名校验通过。

## 仍然存在的问题

- 还需要真机实际安装验证：离线新建 / 编辑 / 重启 App 后记录、分类、成员状态是否仍在。
- 恢复联网后的同步冲突和重复提交保护还没进入 Gate 3。

---
测试时间：2026-07-06

当前目标：Gate 3 第一刀，补齐 Android 离线记录恢复联网后的同步触发和重复队列保护。本轮不改数据库结构、不改真实运行数据、不提交 data/ 内容。

## 复现 / 风险来源

1. 离线新建一条本机记录后，如果继续离线编辑同一条记录，旧队列可能同时保留 create 和 update。恢复联网后 create 会生成服务端记录，但 update 仍指向 local-* ID，存在同步失败或重复处理风险。
2. 首页只有“本机记录待同步”提示，没有明确的手动“尝试同步”入口，家庭用户恢复 Docker/NAS 后不知道该刷新还是等待。

## 修复内容

- IndexedDB syncQueue 增加队列压缩：同一条 local-* 记录已有 pending create 时，后续 update 会合并回这条 create，只保留最新 payload。
- 首页待同步提示增加“尝试同步”按钮，点击后重新尝试连接家庭记录服务。
- 浏览器 / WebView 触发 online 事件时，如果存在待同步记录，也会重新尝试连接。
- 新增回归测试覆盖队列压缩和手动同步入口。

## 运行命令

```bash
node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- 定向测试：通过，26 tests pass。
- npm.cmd run check：通过，integrityCheck=ok，categoryCount=11，noteCount=188。
- npm.cmd run test：通过，75 tests pass。
- npm.cmd run build：通过，保留已知 Tiptap bundle size warning。
- npm.cmd run android:build：通过，APK 已重新生成并签名校验通过。

## 仍然存在的问题

- 还需要用户在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上做真机恢复联网同步验收。
- 当前仍是基础同步：失败重试和本机待同步提示已补齐，但复杂多设备冲突合并、后台自动同步、大附件 Blob 完整长期同步仍需后续小阶段处理。

## 下一步建议

1. 不配置服务器地址，离线新建一条记录。
2. 离线编辑这条记录，修改标题、正文、分类或标签。
3. 重启 App，确认记录仍在并显示待同步。
4. 配置正确 Docker/NAS 地址，点击“尝试同步”。
5. 在 Docker/NAS 浏览器端确认只出现一条最终记录，内容是最后编辑后的版本。
---
测试时间：2026-07-06

当前目标：Gate 4 第一刀，修复离线同步失败后的可见状态和重试触发。本轮不改数据库结构、不修改真实运行数据、不提交 data/ 内容。

## 复现 / 风险来源

上一轮虽然在首页增加了“尝试同步”按钮，但复查代码发现：如果 App 已经处于在线 sqlite 模式且队列里有失败项，按钮主要触发重新拉取服务端数据，不一定立刻重跑 syncPendingLocalMutations。家庭用户看到按钮但失败项不动，会误以为同步坏了。

## 问题原因

- `retryRemoteConnection()` 只递增 accessNonce，没有在在线模式下直接触发本机待同步队列。
- 首页待同步提示没有区分 pending 和 failed，用户无法知道是还没同步，还是同步失败需要重试。
- 同步失败时只把 mutation 标记为 failed，没有明确 toast 提示。

## 修复内容

- `retryRemoteConnection()` 在 `dataMode === 'sqlite'` 且存在待同步记录时，直接调用 `syncPendingLocalMutations()`。
- 首页根据 `offlineFailedCount` 显示“有 X 条同步失败，可重试”，按钮文案切换为“重试同步”。
- 同步失败时 toast 提示“同步暂时失败，可稍后重试”；部分成功时提示“已同步部分记录，还有记录待重试”。
- 新增静态回归测试，防止按钮退回成只刷新。

## 运行命令

```bash
node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- 定向测试：通过，26 tests pass。
- npm.cmd run check：通过，integrityCheck=ok，categoryCount=11，noteCount=188。
- npm.cmd run test：通过，75 tests pass。
- npm.cmd run build：通过，保留已知 Tiptap bundle size warning。
- npm.cmd run android:build：通过，APK 已重新生成并签名校验通过。

## 仍然存在的问题

- 仍需两台真机人工验收：vivo X300 Pro 与 Huawei P30 Pro / HarmonyOS。
- 当前是基础失败重试：复杂冲突合并、后台同步、大附件 Blob 长期离线同步仍未完成。

## 下一步建议

1. 离线新建并编辑一条记录。
2. 临时配置错误服务器地址，观察待同步 / 失败提示。
3. 改回正确 Docker/NAS 地址，点击“重试同步”。
4. 在服务端确认只出现最终版本记录。

---
测试时间：2026-07-06

当前目标：Gate 5 第一刀，防止离线编辑旧版本在恢复联网后静默覆盖服务端新版本。本轮不改数据库结构、不修改真实运行数据、不提交 data/ 内容。

## 复现 / 风险来源

家庭里可能出现两台手机或手机 + 浏览器同时使用：A 手机离线打开并编辑旧记录，B 设备已经在线修改了同一条记录。A 手机恢复联网后如果直接 PATCH，会把 B 的更新覆盖掉。

## 问题原因

离线队列此前只保存最新编辑 payload，没有保存编辑时看到的服务端 `updatedAt` 基线。服务端收到 PATCH 时无法判断这是基于旧版本的离线编辑，还是用户刚刚基于最新记录做的编辑。

## 修复内容

- 前端把已有服务端记录进入离线编辑时的 `updatedAt` 保存为 `baseUpdatedAt`。
- 服务端 PATCH 检查 `baseUpdatedAt`，发现服务端记录已更新时返回 `409 note_conflict`。
- 同步失败信息保留在 IndexedDB 队列中，避免静默丢失本机编辑。
- 增加 API 和前端静态回归测试。

## 运行命令

```bash
node --test tests/mvp-api.test.js tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- 定向测试：通过，49 tests pass。
- npm.cmd run check：通过，integrityCheck=ok，categoryCount=11，noteCount=188。
- npm.cmd run test：通过，76 tests pass。
- npm.cmd run build：通过，保留已知 Tiptap bundle size warning。
- npm.cmd run android:build：通过，APK 已重新生成并签名校验通过。

## 仍然存在的问题

- 当前只是防覆盖保护，不做复杂冲突合并界面。
- 仍需要两台真机实际验证离线编辑、恢复联网、失败重试和冲突提示。

## 下一步建议

1. A 设备离线打开一条已有记录并编辑。
2. B 设备在线修改同一条记录。
3. A 设备恢复联网后尝试同步。
4. 确认服务端不会被旧版本覆盖，A 设备显示同步失败 / 待处理。

---
测试时间：2026-07-06

当前目标：Gate 6 第一刀，补齐离线富文本图片 / 附件的安全边界。本轮不改数据库结构、不修改真实运行数据、不提交 data/ 内容。

## 复现 / 风险来源

富文本编辑器已经能插入图片和附件，但如果用户在离线 APK 里插入过大的手机照片或文件，页面可能看起来保存成功，恢复联网时却因为 JSON / 同步体积过大失败。这对家庭用户是最糟的体验：以为保存了，最后同步不了。

## 问题原因

图片和附件此前直接转成 base64 放进富文本正文和同步 payload，没有客户端大小边界，也没有图片压缩。服务端 JSON 限制和移动端存储限制会在更晚的时候才暴露。

## 修复内容

- 图片插入前尝试压缩到移动端离线同步友好的大小。
- 图片超过 12MB、压缩后仍过大或压缩失败时，编辑器内直接提示。
- 普通附件单个超过 8MB 时，编辑器内直接提示。
- 新增测试覆盖图片压缩常量、附件大小限制和编辑器提示入口。

## 运行命令

```bash
node --test tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 测试结果

- 定向测试：通过，27 tests pass。
- npm.cmd run check：通过，integrityCheck=ok，categoryCount=11，noteCount=188。
- npm.cmd run test：通过，77 tests pass。
- npm.cmd run build：通过，保留已知 Tiptap bundle size warning。
- npm.cmd run android:build：通过，APK 已重新生成并签名校验通过。

## 仍然存在的问题

- 还没做超大附件 Blob 独立长期离线存储和分块同步。
- 仍需真机测试手机照片压缩后的显示、重启持久化和恢复联网同步。

## 下一步建议

1. 安卓 APK 离线新建一条富文本记录。
2. 插入一张手机照片和一个小附件。
3. 保存后杀掉 App 再打开，确认记录和图片仍在。
4. 恢复连接 Docker/NAS，确认记录能同步。
5. 尝试插入一个超过 8MB 的普通附件，确认会提示而不是假保存。

---
测试时间：2026-07-06

当前目标：Gate 7 第一刀，本机构建产物启动后的真实 HTTP 烟测。本轮不改业务代码、不改数据库结构、不提交 data/ 内容。

## 复现 / 风险来源

此前用户遇到过“本地浏览器好用，但推到 Docker / APK 后不能保存或不能导入”的问题。因此本轮不能只看单元测试，必须启动真实服务并跑 API 烟测。

## 测试内容

- 启动 Express 服务到 `http://localhost:3400`。
- 对 `http://127.0.0.1:3400` 执行完整 smoke。
- 覆盖健康接口、app-data、列表、详情、搜索、分类筛选、成员筛选、分类 API、新建记录、Note Station 网页上传导入、存储探测、手动备份、JSON 导出和前端 shell。

## 运行命令

```bash
$env:PORT='3400'; npm.cmd run server
npm.cmd run smoke -- --base-url http://127.0.0.1:3400
```

## 测试结果

- smoke：通过，`ok=true`。
- `notestation-web-import`：通过，`inlineAttachmentRefs=2`。
- `manual-backup`：通过。
- `json-export`：通过。
- `frontend-shell`：通过，HTTP 200。

## 仍然存在的问题

- 这次是本机 HTTP 烟测，不等同于两台手机的真机离线 / 联网同步验收。
- 烟测会新增本地测试记录和运行文件，但这些都在 ignored 的 `data/` 目录，不提交。

## 下一步建议

1. 用最新 APK 在 vivo X300 Pro 离线新建 / 编辑 / 插图。
2. 用 Huawei P30 Pro / HarmonyOS 打开编辑页，确认不白屏。
3. 配置 Docker/NAS 地址后点击同步。
4. 在浏览器端确认新记录存在，NSX 导入仍可用。

---
测试时间：2026-07-06

当前目标：Gate 8，整理 Android APK 家庭测试交付说明。本轮不改业务代码、不改数据库结构、不提交 data/ 内容。

## 内容

- 新增 `docs/ANDROID_APK_HANDOFF.md`。
- 记录 APK 路径、已验证命令、当前能力、真机验收流程、当前不承诺事项、Docker/NAS 地址填写注意点。

## 运行命令

提交前继续运行：

```bash
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

## 仍然存在的问题

- 真机验收还需要用户在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上实际安装测试。
- 当前文档说明的是 debug APK 家庭测试，不是商店发布版本。

---
测试时间：2026-07-06

当前目标：Gate 9，新增 Android APK 离线包结构验证，避免只靠源码静态测试或 APK build 通过就交付。本轮不改业务逻辑、不改数据库结构、不提交 data/ 内容。

## 复现 / 风险来源

之前出现过 APK 打包路径、离线 `file:///api`、Android 端和浏览器端行为不一致的问题。只跑 `npm.cmd run android:build` 不能证明 APK 内部前端资源就是 file-safe 的，也不能证明构建后的 JS 仍保留离线保护。

## 修复内容

- 新增 `scripts/verify-android-debug-apk.js`。
- 新增 npm 命令 `android:verify`。
- Android wrapper 测试新增对验证脚本的覆盖。
- 交付文档补充：以后 APK 交付前必须跑 `android:verify`。

## 运行命令

```bash
npm.cmd run android:verify
node --test tests/android-wrapper.test.js tests/frontend-ui.test.js tests/offline-store-static.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
```

## 测试结果

- `npm.cmd run android:verify`：通过。
- 定向测试：通过，28 tests pass。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，78 tests pass。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- 最终再次 `npm.cmd run android:verify`：通过。

## 仍然存在的问题

- 该验证能证明 APK 包结构和离线运行时标记正确，但不能替代 vivo / Huawei 真机手动测试。
- 仍需用户在两台手机上测试离线新建、编辑、插图、重启、联网同步。

---
测试时间：2026-07-06

当前目标：Gate 10，补齐离线 IndexedDB 本地数据链路的行为级回归测试。本轮不改业务逻辑、不改数据库结构、不提交 data/ 内容。

## 复现 / 风险来源

离线 Android 目前依赖 WebView IndexedDB 保存本地记录和待同步队列。上一轮 `android:verify` 能确认 APK 包结构和构建后 JS 标记，但不能证明离线存储函数本身真的能完成“保存、恢复、失败重试、队列压缩”。

## 修复内容

- 新增 `tests/offline-store-behavior.test.js`。
- 在测试中实现轻量内存版 IndexedDB fake，不引入新依赖。
- 行为级覆盖：
  - 离线快照保存和恢复。
  - 离线新建后继续编辑时合并为一条 pending create。
  - 同步失败保留为 failed，成功后删除。
  - IndexedDB 写入前清理循环引用和函数值。

## 运行命令

```bash
node --test tests/offline-store-behavior.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js tests/frontend-ui.test.js
```

## 测试结果

- 定向测试：通过，32 tests pass。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，`categoryCount=11`，`noteCount=190`。
- `npm.cmd run test`：通过，15 suites / 82 tests / 82 pass。
- `npm.cmd run build`：通过，仍有已知 Tiptap chunk size warning。
- `npm.cmd run android:build`：通过，APK 已重新生成并签名校验通过。
- `npm.cmd run android:verify`：通过，确认 APK 内 `assets/www/index.html`、相对路径 JS/CSS、manifest/icons 和离线运行时标记存在。

## 仍然存在的问题

- 这是函数级自动化测试，不等同于真实手机 WebView 的完整离线 / 联网同步验收。
- 仍需要在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上验证：离线新建、离线编辑、插图、重启后保留、恢复 Docker/NAS 后同步。

---
测试时间：2026-07-06

当前目标：Gate 11，新增 Android APK 交付前一键自检，避免以后漏跑 build、APK verify 或 HTTP smoke。本轮不改业务逻辑、不改数据库结构、不提交 data/ 内容。

## 复现 / 风险来源

此前多次出现“某个环境好用，但交付到 APK / Docker / GHCR 后版本或功能不一致”的问题。零散手动运行命令容易漏掉步骤，也容易忘记启动真实 HTTP 服务做 smoke。

## 修复内容

- 新增 `scripts/android-delivery-check.js`。
- 新增 npm 命令 `android:delivery-check`。
- Android wrapper 测试新增对该命令和脚本关键步骤的覆盖。
- 自检会执行：`check`、`test`、`build`、`android:build`、`android:verify`，并启动临时 `3400` 端口服务跑 HTTP smoke。
- 第一次实现用 `npm run server` 启动临时服务时，Windows 上退出不够干净；已改为直接 `node src/server/index.js`，最终脚本能正常退出。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run android:delivery-check
```

## 测试结果

- `node --test tests/android-wrapper.test.js`：通过，5 tests pass。
- `npm.cmd run android:delivery-check`：通过。
- 自检内部结果：
  - `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，`categoryCount=11`。
  - `npm.cmd run test`：通过，15 suites / 83 tests / 83 pass。
  - `npm.cmd run build`：通过，仍有已知 Tiptap chunk size warning。
  - `npm.cmd run android:build`：通过，APK 签名校验通过。
  - `npm.cmd run android:verify`：通过。
  - `npm.cmd run smoke -- --base-url http://127.0.0.1:3400`：通过，覆盖 health、app-data、列表、详情、新建、Note Station 网页导入、备份、JSON 导出和前端 shell。
  - APK 输出：`android/app/build/outputs/apk/debug/app-debug.apk`，大小约 `518079` bytes。

## 仍然存在的问题

- 一键自检仍是本机自动化，不等同于 vivo X300 Pro / Huawei P30 Pro 真机完整验收。
- HTTP smoke 会在本地 ignored `data/` 下生成测试记录、备份和导出文件，提交前必须继续确认不跟踪运行数据。

---
测试时间：2026-07-06

当前目标：Gate 12，新增 Android 真机 ADB 启动日志烟测命令。本轮不改业务逻辑、不改数据库结构、不提交 data/ 内容。

## 复现 / 风险来源

APK 在浏览器和本机自动化通过后，仍可能在真实手机 WebView 上出现白屏、脚本异常或系统兼容问题。此前 Huawei P30 Pro / HarmonyOS 曾出现编辑页脚本异常，所以交付前需要一个能安装 APK、启动 App、抓取 logcat 的命令。

## 修复内容

- 新增 `scripts/android-device-smoke.js`。
- 新增 npm 命令 `android:device-smoke`。
- Android wrapper 测试新增对该命令的覆盖。
- `.gitignore` 新增 `output/`，避免真机日志被提交。
- Android 交付文档补充可选真机烟测说明。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- `node --test tests/android-wrapper.test.js`：通过，6 tests pass。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，`categoryCount=11`。
- `npm.cmd run test`：通过，15 suites / 84 tests / 84 pass。
- `npm.cmd run build`：通过，仍有已知 Tiptap chunk size warning。
- `npm.cmd run android:verify`：通过，确认 APK 内 `assets/www/index.html`、相对路径 JS/CSS、manifest/icons 和离线运行时标记存在。
- `npm.cmd run android:delivery-check`：通过，内部覆盖 `check/test/build/android:build/android:verify`，并启动临时 `http://127.0.0.1:3400` 执行 HTTP smoke。
- `npm.cmd run android:device-smoke`：脚本可找到本机 Android SDK 默认目录下的 adb，但当前未连接可用手机，因此按预期失败并提示“没有检测到可用手机”。这不是 APK 功能通过，只表示命令在无真机环境下能给出明确原因。

## 仍然存在的问题

- 本轮尚未连接真实手机成功执行 `npm.cmd run android:device-smoke`，所以不能声明 vivo / Huawei 真机已通过。
- 后续交付 APK 前，如果电脑连接了手机，应先运行 `npm.cmd run android:device-smoke`，再做人工离线和同步流程。

---
测试时间：2026-07-06

当前目标：Gate 13，补齐恢复联网同步批处理行为测试。本轮不改数据库结构，不提交 data/ 内容。

## 复现 / 风险来源

离线 APK 恢复联网时，最容易出问题的是待同步队列：成功项没有清理、失败项被误删、失败后继续乱同步后续记录，都会导致家庭记录重复、丢失或状态混乱。此前已有 IndexedDB 存储测试，但同步批处理主循环仍主要依赖源码静态检查。

## 修复内容

- 新增 `src/client/offlineSync.js`，把离线待同步批处理循环抽成可测试函数。
- 新增 `tests/offline-sync-behavior.test.js`。
- React 页面继续调用同一套同步逻辑，不改变用户交互。
- 前端静态测试更新为检查 `offlineSync.js` 接入和失败后停止批处理。

## 运行命令

```bash
node --test tests/offline-sync-behavior.test.js tests/offline-store-behavior.test.js tests/offline-store-static.test.js tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
```

## 测试结果

- 定向离线测试：通过，30 tests pass。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，`categoryCount=11`。
- `npm.cmd run test`：通过，16 suites / 86 tests / 86 pass。
- `npm.cmd run build`：通过，仍有已知 Tiptap chunk size warning。
- `npm.cmd run android:build`：通过，APK 重新生成并签名验证通过。
- `npm.cmd run android:verify`：通过，APK 内部 JS 为 `assets/www/assets/index-NFcfECEN.js`。
- `npm.cmd run android:delivery-check`：通过，内部再次覆盖 `check/test/build/android:build/android:verify`，并启动临时 `http://127.0.0.1:3400` 执行 HTTP smoke；smoke 覆盖 health、app-data、列表、详情、新建、Note Station 网页导入、备份、JSON 导出和前端 shell。

## 仍然存在的问题

- 该测试证明恢复联网同步批处理的代码行为，但仍不能替代真实手机上的离线新建、编辑、重启、恢复联网同步人工验收。
- 当前电脑未连接手机，因此本轮没有执行成功的 `npm.cmd run android:device-smoke`。

---
测试时间：2026-07-06

---
测试时间：2026-07-06

当前目标：纠正 Android 交付路线，停止 WebView/file:// 壳 APK，验证原生离线核心 APK。

## 问题结论

用户反馈是正确的：此前所谓离线 APK 实际仍是 WebView / file:// 壳，离线、兼容性、长期本地保存都不可靠。继续在壳 APK 上修补属于错误方向，不能作为家庭自用离线 Android App 交付。

## 本轮修正

- Android `MainActivity.java` 改为原生 Android UI + SQLite 本地存储。
- 移除 WebView 加载路径，不再打包 `assets/www`。
- Android 构建脚本改为构建原生离线 APK，不再先构建前端网页并复制到 APK。
- APK 验证脚本新增 `nativeOffline` 和 `webAssetCount=0` 检查。
- Android 测试改为确认原生 SQLite 路线，并禁止 WebView 壳标记回归。

## 运行命令

```bash
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`，当前 Web 服务测试库记录数为 202。
- `npm.cmd run test`：通过，16 suites / 85 tests / 85 pass。
- `npm.cmd run build`：通过，仍有 Vite 大 chunk warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`，`hasClassesDex=true`，`hasLauncherIcon=true`，`webAssetCount=0`。
- HTTP smoke：通过，覆盖 health、app-data、列表、详情、新建、Note Station 网页导入、备份、JSON 导出和前端 shell。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机。这不是 APK 功能失败，但表示本机无法完成自动真机验收；不能声称 vivo X300 Pro / Huawei P30 Pro 已通过。

## 仍然存在的问题

- 当前原生 Android 只完成离线核心：列表、新建、编辑、详情、本地保存。
- 还没有原生端同步 Docker/NAS。
- 还没有原生端富文本、附件、Note Station `.nsx` 导入、分类筛选、成员等完整功能。
- 当前电脑未连接手机，不能声称 vivo / Huawei 已验收。

---
测试时间：2026-07-06

当前目标：原生离线 Android 增加本地搜索和分类筛选。

## 复现 / 风险来源

上一轮原生 APK 只完成列表、新建、编辑、详情和本地保存。家庭日常使用至少需要在离线状态下按关键词找记录、按分类缩小范围，否则只是“能记”，还不能算可持续使用。

## 修复内容

- Android 原生首页新增搜索输入和搜索按钮。
- 搜索范围：标题、正文、标签。
- Android 原生首页新增横向分类筛选。
- 分类来源：手机本地 SQLite 记录中的 distinct category。
- 增加“清除筛选”入口。
- 新增 Android 测试覆盖搜索、分类筛选、SQLite 查询方法和 `LIKE ?` 条件。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，6 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 86 tests / 86 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`，`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，临时 `http://127.0.0.1:3400` HTTP smoke 也通过。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；不能声称真机通过。

## 仍然存在的问题

- 原生端尚未实现 Docker/NAS 同步。
- 原生端尚未实现富文本、附件、Note Station `.nsx` 导入。
- 真机仍需要用户或连接 USB 设备后验收。

---
测试时间：2026-07-06

当前目标：原生离线 Android 增加本机自定义分类管理。

## 复现 / 风险来源

上一阶段原生 APK 已经支持本地搜索和分类筛选，但分类来源主要依赖已有记录。家庭日常使用需要能在手机离线状态下先创建自己的分类，再用于新建和编辑记录。

## 修复内容

- Android 原生 SQLite 数据库版本升级到 2。
- 新增 `categories` 表和默认分类初始化。
- 新增原生分类管理页，可新增分类并按分类筛选。
- 新建 / 编辑记录页增加分类快捷选择。
- 新建 / 编辑保存时自动确保分类落入本地分类表。
- 新增 Android 静态测试覆盖分类表、默认分类、分类管理页和编辑页分类选择入口。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，7 tests。
- `npm.cmd run android:delivery-check`：通过。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 87 tests / 87 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- 临时 HTTP smoke：通过，覆盖 health、app-data、列表、详情、搜索、分类筛选、成员筛选、新建、Note Station 网页导入、备份、JSON 导出和前端 shell。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；不能声称真机通过。

## 仍然存在的问题

- 原生端尚未实现 Docker/NAS 同步。
- 原生端尚未实现富文本、图片、附件、Note Station `.nsx` 导入。
- 真机仍需要 USB 连接设备或用户手动验收。

---
测试时间：2026-07-06

当前目标：原生离线 Android 增加恢复联网同步的前置结构。

## 复现 / 风险来源

原生 APK 已能离线保存、搜索、分类和自定义分类，但恢复联网同步还没有数据结构基础。若继续直接做网络请求，容易再次出现“按钮存在但无法可靠同步”的半成品。因此本轮先补本机同步队列表和服务器地址配置。

## TDD 过程

- 先新增 `prepares native offline notes for later Docker NAS sync` 测试。
- 红灯结果：测试因 `DATABASE_VERSION = 3` 不存在而失败。
- 实现数据库版本 3、`sync_queue`、`queueSyncMutation`、`pendingSyncCount()`、`SharedPreferences` 服务器地址和同步页面后，定向测试通过。

## 修复内容

- Android 原生 SQLite 新增 `sync_queue` 表。
- 新建 / 编辑记录时记录 pending mutation。
- 首页显示待同步数量。
- 新增原生同步设置页面，可保存服务器地址。
- 手动同步按钮暂时只提示下一阶段接入 Docker/NAS，避免假同步。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，8 tests。
- `npm.cmd run android:delivery-check`：通过。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 88 tests / 88 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- 临时 HTTP smoke：通过。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；不能声称真机通过。

## 仍然存在的问题

- 原生端尚未真正同步 Docker/NAS。
- 原生端尚未实现同步成功后的队列清理。
- 原生端尚未处理同步失败提示细节、编辑同步冲突、富文本、图片、附件和 Note Station `.nsx` 导入。

---
测试时间：2026-07-06

当前目标：原生离线 Android 最小新建记录同步到 Docker/NAS。

## 复现 / 风险来源

上一阶段只有同步队列表和服务器地址配置，手动同步还没有真实网络请求。用户需要的是长期离线可用、恢复联网后可同步的 Android App，因此本轮先补最小闭环：本地新建记录上传到服务端。

## TDD 过程

- 新增 `syncs native offline created notes to Docker NAS when server is reachable` 测试。
- 红灯结果：测试因 `HttpURLConnection` 缺失失败，证明原生端确实还没有网络同步。
- 实现后定向 Android 测试通过。

## 修复内容

- 新增原生后台线程同步入口 `runManualSync()`。
- 新增 `syncPendingCreates()`，只处理 `create` 类型队列项。
- 新增 `postCreateMutation()`，POST 到真实 `/api/notes` 接口。
- 新增 `markSyncDone()` 和 `markSyncFailed()`。
- 修复全新安装时 `sync_queue` 未创建的问题。
- 同步失败项保留为 failed，并继续纳入待同步数量。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，9 tests。
- `npm.cmd run android:delivery-check`：通过。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 89 tests / 89 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- 临时 HTTP smoke：通过。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；不能声称真机通过。

## 仍然存在的问题

- 原生端编辑记录同步未完成。
- 原生端冲突处理未完成。
- 原生端富文本、图片、附件、Note Station `.nsx` 导入未完成。
- 需要真实手机验证手动同步按钮是否能在局域网内把记录上传到 Docker/NAS。

---

测试时间：2026-07-07

当前目标：原生离线 Android 保存远端 ID，并同步本地编辑到 Docker/NAS。

## 复现 / 风险来源

上一阶段只完成了原生端新建记录同步。新建记录同步成功后如果不保存服务端 `note.id`，后续手机本地编辑无法知道应该 PATCH 哪条 Docker/NAS 记录，容易继续停留在“只能上传新建，不能更新”的半闭环状态。

## TDD 过程

- 新增 `stores remote note ids and syncs native offline edits back to Docker NAS` 测试。
- 红灯结果：测试因 `DATABASE_VERSION = 4`、`remote_id`、`saveRemoteId`、`postUpdateMutation`、`PATCH` 等能力缺失失败。
- 实现后定向 Android 测试通过。

## 修复内容

- Android 原生数据库升级到 v4。
- `notes` 表新增 `remote_id` 字段和升级迁移。
- 本地新建和编辑保存都会进入 `sync_queue`。
- 本地 pending create 期间再次编辑会合并到同一个 create，不额外生成 update。
- `POST /api/notes` 成功后解析并保存服务端返回的 `note.id`。
- 已有 `remote_id` 的本地编辑记录会通过 `PATCH /api/notes/:remoteId` 同步。
- 缺少 `remote_id` 的 update 不会静默丢弃，会失败并保留待同步状态。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，10 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 90 tests / 90 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含临时 HTTP smoke。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；不能声称真机通过。

## 仍然存在的问题

- 原生端还没有同步失败详情页，只能保留 failed 并显示待同步数量。
- 原生端冲突处理未完成。
- 原生端富文本、图片、附件、Note Station `.nsx` 导入未完成。
- 需要真实手机验证：离线新建 -> 同步 -> 编辑 -> 再同步 -> Docker/NAS 端确认最终内容。

---

测试时间：2026-07-07

当前目标：原生离线 Android 同步失败详情可见。

## 复现 / 风险来源

上一阶段已经能同步新建和编辑，但同步失败只保留 failed 状态和待同步数量。家庭用户看到失败后无法判断是网络问题、服务器地址问题、HTTP 返回错误，还是缺少远端记录 ID。

## TDD 过程

- 新增 `shows native sync failure details for retry decisions` 测试。
- 红灯结果：测试因 `DATABASE_VERSION = 5`、`error_message`、`last_attempt_at`、`listFailedSyncItems()`、失败详情文案缺失而失败。
- 实现后定向 Android 测试通过。

## 修复内容

- Android 原生数据库升级到 v5。
- `sync_queue` 新增 `error_message` 和 `last_attempt_at` 字段。
- 升级路径 `ensureSyncQueueDetailColumns()` 会补齐旧库字段。
- `markSyncFailed(long queueId, String message)` 保存失败原因和最后尝试时间。
- `markSyncDone()` 清空失败原因并记录最后尝试时间。
- 同步页新增“最近同步失败”列表，展示记录标题、同步类型、失败原因和最后尝试时间。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，11 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 91 tests / 91 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；不能声称真机通过。

## 仍然存在的问题

- 原生端冲突处理未完成。
- 原生端富文本、图片、附件、Note Station `.nsx` 导入未完成。
- 需要真实手机验证失败详情：错误地址同步失败 -> 页面显示原因 -> 改回正确地址后重试。

---

测试时间：2026-07-07

当前目标：原生离线 Android 编辑同步冲突保护。

## 复现 / 风险来源

上一阶段已经能把手机端离线新建和编辑同步到 Docker/NAS，但如果同一条记录在手机离线期间被其他设备改过，手机端再次同步可能静默覆盖服务端较新的内容。家庭自用场景也需要避免这种“看起来同步成功，实际覆盖了别人修改”的问题。

## TDD 过程

- 新增 `sends baseUpdatedAt to avoid silently overwriting server edits` 测试。
- 红灯结果：测试因缺少 `DATABASE_VERSION = 6`、`remote_updated_at`、`saveRemoteSyncState`、`baseUpdatedAt` 和冲突提示而失败。
- 实现后定向 Android 测试通过。

## 修复内容

- Android 原生数据库升级到 v6。
- `notes.remote_updated_at` 保存最近一次服务端同步成功返回的 `updatedAt`。
- create 同步成功后保存 `remote_id` 和 `remote_updated_at`。
- update 同步时提交 `baseUpdatedAt`。
- 服务端返回 `409 note_conflict` 时，Android 原生端保留失败队列项并显示“记录已经在其他设备更新，请先确认后再同步”，不静默覆盖。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，12 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 92 tests / 92 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含临时 HTTP smoke。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；真机验证交给用户在 vivo / Huawei 手机上执行。

## 仍然存在的问题

- 原生端还没有冲突详情/合并界面，目前只阻止静默覆盖并显示失败原因。
- 原生端富文本、图片、附件、Note Station `.nsx` 导入未完成。
- 需要真实手机验证：离线新建、同步、编辑、冲突失败提示。

---

测试时间：2026-07-07

当前目标：原生离线 Android 记录归档 / 删除生命周期。

## 复现 / 风险来源

当前原生 APK 已经支持离线新建、编辑、搜索、分类和同步，但日常记事 App 不能只增改不删。用户反馈“开发 15 个小时只实现一点点功能”后，本轮改为补一个更完整的可用闭环：本机离线可归档、删除，并在恢复联网后同步到 Docker/NAS。

## TDD 过程

- 新增 `supports native offline archive and delete lifecycle with sync` 测试。
- 红灯结果：测试因缺少 `DATABASE_VERSION = 7`、`is_archived`、`is_deleted`、`archiveNote`、`deleteNote`、`postArchiveMutation`、`postDeleteMutation` 和删除请求而失败。
- 实现后定向 Android 测试通过。

## 修复内容

- Android 原生数据库升级到 v7。
- `notes` 新增 `is_archived` 和 `is_deleted` 字段。
- 首页列表过滤已归档和已删除记录。
- 详情页新增“归档记录”和“删除记录”。
- 归档/删除会写入本机同步队列，恢复联网后同步到服务端。
- 未同步的新建记录被删除时直接清理本机记录和 pending create，避免无远端 ID 的同步失败。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，13 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 93 tests / 93 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含临时 HTTP smoke。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；真机验证交给用户在实际手机上执行。

## 仍然存在的问题

- 原生端没有归档列表/回收站，归档和删除后只是从默认列表隐藏。
- 原生端富文本、图片、附件、Note Station `.nsx` 导入未完成。
- 原生端标签筛选仍然比较基础，当前主要依赖搜索框搜索标签。

---

测试时间：2026-07-07

当前目标：原生离线 Android 标签筛选与快速标签。

## 复现 / 风险来源

上一阶段已经支持本机新建、编辑、搜索、分类、归档和删除，但家庭日常记录常见的“待办 / 重要 / 维修 / 账单”仍然只能手动输入后靠搜索框找回，离实际使用还不够顺手。

## TDD 过程

- 新增 `supports native offline tag chips and quick tag editing` 测试。
- 红灯结果：测试因缺少 `currentTagFilter`、`tagFilterButton`、`quickTagButton`、`清空标签`、`normalizeTags`、`listTags()` 和三参 `listNotes` 而失败。
- 实现后定向 Android 测试通过。

## 修复内容

- 首页新增标签 chip 筛选。
- 编辑页新增常用标签按钮：`待办`、`重要`、`维修`、`账单`。
- 编辑页新增“清空标签”按钮。
- 保存时对标签去重和规范化。
- 本机数据库从现有记录中提取标签，过滤已删除 / 已归档记录。
- 同步 payload 继续复用已有 tags 数组，不破坏服务端。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，14 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 94 tests / 94 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含临时 HTTP smoke。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；真机验证交给用户在实际手机上执行。

## 仍然存在的问题

- 标签仍是轻量文本标签，没有独立标签管理页。
- 原生端富文本、图片、附件、Note Station `.nsx` 导入未完成。

---

测试时间：2026-07-07

当前目标：原生离线 Android 成员归属与筛选。

## 复现 / 风险来源

上一阶段原生 APK 已经可以离线新建、编辑、搜索、分类、标签、归档、删除和同步，但同步 payload 里的 `memberId` 仍固定为 `self`，两人家庭使用时无法区分“我 / 爱人”的记录归属。

## TDD 过程

- 新增 `supports native offline member ownership and filtering for family use` 测试。
- 红灯结果：测试因缺少数据库 v8、`member_id` 字段、成员筛选、编辑页成员选择和同步成员 payload 而失败。
- 实现后定向 Android 测试通过。

## 修复内容

- 本机 SQLite `notes` 表新增 `member_id`。
- 数据库版本升级到 8，并提供旧库自动迁移。
- 首页新增“全部成员 / 我 / 爱人”筛选。
- 新建 / 编辑记录页新增当前成员选择。
- 详情页和首页记录卡片显示成员归属。
- 同步到 Docker/NAS 时使用记录自己的 `memberId`，不再硬编码。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run android:build
```

## 测试结果

- 定向 Android 测试：通过，15 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 95 tests / 95 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含临时 HTTP smoke；覆盖健康接口、app-data、列表、详情、搜索、分类筛选、成员筛选、新建记录、NSX Web 导入、备份、JSON 导出和前端 shell。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；真机验证仍需用户在实际手机上执行。

## 仍然存在的问题

- 原生端富文本、图片、附件、Note Station `.nsx` 导入未完成。
- 当前没有 USB 真机连接，无法由 Codex 本机执行 `android:device-smoke`。

---

测试时间：2026-07-07

当前目标：原生离线 Android 基础富文本格式。

## 复现 / 风险来源

上一阶段原生 APK 已经支持离线新建、编辑、分类、标签、成员和同步，但正文仍然只是普通 `EditText` + 普通 `TextView`。日常记录至少需要标题、粗体、列表、待办等轻量格式。

## TDD 过程

- 新增 `supports native offline basic rich text formatting for daily notes` 测试。
- 红灯结果：测试因缺少 `richText` 渲染、格式工具栏、基础格式按钮和 `SpannableStringBuilder` 渲染逻辑而失败。
- 实现后定向 Android 测试通过。

## 修复内容

- 编辑页新增基础格式工具栏：加粗、斜体、下划线、删除线、标题、列表、待办。
- 详情页新增原生 `SpannableStringBuilder` 渲染，支持粗体、斜体、下划线、删除线、标题、项目列表和待办 / 已完成符号。
- 不引入大型富文本依赖，不改变服务端接口，不改变当前数据库结构。
- 格式仍保存在正文文本中，便于搜索、同步和后续迁移。

## 运行命令

```bash
node --test tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run android:device-smoke
```

## 测试结果

- 定向 Android 测试：通过，16 tests。
- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，16 suites / 96 tests / 96 pass。
- `npm.cmd run build`：通过，仍有已知 Vite chunk size warning。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`hasClassesDex=true`、`hasLauncherIcon=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含临时 HTTP smoke。
- `npm.cmd run android:device-smoke`：未通过，原因是当前电脑没有检测到可用 USB 手机；真机验证仍需用户在实际手机上执行。

## 仍然存在的问题

- 这是轻量格式能力，不是完整 Note Station 级编辑器。
- 原生端图片、附件和 Note Station `.nsx` 导入仍未迁入。

## 2026-07-07 原生 Android 本机附件验收

测试目标：原生离线 APK 支持在不连接 Docker/NAS 时为已保存记录添加本机附件 / 图片。

修改内容：
- `android/app/src/main/java/com/homeoldnote/app/MainActivity.java`：新增系统文件选择、复制到 App 私有附件目录、详情页附件列表展示。
- `tests/android-wrapper.test.js`：新增原生离线本机附件静态验收。

运行命令与结果：
- `node --test tests/android-wrapper.test.js`：通过，17/17。
- `npm.cmd run android:build`：通过，生成 `android/app/build/outputs/apk/debug/app-debug.apk`。
- `npm.cmd run android:verify`：通过，确认是 native offline APK，未包含 WebView assets。
- `npm.cmd run android:delivery-check`：通过，包含 check/test/build/android build/android verify/HTTP smoke。
- `npm.cmd run android:device-smoke`：未通过，当前没有 USB 调试手机连接。

仍然存在的问题：
- 本机附件目前只保存在当前手机，不会同步到 Docker/NAS。
- 原生端还没有 `.nsx` 导入。
- 需要用户真机验证“添加附件 / 图片”系统选择器和详情页展示。

## 2026-07-07 原生 Android 附件同步验收

测试目标：原生离线 APK 添加的本机附件 / 图片在恢复连接 Docker/NAS 后可以随记录同步上传，且同步成功后不重复上传。

修复内容：
- `android/app/src/main/java/com/homeoldnote/app/MainActivity.java`：附件表升级到 v10，新增 `remote_id`、`sync_status`；记录创建 / 更新同步时携带未同步附件 payload；成功后调用 `markAttachmentsSynced`。
- `tests/android-wrapper.test.js`：新增并补强“本机附件同步到 Docker/NAS 且不重复上传”的验收。
- 本轮没有修改 Android UI 风格，只补数据同步闭环。

运行命令与结果：
- `node --test tests/android-wrapper.test.js`：通过，18/18。
- `npm.cmd run android:build`：通过，APK 编译、签名和验证通过。
- `npm.cmd run android:delivery-check`：通过，包含 check/test/build/android build/android verify/HTTP smoke。
- `npm.cmd run android:device-smoke`：未通过，当前电脑没有检测到 USB 调试手机。

仍然存在的问题：
- 尚未在用户真实手机上验证“附件同步后浏览器端可下载/查看”。
- 原生 APK 仍未迁入 `.nsx` 文件导入。



## 2026-07-07 Android 离线本地数据层补强 QA

测试时间：2026-07-07 20:49

测试目标：补齐 Android 本地 SQLite 对分类、成员、标签、附件元数据的持久化，减少首次离线和长期离线时只依赖 IndexedDB / fallback 的风险。

修复内容：
- SQLite schema 新增 categories、members、	ags。
- 新增分类 / 成员 / 标签本地仓储读写。
- 附件本地仓储新增批量写入和读取。
- offlineStore 在 Android 原生环境保存 / 读取快照时接入上述仓储，并将附件元数据挂回记录。

运行命令与结果：
-
ode --test tests/android-wrapper.test.js：通过，5/5。
-
pm.cmd run test：通过，85 tests / 0 fail。
-
pm.cmd run build：通过，仅保留 Vite chunk size 提示。

仍然存在的问题：
- 真机飞行模式完整验收仍需要用户手机实际安装测试。
- NAS 同步完整 push/pull 和多设备冲突处理仍在后续阶段。

补充交付检查：2026-07-07 20:57

-
pm.cmd run android:delivery-check：通过。
- 覆盖步骤：check、	est、uild、ndroid:build、ndroid:verify、临时 http://127.0.0.1:3400 HTTP smoke。
- APK：ndroid/app/build/outputs/apk/debug/app-debug.apk，大小 25,706,306 bytes。
- APK verify：kind=capacitor-local-first，undledReact=true，
ativeShellOnly=false。
- HTTP smoke：健康接口、app-data、列表、详情、搜索、分类筛选、成员筛选、新建记录、Note Station Web 导入、备份、JSON 导出、前端 shell 均通过。
