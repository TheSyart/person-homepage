const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const store = require('../store');
const { fetchGithubProfile, publicGithub } = require('./github');
const {
  extractPlayUrlNative,
  fetchBilibiliProfile,
  fetchBilibiliVideos,
  fetchVideoDetail
} = require('./bilibili');
const { fetchDouyinProfile } = require('./douyin');
const { classifyFreshness, mergeVideoInventory, shouldRefreshPlayUrl } = require('./utils');

const execFileAsync = promisify(execFile);
const PROFILE_CACHE = 'platform-cache.json';
const VIDEO_CACHE = 'bilibili-videos.json';
const PLAY_CACHE = 'video-play-cache.json';
const PROFILE_TTL = 15 * 60_000;
const DOUYIN_TTL = 6 * 3600_000;

const fallbackProfile = {
  github: {
    login: 'TheSyart', name: 'TheSyart', avatar: 'https://avatars.githubusercontent.com/u/141762452?v=4',
    followers: 18, repos: 9, totalStars: 533, joinedAt: '2023-08-08T16:58:58Z',
    url: 'https://github.com/TheSyart', featuredRepos: [], source: 'verified snapshot', updatedAt: '2026-08-18T10:00:00.000Z'
  },
  bilibili: {
    id: '1452412374', name: '小单说AI', face: '', sign: '分享ai 学习ai 诸君共进步',
    followers: 3167, following: 174, videoCount: 50, url: 'https://space.bilibili.com/1452412374',
    source: 'verified snapshot', updatedAt: '2026-08-18T10:00:00.000Z'
  },
  douyin: {
    id: '23329202234', name: '小单说AI', avatar: '', sign: '分享ai 学习ai 诸君共进步',
    followers: 1990, following: 81, likes: 12000, likesDisplay: '1.2万', works: 42,
    url: 'https://www.douyin.com/user/MS4wLjABAAAAk5lgbm96yoPPEoGXoY3MIp4S8voya0dzcnG0Lom5-SI?from_tab_name=main',
    source: 'verified snapshot', updatedAt: '2026-08-18T10:00:00.000Z'
  }
};

let profileCache = { ...fallbackProfile, ...store.readJSON(PROFILE_CACHE, {}) };
let videoCache = store.readJSON(VIDEO_CACHE, []);
let playCache = store.readJSON(PLAY_CACHE, {});
let profileRefresh;
let videoRefresh;

function getProfile() {
  return {
    updatedAt: newestTimestamp(profileCache),
    github: publicGithub(profileCache.github),
    bilibili: { ...profileCache.bilibili, status: classifyFreshness(profileCache.bilibili?.updatedAt, PROFILE_TTL) },
    douyin: { ...profileCache.douyin, status: classifyFreshness(profileCache.douyin?.updatedAt, DOUYIN_TTL) }
  };
}

function getVideos(series) {
  const rows = series ? videoCache.filter((video) => video.series === series) : videoCache;
  return [...rows].sort((a, b) => series
    ? (a.episode || 999) - (b.episode || 999)
    : String(b.date || '').localeCompare(String(a.date || '')))
    .map((video) => {
      const description = String(video.desc || '').trim();
      return {
        ...video,
        desc: description.length >= 10
          ? description
          : `这期视频记录了「${video.title}」相关内容，具体演示和结论请以视频为准。`
      };
    });
}

async function refreshProfiles({ includeDouyin = false } = {}) {
  if (profileRefresh) return profileRefresh;
  profileRefresh = (async () => {
    const tasks = [
      fetchGithubProfile().then((value) => { profileCache.github = value; }),
      fetchBilibiliProfile().then((value) => { profileCache.bilibili = value; })
    ];
    if (includeDouyin) tasks.push(fetchDouyinProfile().then((value) => { profileCache.douyin = value; }));
    const results = await Promise.allSettled(tasks);
    store.writeJSON(PROFILE_CACHE, profileCache);
    return results;
  })().finally(() => { profileRefresh = null; });
  return profileRefresh;
}

