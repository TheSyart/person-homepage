<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue';
import { PROFILE } from '../../config';

defineProps({
  stats: { type: Object, required: true }
});

const avatarFailed = ref(false);
const squishing = ref(false);
const sparks = ref([]);
let squishTimer;
let sparkTimer;

const SPARK_COLORS = ['#bde0fe', '#ffd6e0', '#c8f7dc', '#fff1c9', '#d8c7ff'];

function activate() {
  clearTimeout(squishTimer);
  clearTimeout(sparkTimer);

  if (squishing.value) {
    squishing.value = false;
    nextTick(() => { squishing.value = true; });
  } else {
    squishing.value = true;
  }

  sparks.value = Array.from({ length: 18 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 18;
    const distance = 118 + (index % 4) * 18;
    return {
      id: `${Date.now()}-${index}`,
      style: {
        '--spark-x': `${Math.cos(angle) * distance}px`,
        '--spark-y': `${Math.sin(angle) * distance}px`,
        '--spark-rotate': `${index * 47}deg`,
        '--spark-delay': `${(index % 5) * 18}ms`,
        background: SPARK_COLORS[index % SPARK_COLORS.length]
      }
    };
  });

  squishTimer = setTimeout(() => { squishing.value = false; }, 620);
  sparkTimer = setTimeout(() => { sparks.value = []; }, 800);
}

onBeforeUnmount(() => {
  clearTimeout(squishTimer);
  clearTimeout(sparkTimer);
});
</script>

<template>
  <section class="agent-hero" aria-labelledby="home-title">
    <div class="agent-hero__inner site-shell">
      <div class="agent-hero__copy">
        <p class="agent-hero__eyebrow"><i aria-hidden="true"></i>OPEN-SOURCE AGENT BUILDER · CREATOR</p>
        <h1 id="home-title">把 AI <span>Agent 做活。</span></h1>
        <p class="agent-hero__intro">{{ PROFILE.tagline }}</p>
        <div class="agent-hero__actions">
          <router-link to="/agents" class="clay-button clay-button--primary">进入 Agent 实验室 <span aria-hidden="true">↗</span></router-link>
          <router-link to="/videos" class="clay-button">观看系列视频 <span aria-hidden="true">▶</span></router-link>
        </div>
      </div>

      <div class="agent-hero__visual" aria-label="动态粘土 Agent 核心">
        <div class="agent-halo" aria-hidden="true"></div>
        <div class="agent-orbit agent-orbit--one" aria-hidden="true"></div>
        <div class="agent-orbit agent-orbit--two" aria-hidden="true"></div>
        <span class="agent-satellite agent-satellite--stars"><strong>{{ stats.github.cae.stars }} ★</strong><small>CLAUDE AGENT</small></span>
        <span class="agent-satellite agent-satellite--memory"><strong>MEMORY</strong><small>长期记忆</small></span>
        <span class="agent-satellite agent-satellite--team"><strong>AGENT TEAM</strong><small>多智能体协作</small></span>
        <span class="agent-satellite agent-satellite--steps"><strong>12 STEPS</strong><small>从零实现</small></span>
        <button class="agent-core" :class="{ 'is-squishing': squishing }" type="button"
          aria-label="激活 Agent 粘土核心" @click="activate">
          <span class="agent-core__portrait">
            <img v-if="!avatarFailed" :src="PROFILE.githubAvatar" alt="小单说AI GitHub 头像" @error="avatarFailed = true">
            <b v-else aria-label="小单说AI 头像加载失败">单</b>
          </span>
          <span class="agent-core__label">CLICK TO ACTIVATE</span>
        </button>
        <i v-for="spark in sparks" :key="spark.id" class="clay-spark" :style="spark.style" aria-hidden="true"></i>
      </div>
    </div>
  </section>
</template>
