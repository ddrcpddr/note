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
