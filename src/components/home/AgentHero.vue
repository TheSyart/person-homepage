<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { PROFILE } from '../../config';

defineProps({
  stats: { type: Object, required: true }
});

const avatarFailed = ref(false);
const squishing = ref(false);
const sparks = ref([]);
const hero = ref(null);
const active = ref(true);
const parallaxStyle = ref({ '--pointer-x': '0px', '--pointer-y': '0px' });
let squishTimer;
let sparkTimer;
let observer;
let reducedMotion;

const SPARK_COLORS = ['#bde0fe', '#ffd6e0', '#c8f7dc', '#fff1c9', '#d8c7ff'];

function activate() {
  if (reducedMotion?.matches) {
    squishing.value = true;
    clearTimeout(squishTimer);
    squishTimer = setTimeout(() => { squishing.value = false; }, 180);
    return;
  }
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

function updateParallax(event) {
  if (!active.value || reducedMotion?.matches || event.pointerType === 'touch') return;
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = Math.round((((event.clientX - rect.left) / rect.width) - .5) * 36);
  const y = Math.round((((event.clientY - rect.top) / rect.height) - .5) * 28);
  parallaxStyle.value = { '--pointer-x': `${x}px`, '--pointer-y': `${y}px` };
}

function resetParallax() {
  parallaxStyle.value = { '--pointer-x': '0px', '--pointer-y': '0px' };
}

onMounted(() => {
  reducedMotion = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  if (typeof IntersectionObserver !== 'function') return;
  observer = new IntersectionObserver(([entry]) => {
    active.value = entry.isIntersecting;
    if (!active.value) resetParallax();
  }, { threshold: .08 });
  if (hero.value) observer.observe(hero.value);
});

onBeforeUnmount(() => {
  clearTimeout(squishTimer);
  clearTimeout(sparkTimer);
  observer?.disconnect();
});
</script>

<template>
  <section ref="hero" class="agent-hero" :class="{ 'is-paused': !active }" aria-labelledby="home-title" @pointermove="updateParallax" @pointerleave="resetParallax">
    <div class="agent-hero__inner site-shell">
      <div class="agent-hero__copy">
        <p class="agent-hero__eyebrow"><i aria-hidden="true"></i>OPEN-SOURCE AGENT BUILDER · CREATOR</p>
        <h1 id="home-title">你好，我是小单。</h1>
        <p class="agent-hero__intro">我做开源 Agent，也把实现过程拍成视频。现在正从零拆解记忆、规划、工具与多代理协作，让 AI 真正把任务做完。</p>
        <div class="agent-hero__actions">
          <router-link to="/agents" class="clay-button clay-button--primary">看 9 期 Agent 系列 <span aria-hidden="true">↗</span></router-link>
          <a :href="PROFILE.githubUrl" target="_blank" rel="noopener" class="clay-button">打开 GitHub <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div class="agent-hero__visual" :style="parallaxStyle" aria-label="动态粘土 Agent 核心">
        <div class="agent-halo" aria-hidden="true"></div>
        <div class="agent-orbit agent-orbit--one" aria-hidden="true"></div>
        <div class="agent-orbit agent-orbit--two" aria-hidden="true"></div>
        <span class="agent-satellite agent-satellite--stars"><strong>{{ stats.github.totalStars }} ★</strong><small>GITHUB</small></span>
        <span class="agent-satellite agent-satellite--memory"><strong>{{ stats.bili.followers }}</strong><small>BILIBILI</small></span>
        <span class="agent-satellite agent-satellite--team"><strong>{{ stats.douyin.followers || '1990' }}</strong><small>DOUYIN</small></span>
        <span class="agent-satellite agent-satellite--steps"><strong>9 EPISODES</strong><small>BUILD AGENT</small></span>
        <button class="agent-core" :class="{ 'is-squishing': squishing }" type="button"
          aria-label="激活 Agent 粘土核心" @click="activate">
          <img class="agent-core__shell" src="/assets/clay/agent-core.png" alt="" aria-hidden="true">
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
