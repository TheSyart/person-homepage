import { reactive } from 'vue';
import { SNAPSHOT } from '../config';

/**
 * 全站共享的动态数据源（模块级单例）。
 * 兜底链：实时接口 → /data/stats.json → 内嵌快照（SNAPSHOT）
 */
export const stats = reactive({
  github: { ...SNAPSHOT.github, cae: { ...SNAPSHOT.github.cae }, ea: { ...SNAPSHOT.github.ea }, status: 'stale', live: false },
  bili: { ...SNAPSHOT.bilibili, status: 'stale', live: false },
  douyin: { ...SNAPSHOT.douyin, status: 'stale', live: false },
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
  if (j.updatedAt) stats.updated = j.updatedAt;
  if (j.bilibili) {
    if (+j.bilibili.followers > 0) stats.bili.followers = +j.bilibili.followers;
    if (j.bilibili.name) stats.bili.name = j.bilibili.name;
    if (j.bilibili.face) stats.bili.face = j.bilibili.face;
    if (j.bilibili.sign) stats.bili.sign = j.bilibili.sign;
    Object.assign(stats.bili, j.bilibili);
    stats.bili.live = j.bilibili.status === 'live';
  }
  if (j.douyin) {
    Object.assign(stats.douyin, j.douyin);
    stats.douyin.live = j.douyin.status === 'live';
  }
  if (j.github) {
    const { live, ...rest } = j.github;
    if (rest.cae) { stats.github.cae = { ...stats.github.cae, ...rest.cae }; delete rest.cae; }
    if (rest.ea) { stats.github.ea = { ...stats.github.ea, ...rest.ea }; delete rest.ea; }
    Object.assign(stats.github, rest);
    stats.github.live = j.github.status === 'live';
    const featured = j.github.featuredRepos || [];
    const cae = featured.find((repo) => repo.name === 'claude-agent-examples');
    const ea = featured.find((repo) => repo.name === 'emperor-agent');
    if (cae) stats.github.cae = { stars: cae.stars, forks: cae.forks };
    if (ea) stats.github.ea = { stars: ea.stars, forks: ea.forks };
  }
}

async function load() {
  /* 1. 服务端聚合数据；缓存状态由服务端明确标注，不在浏览器伪装成实时。 */
  try {
    const r = await fetch('/api/profile', { cache: 'no-store' });
    if (r.ok) mergeStats(await r.json());
  } catch { /* 继续使用静态兜底 */ }

  /* 2. 本地 stats.json 仅作服务不可用时的最后快照。 */
  try {
    const r = await fetch('/data/stats.json', { cache: 'no-store' });
    if (r.ok && !stats.github.updatedAt) mergeStats(await r.json());
  } catch { /* 忽略，用内嵌快照 */ }
}
