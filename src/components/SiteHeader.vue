<script setup>
import SealLogo from './SealLogo.vue';

const LINKS = [
  { to: '/', label: '首页', exact: true },
  { to: '/agents', label: 'Agents' },
  { to: '/articles', label: '文章' },
  { to: '/videos', label: '视频' },
  { to: '/about', label: '关于' },
  { to: '/messages', label: '留言' }
];
</script>

<template>
  <header class="site-header">
    <div class="site-shell site-nav-shell clay-surface">
      <router-link to="/" class="brand-home" aria-label="小单说AI 首页">
        <SealLogo />
        <span>小单说AI</span>
      </router-link>

      <nav class="site-nav" aria-label="主导航">
        <router-link v-for="l in LINKS" :key="l.to" :to="l.to"
          class="nav-link"
          :class="(l.exact ? $route.path === l.to : $route.path.startsWith(l.to))
            ? 'nav-link--active'
            : ''">
          {{ l.label }}
        </router-link>
        <a href="https://github.com/TheSyart" target="_blank" rel="noopener"
          class="nav-link github-nav">
          <img src="/example/平台logo/github.png" alt="">GitHub
        </a>
      </nav>
    </div>
  </header>
</template>
