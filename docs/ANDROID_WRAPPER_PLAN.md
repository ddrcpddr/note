# Android 原生封装准备方案

本文件用于最后阶段的 Android App 封装决策。当前先做方案收口和验收门槛，不安装 Android / Capacitor / TWA 依赖，不生成签名文件，不写入真实 NAS 地址。

## 1. 当前事实

- 当前 note 是家庭 NAS / 局域网优先的 Web + API 应用。
- 前端由 Vite 构建，生产模式下 Express 同端口提供静态前端和 API。
- 数据库是服务端 SQLite，默认位于 `data/database/app.db`，NAS / Docker 部署时通过 `NOTE_DATA_DIR=/data` 集中管理。
- Android 手机上的 PWA 安装已经具备基础条件：manifest、runtime 图标、standalone display、移动端布局。
- 当前不做复杂离线同步，不把正式数据库迁移到手机本地。

## 2. 推荐封装路线

### 路线 A：先使用 PWA / 添加到桌面

适合当前家庭试运行，成本最低。

- 手机通过浏览器访问 `http://<局域网IP或NAS地址>:3300`。
- 使用浏览器“添加到主屏幕 / 安装应用”。
- 数据仍保存在 NAS 上，手机只是访问入口。
- 不需要 Android Studio、签名证书或应用商店。

当前建议：作为真实家庭试运行的默认方式。

### 路线 B：Android WebView 壳

适合后续希望有一个安装包，但仍由 NAS 提供服务。

- Android App 内置一个 WebView。
- 首次打开时让用户填写家庭服务地址，或在本地调试包中使用占位地址。
- WebView 加载 NAS 上的 Web 应用。
- 数据仍在 NAS 服务端，不复制到手机本地。
- 需要 Android 工程、包名、签名、版本号和最小 SDK 选择。

当前建议：如果 PWA 试运行稳定，再进入这一路线。

### 路线 C：Trusted Web Activity / TWA

适合公开 HTTPS 域名和可配置 Digital Asset Links 的场景。

- 对家庭局域网 HTTP / 私有 NAS 地址不友好。
- 通常需要 HTTPS、域名、assetlinks.json 和签名指纹。
- 当前不建议作为第一条 Android 封装路线。

### 路线 D：真正原生 Android + 本地数据库 / 同步

当前不建议。

- 会改变核心架构。
- 需要移动端数据库、同步、冲突解决和权限模型。
- 不符合当前“家庭 NAS 轻量记录工具”的 MVP 方向。

## 3. 进入 Android 封装前的必备验收

进入 WebView / TWA 封装前，必须先完成：

1. 真实安卓手机通过局域网地址打开 Web 版。
2. PWA 添加到桌面可打开。
3. 首页、详情、新建、编辑、搜索、分类、设置、导入记录详情可正常使用。
4. 新建记录刷新后不丢失。
5. 真实附件上传在手机浏览器中可用，文件落到 NAS `data/attachments/`。
6. 设置页手动备份、JSON 导出、Markdown 导出可用。
7. 设置页“检查当前数据目录”通过。
8. 如果配置 `NOTE_ACCESS_PIN`，手机端解锁流程可用。
9. 长标题、长正文、长链接无明显横向溢出。
10. 家庭成员“我 / 爱人”筛选和显示正常。

## 4. 需要用户确认的信息

真正创建 Android 工程前，需要用户确认：

- Android 包名，例如 `com.example.home_note` 或自定义正式包名。
- App 显示名称是否继续使用“家事记”。
- 是否只做家庭自用 APK，还是未来可能上架应用商店。
- 最低 Android 版本要求。
- 是否需要应用内配置 NAS 地址，还是构建时写入占位默认地址。
- 是否允许引入 Capacitor、原生 Kotlin/Java WebView 工程，或 TWA 相关依赖。
- 是否已有签名证书；如果没有，是否由本地生成调试 / 发布 keystore。

不要把真实 NAS 地址、账号、密码、token 或签名密钥提交到 Git。

## 5. 建议验收标准

Android 封装完成后，应至少验证：

- APK 可安装并打开。
- 首屏不白屏，能连接家庭 NAS 服务。
- 返回键行为合理：页面内返回优先，首页再退出。
- 文件选择器可用于附件上传。
- PWA / WebView 中设置页备份、导出、目录探测仍可用。
- 访问口令开启时，解锁 cookie 或会话策略在 WebView 中正常。
- 断网或 NAS 不可用时有可理解提示。
- 不包含真实 NAS 地址、密码、token、数据库、备份、附件或导出文件。

## 6. 当前结论

当前最合理的下一步不是直接创建 Android 工程，而是先用真实 Android 手机完成 Web / PWA 试运行。试运行稳定后，再选择 WebView 壳或 TWA。若用户明确批准引入 Android 封装依赖和确认包名等信息，再进入实际 Android 工程创建阶段。
