import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import ArticleDetailPage from '../src/pages/ArticleDetailPage.vue';
import NotFoundPage from '../src/pages/NotFoundPage.vue';
import '../src/style.css';

const clayCss = readFileSync('./src/style.css', 'utf8');

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => ({ params: { slug: 'hello-new-home' } })
  };
});

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};

describe('文章详情与 404', () => {
  test('文章详情将标题与完整 Markdown 正文关联到阅读区域', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        title: '你好，新主页',
        date: '2026-08-18',
        tags: ['随笔', '重构'],
        content: '欢迎来到这里。\n\n## 这一版改了什么\n\n- 完整正文保留。\n- 列表符号保留。\n\n1. 第一步\n2. 第二步'
      })
    })));

    const wrapper = mount(ArticleDetailPage, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    });
    await flushPromises();

    const article = wrapper.get('article[aria-labelledby="article-title"]');
    expect(article.get('#article-title').text()).toBe('你好，新主页');
    expect(article.text()).toContain('这一版改了什么');
    expect(article.text()).toContain('完整正文保留。');
    expect(article.get('a[href="/articles"]').text()).toContain('全部文章');
    expect(getComputedStyle(article.get('ul').element).listStyleType).toBe('disc');
    expect(getComputedStyle(article.get('ol').element).listStyleType).toBe('decimal');
    expect(clayCss).toMatch(/\.article-body ul\s*\{[^}]*list-style:\s*disc/s);
    expect(clayCss).toMatch(/\.article-body ol\s*\{[^}]*list-style:\s*decimal/s);
  });

  test('404 场景具备明确标题和返回首页入口', () => {
    const wrapper = mount(NotFoundPage, {
      global: { stubs: { RouterLink: RouterLinkStub } }
    });

    const page = wrapper.get('main[aria-labelledby="not-found-title"]');
    expect(page.get('#not-found-title').text()).toBe('404');
    expect(page.text()).toContain('这一页走丢了。');
    expect(page.get('a[href="/"]').text()).toBe('回到首页');
  });
});
