# 下一步

更新时间：2026-07-03

当前项目是个人和家庭自用的生活记录工具，不走复杂 RC / 发布流程。新的主线已调整为：

```text
面向重新导入 Note Station 数据的最终富文本能力补齐 -> 富文本页面收口 -> Product Design 视觉还原 -> Android 封装
```

## 新前提

当前仍是测试阶段，现有数据库、测试记录、测试附件、已经导入的测试数据都可以丢失。产品功能完善后，会重新导入 Synology Note Station 导出的 `.nsx` 文件。

因此后续不再为了保护当前测试数据库而做过度兼容：

- 可以调整数据库结构。
- 可以做破坏性迁移。
- 可以清空测试数据库。
- 可以重建测试附件目录。
- 可以重新设计 notes 正文字段。
- 可以重新实现 Note Station 导入后的富文本存储方式。
- 不要删除原始 `.nsx` 文件。
- 不要提交 `data/`、数据库、附件、备份、导出、`.nsx`、日志或真实隐私内容。

## 优先级 1：最终富文本能力补齐

推荐采用 Tiptap / ProseMirror，替换当前轻量 `contenteditable` 方案。目标能力：

- 文字格式：粗体、斜体、下划线、删除线、标题、段落、颜色、高亮、清除格式、撤销 / 重做。
- 列表和待办：无序列表、有序列表、多级列表、缩进 / 反缩进、待办 / 复选框列表，保存勾选状态。
- 段落结构：引用、分隔线、左 / 中 / 右对齐、行内代码、代码块。
- 链接：插入、编辑、删除，详情页安全打开。
- 图片：上传 / 粘贴图片并插入正文，保存到本地附件系统。
- 附件：上传附件、插入正文引用、详情页展示、打开 / 下载。
- 表格：展示 Note Station 表格，新建和编辑简单表格，手机端横向滚动不撑破页面。
- Note Station 重新导入：保留原始 HTML、表格、图片、附件、链接、列表、待办、颜色、高亮、删除线、下划线；复杂格式无法编辑时至少安全展示。

## 优先级 2：数据结构重建

建议新结构：

```text
notes.content_text    -- 纯文本，搜索和摘要
notes.content_html    -- 安全 HTML，详情展示
notes.content_json    -- Tiptap / ProseMirror JSON，再编辑
notes.source_html     -- Note Station 原始 HTML，重新导入溯源
attachments           -- 统一管理图片和附件
```

可以清空当前测试库后重新 seed。不要删除原始 `.nsx`。

## 优先级 3：富文本页面收口

新建记录页、编辑记录页、详情页围绕 Tiptap 工具栏和安全展示收口。手机端工具栏采用“常用一排 + 更多面板”，不要堆成桌面软件。

## 优先级 4：重新导入 Note Station

富文本结构稳定后，重新 dry-run 并导入 `.nsx`：

- 先 dry-run 看 HTML、表格、图片、附件、待办和链接识别情况。
- 再写入测试库。
- 用户确认后再作为家庭试用库。

## 优先级 5：最终视觉还原

Product Design 7 张最终图仍然重要，但当前不阻塞富文本重建。等富文本编辑和重新导入稳定后，再按 Figma Make 规格逐页还原。

## 优先级 6：Android 封装

Android / WebView / TWA 继续排最后。进入前需要确认：

- 富文本编辑和重新导入稳定。
- 主要页面视觉还原稳定。
- NAS 访问方式稳定。
- App 名称、包名、图标、签名方式、NAS 地址配置方式确认。

当前不要创建 Android 工程，不生成 APK。
## 当前富文本第一轮完成后的下一步

第一轮代码已完成，不再只是方案：Tiptap 编辑器、新字段、详情页安全展示、图片/附件写入、JSON / Markdown 导出和 Note Station 重新导入字段写入均已接入。

## 2026-07-03 附件与 NSX 导入入口收口

- 新建 / 编辑页不再保留独立的旧附件上传区，日常图片和附件统一从富文本编辑器的“插入 -> 图片 / 附件”进入。
- 后续不要再恢复单独的“附件上传”表单区，避免正文与附件割裂。
- 导入 Note Station 页面需要支持点击选择 `.nsx` 文件；网页端完整解析接入前，只能做安全预检和状态提示，不应假装已经解析真实文件内容。
- 后续实现真实 `.nsx` 网页导入时，必须把 Note Station HTML、图片和附件关系尽量写入 `content_html` / `content_json` / 附件引用，让详情页和编辑页能直接在富文本正文中看到效果。
- 附件列表可以作为下载和兼容展示，但不再作为主要编辑入口。
下一步建议按这个顺序人工验收和继续：

