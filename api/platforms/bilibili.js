const { episodeFromTitle, mixinKey, signWbiParams } = require('./utils');

const UID = '1452412374';
const API = 'https://api.bilibili.com';
const BASE_HEADERS = {
  Accept: 'application/json',
  Referer: `https://space.bilibili.com/${UID}`,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'
};

async function createSession(fetchImpl = fetch) {
  let cookie = '';
  try {
    const spi = await request('/x/frontend/finger/spi', {}, { fetchImpl });
    if (spi?.data?.b_3) cookie += `buvid3=${spi.data.b_3}; `;
    if (spi?.data?.b_4) cookie += `buvid4=${spi.data.b_4}; `;
  } catch { /* WBI 在部分网络不需要 buvid。 */ }
  return { fetchImpl, cookie };
}

async function fetchBilibiliProfile(fetchImpl = fetch) {
  const session = await createSession(fetchImpl);
  const [card, relation, navnum] = await Promise.all([
    request('/x/web-interface/card', { mid: UID }, session),
    request('/x/relation/stat', { vmid: UID }, session),
    request('/x/space/navnum', { mid: UID }, session)
  ]);
  const user = card?.data?.card;
  if (!user || relation?.code !== 0) throw new Error('B站账号资料不完整');
  return {
    id: UID,
    name: user.name,
    face: normalizeHttps(user.face),
    sign: user.sign || '',
    followers: Number(relation.data.follower || user.fans || 0),
    following: Number(relation.data.following || user.attention || 0),
    videoCount: Number(navnum?.data?.video || 0),
    url: `https://space.bilibili.com/${UID}`,
    source: 'Bilibili API',
    updatedAt: new Date().toISOString()
  };
}

async function fetchBilibiliVideos(fetchImpl = fetch) {
  /* 裸请求会先触发 -352，再让同一 IP 的浏览器会话短暂 412。
     生产默认直接在完整浏览器指纹会话中发 WBI；注入 fetch 的单测仍走纯 WBI。 */
  if (fetchImpl !== fetch || process.env.BILIBILI_DIRECT_WBI === '1') {
    return fetchBilibiliVideosWbi(fetchImpl);
  }
  return fetchBilibiliVideosBrowser();
}

async function fetchBilibiliVideosWbi(fetchImpl = fetch) {
  const session = await createSession(fetchImpl);
  const navnum = await request('/x/space/navnum', { mid: UID }, session);
  const expectedTotal = Number(navnum?.data?.video || 0);
  if (!expectedTotal) throw new Error('B站视频总数不可用');
  const rawKey = await getRawWbiKey(session);
  return collectVideoPages({ expectedTotal, rawKey, session });
}

