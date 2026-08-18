<script setup>
import { ref, onMounted } from 'vue';

const articles = ref(null);
const TONES = ['clay-surface--blue', 'clay-surface--pink', 'clay-surface--green', 'clay-surface--yellow'];

onMounted(async () => {
  try {
    const response = await fetch('/api/articles');
    const data = await response.json();
    articles.value = Array.isArray(data) ? data : [];
  } catch {
    articles.value = [];
  }
});
</script>

<template>
  <main class="site-shell page-wrap" aria-labelledby="articles-title">
    <header class="page-hero clay-surface clay-surface--yellow" v-reveal>
      <p class="page-kicker">ARTICLES</p>
      <h1 id="articles-title" class="page-title">文章</h1>
      <p class="page-description">记录 AI、编程与成长。慢慢写，认真写。</p>
    </header>

    <div v-if="articles === null" class="loading-panel clay-surface" role="status">加载中…</div>

    <ul v-else-if="articles.length" class="clay-grid" aria-label="文章列表">
      <li v-for="(article, index) in articles" :key="article.slug" class="clay-list-item" v-reveal="index * 60">
        <router-link :to="`/articles/${article.slug}`" class="clay-card clay-surface clay-interactive"
          :class="TONES[index % TONES.length]">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
            <time class="clay-tag font-code">{{ article.date }}</time>
            <span class="clay-tag">阅读全文 →</span>
          </div>
          <h2 class="text-2xl font-black leading-snug mb-4 pr-5">{{ article.title }}</h2>
          <p class="text-muted leading-relaxed mb-5">{{ article.summary }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in article.tags" :key="tag" class="clay-tag">{{ tag }}</span>
          </div>
        </router-link>
      </li>
    </ul>

    <p v-else class="empty-panel clay-surface clay-surface--pink">还没有文章，第一篇正在路上。</p>
  </main>
</template>
