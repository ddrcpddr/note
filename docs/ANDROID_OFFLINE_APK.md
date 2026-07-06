# Android 离线 APK 说明

更新时间：2026-07-06

## 目标

Android APK 需要在 Docker / NAS 服务暂时不可达时继续可用，不能只作为远程 WebView。当前家里重点兼容设备：

- Huawei P30 Pro / HarmonyOS，旧 WebView 风险较高。
- vivo X300 Pro，新 Android 系统。

## 当前实现

- APK 内置前端静态页面：`file:///android_asset/www/index.html`。
- `npm.cmd run android:build` 每次先运行 `npm.cmd run build`，再把 `dist/` 打进 APK `assets/www/`。
- 服务器可达时，可以加载配置的 Docker/NAS 地址。
- 服务器不可达时，自动进入本地离线页面。
- 首次未设置服务器地址时，可以点“离线使用”。
- 本地页面通过 `window.HomeNoteAndroid.getServerUrl()` 读取手机里保存的服务器地址，用于恢复联网后的 API 请求。
- file:// 本地壳不注册 Service Worker，避免旧 WebView 兼容问题。

## 离线数据策略

- 使用浏览器 / WebView IndexedDB 保存本地快照、离线记录和同步队列。
- 离线新建和编辑会先保存到本机。
- 恢复连接后，已有同步队列会尝试写回 Docker/NAS。
- 搜索、分类、成员和详情仍复用同一套前端逻辑。

## 当前边界

- 首次完全离线没有 NAS 历史记录快照，只能使用默认分类、默认成员和本机新建记录。
- 已有 NAS 记录需要至少在线成功加载一次，才会保存在本机快照里。
- 大图片 / 附件 Blob 的长期离线持久化仍需后续增强。
- 多设备冲突合并目前不是完整方案；后续应增加冲突提示，不要静默覆盖。

## 验收流程

1. 安装 APK，先不填服务器地址，点击“离线使用”。
2. 新建一条记录，关闭 App 后重新打开，确认记录仍在。
3. 填入错误服务器地址，确认不会卡死或白屏，会进入离线模式。
4. 填入正确 Docker/NAS 地址，确认首页、详情、新建、编辑、NSX 文件选择可用。
5. 离线新建一条记录，再恢复 Docker/NAS，确认记录同步到服务端。
6. 在 Huawei P30 Pro / HarmonyOS 上重点测试编辑页；如出现 Toast，记录完整错误文案。

## 本轮验证

- `node --test tests/android-wrapper.test.js tests/frontend-ui.test.js tests/pwa-config.test.js`：通过。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，73 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 签名校验通过。
- APK 包内容确认包含 `assets/www/index.html` 和前端静态资源。

## Windows 打包路径注意事项

2026-07-06 修复：Windows 上不能再用 `aapt2 link -A <assets>` 打包前端 `dist/`，否则 APK 里可能出现 `assets/www\index.html` 这类反斜杠 zip entry，导致 `file:///android_asset/www/index.html` 在 Android WebView 里打不开。

当前脚本做法：

1. `aapt2 link` 只处理 manifest / res。
2. 使用 JDK `jar uf -C <staged main> assets` 追加 `assets/www/`。
3. 构建过程中强制校验：APK 必须包含 `assets/www/index.html`，且 `assets/` 条目不能包含 `\`。

手动复查命令：

```bash
jar tf android/app/build/outputs/apk/debug/app-debug.apk
```

合格结果应看到 `assets/www/index.html`、`assets/www/assets/...`，不能看到 `assets/www\index.html`。
## 2026-07-06 Gate 1 修复：纯离线不再请求 file API

用户真机反馈：首次不配置服务器、点击“离线使用”后，页面可保存记录，但会弹出：

```text
页面脚本异常：JS console: Fetch API cannot load file:///api/access/status
```

本轮修复结果：

- `file://` 页面且没有 Android 服务器地址时，前端不再把 `/api/...` 交给 WebView `fetch`。
- 业务 API 统一经过 `fetchApi()`；纯离线模式会走本地 IndexedDB 快照 / 本地空库降级。
- 构建产物检查：生产 JS 含离线 guard，不含 `file:///api`，不含旧 access/status fetch 写法。
- 已重新执行 `npm.cmd run android:build`，新 APK 在 `android/app/build/outputs/apk/debug/app-debug.apk`。