async function fetchBilibiliVideosBrowser() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ locale: 'zh-CN', viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    let resolveFingerprint;
    const fingerprintRequest = new Promise((resolve) => { resolveFingerprint = resolve; });
    page.on('request', (request) => {
      if (request.url().includes('/x/space/wbi/acc/info?')) resolveFingerprint(request.url());
    });
    await page.goto(`https://space.bilibili.com/${UID}/upload/video`, {
      waitUntil: 'domcontentloaded', timeout: 45_000
    });
    const fingerprintUrl = await Promise.race([
      fingerprintRequest,
      new Promise((_, reject) => setTimeout(() => reject(new Error('B站浏览器指纹加载超时')), 25_000))
    ]);
    const nav = await page.evaluate(() => fetch('https://api.bilibili.com/x/web-interface/nav', {
      credentials: 'include'
    }).then((response) => response.json()));
    const rawKey = keyFromUrl(nav?.data?.wbi_img?.img_url) + keyFromUrl(nav?.data?.wbi_img?.sub_url);
    if (!rawKey) throw new Error('B站浏览器会话未返回 WBI 密钥');
    const navnum = await page.evaluate((uid) => fetch(`https://api.bilibili.com/x/space/navnum?mid=${uid}`, {
      credentials: 'include'
    }).then((response) => response.json()), UID);
    const expectedTotal = Number(navnum?.data?.video || 0);
    if (!expectedTotal) throw new Error('B站浏览器会话未返回视频总数');
    const source = new URL(fingerprintUrl).searchParams;
    const fingerprint = {
      web_location: source.get('web_location') || '1550101',
      dm_img_list: source.get('dm_img_list') || '[]',
      dm_img_str: source.get('dm_img_str') || '',
      dm_cover_img_str: source.get('dm_cover_img_str') || '',
      dm_img_inter: source.get('dm_img_inter') || ''
    };
    const pages = Math.ceil(expectedTotal / 50);
    const rawVideos = [];
    let complete = true;
    for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
      try {
        const signed = signWbiParams({
          mid: UID, pn: pageNumber, ps: 50, order: 'pubdate', ...fingerprint
        }, mixinKey(rawKey));
        const result = await page.evaluate((url) => fetch(url, { credentials: 'include' }).then((response) => response.json()),
          `${API}/x/space/wbi/arc/search?${signed.query}`);
        if (result.code !== 0) throw new Error(result.message || `code ${result.code}`);
        rawVideos.push(...(result.data?.list?.vlist || []));
      } catch (error) {
        complete = false;
        if (pageNumber === 1) throw error;
        break;
      }
    }
    if (rawVideos.length < expectedTotal) complete = false;
    return {
      videos: rawVideos.map(normalizeVideo).filter((video) => video.bvid),
      expectedTotal,
      complete,
      source: 'Bilibili WBI via browser session',
      updatedAt: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

async function collectVideoPages({ expectedTotal, rawKey, session }) {
  const pages = Math.ceil(expectedTotal / 50);
  const rawVideos = [];
  let complete = true;
  for (let page = 1; page <= pages; page += 1) {
    try {
      const signed = signWbiParams({ mid: UID, pn: page, ps: 50, order: 'pubdate' }, mixinKey(rawKey));
      const result = await requestRaw(`/x/space/wbi/arc/search?${signed.query}`, session);
      if (result.code !== 0) throw new Error(result.message || `code ${result.code}`);
      rawVideos.push(...(result.data?.list?.vlist || []));
    } catch (error) {
      complete = false;
      if (page === 1) throw error;
      break;
    }
  }
  if (rawVideos.length < expectedTotal) complete = false;
  return {
    videos: rawVideos.map(normalizeVideo).filter((video) => video.bvid),
    expectedTotal,
    complete,
    source: 'Bilibili WBI',
    updatedAt: new Date().toISOString()
  };
}

async function fetchVideoDetail(bvid, fetchImpl = fetch) {
  const result = await request('/x/web-interface/view', { bvid }, { fetchImpl, cookie: '' });
  if (result.code !== 0 || !result.data) throw new Error('B站视频详情不可用');
  const data = result.data;
  return {
    bvid: data.bvid,
    title: data.title,
    desc: data.desc || '',
    cover: normalizeHttps(data.pic),
    date: new Date(data.pubdate * 1000).toISOString().slice(0, 10),
    durationSeconds: data.duration || 0,
    duration: formatDuration(data.duration || 0),
    stats: {
      view: data.stat?.view || 0,
      danmaku: data.stat?.danmaku || 0,
      reply: data.stat?.reply || 0,
      favorite: data.stat?.favorite || 0,
      coin: data.stat?.coin || 0,
      share: data.stat?.share || 0,
      like: data.stat?.like || 0
    }
  };
}

async function extractPlayUrlNative(bvid, fetchImpl = fetch) {
  const detail = await request('/x/web-interface/view', { bvid }, { fetchImpl, cookie: '' });
  const cid = detail?.data?.pages?.[0]?.cid;
  if (!cid) throw new Error('无法获取视频 cid');
  const result = await request('/x/player/playurl', {
    bvid, cid, qn: 120, otype: 'json', platform: 'html5', high_quality: 1, fnval: 129, fourk: 1
  }, { fetchImpl, cookie: '' });
  const url = result?.data?.durl?.[0]?.url;
  if (!url) throw new Error('无法获取视频直链');
  return { title: detail.data.title, topic: detail.data.desc || '', videoId: bvid, url, platform: 'bilibili' };
}

async function getRawWbiKey(session) {
  const nav = await request('/x/web-interface/nav', {}, session);
  const img = keyFromUrl(nav?.data?.wbi_img?.img_url);
  const sub = keyFromUrl(nav?.data?.wbi_img?.sub_url);
  if (!img || !sub) throw new Error('无法获取 B站 WBI 密钥');
  return img + sub;
}

async function request(pathname, params, session) {
  const query = new URLSearchParams(params).toString();
  return requestRaw(`${pathname}${query ? `?${query}` : ''}`, session);
}

async function requestRaw(pathname, { fetchImpl = fetch, cookie = '' }) {
  const response = await fetchImpl(`${API}${pathname}`, {
    headers: { ...BASE_HEADERS, ...(cookie ? { Cookie: cookie } : {}) },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error(`Bilibili API ${response.status}`);
  return response.json();
}

function normalizeVideo(raw) {
  const episode = episodeFromTitle(raw.title);
  const bvid = raw.bvid || raw.id || '';
  return {
    id: bvid,
    bvid,
    platform: 'bilibili',
    title: raw.title || '',
    desc: raw.description || '',
    url: `https://www.bilibili.com/video/${bvid}`,
    pageUrl: `https://www.bilibili.com/video/${bvid}`,
    cover: normalizeHttps(raw.pic),
    date: raw.created ? new Date(raw.created * 1000).toISOString().slice(0, 10) : '',
    duration: raw.length || '',
    durationSeconds: parseDuration(raw.length),
    stats: { view: Number(raw.play || 0), danmaku: Number(raw.video_review || 0) },
    series: episode ? 'from-zero-agent' : null,
    episode
  };
}

function keyFromUrl(url) {
  return String(url || '').split('/').pop()?.split('.')[0] || '';
}
function normalizeHttps(url) { return String(url || '').replace(/^http:/, 'https:'); }
function parseDuration(value) {
  const parts = String(value || '').split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

module.exports = {
  UID,
  extractPlayUrlNative,
  fetchBilibiliProfile,
  fetchBilibiliVideos,
  fetchBilibiliVideosBrowser,
  fetchBilibiliVideosWbi,
  fetchVideoDetail,
  normalizeVideo
};
