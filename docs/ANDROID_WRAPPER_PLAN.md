# Android 原生封装准备方案

更新时间：2026-07-03

当前结论：Android / WebView / TWA 封装继续排在最后。现在不要创建 Android 工程，不生成 APK，不引入 Android、Capacitor 或 TWA 依赖。

## 1. 当前方向

note 是个人和家庭自用的 NAS / 局域网 Web 工具。当前主线已经调整为：

```text
富文本编辑 -> 富文本相关页面收口 -> Product Design 7 图最终视觉还原 -> Android 封装
```

Android 不是当前阶段任务。

## 2. Android 前置条件

进入 Android 封装前，必须先完成：

1. 富文本编辑能力稳定。
2. 新建记录页、编辑记录页、详情页完成富文本收口。
3. Product Design 7 张最终图视觉还原完成。
4. Web / PWA 版本在真实手机上可用。
5. 用户确认 Android 封装路线和必要信息。

## 3. 当前禁止

当前不要：

- 创建 Android 工程。
- 生成 APK。
- 引入 Capacitor / TWA / Android Gradle 依赖。
- 写入真实 NAS 地址。
- 写入账号、密码、token。
- 生成签名文件。
- 把 Android 作为富文本之前的工作。

## 4. 未来可选路线

### 路线 A：继续使用 PWA / 添加到桌面

仍然是当前最轻量路线。手机通过浏览器访问家庭 NAS 服务，数据保存在 NAS 上。

### 路线 B：Android WebView 壳

适合未来需要安装包但仍由 NAS 提供服务的场景。需要用户确认包名、App 名称、NAS 地址配置方式、签名方式。

### 路线 C：TWA

适合公开 HTTPS 域名和 Digital Asset Links 的场景。家庭局域网 HTTP / 私有 NAS 地址不优先。

### 路线 D：原生 Android + 本地数据库

当前不建议，会引入同步、冲突、移动端数据库和架构复杂度。

## 5. 未来需要用户确认的信息

真正进入 Android 封装前，需要确认：

- 包名。
- App 名称。
- 最低 Android 版本。
- 封装路线：PWA / WebView / TWA。
- NAS 地址由用户填写还是构建时配置占位默认值。
- 是否已有签名证书。
- 是否只是家庭自用 APK。

## 6. 当前结论

Android 封装暂停。等富文本编辑稳定、富文本页面收口完成、Product Design 7 图视觉还原完成后，再重新打开本文件继续决策。
