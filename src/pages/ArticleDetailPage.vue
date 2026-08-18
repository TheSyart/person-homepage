<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
const route = useRoute();
const article = ref(null);
const notFound = ref(false);

async function load(slug) {
  article.value = null;
  notFound.value = false;
  try {
    const response = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
    if (!response.ok) {
      notFound.value = true;
      return;
    }
    const data = await response.json();
    article.value = data;
    document.title = `${data.title} · 小单说AI`;
  } catch {
    notFound.value = true;
  }
}

onMounted(() => load(route.params.slug));
watch(() => route.params.slug, (slug) => slug && load(slug));
</script>

<template>
  <main class="site-shell page-wrap">
    <section v-if="notFound" class="not-found-shell">
      <div class="not-found-card clay-surface clay-surface--pink">
        <h1 class="text-5xl font-black mb-4">文章不存在</h1>
        <router-link to="/articles" class="clay-button clay-button--primary">返回文章列表</router-link>
      </div>
    </section>

    <div v-else-if="!article" class="loading-panel clay-surface" role="status">加载中…</div>

    <article v-else class="reading-shell clay-surface" aria-labelledby="article-title">
      <header class="article-header">
        <router-link to="/articles" class="clay-pill">← 全部文章</router-link>
        <h1 id="article-title" class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <time class="clay-tag font-code">{{ article.date }}</time>
          <span v-for="tag in article.tags" :key="tag" class="clay-tag">{{ tag }}</span>
        </div>
      </header>
      <div class="article-body" v-html="md.render(article.content || '')"></div>
    </article>
  </main>
</template>
