import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import HomePage from '../src/pages/HomePage.vue';
import AgentsPage from '../src/pages/AgentsPage.vue';
import ArticlesPage from '../src/pages/ArticlesPage.vue';
import VideosPage from '../src/pages/VideosPage.vue';

const profile = vi.hoisted(() => ({
  github: {
    status: 'live', updatedAt: '2026-08-18T10:00:00Z', followers: 18, repos: 9,
    totalStars: 533, joinedAt: '2023-08-08T16:58:58Z', avatar: '/avatar.png',
    featuredRepos: [{ name: 'claude-agent-examples', stars: 358, forks: 94, url: '#repo' }],
    cae: { stars: 358, forks: 94 }, ea: { stars: 175, forks: 40 }, live: true
  },
  bili: {
    status: 'live', updatedAt: '2026-08-18T10:00:00Z', name: '小单说AI', followers: 3167,
    following: 174, videoCount: 50, face: '/bili.png', sign: '分享ai 学习ai 诸君共进步', live: true
  },
  douyin: {
    status: 'live', updatedAt: '2026-08-18T10:00:00Z', name: '小单说AI', followers: 1990,
    likesDisplay: '1.2万', works: 42, following: 81, id: '23329202234', sign: '分享ai 学习ai 诸君共进步'
  },
  updated: '2026-08-18'
}));

vi.mock('../src/composables/useStats', () => ({ useStats: () => profile }));

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};
const global = { directives: { reveal: {} }, stubs: { RouterLink: RouterLinkStub } };

const agentVideos = Array.from({ length: 9 }, (_, index) => ({
  id: `BVagent00000${index + 1}`,
  bvid: `BVagent00000${index + 1}`,
  platform: 'bilibili',
  episode: index + 1,
  series: 'from-zero-agent',
  title: `从零实现自己的agent第${index + 1}期`,
  url: `https://www.bilibili.com/video/BVagent00000${index + 1}`,
  pageUrl: `https://www.bilibili.com/video/BVagent00000${index + 1}`,
  cover: `/cover-${index + 1}.jpg`,
  date: '2026-08-18',
  duration: '09:00',
  stats: { view: 1000 + index }
}));

describe('实时内容信息架构', () => {
  test('首页只展示自我介绍 Hero 和三个实时平台', () => {
    const wrapper = mount(HomePage, { global });

    expect(wrapper.get('#home-title').text()).toBe('你好，我是小单。');
    expect(wrapper.text()).toContain('我做开源 Agent，也把实现过程拍成视频');
    expect(wrapper.findAll('[data-live-platform]')).toHaveLength(3);
    expect(wrapper.find('.latest-signals').exists()).toBe(false);
    expect(wrapper.find('.home-paths').exists()).toBe(false);
    expect(wrapper.find('[data-featured-projects]').exists()).toBe(false);
  });

  test('Agent 页只展示九期系列且每期有视频和 GitHub 资源', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => agentVideos })));
    const wrapper = mount(AgentsPage, { global });
    await flushPromises();

    const episodes = wrapper.findAll('[data-agent-episode]');
    expect(episodes).toHaveLength(9);
    episodes.forEach((episode) => {
      expect(episode.find('a[href*="bilibili.com/video/"]').exists()).toBe(true);
      expect(episode.find('a[href*="github.com/TheSyart/claude-agent-examples"]').exists()).toBe(true);
    });
    expect(wrapper.findAll('[data-skill]')).toHaveLength(0);
  });

  test('文章卡片必须显示对应封面和合理摘要', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [{
        slug: 'agent-memory', title: 'Agent 记忆系统', date: '2026-08-18', tags: ['Agent'],
        cover: '/articles/agent-memory.png', coverAlt: 'Agent 记忆系统封面',
        summary: '拆解原始记录、情景记忆和长期记忆如何配合，让 Agent 在上下文受限时仍能持续工作。'
      }]
    })));
    const wrapper = mount(ArticlesPage, { global });
    await flushPromises();

    expect(wrapper.get('article[data-article-card] img').attributes('src')).toBe('/articles/agent-memory.png');
    expect(wrapper.get('article[data-article-card] img').attributes('alt')).toBe('Agent 记忆系统封面');
    expect(wrapper.get('article[data-article-card] p').text().length).toBeGreaterThan(30);
  });

  test('视频页提供站内播放入口和稳定 B站兜底', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url).includes('/play')) {
        return { ok: true, json: async () => ({ url: 'https://video.example/play.mp4', pageUrl: agentVideos[0].pageUrl }) };
      }
      return { ok: true, json: async () => [agentVideos[0]] };
    }));
    const wrapper = mount(VideosPage, { global });
    await flushPromises();

    expect(wrapper.get('[data-video-card] img').attributes('src')).toBe(agentVideos[0].cover);
    expect(wrapper.get('a[href*="bilibili.com/video/"]').text()).toContain('B站');
    await wrapper.get('button[data-play-video]').trigger('click');
    await flushPromises();
    expect(wrapper.get('video').attributes('src')).toBe('https://video.example/play.mp4');
  });
});