1. 在本机页面新建一条富文本记录，测试粗体、标题、待办、表格、颜色、高亮、链接、图片粘贴和附件引用。
2. 编辑一条旧纯文本记录，确认保存后仍能搜索，详情页能展示富文本。
3. 重新用真实 `.nsx` 做 dry-run，重点检查表格、图片、附件、链接和待办状态是否进入 `content_html` / `source_html`。
4. 确认真实导入效果后，再决定是否清空当前测试库并重新正式导入。
5. 富文本稳定后，再回到 Product Design 视觉还原；Android 仍排最后。

暂不继续做：复杂块编辑器、协同编辑、AI 整理、Android 工程、全站视觉重做。

## 2026-07-03 网页端 NSX 真实解析与测试库清理完成

- 当前测试数据库和测试附件目录已清理重建，保留原始 `.nsx` 文件。
- 默认测试库现在为 0 条记录、11 个分类、2 个默认成员，不再包含旧 QA 假附件。
- 导入 Note Station 页面已经支持点击选择并上传真实 `.nsx` 文件，网页端 dry-run 会调用真实 NSX 解析器，不再只是文件名预检。
- 真实 `.nsx` dry-run 已在 Docker 3300 服务验证：93 条记录、20 个附件、0 个失败项。
- 下一步建议在页面重新选择 `.nsx`，确认预览数量后再点击确认导入；导入后重点检查首页、搜索、详情页富文本、图片和附件引用。


## 2026-07-03 清空测试库后的下一步

当前测试库已清空，默认记录为 0 条，只保留默认分类、标签和成员“我 / 爱人”。详情页硬编码“关联记录”已移除。下一步请在 Docker 3300 页面重新上传真实 `.nsx` 文件测试导入。

建议测试顺序：

1. 首页确认没有历史记录和旧附件筛选结果。
2. 导入 Note Station 页选择真实 `.nsx`，确认 dry-run 数量和失败项。
3. 确认导入后打开带图片记录，检查图片是否内联显示在富文本正文。
4. 检查非图片附件是否作为下载附件保留。
5. 新建一条富文本记录，测试图片/附件都从编辑器入口进入。

## 2026-07-03 更新：Note Station 富文本导入图片内联

当前优先级已从“逐条修导入记录”调整为应用级导入规则：后续 `.nsx` 导入必须自动把图片附件放进富文本正文。已完成网页端导入、CLI 导入和读取旧数据的通用内联逻辑。

接下来如果继续处理 Note Station 导入，应优先验证：

1. 重新导入 `.nsx` 后，带图片记录是否直接在正文富文本里预览图片。
2. 独立附件区是否只保留非图片附件或无法内联的兼容项。
3. 搜索和列表摘要是否仍使用纯文本正文，而不是图片文件名。
4. 复杂表格、颜色、高亮、待办列表在详情页展示和编辑页载入是否足够日常使用。


## 2026-07-04 当前开发顺序更新

当前继续暂停 Android 封装，先把 Web 功能做扎实。

### 第一目标：自定义分类（本轮已完成代码与测试）

- 支持新增分类。
- 支持编辑分类名称、颜色、图标。
- 新建 / 编辑记录可以选择自定义分类。
- 首页和搜索页筛选使用动态分类。
- Note Station 导入仍可先进入“未分类 / 待整理”，后续人工整理到自定义分类。

待用户在 Docker 页面人工确认：

1. 新增一个分类。
2. 新建一条记录选择该分类。
3. 首页更多筛选筛出该分类记录。
4. 搜索页分类筛选可选该分类。
5. 编辑分类名称后相关记录展示同步变化。

### 第二目标：离线可记录，恢复联网后同步

下一阶段不要直接做 Android。先在 Web 端设计并实现离线能力：