真机验收重点：

1. 不填服务器地址，点击“离线使用”。
2. 首页不再弹 `file:///api/access/status` 脚本异常。
3. 新建一条记录，完全退出 App 后再打开，记录仍在。
4. 再填入正确 Docker/NAS 地址，进入联网模式后观察待同步记录是否能继续处理。

注意：Gate 1 只解决启动阶段的 file API 错误。长期离线图片、附件和同步冲突属于下一阶段。

## 2026-07-06 Gate 2 第一刀：离线队列收敛到 IndexedDB

本轮已把离线新建 / 编辑记录的待同步队列从旧 localStorage 路径收敛到 IndexedDB：

- 本地记录写入 IndexedDB `notes`。
- 待同步操作写入 IndexedDB `syncQueue`。
- 页面顶部仍用“本机记录待同步”提示待同步数量。
- 旧 localStorage create queue 已移除，避免富文本图片 / 附件长期离线时被 localStorage 容量限制卡住。

真机继续验证：

1. 不填服务器地址，离线新建一条普通富文本记录。
2. 离线编辑这条记录，修改标题、分类、标签和正文。
3. 完全退出 App 后重新打开，确认记录仍在且仍显示待同步。
4. 再测试插入一张小图片和一个小附件，确认重启后仍能看到记录内容。
5. 联网同步属于下一 Gate，未完成前不要把“已同步 NAS”作为验收标准。

## 2026-07-06 Gate 2 第二刀：离线快照覆盖记录 / 分类 / 成员

本轮进一步调整：离线模式下也会把当前记录、分类、成员和当前成员写入 IndexedDB snapshot。这样不只是单条记录进队列，页面需要的基础数据也能在下次启动时恢复。

建议真机测试：

1. 完全不填服务器地址进入离线模式。
2. 新建记录并修改分类 / 标签 / 成员。
3. 如果页面有自定义分类入口，离线新增一个分类并用于记录。
4. 杀掉 App 进程后重新打开。
5. 确认记录、分类、成员显示仍在。


## 2026-07-06 Gate 3 第一刀：恢复联网同步入口

本轮补齐两个基础同步保护：

- 离线新建记录后继续编辑，同步队列会合并为一条最终 create，避免恢复联网时对 local-* ID 发 PATCH。
- 首页待同步提示增加“尝试同步”按钮。恢复 Docker/NAS 后，可以直接点击它重新连接并同步本机记录。

建议真机验收：

1. 断开 Docker/NAS 或不填写服务器地址，进入离线使用。
2. 新建一条记录。
3. 离线编辑这条记录，改标题、正文、分类、标签。
4. 杀掉 App 后重新打开，确认这条记录仍在。
5. 填入正确服务器地址或恢复网络，在首页待同步提示中点“尝试同步”。
6. 在服务端浏览器查看，确认只生成一条记录，且内容是最后编辑后的版本。

当前仍未完成：复杂冲突合并、后台同步、大附件 Blob 长期离线同步。它们后续继续按小阶段处理。

## 2026-07-06 Gate 4 第一刀：同步失败可见和重试

本轮修复了“按钮看起来能同步，但在线失败队列未必直接重跑”的风险：

- 如果 App 已经连上 Docker/NAS 且有本机待同步记录，点击“尝试同步 / 重试同步”会直接执行同步队列。
- 如果同步失败，首页提示会显示“有 X 条同步失败，可重试”。
- 失败后不会静默丢记录，待同步记录仍保留在本机 IndexedDB 队列。

建议真机验收：

