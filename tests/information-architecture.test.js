import { readFileSync } from 'node:fs';
import path from 'node:path';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import router from '../src/router';
import SiteHeader from '../src/components/SiteHeader.vue';
import AgentsPage from '../src/pages/AgentsPage.vue';
import AboutPage from '../src/pages/AboutPage.vue';
import VideoShowcase from '../src/components/home/VideoShowcase.vue';
import {
  ABOUT_PARAS,
  AGENT_SERIES,
  FEATURED_REPOS,
  HOBBIES,
  MORE_PLATFORMS,
  OTHER_REPOS,
  PROFILE,
  SCHOOL_PHOTOS,
  SKILLS
} from '../src/config';

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

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};

const globalOptions = {
  directives: { reveal: {} },
  stubs: { RouterLink: RouterLinkStub }
};

describe('Agent 作品集信息架构', () => {
  test('注册 Agents 与 About 页面且在主导航中可访问', async () => {
    const routes = router.getRoutes();
    const paths = routes.map((route) => route.path);
    ['/', '/agents', '/about', '/articles', '/articles/:slug', '/videos', '/messages']
      .forEach((path) => expect(paths).toContain(path));

    for (const path of ['/agents', '/about']) {
      const route = routes.find((item) => item.path === path);
      const loaded = await route.components.default();
      expect(loaded.default).toBeTruthy();
    }

    const header = mount(SiteHeader, {
      global: {
        mocks: { $route: { path: '/' } },
        stubs: { RouterLink: RouterLinkStub }
      }
    });
    const hrefs = header.findAll('nav a').map((link) => link.attributes('href'));
    expect(hrefs).toContain('/agents');
    expect(hrefs).toContain('/about');
  });

  test('Agents 页面恰好呈现九期视频、对应资源和两个核心仓库', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => AGENT_SERIES.map((episode) => ({
      ...episode,
      id: episode.bvid,
      pageUrl: `https://www.bilibili.com/video/${episode.bvid}`,
      title: `从零实现自己的agent第${episode.episode}期`,
      cover: `/cover-${episode.episode}.png`,
      stats: {}
    })) })));
    const wrapper = mount(AgentsPage, { global: globalOptions });
    await flushPromises();
    const text = wrapper.text();

    expect(wrapper.findAll('[data-agent-episode]')).toHaveLength(9);
    AGENT_SERIES.forEach(({ resourceLabel }) => expect(text).toContain(resourceLabel));
    FEATURED_REPOS.forEach(({ name }) => expect(text).toContain(name));
    expect(wrapper.findAll('[data-skill]')).toHaveLength(0);
  });

  test('About 页面完整呈现 Agent 定位、个人资料、照片、爱好、平台与联系方式', () => {
    const wrapper = mount(AboutPage, { global: globalOptions });
    const text = wrapper.text();
    const sources = wrapper.findAll('img').map((image) => decodeURI(image.attributes('src')));

    expect(ABOUT_PARAS).toHaveLength(3);
    expect(text).toContain('把 AI Agent 做成开源项目');
    expect(text).not.toContain('作为一名全栈程序员');
    ABOUT_PARAS.forEach((paragraph) => expect(text).toContain(paragraph));
    expect(wrapper.findAll('img[alt^="校园照片"]')).toHaveLength(10);
    SCHOOL_PHOTOS.forEach((src) => expect(sources).toContain(src));
    HOBBIES.forEach(([name]) => expect(text).toContain(name));
    MORE_PLATFORMS.forEach(({ name }) => expect(text).toContain(name));
    expect(text).toContain(PROFILE.email);
    expect(text).toContain(PROFILE.wechat);
    expect(wrapper.findAll('[data-skill]')).toHaveLength(22);
    SKILLS.forEach(([, name]) => expect(text).toContain(name));
    OTHER_REPOS.forEach(([name]) => expect(text).toContain(name));
  });

  test('浏览器标题、SEO 与视频介绍统一采用 Agent 定位', () => {
    const indexHtml = readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    const routerSource = readFileSync(path.join(process.cwd(), 'src/router.js'), 'utf8');
    const video = mount(VideoShowcase, { global: globalOptions });

    expect(indexHtml).toContain('AI Agent 开源作者');
    expect(indexHtml).not.toContain('全栈程序员');
    expect(routerSource).toContain('AI Agent 开源作者');
    expect(routerSource).not.toContain('全栈程序员');
    expect(video.text()).toContain('Agent 教程');
    expect(video.text()).not.toContain('大学生程序员');
  });
});