- 网络 / 服务不可用时，新建记录保存到浏览器本地队列。
- 本地记录要显示“待同步”状态。
- 恢复连接后自动或手动同步到 Docker/NAS 服务端。
- 同步成功后替换临时 ID，记录变成已保存状态。
- 同步失败保留在本地，不丢失正文、富文本、图片和附件。
- 需要明确冲突策略：同一条本地记录未同步前只允许本地编辑；服务端已有同名记录不自动覆盖。

建议先写离线同步方案，再小步实现 IndexedDB/localStorage 队列和同步 API 调用。


## 2026-07-04 离线同步后续

已开始实现离线新建记录队列。后续继续按这个顺序：

1. 用 Docker 人工验证：停服务 -> 新建记录 -> 刷新保留 -> 恢复服务 -> 自动同步。
2. 如果 localStorage 对图片/附件容量不够，升级为 IndexedDB。
3. 增加同步失败原因和手动重试入口。
4. 再考虑离线编辑本地待同步记录。
5. 最后再讨论 Android 封装。


## Android 第一版后续

- 先人工安装 debug APK，验证服务器地址配置和 WebView 内完整 Web 功能。
- 若需要长期使用，再考虑 release 签名、正式图标、应用内修改服务器地址入口和更完整的 Android 离线同步。

## 2026-07-04 本地优先长期离线后续

当前主线调整为长期离线能力：

1. 已完成第一版 IndexedDB 本地优先数据层和新建/编辑同步队列。
2. 下一步应增强附件/图片 Blob 的 IndexedDB 持久化，避免大图片仍依赖短期 payload。
3. 再下一步处理冲突标记：服务端记录和本地 dirty 记录同时变化时，不自动覆盖，提示用户选择。
4. Android 后续可考虑把前端静态资源打进 APK，让首次冷启动也不依赖服务器前端壳。
5. 最后再考虑 Android 原生 SQLite / Room；当前优先保持 WebView 和浏览器共用同一套离线能力。

## 2026-07-04 镜像 / APK 交付前必跑检查

后续继续开发前，交付 Docker 镜像或 APK 必须先跑：

1. 
npm.cmd run check
2. 
npm.cmd run test
3. 
npm.cmd run build
4. 本机 Docker 或 GHCR 镜像启动后执行写入版 smoke：
npm.cmd run smoke -- --base-url http://127.0.0.1:3300
5. 确认 smoke 中包含 create-note、created-note-detail、
otestation-web-import 三项。
6. Android APK 如涉及导入，必须验证 WebView 文件选择器能打开 .nsx。

当前建议下一步：重新构建本地 Docker 与 APK，先在用户手机和浏览器确认保存笔记、富文本附件、.nsx 选择和导入，再考虑继续长期离线增强。

## 2026-07-06 下一步：离线 APK 真机验收

本轮已把前端静态资源打入 Android APK，并让服务器不可达时自动进入本地离线页面。下一步不要继续大改功能，先在两台真实设备验收：

1. Huawei P30 Pro / HarmonyOS：不配置服务器直接离线使用，新建、编辑、关闭重开。
2. Huawei P30 Pro / HarmonyOS：配置不可达地址，确认不会白屏，自动进入离线模式。
3. vivo X300 Pro：同样走离线新建、编辑和恢复联网同步。
4. 两台设备都连接 Docker/NAS 后，确认服务器地址、首页、详情、富文本编辑、NSX 选择、备份/导出入口正常。
5. 若继续做离线增强，优先处理图片/附件 Blob 的 IndexedDB 长期保存和同步冲突提示。

## 2026-07-06 当前目标：离线可用 Android App

用户已明确要求：这是家庭自用工具，不走大项目流程；最终交付应是经过测试、没有明显关键 bug、可长期离线使用的 Android App。

当前按 Gate 小阶段推进：

1. Gate 1：离线启动稳定。本轮已修 `file:///api/access/status` 报错，APK 已重新构建，待真机确认。
2. Gate 2：离线日常记录完整。离线状态下新建、编辑、富文本、分类、标签、图片 / 附件都要能本地持久化。
3. Gate 3：恢复联网同步。Android 恢复连接 Docker/NAS 后，把本地待同步记录写回服务端。
4. Gate 4：同步安全。处理重复同步、基础冲突提示、失败重试，不静默丢记录。
5. Gate 5：交付验收。在 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 上完成安装、离线、联网、同步和回归测试后再交付 APK。

