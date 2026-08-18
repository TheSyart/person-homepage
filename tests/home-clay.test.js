import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import HomePage from '../src/pages/HomePage.vue';
import { PROFILE } from '../src/config';

const testStats = vi.hoisted(() => ({
  github: {
    followers: 18,
    repos: 9,
    totalStars: 533,
    status: 'live', updatedAt: '2026-08-18T10:00:00Z', avatar: '/github.png', featuredRepos: [],
    cae: { stars: 358, forks: 94 },
    ea: { stars: 175, forks: 40 },
    live: true
  },
  bili: {
    followers: 3164,
    name: '小单说AI',
    face: '',
    sign: '分享ai 学习ai 诸君共进步',
    following: 174, videoCount: 50, status: 'live', updatedAt: '2026-08-18T10:00:00Z',
    live: true
  },
  douyin: { name: '小单说AI', id: '23329202234', followers: 1990, likesDisplay: '1.2万', works: 42, sign: '分享ai 学习ai 诸君共进步', status: 'live', updatedAt: '2026-08-18T10:00:00Z' },
  updated: '2026-08-18'
}));

vi.mock('../src/composables/useStats', () => ({ useStats: () => testStats }));

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};

function mountHome() {
  return mount(HomePage, {
    global: {
      directives: { reveal: {} },
      stubs: { RouterLink: RouterLinkStub }
    }
  });
}

describe('Clay 首页回归', () => {
  test('GitHub 头像加载失败时在同一核心位置显示品牌兜底', async () => {
    const wrapper = mountHome();
    const avatar = wrapper.get('img[alt="小单说AI GitHub 头像"]');

    expect(avatar.attributes('src')).toBe(PROFILE.githubAvatar);
    await avatar.trigger('error');
    expect(wrapper.find('img[alt="小单说AI GitHub 头像"]').exists()).toBe(false);
    expect(wrapper.get('.agent-core__portrait b').text()).toBe('单');
  });

  test('平台使用缓存状态时 Hero 与资料面板仍保持可用', () => {
    testStats.github.status = 'stale';
    testStats.bili.status = 'cached';
    testStats.douyin.status = 'unavailable';
    const wrapper = mountHome();

    expect(wrapper.get('#home-title').text()).toBe('你好，我是小单。');
    expect(wrapper.findAll('[data-live-platform]')).toHaveLength(3);
    expect(wrapper.text()).toContain('缓存已过期');
    expect(wrapper.text()).toContain('暂不可用');
  });

  test('首页保留 Agent 系列与三个平台真实外链', () => {
    const wrapper = mountHome();
    const hrefs = wrapper.findAll('a').map((link) => link.attributes('href'));

    ['/agents', PROFILE.githubUrl, PROFILE.bilibiliUrl, PROFILE.douyinUrl].forEach((path) => expect(hrefs).toContain(path));
    expect(wrapper.find('.latest-signals').exists()).toBe(false);
    expect(wrapper.find('nav[aria-label="继续探索"]').exists()).toBe(false);
  });

  test('B站和 GitHub 标志固定在各自装置的内容中心', () => {
    const wrapper = mountHome();

    for (const platform of ['bili', 'github']) {
      const device = wrapper.get(`.platform-device--${platform}`);
      expect(device.get('.platform-device__screen .platform-device__logo').exists()).toBe(true);
    }
  });
});
