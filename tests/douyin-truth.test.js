import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import VideoShowcase from '../src/components/home/VideoShowcase.vue';
import { PROFILE, SNAPSHOT } from '../src/config';

const stats = vi.hoisted(() => ({
  github: {
    followers: 18,
    repos: 9,
    totalStars: 533,
    cae: { stars: 358, forks: 94 },
    ea: { stars: 175, forks: 40 },
    live: true
  },
  bili: {
    followers: 3164,
    name: '小单说AI',
    face: '',
    sign: '分享ai 学习ai 诸君共进步',
    live: true
  },
  douyin: { followers: null, likes: null, works: null },
  updated: '2026-08-18'
}));

vi.mock('../src/composables/useStats', () => ({ useStats: () => stats }));

describe('抖音事实展示', () => {
  test('未知统计保持可空且页面只展示经过确认的账号事实', () => {
    const wrapper = mount(VideoShowcase, {
      global: { directives: { reveal: {} } }
    });
    const douyinCard = wrapper.findAll('.creator-card')[1];

    expect(SNAPSHOT.douyin).toEqual({ followers: null, likes: null, works: null });
    expect(douyinCard.text()).toContain('小单说AI');
    expect(douyinCard.text()).toContain(PROFILE.douyinId);
    expect(douyinCard.text()).toContain('抖音号');
    expect(douyinCard.text()).not.toContain('粉丝');
    expect(douyinCard.text()).not.toContain(stats.updated);
    expect(douyinCard.get(`a[href="${PROFILE.douyinUrl}"]`)).toBeTruthy();
  });
});