不要再提供未自测的半成品 APK。每个 Gate 至少执行：定向测试、`npm.cmd run check`、`npm.cmd run test`、`npm.cmd run build`、需要 APK 时执行 `npm.cmd run android:build`。

## 2026-07-06 Gate 2 进度

已完成 Gate 2 第一刀：离线记录队列从旧 localStorage 收敛到 IndexedDB，适合继续承载富文本、图片和附件的长期离线使用。

继续 Gate 2 时优先做：

1. 真机离线新建 / 编辑 / 重启后持久化验证。
2. 图片和附件离线保存能力验证，确认不依赖 Docker/NAS 即可保留本机记录内容。
3. 离线分类、标签、成员字段编辑后仍能保留。
4. 形成一份 Android 离线真机验收清单，覆盖 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS。

Gate 3 才处理恢复联网后的同步、重复提交和冲突提示。

## 2026-07-06 Gate 2 第二刀完成

离线模式现在会持续写 IndexedDB snapshot，覆盖记录、分类、成员和当前成员。下一步不要急着做联网同步，先在真机上把离线完整使用走通：

1. 离线新建普通记录。
2. 离线编辑记录。
3. 离线富文本格式保存。
4. 离线插入小图片 / 小附件。
5. 杀掉 App 后重新打开，确认以上内容都还在。

这些通过后，再进入 Gate 3：恢复联网后同步到 Docker/NAS。


## 2026-07-06 Gate 3 第一刀完成

已完成恢复联网同步的第一层保护：

1. 同一条本机 local-* 记录离线新建后再编辑，会合并到同一条 pending create，不再产生 create + update local-id 的错误队列。
2. 首页待同步提示有“尝试同步”按钮，家庭用户恢复 Docker/NAS 后可以手动触发。
3. online 事件会在存在待同步记录时触发重新连接。
4. check/test/build/android:build 均通过，APK 已重新生成。

下一步仍按家庭自用小 Gate 推进：

1. 真机验证 Gate 3：离线新建 -> 离线编辑 -> 重启 -> 恢复联网 -> 只同步最终版本。
2. Gate 4：处理同步失败提示、重试状态和基础冲突提示，避免静默丢数据。
3. Gate 5：整理最终 APK 交付清单，只交付实际测过的 APK 和 Docker 镜像。

## 2026-07-06 Gate 4 第一刀完成

已完成同步失败状态和真正重试触发：

1. 在线模式下点击“尝试同步 / 重试同步”会直接执行本机 syncQueue。
2. failed mutation 会在首页显示为“同步失败，可重试”。
3. 同步失败不会静默丢记录，仍保留在 IndexedDB 队列。
4. check/test/build/android:build 均通过，APK 已重新生成。

下一步继续：

1. 真机手动制造同步失败，再恢复服务器地址重试。
2. 补基础冲突提示：同一条服务端记录离线编辑期间如果服务端也变化，不要静默覆盖。
3. 整理最终真机验收表，只交付实际测过的 APK。
## 当前离线 Android 小 Gate

已完成到 Gate 14：

- Gate 1：纯离线 Android 不再请求 `file:///api/...`。
- Gate 2：离线记录和同步队列改为 IndexedDB，离线快照可持久化。
- Gate 3：恢复联网后可手动触发同步，并合并同一条本地记录的离线新建 + 编辑。
- Gate 4：同步失败状态可见，在线后“重试同步”会真正重跑同步队列。
- Gate 5：已有服务端记录的离线编辑带 `baseUpdatedAt`，服务端发现旧版本同步会返回 `409 note_conflict`，避免静默覆盖。
- Gate 6：富文本图片插入会压缩，超大图片 / 附件会提示并阻止假保存。
- Gate 7：本机构建产物启动后，HTTP smoke 通过，覆盖新建、搜索、筛选、NSX 上传导入、备份、JSON 导出和前端 shell。
- Gate 8：新增 `docs/ANDROID_APK_HANDOFF.md`，集中记录当前 APK 的测试方式、已验证能力和限制。
- Gate 9：新增 `npm.cmd run android:verify`，直接检查 APK 内部离线 web bundle、相对路径、图标/manifest 和离线运行时标记。
- Gate 10：新增 `tests/offline-store-behavior.test.js`，用行为级测试覆盖 IndexedDB 离线快照、待同步队列压缩、失败重试和写入安全。
- Gate 11：新增 `npm.cmd run android:delivery-check`，一键覆盖 check/test/build/APK build/APK verify/临时 HTTP smoke，减少交付前漏测。
- Gate 12：新增 `npm.cmd run android:device-smoke`，连接一台真实手机后安装 APK、启动 App、抓取 logcat，并对崩溃 / WebView 脚本错误失败退出。
- Gate 13：新增 `tests/offline-sync-behavior.test.js`，把恢复联网同步批处理从静态检查推进到行为测试，确认成功项清理、失败项保留、失败后停止后续批处理。
- Gate 14：APK 离线 App 内设置页新增“修改手机端服务器地址”，可重新打开 Android 原生地址设置页，方便离线后恢复 Docker/NAS 连接。

