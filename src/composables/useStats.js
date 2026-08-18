import { reactive } from 'vue';
import { SNAPSHOT } from '../config';

/**
 * 全站共享的动态数据源（模块级单例）。
 * 兜底链：实时接口 → /data/stats.json → 内嵌快照（SNAPSHOT）
 */
export const stats = reactive({
  github: { ...SNAPSHOT.github, cae: { ...SNAPSHOT.github.cae }, ea: { ...SNAPSHOT.github.ea }, live: false },
  bili: { ...SNAPSHOT.bilibili, live: false },
  douyin: { ...SNAPSHOT.douyin },
  updated: SNAPSHOT.updated
});

let started = false;

export function useStats() {
  if (!started) {
    started = true;
    load();
  }
  return stats;
}

function mergeStats(j) {
  if (j.updated) stats.updated = j.updated;
  if (j.bilibili) {
    if (+j.bilibili.followers > 0) stats.bili.followers = +j.bilibili.followers;
    if (j.bilibili.name) stats.bili.name = j.bilibili.name;
    if (j.bilibili.face) stats.bili.face = j.bilibili.face;
    if (j.bilibili.sign) stats.bili.sign = j.bilibili.sign;
  }
  if (j.douyin) Object.assign(stats.douyin, j.douyin);
  if (j.github) {
    const { live, ...rest } = j.github;
    if (rest.cae) { stats.github.cae = { ...stats.github.cae, ...rest.cae }; delete rest.cae; }
    if (rest.ea) { stats.github.ea = { ...stats.github.ea, ...rest.ea }; delete rest.ea; }
    Object.assign(stats.github, rest);
  }
}

async function load() {
  /* 1. 本地 stats.json 打底（可手动维护的最新值） */
  try {
    const r = await fetch('/data/stats.json', { cache: 'no-store' });
    if (r.ok) mergeStats(await r.json());
  } catch { /* 忽略，用内嵌快照 */ }

  /* 2. B站实时资料（经 nginx 代理）：昵称/头像/签名/粉丝数 */
  fetch('/api/bilibili/x/web-interface/card?mid=1452412374', { cache: 'no-store' })
    .then((r) => r.json())
    .then((j) => {
      const c = j && j.code === 0 && j.data && j.data.card;
      if (c) {
        if (c.name) stats.bili.name = c.name;
        if (c.face) stats.bili.face = c.face;
        if (c.sign) stats.bili.sign = c.sign;
        if (+c.fans > 0) stats.bili.followers = c.fans;
        stats.bili.live = true;
      }
    })
    .catch(() => {});

  /* 3. GitHub 实时数据（浏览器直连 api.github.com） */
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const [u, repos] = await Promise.all([
      fetch('https://api.github.com/users/TheSyart', { signal: ctl.signal }).then((r) => r.json()),
      fetch('https://api.github.com/users/TheSyart/repos?per_page=100', { signal: ctl.signal }).then((r) => r.json())
    ]);
    clearTimeout(timer);
    if (u && !u.message && Array.isArray(repos)) {
      stats.github.followers = u.followers;
      stats.github.repos = u.public_repos;
      let total = 0;
      repos.forEach((r) => { if (!r.fork) total += r.stargazers_count || 0; });
      if (total > 0) stats.github.totalStars = total;
      const cae = repos.find((r) => r.name === 'claude-agent-examples');
      const ea = repos.find((r) => r.name === 'emperor-agent');
      if (cae) stats.github.cae = { stars: cae.stargazers_count, forks: cae.forks_count };
      if (ea) stats.github.ea = { stars: ea.stargazers_count, forks: ea.forks_count };
      stats.github.live = true;
    }
  } catch { /* 超时/失败 → 保留打底数据 */ }
}
