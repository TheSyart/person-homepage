<script setup>
import { ref, onMounted } from 'vue';

const articles = ref(null);

onMounted(async () => {
  try {
    const r = await fetch('/api/articles');
    const j = await r.json();
    articles.value = Array.isArray(j) ? j : [];
  } catch {
    articles.value = [];
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 pt-16">
    <p class="text-xs tracking-[.35em] text-faint mb-4" v-reveal>ARTICLES</p>
    <h1 class="font-serifSc text-4xl md:text-5xl font-bold mb-4" v-reveal="60">文章</h1>
    <p class="text-muted mb-12" v-reveal="120">记录 AI、编程与成长。慢慢写，认真写。</p>

    <div v-if="articles === null" class="py-10 text-faint text-sm">加载中…</div>

    <div v-else-if="articles.length">
      <router-link v-for="(a, i) in articles" :key="a.slug" :to="`/articles/${a.slug}`"
        class="block group py-7 border-b hairline first:border-t" v-reveal="i * 60">
        <div class="flex items-baseline justify-between gap-4 mb-2">
          <h2 class="font-serifSc text-2xl font-bold group-hover:text-vermilion transition-colors">{{ a.title }}</h2>
          <time class="text-faint text-sm font-code shrink-0">{{ a.date }}</time>
        </div>
        <p class="text-muted leading-relaxed mb-3">{{ a.summary }}</p>
        <div class="flex gap-2">
          <span v-for="t in a.tags" :key="t"
            class="text-xs text-muted border hairline rounded-full px-2.5 py-0.5 bg-card">{{ t }}</span>
        </div>
      </router-link>
    </div>

    <p v-else class="py-10 text-faint text-sm">还没有文章，第一篇正在路上。</p>
  </div>
</template>
