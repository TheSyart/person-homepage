<script setup>
import { ref, onMounted } from 'vue';
import { PROFILE } from '../config';

const videos = ref(null);
const TONES = ['clay-surface--blue', 'clay-surface--pink', 'clay-surface--green', 'clay-surface--yellow'];

onMounted(async () => {
  try {
    const response = await fetch('/api/videos');
    const data = await response.json();
    videos.value = Array.isArray(data) ? data : [];
  } catch {
    videos.value = [];
  }
});
</script>

<template>
  <main class="site-shell page-wrap" aria-labelledby="videos-title">
    <header class="page-hero clay-surface clay-surface--pink" v-reveal>
      <p class="page-kicker">VIDEOS</p>
      <h1 id="videos-title" class="page-title">视频</h1>
      <p class="page-description">
        在 <a :href="PROFILE.bilibiliUrl" target="_blank" rel="noopener" class="link-vermilion">B站</a> 和
        <a :href="PROFILE.douyinUrl" target="_blank" rel="noopener" class="link-vermilion">抖音</a> 持续更新。
      </p>
    </header>

    <div v-if="videos === null" class="loading-panel clay-surface" role="status">加载中…</div>

    <ul v-else-if="videos.length" class="clay-grid" aria-label="视频列表">
      <li v-for="(video, index) in videos" :key="video.id" class="clay-list-item" v-reveal="index * 60">
        <a :href="video.url" target="_blank" rel="noopener" class="clay-card clay-surface clay-interactive"
          :class="TONES[index % TONES.length]">
          <div class="flex items-center justify-between gap-4 mb-5">
            <span class="clay-tag">{{ video.platform === 'bilibili' ? 'B站' : '抖音' }}</span>
            <time class="clay-tag font-code">{{ video.date }}</time>
          </div>
          <h2 class="text-xl font-black leading-snug mb-3 pr-5">{{ video.title }}</h2>
          <p v-if="video.desc" class="text-muted text-sm leading-relaxed">{{ video.desc }}</p>
          <span class="clay-button mt-6">观看视频 →</span>
        </a>
      </li>
    </ul>

    <p v-else class="empty-panel clay-surface clay-surface--green">视频整理中，先去 B站/抖音主页看看吧。</p>
  </main>
</template>
