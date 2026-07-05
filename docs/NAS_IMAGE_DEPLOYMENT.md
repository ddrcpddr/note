# 通用 NAS 镜像部署

本方案适合群晖和 QNAP：NAS 不需要从源码构建镜像，只需要拉取 GitHub Container Registry 镜像、映射端口、挂载 `/data`。

镜像地址：

```text
ghcr.io/ddrcpddr/note:latest
```

固定版本也可以使用 commit tag：

```text
ghcr.io/ddrcpddr/note:<commit-sha>
```

## 1. 先公开 GitHub Packages 镜像

GitHub Actions 会把镜像推到 GitHub Packages / GHCR。首次生成后，如果包默认是 private，需要你在 GitHub 页面手动设为 public：

1. 打开仓库 `ddrcpddr/note`。
2. 进入右侧或个人主页的 Packages。
3. 找到 `note` 镜像。
4. Package settings 中把 Visibility 改为 public。

如果不设为 public，群晖 / QNAP 拉镜像时需要配置 GHCR 登录；家庭内网部署为了省事，建议设为 public。镜像不包含 `data/`、数据库、附件、备份、导出、`.nsx`、`.env` 或真实 NAS 地址。

## 2. 群晖 Container Manager

建议数据目录：

```text
/volume1/docker/home-note/data
```

Container Manager 中创建容器或项目时填写：

```text
Image: ghcr.io/ddrcpddr/note:latest
Container port: 3300
Local port: 3300
```

卷挂载：

```text
/volume1/docker/home-note/data -> /data
```

环境变量：

```text
NODE_ENV=production
PORT=3300
NOTE_DATA_DIR=/data
TZ=Asia/Shanghai
NOTE_ACCESS_PIN=你的家庭口令，可留空
NOTE_AUTO_BACKUP_INTERVAL_HOURS=24
```

访问：

```text
http://群晖IP:3300
```

健康检查：

```text
http://群晖IP:3300/api/health
```

## 3. QNAP Container Station

建议数据目录：

```text
/share/Container/home-note/data
```

Container Station 中创建容器时填写：

```text
Image: ghcr.io/ddrcpddr/note:latest
Container port: 3300
Host port: 3300
```

卷挂载：

```text
/share/Container/home-note/data -> /data
```

环境变量同群晖：

```text
NODE_ENV=production
PORT=3300
NOTE_DATA_DIR=/data
TZ=Asia/Shanghai
NOTE_ACCESS_PIN=你的家庭口令，可留空
NOTE_AUTO_BACKUP_INTERVAL_HOURS=24
```

访问：

```text
http://QNAP-IP:3300
```

## 4. 使用 Compose 部署

仓库提供通用镜像 compose：

```text
docker-compose.image.yml
```

群晖默认示例：

```yaml
volumes:
  - /volume1/docker/home-note/data:/data
```

QNAP 可改为：

```yaml
volumes:
  - /share/Container/home-note/data:/data
```

默认时区为 `Asia/Shanghai`，如果你的 NAS 位于其他时区，可以通过环境变量 `TZ` 覆盖。

启动：

```bash
docker compose -f docker-compose.image.yml up -d
```

## 5. Android App 地址

Android App 第一次打开时，服务器地址填写：

```text
http://你的NAS局域网IP:3300
```

例如：

```text
http://192.168.2.213:3300
```

## 6. 数据备份

真正需要长期保存的是 NAS 上挂载到 `/data` 的目录。

群晖示例：

```text
/volume1/docker/home-note/data
```

QNAP 示例：

```text
/share/Container/home-note/data
```

里面包含：

```text
database/app.db
attachments/
backups/
exports/
imports/notestation/
```

升级镜像、重建容器或换 NAS 时，先备份整个 `data` 目录。

## 7. 安全提醒

- 不要提交 `.env`。
- 不要提交 `data/`。
- 不要提交数据库、附件、备份、导出、`.nsx`。
- 不要把真实 NAS 地址、账号、密码、token 写进 Git。
- 如果手机访问不了，检查 NAS 防火墙是否放行 TCP `3300`。

## 8. 确认 NAS 实际运行的是最新镜像

后续镜像会在 `/api/health` 中返回 build 信息：

```text
http://你的NAS-IP:3300/api/health
```

重点查看：

```json
{
  "build": {
    "commit": "GitHub commit sha",
    "buildTime": "GitHub Actions run id"
  }
}
```

如果页面功能和本地 Docker 表现不一致，优先检查：

1. NAS 是否重新拉取了 `ghcr.io/ddrcpddr/note:latest`。
2. 容器是否删除旧容器后重新创建，而不是继续跑旧镜像。
3. NAS 挂载目录 `/data` 是否可写。
4. 手机浏览器 / WebView 是否缓存了旧前端；可以清站点数据或重新安装 APK 后再测。
5. 用写入版 smoke 验证测试环境：

```powershell
npm.cmd run smoke -- --base-url http://你的NAS-IP:3300
```

注意：写入版 smoke 会创建一条测试记录、一次测试导入、备份和 JSON 导出。真实家庭数据环境如不想写测试数据，可使用：

```powershell
npm.cmd run smoke -- --base-url http://你的NAS-IP:3300 --read-only
```
