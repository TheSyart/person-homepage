/* 管理接口：全部需 Bearer token（auth.requireAdmin 挂载于 server.js） */
const express = require('express');
const store = require('./store');
const auth = require('./auth');

const router = express.Router();

function clientIp(req) {
  return (req.headers['x-real-ip'] || req.ip || 'unknown').toString();
}

/* ---- 会话 ---- */
router.post('/login', (req, res) => {
  const { password } = req.body || {};
  const r = auth.login(password, clientIp(req));
  if (!r.ok) return res.status(401).json({ error: r.error });
  res.json({ token: r.token, exp: r.exp });
});

router.post('/logout', (req, res) => {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) auth.logout(h.slice(7));
  res.json({ ok: true });
});

/* ---- 概览 ---- */
router.get('/overview', (req, res) => {
  const msgs = store.listMessages(1, 5);
  res.json({
    articles: store.listArticles(true).length,
    videos: store.listVideos().length,
    messages: msgs.total,
    latestMessages: msgs.list
  });
});

/* ---- 文章 ---- */
router.get('/articles', (req, res) => {
  res.json(store.listArticles(true));
});

router.post('/articles', (req, res) => {
  const { slug, title, summary, tags, date, content, draft } = req.body || {};
  if (!slug || !title || !content) {
    return res.status(400).json({ error: 'slug、title、content 必填' });
  }
  try {
    store.saveArticle({
      slug: String(slug),
      title: String(title).slice(0, 80),
      summary: String(summary || '').slice(0, 200),
      tags: Array.isArray(tags) ? tags.map((t) => String(t).slice(0, 20)).slice(0, 8) : [],
      date: date ? String(date).slice(0, 10) : undefined,
      content: String(content),
      draft: !!draft
    });
    res.json({ ok: true, slug });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/articles/:slug', (req, res) => {
  if (!store.deleteArticle(req.params.slug)) {
    return res.status(404).json({ error: '文章不存在' });
  }
  res.json({ ok: true });
});

/* ---- 视频 ---- */
router.post('/videos', (req, res) => {
  const { platform, title, url, date, desc } = req.body || {};
  if (!title || !url) return res.status(400).json({ error: 'title、url 必填' });
  if (!/^https?:\/\//.test(url)) return res.status(400).json({ error: 'url 需为 http(s) 链接' });
  const v = store.addVideo({ platform, title, url, date, desc });
  res.status(201).json(v);
});

router.delete('/videos/:id', (req, res) => {
  if (!store.deleteVideo(req.params.id)) {
    return res.status(404).json({ error: '视频不存在' });
  }
  res.json({ ok: true });
});

/* ---- 留言 ---- */
router.get('/messages', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  res.json(store.listMessages(page, 20));
});

router.delete('/messages/:id', (req, res) => {
  if (!store.deleteMessage(req.params.id)) {
    return res.status(404).json({ error: '留言不存在' });
  }
  res.json({ ok: true });
});

module.exports = router;
