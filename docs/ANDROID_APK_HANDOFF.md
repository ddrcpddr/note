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

## 2026-07-06 原生离线搜索 / 分类筛选补充

当前 debug APK 已在原生离线核心上补充：

- 首页搜索记录、标签或内容。
- 按本地分类筛选。
- 清除筛选。

APK 仍为原生离线包：`npm.cmd run android:verify` 显示 `nativeOffline=true`、`webAssetCount=0`。

本机自动检查通过：`npm.cmd run android:delivery-check`。当前电脑未连接 USB 手机，`npm.cmd run android:device-smoke` 未完成真机验证。

## 2026-07-06 原生离线分类管理补充

当前 debug APK 已在原生离线核心上补充：

- 手机本地 SQLite `categories` 表。
- 11 个默认分类初始化。
- 原生分类管理页。
- 离线新增自定义分类。
- 新建 / 编辑记录时选择本地分类。
- 保存记录时自动维护本地分类。

验证结果：

- `npm.cmd run android:delivery-check`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

边界：

- 这是原生离线功能推进的一小步，不是最终离线 Android App。
- Docker/NAS 同步、富文本、图片、附件、Note Station `.nsx` 导入还未迁入原生端。

## 2026-07-06 原生同步前置补充

当前 debug APK 已加入同步前置能力：

- `sync_queue` 本地待同步队列。
- 新建 / 编辑记录会写入待同步项。
- 首页显示待同步数量。
- 原生同步页面可保存 Docker/NAS 服务器地址。
- 手动同步按钮当前只提示“同步功能下一阶段接入 Docker/NAS”。

验证结果：

- `npm.cmd run android:delivery-check`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

边界：

- 当前还没有真正把手机本地记录上传到 Docker/NAS。
- 不应把这个 APK 说成“联网同步已完成”。

## 2026-07-06 原生新建记录同步补充

当前 debug APK 已加入最小联网同步能力：

- 在原生同步页保存 Docker/NAS 服务器地址。
- 点击“手动同步”会后台上传本机新建记录。
- 目标接口：`POST /api/notes`。
- 成功后队列项标记为 done。
- 失败后队列项标记为 failed，并继续计入待同步数量。

验证结果：

- `npm.cmd run android:delivery-check`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

边界：

- 只同步新建记录。
- 编辑同步、冲突处理、富文本、附件、NSX 导入仍未迁入原生端。
- 真实手机局域网同步还需要连接设备或用户人工验收。

## 2026-07-07 原生编辑同步补充

当前 debug APK 已把原生同步从“只上传新建记录”推进到“新建后保存远端 ID，后续编辑可 PATCH 回 Docker/NAS”：

- 本机 SQLite 数据库版本为 v4。
- `notes.remote_id` 保存服务端返回的 `note.id`。
- 本机新建记录同步成功后，会把服务端 `note.id` 写回本机记录。
- 本机编辑已同步记录后，手动同步会调用 `PATCH /api/notes/:remoteId`。
- 如果一条记录还没完成 create 同步，多次编辑会合并进同一条 create，不会生成错误的 update。
- 如果 update 缺少 `remote_id`，会保留失败状态，不会静默当作成功。

本机验证结果：

- `node --test tests/android-wrapper.test.js`：通过，10 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，90 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含 HTTP smoke。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

建议真机重点测：

1. 不连接 Docker/NAS，新建一条记录并保存。
2. 填写 Docker/NAS 地址，手动同步。
3. 用浏览器打开 Docker/NAS，确认记录出现。
4. 回到 APK 编辑这条记录，保存。
5. 再次手动同步。
6. Docker/NAS 浏览器端刷新，确认标题、正文、分类、标签是编辑后的最终版本。

仍不承诺：

- 原生端富文本编辑。
- 原生端图片 / 附件。
- 原生端 Note Station `.nsx` 导入。
- 多设备冲突合并界面。
- vivo X300 Pro 和 Huawei P30 Pro / HarmonyOS 真机通过，除非用户或 `android:device-smoke` 后续确认。

## 2026-07-07 原生同步失败详情补充

当前 debug APK 已加入原生同步失败详情：

