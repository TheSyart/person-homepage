<script setup>
defineProps({
  articles: { type: Array, required: true },
  videos: { type: Array, required: true },
  ready: { type: Boolean, required: true }
});
</script>

<template>
  <section class="home-section site-shell" aria-labelledby="latest-signals-title">
    <div class="section-heading" v-reveal>
      <span class="section-index" style="background: var(--clay-green)">03</span>
      <div class="section-heading-copy">
        <h2 id="latest-signals-title">最新信号</h2>
        <p>最近写下的文章，以及正在更新的视频。</p>
      </div>
    </div>

    <div class="latest-signals clay-surface">
      <section aria-labelledby="latest-articles-title">
        <div class="card-topline">
          <h3 id="latest-articles-title">文章</h3>
          <router-link to="/articles">全部文章</router-link>
        </div>
        <ul v-if="articles.length" aria-label="最新文章">
          <li v-for="article in articles" :key="article.slug" data-latest-article>
            <router-link :to="`/articles/${article.slug}`">
              <time>{{ article.date }}</time>
              <strong>{{ article.title }}</strong>
              <span>{{ article.summary }}</span>
            </router-link>
          </li>
        </ul>
        <p v-else class="empty-panel">{{ ready ? '文章整理中。' : '加载中…' }}</p>
      </section>

      <section aria-labelledby="latest-videos-title">
        <div class="card-topline">
          <h3 id="latest-videos-title">视频</h3>
          <router-link to="/videos">全部视频</router-link>
        </div>
        <ul v-if="videos.length" aria-label="最新视频">
          <li v-for="video in videos" :key="video.id" data-latest-video>
            <a :href="video.url" target="_blank" rel="noopener">
              <time>{{ video.date }}</time>
              <strong>{{ video.title }}</strong>
              <span>{{ video.desc }}</span>
            </a>
          </li>
        </ul>
        <p v-else class="empty-panel">{{ ready ? '视频整理中。' : '加载中…' }}</p>
      </section>
    </div>
  </section>
</template>
