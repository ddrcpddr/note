# Android APK 交付说明

更新时间：2026-07-06

当前目标是家庭自用测试，不做复杂发布流程。这个文档只说明当前 APK 能怎么测、已经验证了什么、还有什么不能当作已完成。

## APK 位置

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

这是 debug APK，用于家庭手机测试。安装前如果手机上已有旧版，建议先卸载旧版，避免旧 WebView 缓存或旧 IndexedDB 影响判断。

## 当前已验证

已在本机运行：

```bash
node --test tests/mvp-api.test.js tests/frontend-ui.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js
node --test tests/offline-store-behavior.test.js tests/offline-store-static.test.js tests/android-wrapper.test.js tests/frontend-ui.test.js
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run android:build
npm.cmd run android:verify
npm.cmd run android:delivery-check
npm.cmd run smoke -- --base-url http://127.0.0.1:3400
```

最近一次完整结果：

- `npm.cmd run check`：通过，SQLite `integrityCheck=ok`。
- `npm.cmd run test`：通过，86 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过，APK 签名校验通过。
- `npm.cmd run android:verify`：通过，确认 APK 内包含 `assets/www/index.html`、相对路径 JS/CSS、PWA manifest/icons，并且构建后的 JS 不含 `file:///api` 离线错误路径。
- `npm.cmd run android:delivery-check`：通过，一次性覆盖 `check/test/build/android:build/android:verify`，并启动临时 3400 服务跑 HTTP smoke。
- `npm.cmd run android:device-smoke`：当前电脑未检测到 USB 连接且授权的手机，无法完成真机日志烟测。
- `tests/offline-store-behavior.test.js`：通过，函数级验证 IndexedDB 离线快照、待同步队列压缩、失败重试和写入安全。
- HTTP smoke：通过，覆盖健康接口、app-data、列表、详情、搜索、分类筛选、成员筛选、新建记录、Note Station 网页上传导入、手动备份、JSON 导出和前端 shell。

## 可选真机烟测

如果电脑已经安装 Android platform-tools，并用 USB 连接了一台已开启 USB 调试的手机，可以运行：

```bash
npm.cmd run android:device-smoke
```

这个命令会：

- 检查当前 `app-debug.apk` 是否存在。
- 通过 `adb install -r` 安装到手机。
- 启动 `com.homeoldnote.app/.MainActivity`。
- 抓取一段 `logcat`。
- 如果发现 `FATAL EXCEPTION`、`页面脚本异常`、`TypeError`、`ReferenceError`、`Uncaught` 等错误，会返回失败。
- 日志写入 `output/android-device-smoke/`，该目录已加入 `.gitignore`，不要提交。

如果没有连接手机、手机未授权 USB 调试，或同时连接多台手机，该命令会失败并说明原因。它用于交付前补一道真实设备检查，但仍不能替代下面的手动流程。最近一次执行结果是“没有检测到可用手机”，所以当前 APK 还不能声明已经完成 vivo / Huawei 真机烟测。

## 当前 APK 已具备

- 不配置服务器地址时可进入离线使用，不再请求 `file:///api/...`。
- 离线新建记录保存到 IndexedDB。
- 离线编辑记录会保存到 IndexedDB。
- App 恢复联网后可尝试同步待同步记录。
- 离线新建后再离线编辑，会压缩为一条最终创建记录，避免服务端出现重复或 PATCH `local-*`。
- 同步失败会显示失败状态，并可点击重试。
- 在 APK 离线页面里，设置页会显示“修改手机端服务器地址”，可重新打开原生服务器地址设置页，改成当前 Docker/NAS 局域网地址。
- 离线存储函数已有行为级测试覆盖本地快照恢复、失败队列保留和同步成功后清理。
- 已有服务端记录离线编辑时会携带 `baseUpdatedAt`，服务端记录已被别人更新时返回冲突，避免静默覆盖。
- 富文本图片插入会尝试压缩；超大图片 / 附件会提示，不做假保存。
- Huawei / 老 Android WebView 上如果富文本编辑器报错，会降级到纯文本编辑，避免白屏。

## 需要用户真机验收

请至少在两台手机上测试：

- vivo X300 Pro。
- Huawei P30 Pro / HarmonyOS。

建议流程：

1. 不配置服务器地址，点击离线使用。
2. 新建一条纯文本记录，保存，杀掉 App 后重新打开确认还在。
3. 新建一条富文本记录，使用加粗、列表、待办、颜色或高亮。
4. 插入一张手机照片，确认能保存和再次打开。
5. 插入一个小附件，确认能保存。
6. 配置 Docker/NAS 地址，点击同步或等待同步。
7. 如果一开始选择了离线使用，进入设置页，点击“修改手机端服务器地址”，重新填写 Docker/NAS 地址。
8. 用浏览器打开 Docker/NAS 端，确认记录出现且内容是最后编辑版本。
9. 临时配置错误地址，确认出现待同步 / 同步失败提示。
10. 改回正确地址，点击重试同步。
11. 在 Huawei P30 Pro 上进入编辑页，确认没有白屏。

## 当前不承诺

- 不是原生 Android / Room 应用，当前仍是 WebView + IndexedDB + Docker/NAS 同步。
- 不支持复杂自动合并冲突；当前只防止旧离线版本静默覆盖服务端。
- 不支持超大附件长期离线 Blob 仓库和分块同步。
- 后台静默同步、系统级通知、自动重试策略还没有做。
- 如果手机 WebView 极老，富文本会降级纯文本；这是为了保证可写，不是完整富文本兼容。

## Docker / NAS 地址配置

APK 里需要填写 Docker/NAS 服务地址，例如：

```text
http://192.168.x.x:3300
```

不要填写 `localhost`，手机上的 `localhost` 指的是手机自己。

## 出问题时先看

1. 手机和 NAS / Docker 是否在同一个局域网。
2. 浏览器能否打开 `http://NAS-IP:3300/api/health`。
3. APK 设置的服务器地址是否带 `http://` 和端口。
4. 离线进入 App 后，设置页能否看到“修改手机端服务器地址”。
5. 首页是否显示待同步 / 同步失败。
6. 编辑页是否出现“纯文本降级”提示。

如果出现数据同步问题，先不要卸载 App。卸载会删除手机本地 IndexedDB，可能丢失未同步记录。

## 2026-07-06 重要更正：旧 Android 壳方案作废

此前文档中提到的 WebView + IndexedDB + Docker/NAS 同步 APK，不再作为最终 Android 路线。用户已经明确拒绝壳 APK，要求真正离线可用的 Android App。

当前 `android/app/build/outputs/apk/debug/app-debug.apk` 已改为原生离线核心 APK：

- 原生 Android Activity。
- 手机本地 SQLite。
- 不打包 `assets/www`。
- 不依赖 Docker/NAS 才能新建和保存基础记录。

已验证：

- `npm.cmd run android:delivery-check` 通过。
- `npm.cmd run android:verify` 输出 `nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:device-smoke` 未通过，原因是当前电脑没有检测到可用 USB 手机；不能声称 vivo / Huawei 真机已通过。

仍需说明：

- 这只是原生离线核心版，不是完整最终版。
- 富文本、附件、`.nsx` 导入、搜索筛选、Docker/NAS 同步还没有迁入原生端。
- 没有真实手机连接时，不允许声称真机已通过。
