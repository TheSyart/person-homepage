import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';
import HomePage from '../src/pages/HomePage.vue';
import AgentHero from '../src/components/home/AgentHero.vue';

const stats = vi.hoisted(() => ({
  github: {
    followers: 18,
    repos: 9,
    totalStars: 533,
    status: 'live',
    updatedAt: '2026-08-18T10:00:00Z',
    avatar: '/github.png',
    featuredRepos: [],
    cae: { stars: 358, forks: 94 },
    ea: { stars: 175, forks: 40 },
    live: true
  },
  bili: {
    followers: 3164,
    name: '小单说AI',
    face: '',
    sign: '分享ai 学习ai 诸君共进步',
    following: 174,
    videoCount: 50,
    status: 'live',
    updatedAt: '2026-08-18T10:00:00Z',
    live: true
  },
  douyin: { name: '小单说AI', id: '23329202234', followers: 1990, following: 81, likes: 12000, likesDisplay: '1.2万', works: 42, sign: '分享ai 学习ai 诸君共进步', status: 'live', updatedAt: '2026-08-18T10:00:00Z' },
  updated: '2026-08-18'
}));

vi.mock('../src/composables/useStats', () => ({ useStats: () => stats }));

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

describe('Agent Clay 首页', () => {
  test('首页只保留自我介绍 Hero 和三个实时平台面板', () => {
    const wrapper = mountHome();

    const hero = wrapper.get('section[aria-labelledby="home-title"]');
    expect(hero.get('#home-title').text()).toBe('你好，我是小单。');
    expect(hero.get('a[href="/agents"]').text()).toContain('看 9 期 Agent 系列');
    expect(hero.get('a[href="https://github.com/TheSyart"]').text()).toContain('打开 GitHub');
    expect(wrapper.findAll('[data-live-platform]')).toHaveLength(3);

    expect(wrapper.find('.story-grid').exists()).toBe(false);
    expect(wrapper.find('.latest-signals').exists()).toBe(false);
    expect(wrapper.find('.home-paths').exists()).toBe(false);
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

  test('指针移动只产生受限视差并在离开 Hero 时归零', async () => {
    const wrapper = mount(AgentHero, {
      props: { stats },
      global: { stubs: { RouterLink: RouterLinkStub } }
    });
    const hero = wrapper.get('.agent-hero');
    vi.spyOn(hero.element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 500,
      right: 1000,
      bottom: 500,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });

    await hero.trigger('pointermove', { clientX: 750, clientY: 125 });
    expect(wrapper.get('.agent-hero__visual').attributes('style') || '').toContain('--pointer-x: 9px');
    expect(wrapper.get('.agent-hero__visual').attributes('style') || '').toContain('--pointer-y: -7px');

    await hero.trigger('pointerleave');
    expect(wrapper.get('.agent-hero__visual').attributes('style') || '').toContain('--pointer-x: 0px');
    expect(wrapper.get('.agent-hero__visual').attributes('style') || '').toContain('--pointer-y: 0px');
  });
});
