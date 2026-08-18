import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import HomePage from '../src/pages/HomePage.vue';
import { FEATURED_REPOS, PROFILE } from '../src/config';

const testStats = vi.hoisted(() => ({
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

vi.mock('../src/composables/useStats', () => ({ useStats: () => testStats }));

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};

const rows = {
  articles: [
    { slug: 'agent-memory', title: 'Agent 记忆', date: '2026-08-18', summary: '三层记忆', tags: ['Agent'] }
  ],
  videos: [
    { id: 'v1', platform: 'bilibili', title: '什么是 Agent', date: '2026-08-18', desc: 'Agent 入门', url: '#v1' }
  ]
};

function mountHome(fetchImpl = async (url) => ({
  json: async () => String(url).includes('articles') ? rows.articles : rows.videos
})) {
  vi.stubGlobal('fetch', vi.fn(fetchImpl));
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

  test('内容 API 失败时 Hero 保持可用并显示两个独立空状态', async () => {
    const wrapper = mountHome(async () => { throw new Error('offline'); });
    await flushPromises();

    expect(wrapper.get('#home-title').text()).toBe('把 AI Agent 做活。');
    const emptyStates = wrapper.findAll('.latest-signals .empty-panel');
    expect(emptyStates).toHaveLength(2);
    expect(emptyStates[0].text()).toBe('文章整理中。');
    expect(emptyStates[1].text()).toBe('视频整理中。');
  });

  test('旗舰项目保留真实外链且探索入口覆盖四个内容方向', async () => {
    const wrapper = mountHome();
    await flushPromises();
    const hrefs = wrapper.findAll('a').map((link) => link.attributes('href'));

    FEATURED_REPOS.forEach(({ url }) => expect(hrefs).toContain(url));
    ['/agents', '/about', '/articles', '/videos'].forEach((path) => expect(hrefs).toContain(path));
    expect(wrapper.get('nav[aria-label="继续探索"]').findAll('a')).toHaveLength(4);
  });
});
