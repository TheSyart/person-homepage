<script setup>
import CountUp from '../CountUp.vue';
import { PROFILE, FEATURED_REPOS, OTHER_REPOS } from '../../config';
import { useStats } from '../../composables/useStats';

const stats = useStats();
</script>

<template>
  <section class="story-track clay-surface clay-surface--blue" aria-labelledby="github-heading" v-reveal>
    <div class="section-heading">
      <span class="section-index">01</span>
      <div class="section-heading-copy">
        <h2 id="github-heading">开源项目</h2>
        <p>
          github.com/TheSyart ·
          <span v-if="stats.github.live"><i class="live-dot mr-1"></i>实时数据</span>
          <span v-else>数据快照 {{ stats.updated }}</span>
        </p>
      </div>
    </div>

    <div class="account-card clay-surface">
      <img :src="PROFILE.githubAvatar" alt="TheSyart GitHub 头像">
      <div>
        <p class="font-black text-lg">TheSyart</p>
        <p class="text-xs text-muted">2023 年加入 GitHub</p>
        <a :href="PROFILE.githubReposUrl" target="_blank" rel="noopener" class="link-vermilion text-xs mt-2 inline-block">全部仓库</a>
      </div>
      <div class="account-stats">
        <div class="account-stat"><strong><CountUp :value="stats.github.repos" /></strong><span>公开仓库</span></div>
        <div class="account-stat"><strong><CountUp :value="stats.github.followers" /></strong><span>关注者</span></div>
        <div class="account-stat"><strong><CountUp :value="stats.github.totalStars" suffix="+" /></strong><span>累计 Star</span></div>
      </div>
    </div>

    <div class="repo-list">
      <a v-for="repo in FEATURED_REPOS" :key="repo.key" :href="repo.url" target="_blank" rel="noopener"
        class="repo-card clay-surface clay-interactive">
        <div class="card-topline">
          <div>
            <h3 class="font-code">{{ repo.name }}</h3>
            <p class="text-xs mt-1 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ background: repo.langColor }"></span>{{ repo.lang }}
            </p>
          </div>
          <span class="clay-tag">🔥 热门</span>
        </div>
        <p class="text-sm leading-relaxed my-4">{{ repo.desc }}</p>
        <div class="repo-meta text-sm">
          <span>★ <b class="font-code"><CountUp :value="stats.github[repo.key].stars" /></b></span>
          <span>⑂ <b class="font-code"><CountUp :value="stats.github[repo.key].forks" /></b></span>
        </div>
      </a>
    </div>

    <div class="other-repos" aria-label="其他 GitHub 仓库">
      <a v-for="[name, lang, stars] in OTHER_REPOS" :key="name" :href="`https://github.com/TheSyart/${name}`"
        target="_blank" rel="noopener" class="other-repo clay-pill">
        <span class="font-code">{{ name }}</span><span class="text-faint">{{ lang }} · ★{{ stars }}</span>
      </a>
    </div>
  </section>
</template>
