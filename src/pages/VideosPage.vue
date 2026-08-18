<script setup>
import { ref, onMounted } from 'vue';
import { PROFILE } from '../config';

const videos = ref(null);
const playing = ref({});
const playerErrors = ref({});
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

async function play(video) {
  playerErrors.value[video.bvid] = '';
  try {
    const response = await fetch(`/api/videos/${video.bvid}/play`);
    const data = await response.json();
    if (!response.ok || !data.url) throw new Error(data.error || '临时播放地址不可用');
    playing.value[video.bvid] = data.url;
  } catch (error) {
    playerErrors.value[video.bvid] = error.message;
  }
}

function compact(value) {
  const number = Number(value || 0);
  return number >= 10000 ? `${(number / 10000).toFixed(1)}万` : new Intl.NumberFormat('zh-CN').format(number);
}
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
        <article class="video-card clay-surface" :class="TONES[index % TONES.length]" data-video-card>
          <div class="video-card__media">
            <video v-if="playing[video.bvid]" :src="playing[video.bvid]" :poster="video.cover" controls playsinline preload="metadata"></video>
            <template v-else><img :src="video.cover" :alt="`${video.title} 视频封面`" loading="lazy" referrerpolicy="no-referrer"><button type="button" data-play-video :aria-label="`站内播放：${video.title}`" @click="play(video)"><span aria-hidden="true">▶</span></button><span class="video-card__duration">{{ video.duration }}</span></template>
          </div>
          <div class="video-card__body">
            <div class="flex items-center justify-between gap-4 mb-4"><span class="clay-tag">B站</span><time class="clay-tag font-code">{{ video.date }}</time></div>
            <h2>{{ video.title }}</h2>
            <p v-if="video.desc">{{ video.desc }}</p>
            <p v-if="playerErrors[video.bvid]" class="video-card__error" role="status">{{ playerErrors[video.bvid] }}</p>
            <div class="video-card__footer"><span>{{ compact(video.stats?.view) }} 播放 · {{ compact(video.stats?.like) }} 赞</span><a :href="video.pageUrl || video.url" target="_blank" rel="noopener" class="clay-button clay-button--small">去 B站观看 ↗</a></div>
          </div>
        </article>
      </li>
    </ul>

    <p v-else class="empty-panel clay-surface clay-surface--green">视频整理中，先去 B站/抖音主页看看吧。</p>
  </main>
</template>
