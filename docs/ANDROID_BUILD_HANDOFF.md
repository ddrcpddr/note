# Android 打包交接

更新时间：2026-07-04

## 当前结果

已生成第一版 Android debug APK：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

大小约 16 KB，已通过 apksigner verify，v1/v2/v3 签名为 true。

## 使用方式

安装后首次打开会要求输入服务器地址。请输入家庭 NAS / Docker 的局域网地址，例如：

```text
http://192.168.1.100:3300
```

该地址只是示例，不是仓库内真实地址。

## 构建命令

```powershell
npm.cmd run android:build
```

## 注意

- 这是 debug 包，适合家庭自用测试。
- APK 不提交 Git。
- 如果手机无法访问，优先确认电脑/NAS 防火墙、Docker 端口、手机和服务器是否在同一局域网。
