import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import HomePage from '../src/pages/HomePage.vue';
import {
  FEATURED_REPOS,
  HOBBIES,
  MORE_PLATFORMS,
  OTHER_REPOS,
  PROFILE,
  SCHOOL_PHOTOS
} from '../src/config';

const testStats = vi.hoisted(() => ({
  github: {
    followers: 18,
    repos: 9,
    totalStars: 530,
    cae: { stars: 355, forks: 94 },
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
  douyin: { followers: 2000, likes: 0, works: 6 },
  updated: '2026-08-18'
}));

vi.mock('../src/composables/useStats', () => ({
  useStats: () => testStats
}));

const articles = [
  { slug: 'hello-new-home', title: '你好，新主页', date: '2026-08-18', summary: '主页第三次重构', tags: ['随笔', '重构'] },
  { slug: 'why-all-in-ai', title: '我为什么 all in AI', date: '2026-08-18', summary: '一个普通本科生的转型思考', tags: ['AI', '思考'] }
];

const videos = [
  { id: 'v1', platform: 'bilibili', title: '大学生创业vlog第四期', date: '2025-10-17', desc: '创业日记系列', url: '#' },
  { id: 'v2', platform: 'bilibili', title: '零基础开发一款浏览器插件', date: '2025-10-14', desc: '浏览器插件教程', url: '#' },
  { id: 'v3', platform: 'bilibili', title: '什么是程序员？', date: '2025-10-10', desc: 'hello world', url: '#' },
  { id: 'v4', platform: 'douyin', title: '大学生创业vlog第四期短视频版', date: '2025-10-17', desc: '短视频版', url: '#' }
];

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};

function mountHome() {
  vi.stubGlobal('fetch', vi.fn(async (url) => ({
    json: async () => String(url).includes('articles') ? articles : videos
  })));

  return mount(HomePage, {
    global: {
      directives: { reveal: {} },
      stubs: { RouterLink: RouterLinkStub }
    }
  });
}

describe('Clay 首页', () => {
  test('减少动态偏好下直接展示完整角色，不启动打字循环', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const wrapper = mountHome();
    await flushPromises();

    expect(wrapper.get('.hero-role').text()).toContain(PROFILE.roles[0]);
  });

  test('使用真人头像并把四项核心成就作为可访问列表展示', () => {
    const wrapper = mountHome();

    const avatar = wrapper.get('img[alt="小单说AI GitHub 头像"]');
    expect(avatar.attributes('src')).toBe(PROFILE.githubAvatar);

    const achievements = wrapper.get('ul[aria-label="个人成就"]');
    expect(achievements.findAll(':scope > li')).toHaveLength(4);
    expect(achievements.findAll('li > a')).toHaveLength(3);
    expect(achievements.text()).toContain('GitHub Stars');
    expect(achievements.text()).toContain('B站粉丝');
    expect(achievements.text()).toContain('抖音粉丝');
    expect(achievements.text()).toContain(PROFILE.identity);
  });

  test('完整渲染既有项目、照片、爱好、平台和联系方式', async () => {
    const wrapper = mountHome();
    await flushPromises();

    const pageText = wrapper.text();
    [...FEATURED_REPOS.map((repo) => repo.name), ...OTHER_REPOS.map(([name]) => name)]
      .forEach((name) => expect(pageText).toContain(name));
    HOBBIES.forEach(([name]) => expect(pageText).toContain(name));
    MORE_PLATFORMS.forEach(({ name }) => expect(pageText).toContain(name));

    expect(wrapper.findAll('img[alt^="校园照片"]')).toHaveLength(SCHOOL_PHOTOS.length);
    expect(pageText).toContain(PROFILE.email);
    expect(pageText).toContain(PROFILE.wechat);
    expect(pageText).toContain('TheSyart');
    articles.forEach(({ title }) => expect(pageText).toContain(title));
    videos.slice(0, 3).forEach(({ title }) => expect(pageText).toContain(title));
  });

  test('配置中的项目、平台、联系方式与本地图片路径都保持可访问', async () => {
    const wrapper = mountHome();
    await flushPromises();

    const hrefs = wrapper.findAll('a').map((link) => link.attributes('href'));
    const sources = wrapper.findAll('img').map((image) => decodeURI(image.attributes('src')));

    FEATURED_REPOS.forEach(({ url }) => expect(hrefs).toContain(url));
    OTHER_REPOS.forEach(([name]) => expect(hrefs).toContain(`https://github.com/TheSyart/${name}`));
    MORE_PLATFORMS.forEach(({ url, icon }) => {
      expect(hrefs).toContain(url);
      expect(sources).toContain(icon);
    });
    SCHOOL_PHOTOS.forEach((src) => expect(sources).toContain(src));
    HOBBIES.forEach(([, src]) => expect(sources).toContain(src));
    expect(hrefs).toContain(`mailto:${PROFILE.email}`);
    expect(hrefs).toContain(PROFILE.githubUrl);
  });
});
