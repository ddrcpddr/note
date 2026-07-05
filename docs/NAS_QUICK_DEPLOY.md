# NAS 快速部署教程

这份教程用于把家事记部署到家庭 NAS / Docker 环境。不要把真实 NAS 地址、账号、密码、token 写进仓库。

## 1. 准备 NAS 数据目录

以群晖为例，建议创建：

```text
/volume1/docker/home-note/data
```

目录结构由应用自动创建，最终会包含：

```text
data/
  database/app.db
  attachments/
  backups/
  exports/
  imports/notestation/
```

## 2. 上传项目代码

把当前仓库放到 NAS 上，例如：

```text
/volume1/docker/home-note/app
```

或者在 NAS SSH 中 clone：

```bash
git clone https://github.com/ddrcpddr/note.git /volume1/docker/home-note/app
cd /volume1/docker/home-note/app
```

## 3. 创建本地 `.env`

在 NAS 的项目目录中创建 `.env`，不要提交它：

```env
TZ=Asia/Shanghai
NOTE_ACCESS_PIN=你自己的家庭口令
NOTE_AUTO_BACKUP_INTERVAL_HOURS=24
```

如果暂时不想启用访问口令，可以不填 `NOTE_ACCESS_PIN`。`TZ=Asia/Shanghai` 用于让 Docker 内时间与北京时间一致。

## 4. 修改 compose 挂载路径

仓库已提供：

```text
docker-compose.nas.yml
```

默认数据挂载为：

```yaml
volumes:
  - /volume1/docker/home-note/data:/data
```

如果你的 NAS 路径不同，只改冒号左边：

```yaml
volumes:
  - /你的/NAS/数据目录:/data
```

冒号右边 `/data` 不要改。

## 5. 启动

在 NAS 项目目录运行：

```bash
docker compose -f docker-compose.nas.yml up -d --build
```

查看状态：

```bash
docker compose -f docker-compose.nas.yml ps
```

查看日志：

```bash
docker compose -f docker-compose.nas.yml logs -f note
```

## 6. 访问

电脑或手机访问：

```text
http://你的NAS局域网IP:3300
```

Android APK 里服务器地址也填这个：

```text
http://你的NAS局域网IP:3300
```

## 7. 验证

打开健康检查：

```text
http://你的NAS局域网IP:3300/api/health
```

进入设置页后建议依次测试：

1. 检查当前数据目录。
2. 立即备份。
3. 导出 JSON。
4. 新建一条富文本记录。
5. 上传一张图片或附件。
6. 重启容器后确认记录仍存在。

## 8. 更新

```bash
cd /volume1/docker/home-note/app
git pull
docker compose -f docker-compose.nas.yml up -d --build
```

## 9. 备份

最重要的是保存这个目录：

```text
/volume1/docker/home-note/data
```

其中：

- `database/app.db` 是数据库。
- `attachments/` 是图片和附件。
- `backups/` 是应用生成的数据库备份。
- `exports/` 是 JSON / Markdown 导出。
- `imports/notestation/` 是 Note Station 导入临时目录。

手动备份时，建议同时备份整个 `data/` 目录。

## 10. 停止和重启

停止：

```bash
docker compose -f docker-compose.nas.yml down
```

重启：

```bash
docker compose -f docker-compose.nas.yml up -d
```

## 注意

- 不要提交 `.env`。
- 不要提交 `data/`。
- 不要把真实 NAS 地址、账号、密码、token 写进文档或 Git。
- 如果 NAS 使用防火墙，需要放行 TCP `3300`。

## 11. 更省事的镜像部署方式

如果不想在 NAS 上从源码 `build`，可以使用 GHCR 镜像部署：

```text
ghcr.io/ddrcpddr/note:latest
```

通用教程见：

```text
docs/NAS_IMAGE_DEPLOYMENT.md
```

群晖和 QNAP 都适用。NAS 界面里只需要填写镜像地址、端口 `3300`，并把自己的数据目录挂载到容器 `/data`。
