import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';
import HomePage from '../src/pages/HomePage.vue';
import AgentHero from '../src/components/home/AgentHero.vue';
import CountUp from '../src/components/CountUp.vue';

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

const articleRows = [
  { slug: 'a', title: '文章甲', date: '2026-08-18', summary: '摘要甲', tags: ['Agent'] },
  { slug: 'b', title: '文章乙', date: '2026-08-17', summary: '摘要乙', tags: ['AI'] },
  { slug: 'c', title: '文章丙', date: '2026-08-16', summary: '摘要丙', tags: ['工具'] }
];
const videoRows = [
  { id: 'v1', platform: 'bilibili', title: '视频甲', date: '2026-08-18', desc: '说明甲', url: '#v1' },
  { id: 'v2', platform: 'bilibili', title: '视频乙', date: '2026-08-17', desc: '说明乙', url: '#v2' },
  { id: 'v3', platform: 'douyin', title: '视频丙', date: '2026-08-16', desc: '说明丙', url: '#v3' }
];

function mountHome() {
  vi.stubGlobal('fetch', vi.fn(async (url) => ({
    ok: true,
    json: async () => String(url).includes('articles') ? articleRows : videoRows
  })));

  return mount(HomePage, {
    global: {
      directives: { reveal: {} },
      stubs: { RouterLink: RouterLinkStub }
    }
  });
}

describe('Agent Clay 首页', () => {
  test('首页只保留 Hero、能力证明、旗舰项目和精简后的最新内容', async () => {
    const wrapper = mountHome();
    await flushPromises();

    const hero = wrapper.get('section[aria-labelledby="home-title"]');
    expect(hero.get('#home-title').text()).toBe('把 AI Agent 做活。');
    expect(hero.get('a[href="/agents"]').text()).toContain('进入 Agent 实验室');
    expect(hero.get('a[href="/videos"]').text()).toContain('观看系列视频');

    const proof = wrapper.get('ul[aria-label="Agent 能力证明"]');
    const proofItems = proof.findAll(':scope > li');
    expect(proofItems).toHaveLength(4);
    expect(proofItems[2].getComponent(CountUp).props()).toMatchObject({ value: 12, suffix: ' 阶段' });
    expect(proofItems[3].getComponent(CountUp).props()).toMatchObject({ value: 9, suffix: '+ 集' });
    expect(wrapper.findAll('[data-featured-agent-project]')).toHaveLength(2);
    expect(wrapper.findAll('[data-latest-article]')).toHaveLength(2);
    expect(wrapper.findAll('[data-latest-video]')).toHaveLength(2);
    expect(wrapper.text()).not.toContain('文章丙');
    expect(wrapper.text()).not.toContain('视频丙');

    expect(wrapper.find('.story-grid').exists()).toBe(false);
    expect(wrapper.find('.about-section').exists()).toBe(false);
    expect(wrapper.find('.platform-section').exists()).toBe(false);
    expect(wrapper.find('.contact-section').exists()).toBe(false);
  });

  test('原生按钮激活粘土核心后释放 18 个短生命周期颗粒', async () => {
    vi.useFakeTimers();
    const wrapper = mount(AgentHero, {
      props: { stats },
      global: { stubs: { RouterLink: RouterLinkStub } }
    });
    const core = wrapper.get('.agent-core');

    expect(core.element.tagName).toBe('BUTTON');
    await core.trigger('click');
    expect(core.classes()).toContain('is-squishing');
    expect(wrapper.findAll('.clay-spark')).toHaveLength(18);

    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(wrapper.findAll('.clay-spark')).toHaveLength(0);
    expect(core.classes()).not.toContain('is-squishing');
    vi.useRealTimers();
  });
});
