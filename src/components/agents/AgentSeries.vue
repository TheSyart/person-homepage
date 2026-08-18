<script setup>
import { computed, onMounted, ref } from 'vue';
import { AGENT_SERIES } from '../../config';

const videos = ref(null);

onMounted(async () => {
  try {
    const response = await fetch('/api/videos?series=from-zero-agent');
    const data = await response.json();
    videos.value = Array.isArray(data) ? data : [];
  } catch {
    videos.value = [];
  }
});

const episodes = computed(() => {
  if (!Array.isArray(videos.value)) return null;
  return AGENT_SERIES.map((chapter) => {
    const video = videos.value.find((item) => item.bvid === chapter.bvid || item.episode === chapter.episode);
    return video ? { ...video, ...chapter, title: video.title || `从零实现自己的 Agent 第 ${chapter.episode} 期` } : null;
  }).filter(Boolean);
});

function compact(value) {
  const number = Number(value || 0);
  if (number >= 10000) return `${(number / 10000).toFixed(number >= 100000 ? 0 : 1)}万`;
  return new Intl.NumberFormat('zh-CN').format(number);
}
</script>

<template>
  <section class="agent-series" aria-labelledby="agent-series-title">
    <div class="section-heading" v-reveal>
      <span class="section-index">01</span>
      <div class="section-heading-copy">
        <h2 id="agent-series-title">从零实现自己的 Agent</h2>
        <p>九期不是功能清单，而是一条逐层搭建的代码路线。每一期都有对应视频和可直接查看的仓库资源。</p>
      </div>
    </div>

    <div v-if="episodes === null" class="loading-panel clay-surface" role="status">正在读取系列视频…</div>
    <ol v-else-if="episodes.length" class="agent-episode-list">
      <li v-for="(episode, index) in episodes" :key="episode.bvid" class="agent-episode clay-surface" data-agent-episode v-reveal="index * 45">
        <a :href="episode.pageUrl || episode.url" target="_blank" rel="noopener" class="agent-episode__cover">
          <img :src="episode.cover" :alt="`${episode.title} 视频封面`" loading="lazy" referrerpolicy="no-referrer">
          <span>EP {{ String(episode.episode).padStart(2, '0') }}</span>
          <i aria-hidden="true">▶</i>
        </a>
        <div class="agent-episode__content">
          <div class="agent-episode__meta"><span>第 {{ episode.episode }} 期</span><span>{{ episode.duration || '—' }}</span><span>{{ compact(episode.stats?.view) }} 播放</span></div>
          <h3>{{ episode.title }}</h3>
          <p>{{ episode.summary }}</p>
          <div class="agent-episode__links">
            <a :href="episode.pageUrl || episode.url" target="_blank" rel="noopener" class="clay-button clay-button--small">B站观看 ↗</a>
            <a :href="episode.resourceUrl" target="_blank" rel="noopener" class="clay-button clay-button--small">{{ episode.resourceLabel }} ↗</a>
          </div>
        </div>
      </li>
    </ol>
    <p v-else class="empty-panel clay-surface clay-surface--pink">系列数据正在同步，请稍后刷新。</p>
  </section>
</template>