- 本机 SQLite 数据库版本为 v5。
- `sync_queue.error_message` 保存最近失败原因。
- `sync_queue.last_attempt_at` 保存最近尝试同步时间。
- 同步页会显示“最近同步失败”，列出记录标题、同步类型、失败原因和最后尝试。
- 同步成功后会清空失败原因，避免旧错误误导。

本机验证结果：

- `node --test tests/android-wrapper.test.js`：通过，11 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，91 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

建议真机重点测：

1. 在同步页填写一个错误服务器地址。
2. 新建或编辑一条本机记录。
3. 点击手动同步。
4. 确认同步页出现“最近同步失败”和具体失败原因。
5. 改回正确 Docker/NAS 地址。
6. 再次手动同步，确认失败项消失或待同步数量减少。

仍不承诺：

- 多设备冲突提示。
- 原生端富文本、图片、附件和 `.nsx` 导入。
- 两台家庭手机真机通过。

## 2026-07-07 原生冲突保护补充

当前 debug APK 已加入原生编辑同步冲突保护：

- 本机 SQLite 数据库版本为 v6。
- `notes.remote_updated_at` 保存最近一次成功同步时服务端返回的更新时间。
- 新建记录同步成功后会保存服务端 `note.id` 和 `note.updatedAt`。
- 已同步记录再次编辑后，手动同步会向 Docker/NAS 发送 `baseUpdatedAt`。
- 如果 Docker/NAS 上同一条记录已经被其他设备更新，服务端会返回冲突，APK 会把同步项保留为失败并显示“记录已经在其他设备更新，请先确认后再同步”。
- 这一步只做“不静默覆盖”的保护，还没有做冲突合并 UI。

本机验证结果：

- `node --test tests/android-wrapper.test.js`：通过，12 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，92 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含 HTTP smoke。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

当前可测试 APK：

- `D:\工作文件夹\XYZL\领航未来\GitHub项目\note\android\app\build\outputs\apk\debug\app-debug.apk`

建议真机重点测：

1. 不连接 Docker/NAS，打开 APK 并新建记录。
2. 重启 APK，确认本地记录还在。
3. 填写 Docker/NAS 地址，手动同步，浏览器端确认记录出现。
4. APK 编辑这条记录，再同步，浏览器端确认内容更新。
5. 浏览器端先改这条记录，再让 APK 同步较旧基准上的编辑，确认 APK 显示冲突失败而不是覆盖浏览器端内容。

仍不承诺：

- 冲突合并界面。
- 原生端富文本、图片、附件和 `.nsx` 导入。
- 两台家庭手机真机通过，除非用户后续人工确认。

## 2026-07-07 原生归档 / 删除补充

当前 debug APK 已加入原生记录生命周期能力：

- 本机 SQLite 数据库版本为 v7。
- `notes.is_archived` 和 `notes.is_deleted` 保存本机归档/删除状态。
- 首页默认不显示已归档和已删除记录。
- 详情页新增“记录操作”，包括“归档记录”和“删除记录”。
- 归档已同步记录后，手动同步会调用 Docker/NAS 的 `POST /api/notes/:id/archive`。
- 删除已同步记录后，手动同步会调用 Docker/NAS 的 `DELETE /api/notes/:id`。
- 本地新建但还没同步的记录如果直接删除，会清理本机记录和待同步 create，不会生成无法同步的远端 delete。

本机验证结果：

- `node --test tests/android-wrapper.test.js`：通过，13 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，93 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含 HTTP smoke。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

当前可测试 APK：

- `D:\工作文件夹\XYZL\领航未来\GitHub项目\note\android\app\build\outputs\apk\debug\app-debug.apk`

建议真机重点测：

1. 不连接 Docker/NAS，新建一条记录。
2. 编辑这条记录，确认保存后列表和详情更新。
3. 删除一条未同步的新建记录，确认它从列表消失且不会增加待同步失败项。
4. 同步一条记录到 Docker/NAS 后，在 APK 里归档或删除，再手动同步，确认 Web 端默认列表不再显示。
5. 搜索、分类筛选和新增分类仍可用。

仍不承诺：

- 归档列表 / 回收站。
- 原生端富文本、图片、附件和 `.nsx` 导入。
- 两台家庭手机真机通过，除非用户后续人工确认。

