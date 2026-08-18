<script setup>
import { ref, onMounted } from 'vue';
import { PROFILE } from '../config';

const videos = ref(null);

onMounted(async () => {
  try {
    const r = await fetch('/api/videos');
    const j = await r.json();
    videos.value = Array.isArray(j) ? j : [];
  } catch {
    videos.value = [];
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 pt-16">
    <p class="text-xs tracking-[.35em] text-faint mb-4" v-reveal>VIDEOS</p>
    <h1 class="font-serifSc text-4xl md:text-5xl font-bold mb-4" v-reveal="60">视频</h1>
    <p class="text-muted mb-12" v-reveal="120">
      在 <a :href="PROFILE.bilibiliUrl" target="_blank" rel="noopener" class="link-vermilion">B站</a> 和
      <a :href="PROFILE.douyinUrl" target="_blank" rel="noopener" class="link-vermilion">抖音</a> 持续更新。
    </p>

    <div v-if="videos === null" class="py-10 text-faint text-sm">加载中…</div>

    <div v-else-if="videos.length" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <a v-for="(v, i) in videos" :key="v.id" :href="v.url" target="_blank" rel="noopener"
        class="group border hairline rounded-lg p-6 bg-card hover:border-vermilion/50 transition-colors" v-reveal="i * 60">
        <div class="flex items-center justify-between mb-4">
          <span class="inline-block text-xs px-2.5 py-1 rounded"
            :class="v.platform === 'bilibili' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-600'">
            {{ v.platform === 'bilibili' ? 'B站' : '抖音' }}
          </span>
          <time class="text-faint text-xs font-code">{{ v.date }}</time>
        </div>
        <h2 class="font-serifSc text-lg font-bold leading-snug group-hover:text-vermilion transition-colors mb-2">{{ v.title }}</h2>
        <p v-if="v.desc" class="text-muted text-sm leading-relaxed">{{ v.desc }}</p>
      </a>
    </div>

    <p v-else class="py-10 text-faint text-sm">视频整理中，先去 B站/抖音主页看看吧。</p>
  </div>
</template>