async function refreshVideoInventory() {
  if (videoRefresh) return videoRefresh;
  videoRefresh = (async () => {
    const result = await fetchBilibiliVideos();
    const merged = mergeVideoInventory(videoCache, result.videos, result);
    videoCache = await enrichVideos(merged);
    store.writeJSON(VIDEO_CACHE, videoCache);
    return videoCache;
  })().finally(() => { videoRefresh = null; });
  return videoRefresh;
}

async function enrichVideos(videos) {
  const next = [];
  for (const video of videos) {
    try {
      const detail = await fetchVideoDetail(video.bvid);
      next.push({ ...video, ...detail, stats: { ...video.stats, ...detail.stats }, updatedAt: new Date().toISOString() });
    } catch {
      next.push(video);
    }
  }
  return next;
}

async function getPlayLink(bvid) {
  const video = videoCache.find((item) => item.bvid === bvid);
  if (!video) return null;
  const cached = playCache[bvid];
  if (!shouldRefreshPlayUrl(cached)) {
    cached.lastAccessAt = new Date().toISOString();
    return cached;
  }
  let parsed;
  let parser = 'bilibili-native-fallback';
  try {
    parsed = await parseWithAiVideoEvaluator(video.pageUrl);
    parser = 'ai-video-evaluator';
  } catch {
    parsed = await extractPlayUrlNative(bvid);
  }
  const deadline = Number(new URL(parsed.url).searchParams.get('deadline'));
  const expiresAt = Number.isFinite(deadline) && deadline > 0
    ? new Date(deadline * 1000).toISOString()
    : new Date(Date.now() + 90 * 60_000).toISOString();
  const entry = {
    url: parsed.url,
    pageUrl: video.pageUrl,
    expiresAt,
    refreshedAt: new Date().toISOString(),
    lastAccessAt: new Date().toISOString(),
    parser
  };
  playCache[bvid] = entry;
  store.writeJSON(PLAY_CACHE, playCache);
  return entry;
}

async function refreshActivePlayLinks() {
  const activeSince = Date.now() - 24 * 3600_000;
  for (const [bvid, entry] of Object.entries(playCache)) {
    if (Date.parse(entry.lastAccessAt || '') < activeSince || !shouldRefreshPlayUrl(entry)) continue;
    try { await getPlayLink(bvid); } catch { /* 保留稳定 B站页面兜底。 */ }
  }
}

async function parseWithAiVideoEvaluator(url) {
  const configured = process.env.AI_VIDEO_EVALUATOR_DIR;
  const local = '/Users/anhuike/.codex/skills/ai-video-evaluator';
  const directory = configured || (fs.existsSync(local) ? local : '');
  const script = directory && path.join(directory, 'scripts', 'parse.py');
  if (!script || !fs.existsSync(script)) throw new Error('ai-video-evaluator 未安装');
  const { stdout } = await execFileAsync(process.env.PYTHON_BIN || 'python3', [script, '--url', url], {
    timeout: 30_000, maxBuffer: 1024 * 1024
  });
  const parsed = JSON.parse(stdout.trim());
  if (!parsed.url || parsed.error) throw new Error(parsed.error || '解析器未返回直链');
  return parsed;
}

function startSchedulers() {
  setTimeout(() => refreshProfiles({ includeDouyin: true }).catch(logError), 250).unref();
  setTimeout(() => refreshVideoInventory().catch(logError), 750).unref();
  setInterval(() => refreshProfiles().catch(logError), PROFILE_TTL).unref();
  setInterval(() => refreshProfiles({ includeDouyin: true }).catch(logError), DOUYIN_TTL).unref();
  setInterval(() => refreshVideoInventory().catch(logError), 6 * 3600_000).unref();
  setInterval(() => refreshActivePlayLinks().catch(logError), 60 * 60_000).unref();
}

function newestTimestamp(cache) {
  return [cache.github, cache.bilibili, cache.douyin]
    .map((entry) => entry?.updatedAt || '').sort().at(-1) || '';
}
function logError(error) { console.error('[platform-sync]', error.message); }

module.exports = {
  getPlayLink,
  getProfile,
  getVideos,
  refreshProfiles,
  refreshVideoInventory,
  startSchedulers
};