## 2026-07-07 原生标签筛选补充

当前 debug APK 已加入原生标签使用能力：

- 首页筛选区新增“全部标签”和现有标签 chip。
- 点击标签 chip 可以只看对应标签的本机记录。
- 编辑页标签输入框下新增快速标签：`待办`、`重要`、`维修`、`账单`。
- 编辑页新增“清空标签”。
- 保存时会去重和规范化标签。
- 标签会继续参与同步到 Docker/NAS。

本机验证结果：

- `node --test tests/android-wrapper.test.js`：通过，14 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，94 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含 HTTP smoke。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

当前可测试 APK：

- `D:\工作文件夹\XYZL\领航未来\GitHub项目\note\android\app\build\outputs\apk\debug\app-debug.apk`

建议真机重点测：

1. 新建记录，点击 `待办`、`重要` 标签，保存。
2. 回首页，确认出现对应标签 chip。
3. 点击标签 chip，确认只显示带该标签的记录。
4. 编辑记录，点击“清空标签”，保存后确认标签筛选不再包含它。

仍不承诺：

- 独立标签管理页。
- 原生端富文本、图片、附件和 `.nsx` 导入。
- 两台家庭手机真机通过，除非用户后续人工确认。

## 2026-07-07 原生成员归属补充

当前 debug APK 已加入默认成员归属能力：

- 默认成员只保留“我 / 爱人”。
- 新建 / 编辑记录时可以选择当前成员。
- 首页可以按“全部成员 / 我 / 爱人”筛选。
- 首页记录卡片和详情页会显示记录归属。
- 本机 SQLite 数据库版本为 v8，`notes.member_id` 保存成员归属。
- 手动同步到 Docker/NAS 时会带上记录自己的 `memberId`，不再固定为 `self`。

本机验证结果：

- `node --test tests/android-wrapper.test.js`：通过，15 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，95 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含 HTTP smoke。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

当前可测试 APK：

- `D:\工作文件夹\XYZL\领航未来\GitHub项目\note\android\app\build\outputs\apk\debug\app-debug.apk`

建议真机重点测：

1. 完全断网打开 APK，新建记录并选择“爱人”。
2. 保存后回首页，点“爱人”筛选，确认能看到这条记录。
3. 点“我”筛选，确认不会显示刚才归属“爱人”的记录。
4. 编辑记录，把成员从“爱人”改回“我”，保存后重新筛选确认归属更新。
5. 填写 Docker/NAS 地址并手动同步，在服务端确认 `memberId` 不再固定为 `self`。

仍不承诺：

- 新增真实家庭成员。
- 独立成员管理页。
- 原生端富文本、图片、附件和 `.nsx` 导入。
- 两台家庭手机真机通过，除非用户后续人工确认。

## 2026-07-07 原生基础富文本补充

当前 debug APK 已加入轻量正文格式能力：

- 编辑页内容输入框上方新增格式工具栏。
- 支持：加粗、斜体、下划线、删除线、标题、列表、待办。
- 详情页会把基础格式渲染成原生 Android 文本样式。
- 待办行显示为 `☐`，已完成行 `- [x]` 显示为 `☑`。
- 格式仍保存在正文文本中，不依赖 Docker/NAS，不需要联网。

本机验证结果：

- `node --test tests/android-wrapper.test.js`：通过，16 tests。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，96 tests。
- `npm.cmd run build`：通过。
- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，`nativeOffline=true`、`webAssetCount=0`。
- `npm.cmd run android:delivery-check`：通过，包含 HTTP smoke。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

当前可测试 APK：

- `D:\工作文件夹\XYZL\领航未来\GitHub项目\note\android\app\build\outputs\apk\debug\app-debug.apk`

建议真机重点测：

1. 开飞行模式或断开 Docker/NAS，打开 APK。
2. 新建记录，输入一段文字，选中文字后点“加粗”。
3. 点“标题”“列表”“待办”，保存。
4. 打开详情页，确认标题、粗体、列表、待办符号能看见。
5. 重启 APK，确认记录和格式仍在本机。

仍不承诺：

