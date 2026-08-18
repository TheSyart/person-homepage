<script setup>
import { onMounted, ref } from 'vue';
import AgentHero from '../components/home/AgentHero.vue';
import FeaturedAgentProjects from '../components/home/FeaturedAgentProjects.vue';
import LatestSignals from '../components/home/LatestSignals.vue';
import ProofStrip from '../components/home/ProofStrip.vue';
import { useStats } from '../composables/useStats';

const stats = useStats();
const articles = ref([]);
const videos = ref([]);
const contentReady = ref(false);

onMounted(async () => {
  try {
    const [articleResponse, videoResponse] = await Promise.all([
      fetch('/api/articles').then((response) => response.json()),
      fetch('/api/videos').then((response) => response.json())
    ]);
    if (Array.isArray(articleResponse)) articles.value = articleResponse.slice(0, 2);
    if (Array.isArray(videoResponse)) videos.value = videoResponse.slice(0, 2);
  } catch {
    // 每条内容轨道会显示自己的空状态，Hero 与静态资料不受 API 失败影响。
  }
  contentReady.value = true;
});
</script>

<template>
  <main class="home-main">
    <AgentHero :stats="stats" />
    <ProofStrip :stats="stats" />
    <FeaturedAgentProjects :stats="stats" />
    <LatestSignals :articles="articles" :videos="videos" :ready="contentReady" />

    <nav class="home-paths site-shell" aria-label="继续探索">
      <router-link to="/agents" class="home-path clay-surface clay-surface--blue clay-interactive">
        <span>01</span><strong>Agent 实验室</strong><small>项目、路线与工程能力</small>
      </router-link>
      <router-link to="/about" class="home-path clay-surface clay-surface--yellow clay-interactive">
        <span>02</span><strong>关于小单</strong><small>经历、生活与联系方式</small>
      </router-link>
      <router-link to="/articles" class="home-path clay-surface clay-surface--pink clay-interactive">
        <span>03</span><strong>文章</strong><small>完整的思考与实践记录</small>
      </router-link>
      <router-link to="/videos" class="home-path clay-surface clay-surface--green clay-interactive">
        <span>04</span><strong>视频</strong><small>把 Agent 一步步讲清楚</small>
      </router-link>
    </nav>
  </main>
</template>
