<script setup>
import CountUp from '../CountUp.vue';
import { FEATURED_REPOS } from '../../config';

defineProps({
  stats: { type: Object, required: true }
});
</script>

<template>
  <section class="home-section site-shell" aria-labelledby="featured-agent-title">
    <div class="section-heading" v-reveal>
      <span class="section-index">02</span>
      <div class="section-heading-copy">
        <h2 id="featured-agent-title">不只讲 Agent，也把它做出来</h2>
        <p>一个项目拆解原理，一个项目把能力装进长期工作的个人空间。</p>
      </div>
    </div>

    <ul class="featured-agent-grid" aria-label="旗舰 Agent 项目">
      <li v-for="(repo, index) in FEATURED_REPOS" :key="repo.key" data-featured-agent-project v-reveal="index * 70">
        <a :href="repo.url" target="_blank" rel="noopener" class="featured-agent-card clay-surface clay-interactive"
          :class="index === 0 ? 'clay-surface--blue' : 'clay-surface--pink'">
          <div class="card-topline">
            <span class="clay-tag">{{ index === 0 ? 'TEACH' : 'BUILD' }}</span>
            <span>{{ repo.lang }}</span>
          </div>
          <h3>{{ repo.name }}</h3>
          <p>{{ repo.desc }}</p>
          <div class="repo-meta">
            <span>★ <CountUp :value="stats.github[repo.key].stars" /></span>
            <span>⑂ <CountUp :value="stats.github[repo.key].forks" /></span>
            <span aria-hidden="true">访问项目 ↗</span>
          </div>
        </a>
      </li>
    </ul>
  </section>
</template>
