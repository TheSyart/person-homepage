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
    const r = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
    if (!r.ok) { notFound.value = true; return; }
    const j = await r.json();
    article.value = j;
    document.title = `${j.title} · 小单说AI`;
  } catch {
    notFound.value = true;
  }
}

onMounted(() => load(route.params.slug));
watch(() => route.params.slug, (s) => s && load(s));
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 pt-16">
    <div v-if="notFound" class="py-20 text-center">
      <p class="font-serifSc text-5xl font-bold mb-4">文章不存在</p>
      <router-link to="/articles" class="link-vermilion">返回文章列表</router-link>
    </div>

    <div v-else-if="!article" class="py-20 text-faint text-sm">加载中…</div>

    <article v-else>
      <router-link to="/articles" class="text-sm text-muted hover:text-vermilion transition-colors">← 全部文章</router-link>
      <h1 class="font-serifSc text-4xl md:text-5xl font-bold leading-tight mt-6 mb-4">{{ article.title }}</h1>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-faint pb-8 mb-8 border-b hairline">
        <time class="font-code">{{ article.date }}</time>
        <span v-for="t in article.tags" :key="t"
          class="text-xs text-muted border hairline rounded-full px-2.5 py-0.5 bg-card">{{ t }}</span>
      </div>
      <!-- markdown-it 渲染；API 返回的是站长自己写的可信内容，且 markdown-it html:false -->
      <div class="article-body" v-html="md.render(article.content || '')"></div>
    </article>
  </div>
</template>