下一步按家庭自用优先级继续：

1. 跑 `npm.cmd run android:delivery-check`。
2. USB 连接一台手机，跑 `npm.cmd run android:device-smoke`。
3. 把最新 `app-debug.apk` 分别装到 vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS。
4. 真机验证：离线新建、编辑、富文本、图片、小附件、重启、设置页修改服务器地址和恢复联网同步；同步失败后恢复服务器地址再重试。
5. 用 Docker/NAS 浏览器端确认 APK 同步后的记录内容正确。
6. 后续再根据真机反馈补冲突处理界面、大附件 Blob 或后台同步。

暂不做：

- 原生 Android / Room 重写。
- 复杂后台同步。
- 多设备自动合并界面。
- 大附件长期离线 Blob 完整同步。

## 2026-07-06 Android 路线重置

停止继续推进 WebView / file:// / IndexedDB 壳 APK。用户需要的是能长期离线使用的 Android App，不是网页壳。此前 Android Gate 1-14 只保留为历史教训，不再作为当前主线。

当前主线改为原生离线 Android：

1. 原生 Android + SQLite 本地保存核心。
2. 真机验证：vivo X300 Pro、Huawei P30 Pro / HarmonyOS。
3. 原生端补搜索、分类、标签、成员等日常记事功能。
4. 原生端补富文本、图片、附件。
5. 原生端补 Note Station .nsx 导入，导入后直接进入富文本正文，而不是正文和附件分离。
6. 原生端补 Docker/NAS 同步，服务器只是同步目标，不再是启动前提。

当前已完成第一步的代码基础：

- 不含 WebView。
- 不含 assets/www。
- 使用 home_note_native.db。
- 支持本地列表、新建、编辑、详情、保存。

下一步不要交付“最终版”说法。必须先让用户在真实手机上确认：

- 不连接 Docker/NAS 可以打开。
- 可以新建记录。
- 可以编辑记录。
- 退出重开记录仍在。

通过后再继续补功能。

## 2026-07-06 原生 Android 下一步

已完成原生离线核心的本地搜索和分类筛选。下一步继续按小阶段推进，不回到 WebView 壳路线：

1. 补原生端分类编辑 / 自定义分类的基础能力，确保不依赖 Web 端分类管理。
2. 补原生端本地同步队列表结构，为后续 Docker/NAS 同步做准备。
3. 补原生端服务器地址配置和手动同步入口。
4. 再实现恢复联网后同步到 Docker/NAS。
5. 最后再迁入富文本、附件、Note Station `.nsx` 导入等复杂能力。

当前 APK 可用于验证：不连接 Docker/NAS 时，本地新建、编辑、搜索、分类筛选是否可用。

## 2026-07-06 原生 Android 后续顺序更新

已完成原生离线核心、本地搜索 / 分类筛选、本机自定义分类管理。继续按小阶段推进，不回到 WebView 壳路线：

1. 补原生端本地同步队列表，记录待同步的新建 / 编辑 / 删除操作。
2. 补原生端服务器地址配置和连接状态检查。
3. 补手动同步入口，把本机记录同步到 Docker/NAS。
4. 再补冲突提示：服务端记录已变化时，不静默覆盖。
5. 之后再迁入富文本、图片、附件和 Note Station `.nsx` 导入等复杂能力。

当前不要再交付“最终版 APK”说法。每个阶段只能交付实际自动检查通过、并明确是否真机验收过的结果。

