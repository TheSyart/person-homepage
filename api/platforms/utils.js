const crypto = require('crypto');

const WBI_MIXIN_TABLE = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
  22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
];

function classifyFreshness(updatedAt, ttlMs, now = Date.now()) {
  const timestamp = Date.parse(updatedAt || '');
  if (!Number.isFinite(timestamp)) return 'unavailable';
  const age = Math.max(0, now - timestamp);
  if (age <= ttlMs) return 'live';
  if (age <= ttlMs * 4) return 'cached';
  return 'stale';
}

function shouldRefreshPlayUrl(entry, now = Date.now()) {
  const expiresAt = Date.parse(entry?.expiresAt || '');
  return !Number.isFinite(expiresAt) || expiresAt - now <= 20 * 60 * 1000;
}

function mergeVideoInventory(previous, incoming, { complete = false } = {}) {
  if (complete) return incoming;
  const seen = new Set();
  return [...incoming, ...previous].filter((video) => {
    const key = video.bvid || video.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mixinKey(rawKey) {
  return WBI_MIXIN_TABLE.map((index) => rawKey[index]).join('').slice(0, 32);
}

function signWbiParams(params, key, timestamp = Math.floor(Date.now() / 1000)) {
  const normalized = { ...params, wts: timestamp };
  const query = Object.keys(normalized).sort().map((name) => {
    const value = String(normalized[name] ?? '').replace(/[!'()*]/g, '');
    return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  }).join('&');
  const wRid = crypto.createHash('md5').update(query + key).digest('hex');
  return { ...normalized, w_rid: wRid, query: `${query}&w_rid=${wRid}` };
}

function parseDouyinProfileText(text, { expectedName, expectedId }) {
  const normalized = String(text || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
  const metrics = normalized.match(/关注\s*\n?\s*([\d.万wW]+)\s*\n?\s*粉丝\s*\n?\s*([\d.万wW]+)\s*\n?\s*获赞\s*\n?\s*([\d.万wW]+)/);
  const id = normalized.match(/抖音号[：:]\s*([^\s]+)/)?.[1];
  const works = normalized.match(/作品\s*(\d+)/)?.[1];
  if (!normalized.includes(expectedName) || id !== expectedId || !metrics || !works) {
    throw new Error('账号资料不完整，拒绝覆盖缓存');
  }
  const afterAge = normalized.match(/\d+岁\s*\n+\s*([^\n]+)/)?.[1]?.trim();
  const following = parseCompactNumber(metrics[1]);
  const followers = parseCompactNumber(metrics[2]);
  const likes = parseCompactNumber(metrics[3]);
  const workCount = Number(works);
  if (followers <= 0 || likes <= 0 || workCount <= 0) {
    throw new Error('账号资料出现异常零值，拒绝覆盖缓存');
  }
  return {
    name: expectedName,
    id,
    following,
    followers,
    likes,
    likesDisplay: metrics[3],
    works: workCount,
    sign: afterAge || ''
  };
}

function parseCompactNumber(value) {
  const raw = String(value || '').trim().toLowerCase();
  const number = Number.parseFloat(raw);
  if (!Number.isFinite(number)) return null;
  if (raw.includes('万') || raw.endsWith('w')) return Math.round(number * 10_000);
  return Math.round(number);
}

const CHINESE_NUMBERS = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
function episodeFromTitle(title) {
  const match = String(title || '').match(/从零实现自己的?agent第([一二三四五六七八九十\d]+)期/i);
  if (!match) return null;
  if (/^\d+$/.test(match[1])) return Number(match[1]);
  if (match[1] === '十') return 10;
  if (match[1].startsWith('十')) return 10 + (CHINESE_NUMBERS[match[1][1]] || 0);
  return CHINESE_NUMBERS[match[1]] || null;
}

module.exports = {
  classifyFreshness,
  episodeFromTitle,
  mergeVideoInventory,
  mixinKey,
  parseCompactNumber,
  parseDouyinProfileText,
  shouldRefreshPlayUrl,
  signWbiParams
};
