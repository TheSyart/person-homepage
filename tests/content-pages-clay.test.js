import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import ArticlesPage from '../src/pages/ArticlesPage.vue';
import MessagesPage from '../src/pages/MessagesPage.vue';
import VideosPage from '../src/pages/VideosPage.vue';

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};

const globalOptions = {
  directives: { reveal: {} },
  stubs: { RouterLink: RouterLinkStub }
};

describe('Clay 内容页面', () => {
  test('文章与视频以带名称的语义列表呈现完整 API 数据', async () => {
    const articleRows = [
      { slug: 'a', title: '文章甲', date: '2026-08-18', summary: '摘要甲', tags: ['AI'], cover: '/a.png', coverAlt: '文章甲封面' },
      { slug: 'b', title: '文章乙', date: '2026-08-17', summary: '摘要乙', tags: ['Vue'], cover: '/b.png', coverAlt: '文章乙封面' }
    ];
    const videoRows = [
      { id: '1', bvid: 'BV1111111111', platform: 'bilibili', title: '视频甲', date: '2026-08-18', desc: '说明甲', url: '#1', pageUrl: '#1', cover: '/v1.png', stats: {} },
      { id: '2', bvid: 'BV2222222222', platform: 'bilibili', title: '视频乙', date: '2026-08-17', desc: '说明乙', url: '#2', pageUrl: '#2', cover: '/v2.png', stats: {} }
    ];
    vi.stubGlobal('fetch', vi.fn(async (url) => ({
      json: async () => String(url).includes('articles') ? articleRows : videoRows
    })));

    const articles = mount(ArticlesPage, { global: globalOptions });
    const videos = mount(VideosPage, { global: globalOptions });
    await flushPromises();

    const articleList = articles.get('ul[aria-label="文章列表"]');
    const videoList = videos.get('ul[aria-label="视频列表"]');
    expect(articleList.findAll(':scope > li')).toHaveLength(2);
    expect(videoList.findAll(':scope > li')).toHaveLength(2);
    expect(articleList.findAll('li > article')).toHaveLength(2);
    expect(videoList.findAll('li > article')).toHaveLength(2);
    expect(articleList.findAll('article a[href^="/articles/"]')).toHaveLength(6);
    expect(videoList.findAll('article a')).toHaveLength(2);
    expect(articles.text()).toContain('摘要乙');
    expect(videos.text()).toContain('说明乙');
  });

  test('留言表单使用关联标签并实时播报校验结果', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => ({ list: [], total: 0 })
    })));

    const wrapper = mount(MessagesPage, { global: globalOptions });
    await flushPromises();

    expect(wrapper.get('form[aria-label="发布留言"]')).toBeTruthy();
    expect(wrapper.get('label[for="guest-name"]').text()).toBe('昵称');
    expect(wrapper.get('label[for="guest-message"]').text()).toBe('留言');

    await wrapper.get('form').trigger('submit');
    const status = wrapper.get('[role="status"][aria-live="polite"]');
    expect(status.text()).toBe('昵称和留言内容都要填哦');
  });

  test('留言提交保留请求契约、等待状态和成功后的清空刷新', async () => {
    let finishPost;
    const postResponse = new Promise((resolve) => { finishPost = resolve; });
    const fetchMock = vi.fn((url) => {
      if (url === '/api/messages') return postResponse;
      return Promise.resolve({ json: async () => ({ list: [], total: 0 }) });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(MessagesPage, { global: globalOptions });
    await flushPromises();
    await wrapper.get('#guest-name').setValue('  访客  ');
    await wrapper.get('#guest-message').setValue('  你好，小单  ');
    await wrapper.get('form').trigger('submit');

    const button = wrapper.get('button[type="submit"]');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.text()).toBe('提交中…');

    const postCall = fetchMock.mock.calls.find(([url]) => url === '/api/messages');
    expect(postCall[1].method).toBe('POST');
    expect(JSON.parse(postCall[1].body)).toMatchObject({
      name: '访客',
      content: '你好，小单',
      hp: ''
    });

    finishPost({ ok: true, json: async () => ({ ok: true }) });
    await flushPromises();

    expect(wrapper.get('[role="status"]').text()).toBe('留言成功，感谢你的到来！');
    expect(wrapper.get('#guest-name').element.value).toBe('');
    expect(wrapper.get('#guest-message').element.value).toBe('');
    expect(fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/messages/list'))).toHaveLength(2);
  });

  test('留言页透传限流错误并保留分页能力', async () => {
    const firstPage = Array.from({ length: 10 }, (_, index) => ({
      id: `m${index}`,
      name: `访客${index}`,
      content: `留言${index}`,
      time: '2026-08-18T08:00:00.000Z'
    }));
    const fetchMock = vi.fn(async (url) => {
      if (url === '/api/messages') {
        return { ok: false, json: async () => ({ error: '提交过于频繁，请稍后再试' }) };
      }
      if (String(url).includes('page=2')) {
        return { json: async () => ({ list: [firstPage[0]], total: 11 }) };
      }
      return { json: async () => ({ list: firstPage, total: 11 }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(MessagesPage, { global: globalOptions });
    await flushPromises();
    expect(wrapper.get('nav[aria-label="留言分页"]').text()).toContain('1 / 2');
    await wrapper.get('nav[aria-label="留言分页"] button:last-child').trigger('click');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith('/api/messages/list?page=2&size=10');
    expect(wrapper.get('nav[aria-label="留言分页"]').text()).toContain('2 / 2');

    await wrapper.get('#guest-name').setValue('访客');
    await wrapper.get('#guest-message').setValue('请多更新');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.get('[role="status"]').text()).toBe('提交过于频繁，请稍后再试');
  });
});
