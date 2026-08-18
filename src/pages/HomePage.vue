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

/* 打字机 */
const typed = ref('');
let ri = 0, ci = 0, deleting = false, timer = null;
function tick() {
  const word = PROFILE.roles[ri];
  if (!deleting) {
    ci++;
    typed.value = word.slice(0, ci);
    if (ci === word.length) { deleting = true; timer = setTimeout(tick, 1700); return; }
  } else {
    ci--;
    typed.value = word.slice(0, ci);
    if (ci === 0) { deleting = false; ri = (ri + 1) % PROFILE.roles.length; }
  }
  timer = setTimeout(tick, deleting ? 55 : 130);
}

/* 最新文章/视频（运行时 API） */
const articles = ref([]);
const videos = ref([]);
const contentReady = ref(false);

onMounted(async () => {
  timer = setTimeout(tick, 600);
  try {
    const [a, v] = await Promise.all([
      fetch('/api/articles').then((r) => r.json()),
      fetch('/api/videos').then((r) => r.json())
    ]);
    if (Array.isArray(a)) articles.value = a.slice(0, 3);
    if (Array.isArray(v)) videos.value = v.slice(0, 3);
  } catch { /* API 未就绪时静默 */ }
  contentReady.value = true;
});
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div class="max-w-4xl mx-auto px-6">

    <!-- ═══ 1. 编辑式 Hero ═══ -->
    <section class="pt-20 pb-16 border-b hairline">
      <div class="flex items-center gap-4 mb-10" v-reveal>
        <SealLogo />
        <span class="text-xs tracking-[.35em] text-faint">XIAODAN TALKS AI</span>
      </div>

      <h1 class="font-serifSc text-5xl md:text-7xl font-bold leading-[1.15] mb-6" v-reveal="60">
        我是小单说AI，<br>
        一名<span class="text-vermilion">{{ typed }}</span><span class="animate-caretBlink text-vermilion">|</span>
      </h1>

      <p class="text-muted leading-loose max-w-2xl mb-10" v-reveal="140">
        {{ PROFILE.tagline }}
      </p>

      <!-- 2. 实时数据排版行 -->
      <div class="flex flex-wrap items-center gap-x-10 gap-y-4 mb-12 text-[15px]" v-reveal="220">
        <a :href="PROFILE.githubUrl" target="_blank" rel="noopener" class="group flex items-baseline gap-2">
          <b class="font-code text-2xl text-ink group-hover:text-vermilion transition-colors">
            <CountUp :value="stats.github.totalStars" suffix="+" />
          </b>
          <span class="text-muted">GitHub Stars</span>
          <span v-if="stats.github.live" class="live-dot" title="实时"></span>
        </a>
        <a :href="PROFILE.bilibiliUrl" target="_blank" rel="noopener" class="group flex items-baseline gap-2">
          <b class="font-code text-2xl text-ink group-hover:text-vermilion transition-colors">
            <CountUp :value="stats.bili.followers" />
          </b>
          <span class="text-muted">B站粉丝</span>
          <span v-if="stats.bili.live" class="live-dot" title="实时"></span>
        </a>
        <a :href="PROFILE.douyinUrl" target="_blank" rel="noopener" class="group flex items-baseline gap-2">
          <b class="font-code text-2xl text-ink group-hover:text-vermilion transition-colors">
            <CountUp :value="stats.douyin.followers" />
          </b>
          <span class="text-muted">抖音粉丝</span>
        </a>
      </div>

      <div class="flex flex-wrap gap-4" v-reveal="300">
        <router-link to="/articles"
          class="inline-flex items-center bg-vermilion hover:bg-vermilionDark text-paper font-medium px-7 py-3 rounded transition-colors">
          读我的文章
        </router-link>
        <router-link to="/messages"
          class="inline-flex items-center border hairline hover:border-vermilion hover:text-vermilion text-ink font-medium px-7 py-3 rounded bg-card transition-colors">
          给我留言
        </router-link>
      </div>
    </section>

    <!-- 3. 开源项目精选（GitHub 实时） -->
    <GithubShowcase />

    <!-- 4. 视频创作双卡（B站实时 / 抖音动态） -->
    <VideoShowcase />

    <!-- 5. 最新文章 -->
    <section class="py-16 border-b hairline">
      <div class="flex items-end justify-between mb-8" v-reveal>
        <h2 class="font-serifSc text-3xl font-bold">最新文章</h2>
        <router-link to="/articles" class="link-vermilion text-sm">全部文章</router-link>
      </div>
      <div v-if="articles.length">
        <router-link v-for="a in articles" :key="a.slug" :to="`/articles/${a.slug}`"
          class="block group py-5 border-b hairline last:border-0" v-reveal>
          <div class="flex items-baseline justify-between gap-4">
            <h3 class="font-serifSc text-xl font-bold group-hover:text-vermilion transition-colors">{{ a.title }}</h3>
            <time class="text-faint text-sm font-code shrink-0">{{ a.date }}</time>
          </div>
          <p class="text-muted text-sm mt-2 leading-relaxed">{{ a.summary }}</p>
        </router-link>
      </div>
      <p v-else class="text-faint text-sm py-6" v-reveal>{{ contentReady ? '文章整理中，先来看看视频吧。' : '加载中…' }}</p>
    </section>

    <!-- 6. 最新视频 -->
    <section class="py-16 border-b hairline">
      <div class="flex items-end justify-between mb-8" v-reveal>
        <h2 class="font-serifSc text-3xl font-bold">最新视频</h2>
        <router-link to="/videos" class="link-vermilion text-sm">全部视频</router-link>
      </div>
      <div v-if="videos.length" class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <a v-for="v in videos" :key="v.id" :href="v.url" target="_blank" rel="noopener"
          class="group border hairline rounded-lg p-5 bg-card hover:border-vermilion/50 transition-colors" v-reveal>
          <span class="inline-block text-xs px-2 py-0.5 rounded mb-3"
            :class="v.platform === 'bilibili' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-600'">
            {{ v.platform === 'bilibili' ? 'B站' : '抖音' }}
          </span>
          <h3 class="font-bold leading-snug group-hover:text-vermilion transition-colors">{{ v.title }}</h3>
          <time class="text-faint text-xs font-code mt-3 block">{{ v.date }}</time>
        </a>
      </div>
      <p v-else class="text-faint text-sm py-6" v-reveal>{{ contentReady ? '视频整理中。' : '加载中…' }}</p>
    </section>

    <!-- 7-10. 关于我完整版 / 技能墙 / 校园照片 / 兴趣爱好 -->
    <AboutFull />

    <!-- 11. 更多平台 -->
    <PlatformLinks />

    <!-- 12. 联系我 -->
    <ContactCards />
  </div>
</template>
