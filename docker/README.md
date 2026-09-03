# 容器部署参考

使用仓库根目录的 `Dockerfile` 和 `compose.production.yml`。Compose 仅供人工审查；ServerOps 根据受 root 管理的策略生成生产配置，不直接以 root 执行仓库 Compose。

## 镜像与数据

CI 工作流 `serverops-image.yml` 只构建、发布 `linux/amd64` 私有 GHCR 镜像，push 与 workflow_dispatch 都使用完整 `sha-<40hex>` 标签。手动触发的 `commit` 可指定完整提交；标签与 OCI revision/source 取自实际 checkout，工作流不连接生产环境。保持 GHCR 包为 private，已有包也必须保持 private；不要为解决拉取权限而公开包。CI 使用仓库 `GITHUB_TOKEN` 的 `contents:read`、`packages:write`。生产拉取凭据 `ghcr.token` 由 ServerOps 保管，需有私有包读取权限，不进入 Git、构建参数或镜像。

复制 `compose.env.example` 到仓库外，填入已验证的 image digest、绝对 env 路径、UID/GID 和数据目录。运行时 env 从本目录示例复制到外部权限受限文件，填写凭据；不把 Compose 插值文件当作应用 env。绑定目录必须预先存在，且对配置的非 root UID/GID 可写；`create_host_path: false` 阻止自动创建空目录。数据备份、迁移、切换和回滚由 ServerOps 执行。

web/API 镜像必须取自同一 SHA 并各自固定 digest。web 内部 8080，Nginx 将 `/api/` 保留路径代理到 `api:3081`；API 内部 3081、`HOST=0.0.0.0`。web 的外部 env 可为空，API env 使用 `api.env.example`。镜像内安装与锁文件 Playwright 版本一致的 Chromium。可选 `ai-video-evaluator` Python 插件未打包；视频播放保留现有 B站原生接口回退。`api/data` 整体排除，迁移时完整保留文章、留言、管理 Token 与缓存；镜像不会复制仓库演示数据到挂载目录。

## ServerOps 生产映射

`www.shanchen.space` 与别名 `shanchen.space` 属于同一个服务（`3fe105c4-a341-480f-a22e-f734743a6ee0`）。批准配置如下；该表是部署约定，不代替面板中的实际发布状态。

| 组件 | 宿主入口 | 用户 | 数据与环境 |
| --- | --- | --- | --- |
| Web | `127.0.0.1:8080` | `101:101` | `/etc/serverops/apps/person-homepage-web.env`，不挂载业务数据 |
| API | `127.0.0.1:3081` | `1000:1000` | `/srv/serverops/data/person-homepage/data` → `/app/data`；`/etc/serverops/apps/person-homepage-api.env` |

宿主 Nginx 保留原证书、公开策略、`/api/` 的 API 转发，以及更具体的 `/api/bilibili/` 缓存转发；前端页面及静态资源才转发到 Web 容器。原 HTTP ACME 目录仍为 `/var/www/letsencrypt`，不因容器迁移更改 Certbot 的既有续签配置。

API 运行环境保留原管理员密码哈希和 Token，但将 Playwright 路径改为镜像的 `/ms-playwright`。不要照搬 CentOS 的 `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-bundle.crt`：此路径不在 Debian 镜像中，迁移使用已验证的 Node 内置信任根。私有 CA 如有新增需求，须另行审批挂载和验证，不能关闭 TLS 校验。

日常更新在 Ops「服务 → www → 代码与部署」点击“更新并上线”，由持久化任务固定 `main` 提交、核验两个镜像、停写备份、切换和检查。GitHub push 只构建镜像，不自动更新生产；不要在旧 `/opt/person-app` 执行 Git/npm 当作容器更新。旧目录的 `api/data/bilibili-videos.json`、`api/data/platform-cache.json` 是生产数据，不应 reset 或提交。

人工恢复必须先停下整个 Compose 项目的 Web/API，避免旧、新 API 同时写数据；核验备份后恢复匹配的两个镜像与数据，检查通过再恢复入口。保留的 `person-api.service`、`/opt/person-app` 和 `/opt/person` 仅是迁移前恢复材料。生产开放后若已有新写入，不得未经确认就用旧数据覆盖当前目录。

## 检查和启动

```sh
docker compose --env-file /absolute/path/compose.env -f compose.production.yml config
docker compose --env-file /absolute/path/compose.env -f compose.production.yml up -d
docker compose --env-file /absolute/path/compose.env -f compose.production.yml ps
```

宿主端口只监听 `127.0.0.1`，公网入口由外部反向代理和认证控制。日志采用 json-file 的 10m × 3 轮转，进程以非 root 用户运行并自动重启。正式迁移前必须通过真实 Linux 镜像构建、容器健康检查、静态资源验证以及数据备份/回滚演练；源码构建成功不等于这些检查已通过。
