<script setup>
import CountUp from '../CountUp.vue';
import { PROFILE } from '../../config';
import { useStats } from '../../composables/useStats';

const stats = useStats();
</script>

<template>
  <section class="story-track clay-surface clay-surface--pink" aria-labelledby="creator-heading" v-reveal="80">
    <div class="section-heading">
      <span class="section-index" style="background: var(--clay-pink)">02</span>
      <div class="section-heading-copy">
        <h2 id="creator-heading">视频创作</h2>
        <p>分享 AI、学习 AI，与诸君共进步。</p>
      </div>
    </div>

    <div class="creator-list">
      <article class="creator-card clay-surface">
        <div class="creator-heading">
          <img :src="stats.bili.face || PROFILE.biliAvatar" :alt="stats.bili.name" referrerpolicy="no-referrer">
          <div>
            <h3>{{ stats.bili.name }} <i v-if="stats.bili.live" class="live-dot ml-1" title="实时数据"></i></h3>
            <p class="text-sm mt-1">bilibili UP主 · Lv5</p>
          </div>
        </div>
        <p class="text-sm italic mt-4">「{{ stats.bili.sign }}」</p>
        <div class="creator-stats">
          <div><strong><CountUp :value="stats.bili.followers" /></strong><span>粉丝<span v-if="!stats.bili.live"> · 快照 {{ stats.updated }}</span></span></div>
          <div><strong>AI</strong><span>创作方向</span></div>
        </div>
        <p class="text-sm leading-relaxed">Agent 教程、AI 工具实测与开源构建日志，记录个人智能体从原型到长期协作系统的进化。</p>
        <a :href="PROFILE.bilibiliUrl" target="_blank" rel="noopener" class="clay-button clay-button--primary mt-5">▶ 访问 B站主页</a>
      </article>

      <article class="creator-card clay-surface clay-surface--yellow">
        <div class="creator-heading">
          <img src="/example/平台logo/抖音.png" alt="抖音">
          <div>
            <h3>小单说AI</h3>
            <p class="text-sm mt-1">抖音创作者</p>
          </div>
        </div>
        <div class="creator-stats">
          <div><strong class="text-lg">{{ PROFILE.douyinId }}</strong><span>抖音号</span></div>
          <div><strong>AGENT</strong><span>创作方向</span></div>
        </div>
        <p class="text-sm leading-relaxed">AI Agent 实践、工具观察与教程切片，在短视频里同步更新。</p>
        <a :href="PROFILE.douyinUrl" target="_blank" rel="noopener" class="clay-button clay-button--pink mt-5">♪ 访问抖音主页</a>
      </article>
    </div>
  </section>
</template>
