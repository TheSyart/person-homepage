import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const platforms = require('../api/platforms');

describe('B站视频公开库存', () => {
  test('50 条视频与九期系列都有完整展示字段', () => {
    const videos = platforms.getVideos();
    const agentSeries = platforms.getVideos('from-zero-agent');
    expect(videos).toHaveLength(50);
    expect(agentSeries).toHaveLength(9);
    expect(agentSeries.map((video) => video.episode)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const video of videos) {
      expect(video.bvid).toMatch(/^BV[0-9A-Za-z]{10}$/);
      expect(video.cover).toMatch(/^https:\/\//);
      expect(video.pageUrl).toContain(video.bvid);
      expect(video.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(video.duration).toMatch(/^\d{2,}:\d{2}$/);
      expect(video.desc.length).toBeGreaterThan(10);
      expect(video.stats).toHaveProperty('view');
    }
  });
});
