<script setup>
import CountUp from '../CountUp.vue';
import { PROFILE } from '../../config';

defineProps({ stats: { type: Object, required: true } });

const STATUS_LABELS = {
  live: '实时', cached: '缓存', stale: '缓存已过期', unavailable: '暂不可用'
};

function statusLabel(status) { return STATUS_LABELS[status] || '数据快照'; }
function displayTime(value) {
  if (!value) return '快照时间未知';
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    .format(new Date(value));
}
function joined(value) { return value ? String(value).slice(0, 10) : '2023-08-08'; }
</script>

<template>
  <section class="live-board site-shell" aria-labelledby="live-board-title">
    <header class="live-board__heading">
      <p class="page-kicker">LIVE SIGNALS</p>
      <h2 id="live-board-title">三个平台，现在发生的事</h2>
      <p>每个数字都带状态和更新时间。接口失败时保留最后一次成功结果，不用零值覆盖。</p>
    </header>

    <div class="live-board__grid">
      <article class="live-platform live-platform--bili clay-surface" data-live-platform>
        <div class="platform-device platform-device--bili" aria-hidden="true"><img class="platform-device__shell" src="/assets/clay/bilibili-device.png" alt=""><span class="platform-device__screen"><img class="platform-device__logo" src="/example/平台logo/B站.png" alt=""></span></div>
        <div class="live-platform__head">
          <img :src="stats.bili.face || PROFILE.biliAvatar" alt="小单说AI B站头像">
          <div><p>BILIBILI</p><h3>{{ stats.bili.name || '小单说AI' }}</h3></div>
        </div>
        <p class="live-platform__sign">{{ stats.bili.sign || PROFILE.biliSign }}</p>
        <dl class="live-platform__stats">
          <div><dt>粉丝</dt><dd><CountUp :value="stats.bili.followers || 0" /></dd></div>
          <div><dt>关注</dt><dd><CountUp :value="stats.bili.following || 0" /></dd></div>
          <div><dt>视频</dt><dd><CountUp :value="stats.bili.videoCount || 0" /></dd></div>
        </dl>
        <footer><span :data-status="stats.bili.status">{{ statusLabel(stats.bili.status) }} · {{ displayTime(stats.bili.updatedAt) }}</span><a :href="PROFILE.bilibiliUrl" target="_blank" rel="noopener">进入主页 ↗</a></footer>
      </article>

      <article class="live-platform live-platform--douyin clay-surface" data-live-platform>
        <div class="platform-device platform-device--douyin" aria-hidden="true"><img class="platform-device__shell" src="/assets/clay/douyin-device.png" alt=""><span class="platform-device__screen"><img class="platform-device__logo" src="/example/平台logo/抖音.png" alt=""></span></div>
        <div class="live-platform__head">
          <img v-if="stats.douyin.avatar" :src="stats.douyin.avatar" alt="小单说AI 抖音头像">
          <span v-else class="live-platform__avatar-fallback">单</span>
          <div><p>DOUYIN</p><h3>{{ stats.douyin.name || '小单说AI' }}</h3></div>
        </div>
        <p class="live-platform__sign">{{ stats.douyin.sign || PROFILE.biliSign }} · 抖音号 {{ stats.douyin.id || PROFILE.douyinId }}</p>
        <dl class="live-platform__stats">
          <div><dt>粉丝</dt><dd><CountUp :value="stats.douyin.followers || 0" /></dd></div>
          <div><dt>获赞</dt><dd>{{ stats.douyin.likesDisplay || stats.douyin.likes || '—' }}</dd></div>
          <div><dt>作品</dt><dd><CountUp :value="stats.douyin.works || 0" /></dd></div>
        </dl>
        <footer><span :data-status="stats.douyin.status">{{ statusLabel(stats.douyin.status) }} · {{ displayTime(stats.douyin.updatedAt) }}</span><a :href="PROFILE.douyinUrl" target="_blank" rel="noopener">进入主页 ↗</a></footer>
      </article>

      <article class="live-platform live-platform--github clay-surface" data-live-platform>
        <div class="platform-device platform-device--github" aria-hidden="true"><img class="platform-device__shell" src="/assets/clay/github-device.png" alt=""><span class="platform-device__screen"><img class="platform-device__logo" src="/example/平台logo/github.png" alt=""></span></div>
        <div class="live-platform__head">
          <img :src="stats.github.avatar || PROFILE.githubAvatar" alt="TheSyart GitHub 头像">
          <div><p>GITHUB</p><h3>{{ stats.github.login || 'TheSyart' }}</h3></div>
        </div>
        <p class="live-platform__sign">{{ joined(stats.github.joinedAt) }} 加入 · 非 Fork 仓库累计 Star</p>
        <dl class="live-platform__stats">
          <div><dt>关注者</dt><dd><CountUp :value="stats.github.followers || 0" /></dd></div>
          <div><dt>仓库</dt><dd><CountUp :value="stats.github.repos || 0" /></dd></div>
          <div><dt>Star</dt><dd><CountUp :value="stats.github.totalStars || 0" /></dd></div>
        </dl>
        <div class="featured-live-repos">
          <a v-for="repo in stats.github.featuredRepos" :key="repo.name" :href="repo.url" target="_blank" rel="noopener"><span>{{ repo.name }}</span><b>★ {{ repo.stars }}</b></a>
        </div>
        <footer><span :data-status="stats.github.status">{{ statusLabel(stats.github.status) }} · {{ displayTime(stats.github.updatedAt) }}</span><a :href="PROFILE.githubUrl" target="_blank" rel="noopener">打开 GitHub ↗</a></footer>
      </article>
    </div>
  </section>
</template>
