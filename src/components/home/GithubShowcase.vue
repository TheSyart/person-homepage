<script setup>
import CountUp from '../CountUp.vue';
import { PROFILE, FEATURED_REPOS, OTHER_REPOS } from '../../config';
import { useStats } from '../../composables/useStats';

const stats = useStats();
</script>

<template>
  <section class="py-16 border-b hairline">
    <div class="flex items-end justify-between mb-8" v-reveal>
      <div>
        <h2 class="font-serifSc text-3xl font-bold mb-2">开源项目</h2>
        <p class="text-muted text-sm">
          github.com/TheSyart ·
          <span v-if="stats.github.live" class="text-vermilion"><span class="live-dot mr-1"></span>实时数据</span>
          <span v-else>数据快照 {{ stats.updated }}</span>
        </p>
      </div>
      <a :href="PROFILE.githubReposUrl" target="_blank" rel="noopener" class="link-vermilion text-sm">全部仓库</a>
    </div>

    <!-- 账号统计条 -->
    <div class="flex flex-wrap items-center gap-x-12 gap-y-4 mb-8 border hairline rounded-lg bg-card px-7 py-5" v-reveal="60">
      <img :src="PROFILE.githubAvatar" alt="TheSyart" class="w-12 h-12 rounded-full border hairline">
      <div>
        <p class="font-bold">TheSyart</p>
        <p class="text-xs text-faint">2023 年加入 GitHub</p>
      </div>
      <div class="flex gap-10 ml-auto text-center">
        <div>
          <p class="text-2xl font-bold font-code"><CountUp :value="stats.github.repos" /></p>
          <p class="text-xs text-faint mt-0.5">公开仓库</p>
        </div>
        <div>
          <p class="text-2xl font-bold font-code"><CountUp :value="stats.github.followers" /></p>
          <p class="text-xs text-faint mt-0.5">关注者</p>
        </div>
        <div>
          <p class="text-2xl font-bold font-code text-vermilion"><CountUp :value="stats.github.totalStars" suffix="+" /></p>
          <p class="text-xs text-faint mt-0.5">累计 Star</p>
        </div>
      </div>
    </div>

    <!-- 双明星项目卡 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <a v-for="(repo, i) in FEATURED_REPOS" :key="repo.key" :href="repo.url" target="_blank" rel="noopener"
        class="group border hairline rounded-lg bg-card p-6 hover:border-vermilion/50 transition-colors" v-reveal="i * 100">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="font-bold text-lg font-code group-hover:text-vermilion transition-colors">{{ repo.name }}</p>
            <p class="text-xs text-muted flex items-center gap-1.5 mt-1">
              <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ background: repo.langColor }"></span>{{ repo.lang }}
            </p>
          </div>
          <span class="text-xs font-medium bg-vermilion/10 text-vermilion px-2.5 py-1 rounded-full">🔥 热门</span>
        </div>
        <p class="text-muted text-sm leading-relaxed mb-5">{{ repo.desc }}</p>
        <div class="flex items-center gap-6 text-sm text-muted">
          <span>★ <b class="text-ink font-code text-base"><CountUp :value="stats.github[repo.key].stars" /></b></span>
          <span>⑂ <b class="text-ink font-code text-base"><CountUp :value="stats.github[repo.key].forks" /></b></span>
        </div>
      </a>
    </div>

    <!-- 其他仓库 -->
    <div class="flex flex-wrap gap-2.5" v-reveal>
      <a v-for="[name, lang, stars] in OTHER_REPOS" :key="name"
        :href="`https://github.com/TheSyart/${name}`" target="_blank" rel="noopener"
        class="inline-flex items-center gap-2 text-sm border hairline bg-card hover:border-vermilion/50 hover:text-vermilion rounded-full px-4 py-1.5 transition-colors">
        <span class="font-code">{{ name }}</span>
        <span class="text-xs text-faint">{{ lang }} · ★{{ stars }}</span>
      </a>
    </div>
  </section>
</template>
