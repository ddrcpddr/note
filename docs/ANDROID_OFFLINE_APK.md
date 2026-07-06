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