1. 离线新建一条记录，并编辑一次。
2. 填一个错误服务器地址或临时断开 Docker，触发同步失败。
3. 确认首页出现同步失败提示和“重试同步”。
4. 恢复正确服务器地址，点击“重试同步”。
5. 在 Docker/NAS 浏览器端确认记录同步成功。
## 2026-07-06 Gate 5：离线编辑冲突保护

离线 APK 现在会对“编辑已有服务端记录”的同步做基础冲突保护：

- 手机离线编辑已有记录时，会记录编辑前的服务端更新时间。
- 恢复联网同步时，如果 Docker/NAS 上这条记录已经被其他设备更新，服务端会返回冲突，不会直接覆盖。
- 这类记录会保留在本机待同步 / 失败队列里，后续需要用户刷新后重新编辑，或继续做冲突处理界面。

这不是完整自动合并，只是先保证家庭数据不会被旧离线版本静默覆盖。

本轮验证：

```bash
node --test tests/mvp-api.test.js tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
```

结果：全部通过，APK 输出 `android/app/build/outputs/apk/debug/app-debug.apk`。

## 2026-07-06 Gate 6：离线图片和附件边界

离线 APK 的富文本编辑器现在对文件插入做基础保护：

- 图片：超过 2MB 会尝试压缩到适合手机端离线同步的尺寸；超过 12MB 直接提示。
- 普通附件：单个文件超过 8MB 直接提示。
- 图片压缩失败或压缩后仍过大时，不会写入正文，避免以后同步失败。

当前已验证的是家庭日常小图片 / 小附件路径，不是超大附件长期离线仓库。真机验收时建议测试：

1. 离线插入一张手机照片。
2. 离线插入一个小附件。
3. 保存后重启 App，确认内容仍在。
4. 恢复连接 Docker/NAS，确认能同步。
5. 插入超大附件，确认出现提示。

## 2026-07-06 Gate 7：HTTP 服务烟测

本轮用本机构建产物启动 Express 服务，并执行真实 HTTP smoke：

```bash
$env:PORT='3400'; npm.cmd run server
npm.cmd run smoke -- --base-url http://127.0.0.1:3400
```

结果：通过。

覆盖内容包括：

- 健康接口。
- 首页数据和详情读取。
- 搜索、分类筛选、成员筛选。
- 新建记录。
- 网页端 Note Station `.nsx` 上传导入。
- 备份和 JSON 导出。
- 前端 shell。

这个结果说明服务端 / Docker 方向的主流程正常，但 APK 真机离线和恢复联网仍需要在实际手机上确认。

## 2026-07-06 Gate 9：APK 离线包结构验证

新增命令：

```bash
npm.cmd run android:verify
```

该命令直接检查 `android/app/build/outputs/apk/debug/app-debug.apk` 内部：

- 必须包含 `assets/www/index.html`。
- `assets/` 条目不能包含 Windows 反斜杠。
- `index.html` 必须使用 `./assets/...` 相对 JS/CSS 路径，避免 `file://` 下失效。
- 必须包含 PWA manifest 和图标。
- 构建后的 JS 不能包含 `file:///api`、旧的 access/status fetch 写法或裸 `/api` fetch。
- 构建后的 JS 必须包含 Android bridge、IndexedDB 离线库、待同步文案、冲突基线等运行时标记。

以后交付 APK 前，除 `android:build` 外必须跑 `android:verify`。

## 2026-07-06 Gate 10：离线 IndexedDB 行为测试

新增命令覆盖：

```bash
node --test tests/offline-store-behavior.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js tests/frontend-ui.test.js
```

新增的 `tests/offline-store-behavior.test.js` 会用内存版 IndexedDB 验证离线核心链路：

- 离线快照可以保存和恢复。
- 本机 `local-*` 记录先新建再编辑时，只保留一条最终 `create` 待同步项。
- 同步失败项会保留为 `failed`，同步成功后会从队列移除。
- 循环引用、函数等不可写入 IndexedDB 的值会在保存前被剔除。

这个测试不能替代真机，但以后能防止离线 APK 的本地存储逻辑在代码层面退化。