## 2026-07-06 原生 Android 同步下一阶段

已完成本机同步队列表和服务器地址配置，但还没有真正联网同步。下一步必须按小步继续：

1. 原生端实现最小 HTTP 客户端，只上传本机新建记录到 Docker/NAS。
2. 成功后将对应 `sync_queue` 状态标记为 `done`。
3. 失败时保留 pending，并在同步页显示失败原因。
4. 再扩展到编辑记录同步。
5. 最后补冲突提示和真实手机验收。

不要把当前“手动同步”按钮说成已经可同步。它目前只是同步前置入口。

## 2026-07-06 原生 Android 同步下一步更新

当前已经实现：原生端本地新建记录可通过手动同步 POST 到 Docker/NAS `/api/notes`，成功后队列标记 done，失败后保留 failed。

下一步继续小步推进：

1. 真机验证最小同步：离线新建记录 -> 填 Docker/NAS 地址 -> 手动同步 -> Web 端确认记录出现。
2. 原生端实现编辑记录同步：把 `update` mutation 对接服务端 `PATCH /api/notes/:id` 或设计 server id 映射。
3. 增加同步状态详情：显示失败原因、最近一次失败时间和重试入口。
4. 再补冲突处理，避免多设备修改时静默覆盖。
5. 最后再迁入富文本、图片、附件和 Note Station `.nsx` 导入。

注意：当前不要宣称“完整同步完成”。它只完成了新建记录最小同步。

## 2026-07-07 原生 Android 编辑同步后续

当前已经实现：原生端新建同步成功后保存服务端 `note.id` 到本机 `notes.remote_id`，后续本机编辑会通过 `PATCH /api/notes/:remoteId` 同步回 Docker/NAS。

已验证：

- 定向 Android 测试通过，覆盖 `remote_id`、create 响应解析和 PATCH 更新路径。
- `npm.cmd run check` / `npm.cmd run test` / `npm.cmd run build` 通过。
- `npm.cmd run android:build` / `npm.cmd run android:verify` 通过。
- `npm.cmd run android:delivery-check` 通过。
- `npm.cmd run android:device-smoke` 未完成，当前没有检测到 USB 手机。

下一步不要跳回 WebView 壳路线，也不要直接宣称最终版。继续按这个顺序：

1. 真实手机验证：离线新建 -> 手动同步 -> Docker/NAS 端看到记录 -> 手机端编辑 -> 再同步 -> Docker/NAS 端看到最终内容。
2. 补原生同步失败详情：失败原因、最近失败时间、重试入口。
3. 补基础冲突提示：服务端记录已变化时，不静默覆盖。
4. 再迁入原生端富文本、图片、附件。
5. 最后才迁入原生端 Note Station `.nsx` 导入。

## 2026-07-07 原生 Android 同步失败详情后续

当前已经实现：原生同步失败会保存失败原因和最后尝试时间，并在同步页展示最近失败项。

已验证：

- 定向 Android 测试通过，覆盖 v5 数据库、失败原因字段、失败列表展示。
- `npm.cmd run check` / `npm.cmd run test` / `npm.cmd run build` 通过。
- `npm.cmd run android:build` / `npm.cmd run android:verify` 通过。
- `npm.cmd run android:device-smoke` 未完成，当前没有检测到 USB 手机。

下一步继续：

1. 真机验证错误地址失败详情和正确地址重试。
2. 补基础冲突提示：服务端记录已变化时，不静默覆盖。
3. 原生端日常编辑能力继续补富文本、图片、附件。
4. 最后迁入原生端 Note Station `.nsx` 导入。

## 2026-07-07 原生 Android 冲突保护后续

当前已经实现：原生端编辑同步会携带 `baseUpdatedAt`，如果 Docker/NAS 上同一条记录已经被其他设备更新，服务端会返回冲突，APK 会保留失败项并提示“记录已经在其他设备更新，请先确认后再同步”，不会静默覆盖。

已验证：

- 定向 Android 测试通过，覆盖 v6 数据库、`remote_updated_at`、`baseUpdatedAt` 和冲突提示。
- `npm.cmd run check` / `npm.cmd run test` / `npm.cmd run build` 通过。
- `npm.cmd run android:build` / `npm.cmd run android:verify` / `npm.cmd run android:delivery-check` 通过。
- `npm.cmd run android:device-smoke` 未完成，当前没有检测到 USB 手机。

