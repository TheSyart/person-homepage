<script setup>
import CountUp from '../CountUp.vue';
import { PROFILE } from '../../config';
import { useStats } from '../../composables/useStats';

const stats = useStats();
</script>

<template>
  <section class="py-16 border-b hairline">
    <h2 class="font-serifSc text-3xl font-bold mb-2" v-reveal>视频创作</h2>
    <p class="text-muted text-sm mb-8" v-reveal="60">分享 AI、学习 AI，与诸君共进步。</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- B站卡（全资料实时） -->
      <div class="border hairline rounded-lg bg-card p-7" v-reveal>
        <div class="flex items-center gap-4 mb-5">
          <img :src="stats.bili.face || PROFILE.biliAvatar" :alt="stats.bili.name" referrerpolicy="no-referrer"
            class="w-16 h-16 rounded-full border hairline object-cover">
          <div>
            <p class="font-bold text-lg flex items-center gap-2">
              {{ stats.bili.name }}
              <span v-if="stats.bili.live" class="live-dot" title="实时数据"></span>
            </p>
            <p class="text-sm text-sky-700">bilibili UP主 · Lv5</p>
          </div>
        </div>
        <p class="text-sm text-muted italic mb-6">「{{ stats.bili.sign }}」</p>
        <div class="flex gap-12 mb-6">
          <div>
            <p class="text-3xl font-bold font-code text-ink"><CountUp :value="stats.bili.followers" /></p>
            <p class="text-xs text-faint mt-1">粉丝<span v-if="!stats.bili.live"> · 快照 {{ stats.updated }}</span></p>
          </div>
          <div>
            <p class="text-3xl font-bold text-ink">AI</p>
            <p class="text-xs text-faint mt-1">创作方向</p>
          </div>
        </div>
        <p class="text-sm text-muted leading-relaxed mb-6">技术教程、AI 工具实测、编程日常，记录大学生程序员的成长。</p>
        <a :href="PROFILE.bilibiliUrl" target="_blank" rel="noopener"
          class="inline-flex items-center gap-2 text-sm font-medium text-paper bg-sky-600 hover:bg-sky-700 px-5 py-2.5 rounded transition-colors">
          ▶ 访问 B站主页
        </a>
      </div>

      <!-- 抖音卡 -->
      <div class="border hairline rounded-lg bg-card p-7" v-reveal="100">
        <div class="flex items-center gap-4 mb-5">
          <img src="/example/平台logo/抖音.png" alt="抖音" class="w-12 h-12">
          <div>
            <p class="font-bold text-lg">小单说AI</p>
            <p class="text-sm text-rose-600">抖音创作者</p>
          </div>
        </div>
        <div class="h-[3.75rem] mb-6"></div>
        <div class="flex gap-12 mb-6">
          <div>
            <p class="text-3xl font-bold font-code text-ink"><CountUp :value="stats.douyin.followers" /></p>
            <p class="text-xs text-faint mt-1">粉丝 · {{ stats.updated }} 更新</p>
          </div>
          <div>
            <p class="text-xl font-bold font-code text-ink mt-1.5">{{ PROFILE.douyinId }}</p>
            <p class="text-xs text-faint mt-1">抖音号</p>
          </div>
        </div>
        <p class="text-sm text-muted leading-relaxed mb-6">AI 工具实测、编程技巧分享，用短视频让技术更简单。</p>
        <a :href="PROFILE.douyinUrl" target="_blank" rel="noopener"
          class="inline-flex items-center gap-2 text-sm font-medium text-ink border hairline hover:border-rose-400 hover:text-rose-600 px-5 py-2.5 rounded bg-paper transition-colors">
          ♪ 访问抖音主页
        </a>
      </div>
    </div>
  </section>
</template>
