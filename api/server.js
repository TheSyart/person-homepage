/* person-api —— 个人主页内容/留言/管理微服务，经 nginx 对外。 */
const express = require('express');
const store = require('./store');
const auth = require('./auth');
const routesPublic = require('./routes-public');
const routesAdmin = require('./routes-admin');
const platforms = require('./platforms');

const PORT = parseInt(process.env.PORT, 10) || 3081;
const HOST = process.env.HOST || '127.0.0.1';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '256kb' }));

/* 每日备份（启动一次 + 每 6 小时检查） */
store.dailyBackup();
setInterval(() => store.dailyBackup(), 6 * 3600 * 1000).unref();

/* 健康检查 */
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

/* 公开接口 */
app.use('/api', routesPublic);

/* 管理接口（鉴权；login/logout 自身在路由内处理密码/注销逻辑，也统一过 requireAdmin 之外的校验） */
app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login') return next();      /* 登录不需要 token */
  return auth.requireAdmin(req, res, next);
}, routesAdmin);

/* 兜底 404 与错误 */
app.use('/api', (req, res) => res.status(404).json({ error: '接口不存在' }));
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: '请求格式错误' });
  }
  console.error('[api]', err);
  res.status(500).json({ error: '服务器开小差了' });
});

app.listen(PORT, HOST, () => {
  console.log(`person-api listening on http://${HOST}:${PORT}`);
  platforms.startSchedulers();
});
