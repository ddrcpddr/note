# Android 原生封装说明

更新时间：2026-07-04

当前已经创建第一版 Android WebView 壳，适合家庭自用安装测试。

## 当前能力

- App 名称：家事记。
- 包名：com.homeoldnote.app。
- 形式：原生 Android Activity + WebView。
- 首次打开会显示服务器地址设置页。
- 服务器地址只保存在手机本地 SharedPreferences，key 为 server_url。
- 支持局域网 HTTP 地址，例如 http://192.168.1.100:3300。
- 连接失败时显示错误页，可重新连接或修改服务器地址。
- WebView 开启 JavaScript、DOM Storage 和 Web 数据库能力，用于加载当前 Web / PWA 页面。

## 如何打包

本机 JDK 是 25，Gradle / Kotlin DSL 对它不兼容。因此当前使用本仓库脚本直接调用 Android SDK 工具打 debug APK：

```powershell
npm.cmd run android:build
```

脚本会使用：

- aapt2
- javac
- d8
- zipalign
- apksigner

为避免 Android SDK 工具处理中文路径不稳定，脚本会把 Android 源码复制到系统临时目录下构建，再把 APK 输出回仓库。

## APK 位置

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

这是 debug 签名包，适合自己手机安装测试，不是商店发布包。

## 安全边界

- 不写死真实 NAS 地址。
- 不写入账号、密码、token。
- APK、keystore、build 输出均不提交 Git。
- 服务端仍由 Docker/NAS 提供，Android 只是入口壳。

## 手机测试步骤

1. 确认 Docker/NAS 服务已启动。
2. 手机和 Docker/NAS 在同一局域网。
3. 安装 app-debug.apk。
4. 首次打开输入局域网地址，例如 http://192.168.1.100:3300。
5. 保存并打开，确认首页、富文本、新建、搜索、分类、设置可用。
6. 如果连不上，点修改服务器地址，换成当前电脑/NAS 的局域网 IP。

## 后续可选

- 加一个 Web 页面内的“修改服务器地址”入口，供已进入 WebView 后切换服务。
- 做 release 签名包。
- 统一 app 图标。
- 后续再考虑真正的 Android 本地数据库和离线同步。

## 2026-07-04 长期离线补充

Android APK 仍然是 WebView 壳，但前端已经开始转向 IndexedDB 本地优先：

- 服务器地址仍由用户在 App 内填写，不写死真实 NAS 地址。
- 在线打开后，记录、分类、成员、标签会写入 WebView 的 IndexedDB。
- NAS/Docker 不可用时，App 可读取 IndexedDB 本地快照继续查看记录。
- 新建和编辑会先写入手机本地，恢复连接后再同步到 NAS。

注意：当前不是 Android 原生 SQLite / Room 应用。长期离线能力优先放在 WebView 可复用的 IndexedDB 层，后续如需完全不依赖首次加载服务端前端壳，可以再评估把前端静态资源打进 APK。
