# 小单说AI · Clay 动态个人主页

这是“小单说AI”的个人网站，内容集中在 AI Agent、开源项目、视频和技术文章。前端使用 Vue 3，服务端负责聚合 GitHub、B站和抖音公开资料，也提供文章、视频与留言接口。

网站采用 Clay 粘土拟态设计。首页只保留动态 Agent Hero 和三平台资料，文章、视频、Agent 系列、个人经历分别放在独立页面。

线上地址：[www.shanchen.space](https://www.shanchen.space/)

<p align="center">
  <img src="./public/assets/clay/agent-core.png" width="320" alt="小单说AI Clay Agent 核心">
</p>

## 当前内容

- 34 篇从 CSDN 导入的真实文章，正文图片已保存到站内。
- 34 张统一生成的 16:9 Clay 文章封面，每篇文章有独立摘要与替代文本。
- 50 条 B站视频，页面会同步后续新增内容。
- “从零实现自己的 Agent”9 期系列，每期关联稳定 BV 链接和 GitHub 学习资源。
- GitHub、B站、抖音三平台资料面板，展示数据来源、状态和更新时间。
- 留言板、文章管理、视频管理和留言管理接口。

这些数字描述的是仓库当前自带的数据，不代表平台数据永久不变。运行 API 后，平台资料和视频清单会按计划刷新。

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 动态 Clay Agent Hero；GitHub、B站、抖音资料 |
| `/agents` | 9 期 Agent 实现路线、视频和对应代码资源 |
| `/articles` | 34 篇文章及统一 Clay 封面 |
| `/articles/:slug` | Markdown 文章正文、标签和原文信息 |
| `/videos` | B站视频清单、封面、互动数据和站内播放入口 |
| `/about` | 自我介绍、项目、技能、校园照片、兴趣和联系方式 |
| `/messages` | 留言提交、数量、分页和状态反馈 |

未知路径会进入站内 404 页面。

## 交互与视觉

- 蓝、粉、绿、黄四组 Clay 色板，配合外浮阴影、内高光和圆角表面。
- Hero 支持指针视差、核心挤压、点击粒子和环绕数据体；离开视口后暂停持续动画。
- 平台数字使用滚动计数，按钮有轻抬升与按压反馈。
- `prefers-reduced-motion: reduce` 下关闭环绕、视差和粒子，只保留短淡入反馈。
- 桌面端、平板和 640px 以下手机布局均有独立适配。
- 键盘焦点、列表语义、Markdown 列表样式和触控区域经过自动化测试。

Clay 主视觉、三组平台装置和文章封面位于 `public/assets/clay/`。平台官方 Logo 由页面单独叠加，不写入生成素材。

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 前端 | Vue 3、Vue Router、Vite、Tailwind CSS、原生 CSS 动画 |
| Markdown | markdown-it |
| API | Node.js、Express |
| 平台同步 | GitHub REST API、Bilibili API/WBI、Playwright |
| 测试 | Vitest、Vue Test Utils、jsdom |
| 部署 | Nginx、systemd、Shell |

项目没有增加专用动画库。Hero 的动画主要使用 `transform` 与 `opacity`，避免持续触发布局和重绘。

## 数据同步与缓存

浏览器只请求本站 API，不直接调用三个平台。API 启动时先读取本地缓存，再异步刷新外部数据，因此外部平台暂时不可用时，网站仍能返回最后一次成功结果。

| 数据 | 刷新周期 | 获取方式 | 失败策略 |
| --- | --- | --- | --- |
| GitHub 资料与仓库 | 15 分钟 | GitHub REST API | 保留缓存；统计非 Fork 仓库总 Star 和 Star 最高的两个仓库 |
| B站资料 | 15 分钟 | Bilibili 公开接口 | 保留缓存并标记状态 |
| B站视频 | 6 小时 | WBI 签名；生产环境可使用 Playwright 浏览器会话 | 不完整响应只合并新数据，不删除旧清单 |
| 抖音资料 | 6 小时 | Playwright 读取公开主页 | 校验名称和抖音号；验证码、空页面、零值或字段缺失时拒绝覆盖缓存 |
| 视频临时直链 | 按需，活跃记录每小时检查 | `ai-video-evaluator`，失败后使用 B站原生接口 | 剩余有效期不足 20 分钟时刷新；最终保留稳定 BV 页面链接 |

平台状态有四种：

- `live`：数据仍在配置的刷新周期内。
- `cached`：数据超过一个刷新周期，但没有超过四倍周期。
- `stale`：缓存已经明显过期。
- `unavailable`：没有可用时间戳或有效数据。

主要缓存文件：

- `api/data/platform-cache.json`：三平台资料。
- `api/data/bilibili-videos.json`：B站视频清单。
- `api/data/video-play-cache.json`：临时播放地址，属于运行时数据，不提交到 Git。

## 目录结构

```text
.
├── api/
│   ├── data/                 # Markdown 文章、平台缓存和运行时数据
│   ├── platforms/            # GitHub、B站、抖音同步与缓存逻辑
│   ├── routes-public.js      # 公开 API
│   ├── routes-admin.js       # Bearer Token 管理 API
│   └── server.js             # Express 服务入口
├── docs/                     # CSDN 导入报告与设计文档
├── public/
│   ├── articles/csdn/        # 本地化的文章正文图片
│   ├── assets/clay/          # Hero、平台装置和 34 张文章封面
│   └── example/              # 照片、技能图标和平台 Logo
├── scripts/                  # CSDN 导入、正文图片处理和文章元数据脚本
├── src/
│   ├── components/           # 全站、首页、Agent 与 About 组件
│   ├── composables/          # 平台资料读取与兜底
│   ├── pages/                # 公开页面
│   ├── config.js             # 个人资料、项目、技能和 Agent 系列映射
│   └── style.css             # Clay 设计系统与响应式样式
├── tests/                    # 页面、数据、同步和可访问性测试
└── tools/                    # Nginx、systemd、部署和管理脚本
```

## 本地运行

### 环境要求

- Node.js `^18.0.0` 或 `>=20.0.0`。
- npm。
- Chromium。只有需要刷新抖音资料或使用 B站浏览器会话时才会启动。
- Python 3 与 `ai-video-evaluator` 为可选项，只用于解析视频临时直链，不执行转录。

### 安装

```bash
npm ci
npm ci --prefix api
npx --prefix api playwright install chromium
```

### 启动

先启动 API：

```bash
npm run dev:api
```

再开一个终端启动前端：

```bash
npm run dev
```

Vite 默认使用 `http://127.0.0.1:5173`，并将 `/api` 代理到 `http://127.0.0.1:3081`。如果 5173 端口被占用，以终端显示的实际地址为准。

只查看已有缓存时，不需要配置平台账号或 Cookie。API 会先返回仓库中的缓存，再尝试刷新。

## 环境变量

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `PORT` | `3081` | API 端口；服务固定监听 `127.0.0.1` |
| `DATA_DIR` | `api/data` | 文章、留言、Token 和缓存目录 |
| `GITHUB_TOKEN` | 空 | 提高 GitHub API 配额；只在服务端使用 |
| `BILIBILI_DIRECT_WBI` | 空 | 设为 `1` 时强制使用纯 WBI 请求视频清单 |
| `PLAYWRIGHT_BROWSERS_PATH` | Playwright 默认目录 | 指定 Chromium 安装位置 |
| `AI_VIDEO_EVALUATOR_DIR` | 本机技能目录或空 | `ai-video-evaluator` 所在目录 |
| `PYTHON_BIN` | `python3` | 视频解析脚本使用的 Python 命令 |
| `ADMIN_PASSWORD_HASH` | 空 | 管理端密码的 SHA-256；为空时无法密码登录 |
| `ADMIN_TOKEN` | 空 | 服务器本地管理脚本使用的长期 Token |
| `CSDN_EXPORT_DIR` | `~/Downloads` | CSDN 导入脚本读取导出文件的目录 |

不要把 Token、密码哈希或平台凭据提交到仓库。生产安装脚本会把管理配置写入权限为 `600` 的 `/etc/person-api.env`。

## 公开 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/profile` | GitHub、B站、抖音资料及缓存状态 |
| `GET` | `/api/articles` | 已发布文章列表 |
| `GET` | `/api/articles/:slug` | 单篇文章和完整 Markdown 正文 |
| `GET` | `/api/videos` | 全部 B站视频 |
| `GET` | `/api/videos?series=from-zero-agent` | 9 期 Agent 系列 |
| `GET` | `/api/videos/:bvid/play` | 可过期临时直链与稳定 B站页面链接 |
| `GET` | `/api/messages/list?page=1&size=10` | 留言分页 |
| `GET` | `/api/messages/count` | 留言总数 |
| `POST` | `/api/messages` | 提交留言 |

留言昵称最多 16 字，正文最多 500 字。同一 IP 每 60 秒最多提交一条，每天最多五条；服务端还会检查蜜罐字段和页面停留时间。

`/api/admin/*` 使用 Bearer Token 鉴权，提供文章、视频和留言管理。登录会话有效期为七天；同一 IP 连续失败五次后锁定十分钟。生产环境可以通过 `tools/admin.sh` 在服务器本地管理内容。

## 文章维护

文章使用 Markdown 与 YAML frontmatter，存放在 `api/data/articles/`。每篇文章至少包含标题、日期、摘要、标签、封面与封面替代文本。文章正文图片位于 `public/articles/csdn/<文章 ID>/`。

重新执行 CSDN 导入：

```bash
npm run import:csdn
```

导入器会读取 `scripts/data/csdn-published.json`，期望处理 34 篇文章，并把报告写入 `docs/csdn-import-report.json`。默认从 `~/Downloads` 查找导出文件，可以用 `CSDN_EXPORT_DIR` 修改目录。

重新写入当前摘要与封面字段：

```bash
node scripts/enrich-articles.mjs
```

这个脚本只改 frontmatter，并检查 Markdown 正文没有被替换。

## 测试与构建

运行全部测试：

```bash
npm test
```

生产构建：

```bash
npm run build
```

测试覆盖页面信息架构、Clay 设计约束、减少动态效果、文章元数据、50 条视频清单、9 期 Agent 映射、WBI 签名、部分同步合并、抖音账号校验和临时直链刷新规则。

## 生产部署

仓库内的部署脚本针对当前服务器目录和服务账号编写，不是通用安装器。执行前请先检查脚本中的路径、用户、域名、证书和 Nginx 位置。

当前流程：

1. 将项目放在 `/opt/person-app`，安装前后端依赖并运行 `npm run build`。
2. 首次安装 API：`sudo bash /opt/person-app/tools/install-api.sh`。
3. 部署前端并更新 Nginx：`sudo bash /opt/person-app/tools/deploy.sh`。

`install-api.sh` 会安装 Playwright Chromium、创建 `/etc/person-api.env`、注册 `person-api.service` 并启动 API。`deploy.sh` 会备份现网入口与 Nginx 配置，再复制 `dist/`、校验配置并重载 Nginx。

## 内容与许可

文章、视频、照片、品牌素材和个人资料归原作者所有。仓库当前没有附带开源许可证，因此不能默认将代码或素材视为已授权再分发。
