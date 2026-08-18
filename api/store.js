/* JSON 文件存储：原子写入 + 启动校验 + 每日备份 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, 'articles'), { recursive: true });

function file(name) {
  return path.join(DATA_DIR, name);
}

function readJSON(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file(name), 'utf-8'));
  } catch {
    return fallback;
  }
}

/* 原子写：tmp + rename，防断电半写 */
function writeJSON(name, data) {
  const tmp = file(name) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, file(name));
}

/* 每日备份（messages / videos / tokens / articles 目录打快照） */
let lastBackupDay = '';
function dailyBackup() {
  const day = new Date().toISOString().slice(0, 10);
  if (day === lastBackupDay) return;
  lastBackupDay = day;
  try {
    const dir = path.join(BACKUP_DIR, day);
    fs.mkdirSync(dir, { recursive: true });
    for (const f of ['messages.json', 'videos.json', 'tokens.json']) {
      const src = file(f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dir, f));
    }
    const adir = path.join(DATA_DIR, 'articles');
    const bdir = path.join(dir, 'articles');
    fs.mkdirSync(bdir, { recursive: true });
    for (const f of fs.readdirSync(adir)) {
      if (f.endsWith('.md')) fs.copyFileSync(path.join(adir, f), path.join(bdir, f));
    }
    /* 只保留最近 14 天 */
    const days = fs.readdirSync(BACKUP_DIR).sort();
    while (days.length > 14) {
      fs.rmSync(path.join(BACKUP_DIR, days.shift()), { recursive: true, force: true });
    }
  } catch (e) {
    console.error('[backup] failed:', e.message);
  }
}

/* ---------------- 文章 ---------------- */

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, content: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let [, k, v] = kv;
    v = v.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      meta[k] = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (v === 'true' || v === 'false') {
      meta[k] = v === 'true';
    } else {
      meta[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  return { meta, content: m[2] };
}

function listArticles(includeDraft = false) {
  const dir = path.join(DATA_DIR, 'articles');
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    try {
      const { meta } = parseFrontmatter(fs.readFileSync(path.join(dir, f), 'utf-8'));
      if (meta.draft && !includeDraft) continue;
      out.push({
        slug: f.replace(/\.md$/, ''),
        title: meta.title || f.replace(/\.md$/, ''),
        date: meta.date || '',
        summary: meta.summary || '',
        cover: meta.cover || '',
        coverAlt: meta.coverAlt || '',
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        draft: !!meta.draft
      });
    } catch { /* 跳过坏文件 */ }
  }
  out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return out;
}

function getArticle(slug) {
  if (!/^[\w\u4e00-\u9fa5-]{1,80}$/.test(slug)) return null;
  const p = path.join(DATA_DIR, 'articles', slug + '.md');
  if (!fs.existsSync(p)) return null;
  const { meta, content } = parseFrontmatter(fs.readFileSync(p, 'utf-8'));
  if (meta.draft) return null;
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    summary: meta.summary || '',
    cover: meta.cover || '',
    coverAlt: meta.coverAlt || '',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    content
  };
}

function saveArticle({ slug, title, summary, cover, coverAlt, tags, date, content, draft }) {
  if (!/^[\w\u4e00-\u9fa5-]{1,80}$/.test(slug)) {
    throw new Error('slug 仅允许字母/数字/中文/连字符，80 字以内');
  }
  const fm = [
    '---',
    `title: ${title}`,
    `date: ${date || new Date().toISOString().slice(0, 10)}`,
    `summary: ${summary || ''}`,
    ...(cover ? [`cover: ${cover}`] : []),
    ...(coverAlt ? [`coverAlt: ${coverAlt}`] : []),
    `tags: [${(tags || []).join(', ')}]`,
    `draft: ${draft ? 'true' : 'false'}`,
    '---',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(DATA_DIR, 'articles', slug + '.md'), fm + (content || ''), 'utf-8');
}

function deleteArticle(slug) {
  const p = path.join(DATA_DIR, 'articles', slug + '.md');
  if (fs.existsSync(p)) { fs.unlinkSync(p); return true; }
  return false;
}

/* ---------------- 视频 ---------------- */

function listVideos() {
  return readJSON('videos.json', []);
}

function addVideo({ platform, title, url, date, desc }) {
  const videos = listVideos();
  const v = {
    id: 'v' + Date.now().toString(36),
    platform: platform === 'douyin' ? 'douyin' : 'bilibili',
    title: String(title || '').slice(0, 100),
    url: String(url || ''),
    date: date || new Date().toISOString().slice(0, 10),
    desc: String(desc || '').slice(0, 200)
  };
  videos.unshift(v);
  writeJSON('videos.json', videos);
  return v;
}

function deleteVideo(id) {
  const videos = listVideos();
  const next = videos.filter((v) => v.id !== id);
  if (next.length === videos.length) return false;
  writeJSON('videos.json', next);
  return true;
}

/* ---------------- 留言 ---------------- */

function listMessages(page = 1, size = 10) {
  const all = readJSON('messages.json', []);
  const total = all.length;
  const start = (page - 1) * size;
  return {
    total,
    list: all.slice(start, start + size).map(({ id, name, content, time }) => ({ id, name, content, time }))
  };
}

function addMessage({ name, content }) {
  const all = readJSON('messages.json', []);
  const m = {
    id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: String(name).slice(0, 16),
    content: String(content).slice(0, 500),
    time: Date.now()
  };
  all.unshift(m);
  writeJSON('messages.json', all);
  return m;
}

function deleteMessage(id) {
  const all = readJSON('messages.json', []);
  const next = all.filter((m) => m.id !== id);
  if (next.length === all.length) return false;
  writeJSON('messages.json', next);
  return true;
}

module.exports = {
  DATA_DIR, dailyBackup,
  listArticles, getArticle, saveArticle, deleteArticle,
  listVideos, addVideo, deleteVideo,
  listMessages, addMessage, deleteMessage,
  readJSON, writeJSON
};