给用户真机测试的 APK：

- `android/app/build/outputs/apk/debug/app-debug.apk`

下一步按这个顺序：

1. 用户真机验证当前 APK：完全断网新建、联网同步、编辑再同步、错误地址失败提示。
2. 真机验证冲突保护：手机同步一条记录后，Web 端改同一条，手机端再改并同步，应出现冲突失败提示而不是覆盖。
3. 原生端继续补日常富文本、图片、附件能力。
4. 最后迁入原生端 Note Station `.nsx` 导入。

## 2026-07-07 原生 Android 记录生命周期后续

当前已经实现：原生离线 APK 支持记录归档和删除，并能在恢复联网后把已同步记录的归档/删除同步到 Docker/NAS。

已验证：

- 定向 Android 测试通过，覆盖 v7 数据库、`is_archived`、`is_deleted`、归档/删除 UI 和同步请求。
- `npm.cmd run check` / `npm.cmd run test` / `npm.cmd run build` 通过。
- `npm.cmd run android:build` / `npm.cmd run android:verify` / `npm.cmd run android:delivery-check` 通过。
- `npm.cmd run android:device-smoke` 未完成，当前没有检测到 USB 手机。

给用户真机测试的 APK：

- `android/app/build/outputs/apk/debug/app-debug.apk`

下一步不再做很小的字段级修补，继续按“可用闭环”推进：

1. 真机验证当前离线闭环：新建、编辑、搜索、分类、新增分类、归档、删除、同步。
2. 补原生端更可用的标签能力：标签 chip、标签筛选、删除标签。
3. 补原生富文本基础能力：至少加粗、列表、待办、图片/附件本地保存。
4. 再迁入 Note Station `.nsx` 导入和富文本展示。

## 2026-07-07 原生 Android 标签筛选后续

当前已经实现：原生离线 APK 支持标签 chip 筛选和编辑页快速标签。

已验证：

- 定向 Android 测试通过，覆盖 `currentTagFilter`、首页标签 chip、编辑页快速标签、清空标签、标签规范化和标签筛选。
- `npm.cmd run check` / `npm.cmd run test` / `npm.cmd run build` 通过。
- `npm.cmd run android:build` / `npm.cmd run android:verify` / `npm.cmd run android:delivery-check` 通过。
- `npm.cmd run android:device-smoke` 未完成，当前没有检测到 USB 手机。

给用户真机测试的 APK：

- `android/app/build/outputs/apk/debug/app-debug.apk`

下一步继续按“可用闭环”推进：

1. 真机验证标签：新建记录 -> 点 `待办` / `重要` 等快速标签 -> 保存 -> 首页点标签 chip 筛选。
2. 补原生端富文本基础能力，不追求一次做成 Note Station 全量编辑器，但至少让日常记录能有简单格式。
3. 补原生端图片 / 附件本地保存和同步。
4. 再迁入原生端 Note Station `.nsx` 导入。

## 2026-07-07 原生 Android 成员归属后续

当前已经实现：原生离线 APK 支持默认成员“我 / 爱人”的选择、记录归属展示、首页成员筛选，并在同步到 Docker/NAS 时携带对应 `memberId`。

已验证：

- 定向 Android 测试通过，覆盖 v8 数据库、`member_id`、首页成员筛选、编辑页成员选择、详情页成员展示和同步 payload。
- `npm.cmd run check` / `npm.cmd run test` / `npm.cmd run build` 通过。
- `npm.cmd run android:build` / `npm.cmd run android:verify` / `npm.cmd run android:delivery-check` 通过。
- `npm.cmd run android:device-smoke` 未完成，当前没有检测到 USB 手机。

给用户真机测试的 APK：

- `android/app/build/outputs/apk/debug/app-debug.apk`

下一步继续按“可用闭环”推进：

1. 用户真机验证：新建记录选择“爱人” -> 保存 -> 首页筛选“爱人” -> 同步到 Docker/NAS。
2. 补原生端富文本基础能力，不追求一次做成 Note Station 全量编辑器，但要能满足日常记录。
3. 补原生端图片 / 附件本地保存和同步。
4. 再迁入原生端 Note Station `.nsx` 导入。
