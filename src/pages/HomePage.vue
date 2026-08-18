<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CountUp from '../components/CountUp.vue';
import SealLogo from '../components/SealLogo.vue';
import GithubShowcase from '../components/home/GithubShowcase.vue';
import VideoShowcase from '../components/home/VideoShowcase.vue';
import AboutFull from '../components/home/AboutFull.vue';
import PlatformLinks from '../components/home/PlatformLinks.vue';
import ContactCards from '../components/home/ContactCards.vue';
import { PROFILE } from '../config';
import { useStats } from '../composables/useStats';

const stats = useStats();
const avatarFailed = ref(false);

const typed = ref('');
let ri = 0;
let ci = 0;
let deleting = false;
let timer = null;

function tick() {
  const word = PROFILE.roles[ri];
  if (!deleting) {
    ci += 1;
    typed.value = word.slice(0, ci);
    if (ci === word.length) {
      deleting = true;
      timer = setTimeout(tick, 1700);
      return;
    }
  } else {
    ci -= 1;
    typed.value = word.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      ri = (ri + 1) % PROFILE.roles.length;
    }
  }
  timer = setTimeout(tick, deleting ? 55 : 130);
}

const articles = ref([]);
const videos = ref([]);
const contentReady = ref(false);

onMounted(async () => {
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    typed.value = PROFILE.roles[0];
  } else {
    timer = setTimeout(tick, 600);
  }
  try {
    const [articleResponse, videoResponse] = await Promise.all([
      fetch('/api/articles').then((response) => response.json()),
      fetch('/api/videos').then((response) => response.json())
    ]);
    if (Array.isArray(articleResponse)) articles.value = articleResponse.slice(0, 3);
    if (Array.isArray(videoResponse)) videos.value = videoResponse.slice(0, 3);
  } catch {
    // API 未就绪时使用页面内的空状态，其他静态资料仍完整可见。
  }
  contentReady.value = true;
});

onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <main class="home-main site-shell">
    <section class="hero-story" aria-labelledby="home-title">
      <div class="hero-portrait" v-reveal>
        <div class="hero-avatar-shell">
          <img v-if="!avatarFailed" :src="PROFILE.githubAvatar" alt="小单说AI GitHub 头像"
            class="hero-avatar" @error="avatarFailed = true">
          <div v-else class="hero-avatar grid place-items-center text-7xl font-black" aria-label="小单说AI 头像加载失败">单</div>
        </div>
        <div class="hero-seal"><SealLogo /></div>
      </div>

      <div class="hero-copy">
        <p class="hero-kicker" v-reveal="40">XIAODAN TALKS AI</p>
        <h1 id="home-title" class="hero-title" v-reveal="90">我是<br>小单说AI</h1>
        <p class="hero-role" v-reveal="140">
          一名<span>{{ typed }}</span><span class="animate-caretBlink" aria-hidden="true">|</span>
        </p>
        <p class="hero-tagline" v-reveal="190">{{ PROFILE.tagline }}</p>
        <div class="hero-actions" v-reveal="240">
          <router-link to="/articles" class="clay-button clay-button--primary">读我的文章</router-link>
          <router-link to="/messages" class="clay-button clay-button--pink">给我留言</router-link>
        </div>
      </div>
    </section>

    <ul class="achievement-tray" aria-label="个人成就" v-reveal>
      <li>
        <a :href="PROFILE.githubUrl" target="_blank" rel="noopener"
          class="achievement clay-surface clay-surface--blue clay-interactive">
          <strong class="achievement-value"><CountUp :value="stats.github.totalStars" suffix="+" /></strong>
          <span class="achievement-label">GitHub Stars <i v-if="stats.github.live" class="live-dot ml-2" title="实时数据"></i></span>
        </a>
      </li>
      <li>
        <a :href="PROFILE.bilibiliUrl" target="_blank" rel="noopener"
          class="achievement clay-surface clay-surface--pink clay-interactive">
          <strong class="achievement-value"><CountUp :value="stats.bili.followers" /></strong>
          <span class="achievement-label">B站粉丝 <i v-if="stats.bili.live" class="live-dot ml-2" title="实时数据"></i></span>
        </a>
      </li>
      <li>
        <a :href="PROFILE.douyinUrl" target="_blank" rel="noopener"
          class="achievement clay-surface clay-surface--green clay-interactive">
          <strong class="achievement-value"><CountUp :value="stats.douyin.followers" /></strong>
          <span class="achievement-label">抖音粉丝 · {{ stats.updated }} 更新</span>
        </a>
      </li>
      <li>
        <div class="achievement clay-surface clay-surface--yellow">
          <strong class="achievement-value achievement-identity">{{ PROFILE.identity }}</strong>
          <span class="achievement-label">{{ PROFILE.hobby }}</span>
        </div>
      </li>
    </ul>

    <div class="story-grid">
      <GithubShowcase />
      <VideoShowcase />
    </div>

    <section class="content-showcase" aria-labelledby="content-heading">
      <div class="section-heading" v-reveal>
        <span class="section-index">03</span>
        <div class="section-heading-copy">
          <h2 id="content-heading">最近更新</h2>
          <p>文章与视频，记录我正在做的事。</p>
        </div>
        <span class="section-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>

      <div class="content-showcase-grid">
        <div class="content-column clay-surface clay-surface--yellow" v-reveal="50">
          <div class="card-topline mb-5">
            <h3 class="text-xl font-black">最新文章</h3>
            <router-link to="/articles" class="link-vermilion text-sm">全部文章</router-link>
          </div>
          <div v-if="articles.length" class="content-column-list">
            <router-link v-for="article in articles" :key="article.slug" :to="`/articles/${article.slug}`" class="content-row">
              <h3>{{ article.title }}</h3>
              <time>{{ article.date }}</time>
              <p class="mt-2">{{ article.summary }}</p>
            </router-link>
          </div>
          <p v-else class="empty-panel">{{ contentReady ? '文章整理中，先来看看视频吧。' : '加载中…' }}</p>
        </div>

        <div class="content-column clay-surface clay-surface--green" v-reveal="100">
          <div class="card-topline mb-5">
            <h3 class="text-xl font-black">最新视频</h3>
            <router-link to="/videos" class="link-vermilion text-sm">全部视频</router-link>
          </div>
          <div v-if="videos.length" class="content-column-list">
            <a v-for="video in videos" :key="video.id" :href="video.url" target="_blank" rel="noopener" class="content-row">
              <div class="card-topline">
                <span class="clay-tag">{{ video.platform === 'bilibili' ? 'B站' : '抖音' }}</span>
                <time>{{ video.date }}</time>
              </div>
              <h3 class="mt-3">{{ video.title }}</h3>
            </a>
          </div>
          <p v-else class="empty-panel">{{ contentReady ? '视频整理中。' : '加载中…' }}</p>
        </div>
      </div>
    </section>

    <AboutFull />
    <PlatformLinks />
    <ContactCards />
  </main>
</template>
