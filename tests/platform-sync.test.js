import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const {
  classifyFreshness,
  mergeVideoInventory,
  parseDouyinProfileText,
  shouldRefreshPlayUrl,
  signWbiParams
} = require('../api/platforms/utils');

describe('平台聚合数据工具', () => {
  test('抖音公开资料只在账号事实和数字完整时通过', () => {
    const profile = parseDouyinProfileText(`
      小单说AI\n关注\n81\n粉丝\n1990\n获赞\n1.2万
      抖音号：23329202234\nIP属地：安徽\n23岁
      分享ai 学习ai 诸君共进步\n作品 42
    `, { expectedName: '小单说AI', expectedId: '23329202234' });

    expect(profile).toMatchObject({
      name: '小单说AI',
      id: '23329202234',
      following: 81,
      followers: 1990,
      likesDisplay: '1.2万',
      works: 42,
      sign: '分享ai 学习ai 诸君共进步'
    });
    expect(() => parseDouyinProfileText('登录后查看', {
      expectedName: '小单说AI', expectedId: '23329202234'
    })).toThrow(/账号资料不完整/);
    expect(() => parseDouyinProfileText(`
      小单说AI\n关注\n0\n粉丝\n0\n获赞\n0
      抖音号：23329202234\n23岁\n分享ai 学习ai 诸君共进步\n作品 0
    `, { expectedName: '小单说AI', expectedId: '23329202234' })).toThrow(/异常零值/);
  });

  test('B站部分同步不能删除上一次成功缓存', () => {
    const previous = [
      { bvid: 'BV1old0000001', title: '旧视频' },
      { bvid: 'BV1old0000002', title: '仍然存在' }
    ];
    const incoming = [{ bvid: 'BV1new0000001', title: '新视频' }];

    expect(mergeVideoInventory(previous, incoming, { expectedTotal: 3, complete: false }))
      .toEqual([incoming[0], ...previous]);
    expect(mergeVideoInventory(previous, incoming, { expectedTotal: 1, complete: true }))
      .toEqual(incoming);
  });

  test('临时播放地址在剩余二十分钟内必须刷新', () => {
    const now = Date.parse('2026-08-18T10:00:00Z');
    expect(shouldRefreshPlayUrl({ expiresAt: '2026-08-18T10:19:59Z' }, now)).toBe(true);
    expect(shouldRefreshPlayUrl({ expiresAt: '2026-08-18T10:20:01Z' }, now)).toBe(false);
    expect(shouldRefreshPlayUrl(null, now)).toBe(true);
  });

  test('缓存明确区分实时、缓存、过期和不可用', () => {
    const now = Date.parse('2026-08-18T10:00:00Z');
    expect(classifyFreshness('2026-08-18T09:59:00Z', 15 * 60_000, now)).toBe('live');
    expect(classifyFreshness('2026-08-18T09:30:00Z', 15 * 60_000, now)).toBe('cached');
    expect(classifyFreshness('2026-08-17T09:00:00Z', 15 * 60_000, now)).toBe('stale');
    expect(classifyFreshness('', 15 * 60_000, now)).toBe('unavailable');
  });

  test('WBI 签名清理保留字并产生固定 32 位摘要', () => {
    const signed = signWbiParams(
      { mid: '1452412374', keyword: "Agent!'()*" },
      '7cd084941338484aae1ad9425b84077c4931d4ad7d9f42b2b4f5a5c8824b8e5a',
      1787047200
    );

    expect(signed.wts).toBe(1787047200);
    expect(signed.w_rid).toMatch(/^[a-f0-9]{32}$/);
    expect(signed.query).not.toMatch(/[!'()*]/);
    expect(signed.query).toContain('mid=1452412374');
  });
});
