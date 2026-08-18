/* 公开接口：文章/视频/留言 */
const express = require('express');
const store = require('./store');

const router = express.Router();

/* 留言限流：同 IP 60 秒 1 条、每日 5 条 */
const rateMap = new Map(); // ip -> { last, day, count }
setInterval(() => {
  const today = new Date().toISOString().slice(0, 10);
  for (const [ip, r] of rateMap) {
    if (r.day !== today && Date.now() - r.last > 24 * 3600 * 1000) rateMap.delete(ip);
  }
}, 3600 * 1000).unref();

function clientIp(req) {
  return (req.headers['x-real-ip'] || req.ip || 'unknown').toString();
}

/* ---- 文章 ---- */
router.get('/articles', (req, res) => {
  res.json(store.listArticles(false));
});

router.get('/articles/:slug', (req, res) => {
  const a = store.getArticle(req.params.slug);
  if (!a) return res.status(404).json({ error: '文章不存在' });
  res.json(a);
});

/* ---- 视频 ---- */
router.get('/videos', (req, res) => {
  res.json(store.listVideos());
});

/* ---- 留言 ---- */
router.get('/messages/list', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const size = Math.min(50, Math.max(1, parseInt(req.query.size, 10) || 10));
  res.json(store.listMessages(page, size));
});

router.get('/messages/count', (req, res) => {
  res.json({ count: store.listMessages(1, 1).total });
});

router.post('/messages', (req, res) => {
  const { name, content, hp, t } = req.body || {};

  /* honeypot：机器人字段必须为空 */
  if (hp) return res.status(400).json({ error: '提交失败' });

  /* 页面加载满 3 秒才可提交（防瞬发机器人） */
  const loadTime = parseInt(t, 10);
  if (!loadTime || Date.now() - loadTime < 3000) {
    return res.status(400).json({ error: '提交太快了，喝口水再来' });
  }

  /* 基础校验 */
  const n = String(name || '').replace(/[\x00-\x1f]/g, '').trim();
  const c = String(content || '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').trim();
  if (!n || n.length > 16) return res.status(400).json({ error: '昵称必填，16 字以内' });
  if (!c || c.length > 500) return res.status(400).json({ error: '留言必填，500 字以内' });

  /* 限流 */
  const ip = clientIp(req);
  const today = new Date().toISOString().slice(0, 10);
  let r = rateMap.get(ip);
  if (!r || r.day !== today) r = { last: 0, day: today, count: 0 };
  if (Date.now() - r.last < 60 * 1000) {
    return res.status(429).json({ error: '发言太频繁了，60 秒后再试' });
  }
  if (r.count >= 5) {
    return res.status(429).json({ error: '今天留言已达上限（5 条），明天再来吧' });
  }
  r.last = Date.now();
  r.count += 1;
  rateMap.set(ip, r);

  const m = store.addMessage({ name: n, content: c });
  res.status(201).json({ id: m.id, time: m.time });
});

module.exports = router;
