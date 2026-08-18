import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'home', component: () => import('./pages/HomePage.vue'), meta: { title: '首页' } },
  { path: '/agents', name: 'agents', component: () => import('./pages/AgentsPage.vue'), meta: { title: 'Agents' } },
  { path: '/articles', name: 'articles', component: () => import('./pages/ArticlesPage.vue'), meta: { title: '文章' } },
  { path: '/articles/:slug', name: 'article-detail', component: () => import('./pages/ArticleDetailPage.vue'), meta: { title: '文章' } },
  { path: '/videos', name: 'videos', component: () => import('./pages/VideosPage.vue'), meta: { title: '视频' } },
  { path: '/about', name: 'about', component: () => import('./pages/AboutPage.vue'), meta: { title: '关于' } },
  { path: '/messages', name: 'messages', component: () => import('./pages/MessagesPage.vue'), meta: { title: '留言' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/NotFoundPage.vue'), meta: { title: '404' } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  }
});

router.afterEach((to) => {
  document.title = to.name === 'home' ? '小单说AI — AI Agent 开源作者 / 内容创作者' : `${to.meta.title} · 小单说AI`;
});

export default router;