- 完整 Note Station 级富文本编辑器。
- 图片 / 附件本地保存与同步。
- 原生端 Note Station `.nsx` 导入。
- 两台家庭手机真机通过，除非用户后续人工确认。

## 2026-07-07 APK 交接：本机附件 / 图片保存

当前 APK：`android/app/build/outputs/apk/debug/app-debug.apk`

已新增：
- 记录详情页的“本机附件”卡片。
- “添加附件 / 图片”按钮，调用 Android 系统文件选择器。
- 文件复制到 App 私有附件目录，不需要旧式存储权限。
- SQLite `note_attachments` 只保存元数据，不把文件 BLOB 塞进数据库。

验收建议：
1. 安装 APK，完全断网打开。
2. 新建一条记录并保存。
3. 进入详情页，点击“添加附件 / 图片”。
4. 选择一张图片或一个小文件。
5. 返回详情页确认附件名称显示。
6. 关闭并重开 App，确认记录和附件列表仍在。

限制：
- 目前附件只在当前手机本机可用，尚未同步到 Docker/NAS。
- 当前没有 USB 真机连接，因此 `android:device-smoke` 未完成。

## 2026-07-07 APK 交接：本机附件同步到 Docker/NAS

当前 APK：`D:\工作文件夹\XYZL\领航未来\GitHub项目\note\android\app\build\outputs\apk\debug\app-debug.apk`

已新增：
- 本机附件 / 图片离线保存后，恢复连接 Docker/NAS 可以随记录同步上传。
- 本机 SQLite `note_attachments` 升级到 v10，保存 `sync_status`，同步成功后标记为 `synced`，避免重复上传。
- 使用现有服务端 notes API 的 `attachments` payload，不新增服务端架构。
- UI 保持当前 Android 原生家事记风格，本轮不做视觉重设计。

本机验证：
- `node --test tests/android-wrapper.test.js`：18 tests 通过。
- `npm.cmd run android:build`：通过，重新生成 APK。
- `npm.cmd run android:delivery-check`：通过。
- `npm.cmd run android:device-smoke`：未完成，当前电脑没有检测到 USB 手机。

建议真机重点测：
1. 断网打开 APK，新建记录并保存。
2. 进入详情页添加一张图片或小文件。
3. 关闭重开 APK，确认记录和附件仍在。
4. 设置 Docker/NAS 地址并手动同步。
5. 用浏览器打开 Docker/NAS 端同一记录，确认附件已进入服务端。

---

## 2026-07-07 Capacitor 本地离线 APK 第一阶段

当前 APK 不再是 49KB 远程 URL 壳。`npm.cmd run android:build` 会先执行 Vite build，再执行 `npx cap sync android`，最后 Gradle 生成 debug APK。

### 当前 APK

```text
android/app/build/outputs/apk/debug/app-debug.apk
APK size: 25,393,803 bytes
```

### 已验证

- `npm.cmd run android:build`：通过。
- `npm.cmd run android:verify`：通过，APK 内含 `assets/public/index.html`、`assets/capacitor.config.json`、本地 React JS、`classes.dex` 和 `res/drawable/app_icon.png`。
- `npm.cmd run check`：通过。
- `npm.cmd run test`：通过，84 项测试通过。
- `npm.cmd run build`：通过。

### 本阶段已完成

- Capacitor 本地资源打包。
- Android SQLite schema 和 notes / attachments / sync_queue 基础 repository。
- 前端离线存储层开始优先接入 Android SQLite；浏览器仍保留 IndexedDB。
- 新建、编辑、删除、归档的本地优先代码路径已接入并有静态 / 单元测试覆盖。

### 还不能声明已完成

- 尚未在真实手机飞行模式下完成实测。
- 尚未完成 NAS 手动同步 push/pull。
- 尚未完成附件本地文件系统和 NAS 附件同步的完整真机验证。

### 用户下一步测试

1. 安装 debug APK。
2. 关闭 WiFi / 开飞行模式。
3. 打开 App，确认首页能进入。
4. 新建一条记录，退出 App 后重新打开。
5. 编辑、删除、归档这条记录。
6. 把测试结果反馈给主开发线程，再进入 NAS 同步阶段。
